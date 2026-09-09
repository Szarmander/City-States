import type * as Party from "partykit/server";
import { GameState, ClientMessage, ServerMessage, Player } from "./types";

// Note: includes Polish letters
const LETTERS = "ABCDEFGHIJKLMNOPRSTUWZ".split("");

export default class CityStateServer implements Party.Server {
  state: GameState;

  constructor(readonly room: Party.Room) {
    this.state = {
      status: "lobby",
      players: {},
      adminId: null,
      categories: ["Państwo", "Miasto", "Zwierzę", "Roślina", "Rzecz"],
      proposedCategories: [],
      currentLetter: "",
      usedLetters: [],
      roundTimer: null,
      roundNumber: 0,
      maxRounds: 5,
      reportedAnswers: [],
      invalidatedAnswers: [],
    };
  }

  async onStart() {
    const savedState = await this.room.storage.get<GameState>("gameState");
    if (savedState) {
      this.state = savedState;
    }
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {}

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message) as ClientMessage;

    switch (data.type) {
      case "join": {
        const playerCount = Object.keys(this.state.players).length;
        if (playerCount >= 8 && !this.state.players[sender.id] && !Object.values(this.state.players).some(p => p.name === data.name)) {
          const msg: ServerMessage = { type: "error", message: "Room is full (max 8 players)" };
          sender.send(JSON.stringify(msg));
          return;
        }

        const existingId = Object.keys(this.state.players).find(id => this.state.players[id].name === data.name);
        
        if (existingId) {
          const existingPlayer = this.state.players[existingId];
          existingPlayer.id = sender.id;
          existingPlayer.avatar = data.avatar;
          existingPlayer.accessory = data.accessory;
          
          this.state.players[sender.id] = existingPlayer;
          if (existingId !== sender.id) {
            delete this.state.players[existingId];
            if (this.state.adminId === existingId) {
              this.state.adminId = sender.id;
            }
            this.state.reportedAnswers.forEach(r => { if (r.playerId === existingId) r.playerId = sender.id; });
            this.state.invalidatedAnswers.forEach(i => { if (i.playerId === existingId) i.playerId = sender.id; });
          }
        } else {
          this.state.players[sender.id] = {
            id: sender.id,
            name: data.name,
            avatar: data.avatar,
            accessory: data.accessory,
            score: 0,
            roundScore: 0,
            isReady: false,
            answers: {},
            hasStopped: false,
          };
        }

        if (!this.state.adminId) {
          this.state.adminId = sender.id;
        }
        this.broadcastState();
        break;
      }

      case "propose_category": {
        if (this.state.status === "lobby") {
          const cat = data.category.trim();
          if (cat && !this.state.categories.includes(cat) && !this.state.proposedCategories.includes(cat)) {
            this.state.proposedCategories.push(cat);
            this.broadcastState();
          }
        }
        break;
      }

      case "handle_proposal": {
        if (sender.id === this.state.adminId && this.state.status === "lobby") {
          this.state.proposedCategories = this.state.proposedCategories.filter(c => c !== data.category);
          if (data.accept && !this.state.categories.includes(data.category)) {
            this.state.categories.push(data.category);
          }
          this.broadcastState();
        }
        break;
      }

      case "add_category": {
        if (sender.id === this.state.adminId && this.state.status === "lobby") {
          const cat = data.category.trim();
          if (cat && !this.state.categories.includes(cat)) {
            this.state.categories.push(cat);
            // Also remove from proposals if it was there
            this.state.proposedCategories = this.state.proposedCategories.filter(c => c !== cat);
            this.broadcastState();
          }
        }
        break;
      }

      case "remove_category": {
        if (sender.id === this.state.adminId && this.state.status === "lobby") {
          this.state.categories = this.state.categories.filter(c => c !== data.category);
          this.broadcastState();
        }
        break;
      }

      case "start_game": {
        const players = Object.values(this.state.players);
        const playerCount = players.length;
        const nonAdmins = players.filter(p => p.id !== this.state.adminId);
        const allReady = nonAdmins.length === 0 || nonAdmins.every(p => p.isReady);
        if (playerCount >= 2 && allReady && sender.id === this.state.adminId && (this.state.status === "lobby" || this.state.status === "finished")) {
          this.state.roundNumber = 1;
          for (const p of players) {
            p.score = 0;
          }
          this.startNewRound();
        }
        break;
      }

      case "submit_answers": {
        if (this.state.players[sender.id]) {
          this.state.players[sender.id].answers = data.answers;
        }
        break;
      }

      case "set_max_rounds": {
        if (sender.id === this.state.adminId && this.state.status === "lobby") {
          this.state.maxRounds = Math.max(1, data.maxRounds);
          this.broadcastState();
        }
        break;
      }

      case "report_answer": {
        if (this.state.status === "scoring") {
          const exists = this.state.reportedAnswers.find(r => r.playerId === data.playerId && r.category === data.category);
          if (!exists) {
            this.state.reportedAnswers.push({ playerId: data.playerId, category: data.category });
            this.broadcastState();
          }
        }
        break;
      }

      case "invalidate_answer": {
        if (sender.id === this.state.adminId && this.state.status === "scoring") {
          const exists = this.state.invalidatedAnswers.find(i => i.playerId === data.playerId && i.category === data.category);
          if (!exists) {
            this.state.invalidatedAnswers.push({ playerId: data.playerId, category: data.category });
            this.calculateRoundScores();
            this.broadcastState();
          }
        }
        break;
      }

      case "toggle_ready": {
        if (this.state.status === "lobby" && this.state.players[sender.id]) {
          this.state.players[sender.id].isReady = !this.state.players[sender.id].isReady;
          this.broadcastState();
        }
        break;
      }

      case "stop_round": {
        if (this.state.status === "playing") {
          this.state.players[sender.id].hasStopped = true;
          if (!this.state.roundTimer) {
            this.state.roundTimer = Date.now() + 10000;
            setTimeout(() => {
              this.endRound();
            }, 10000);
          }
          this.broadcastState();
        }
        break;
      }

      case "next_round": {
        if (sender.id === this.state.adminId && this.state.status === "scoring") {
          if (this.state.roundNumber >= this.state.maxRounds) {
            this.state.status = "finished";
          } else {
            this.state.roundNumber++;
            this.startNewRound();
          }
          this.broadcastState();
        }
        break;
      }
    }
  }

  onClose(connection: Party.Connection) {
    if (this.state.status === "lobby") {
      delete this.state.players[connection.id];
      if (this.state.adminId === connection.id) {
        const remainingPlayers = Object.keys(this.state.players);
        this.state.adminId = remainingPlayers.length > 0 ? remainingPlayers[0] : null;
      }
    } else {
      if (this.state.adminId === connection.id) {
        const remainingPlayers = Object.keys(this.state.players).filter(id => id !== connection.id);
        if (remainingPlayers.length > 0) {
          this.state.adminId = remainingPlayers[0];
        }
      }
    }
    this.broadcastState();
  }

  startNewRound() {
    this.state.status = "roulette";
    this.state.roundTimer = null;
    this.state.reportedAnswers = [];
    this.state.invalidatedAnswers = [];
    
    let availableLetters = LETTERS.filter(l => !this.state.usedLetters.includes(l));
    if (availableLetters.length === 0) {
      this.state.usedLetters = [];
      availableLetters = LETTERS;
    }
    const chosenLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    this.state.currentLetter = chosenLetter;
    this.state.usedLetters.push(chosenLetter);
    for (const p of Object.values(this.state.players)) {
      p.score += p.roundScore;
      p.roundScore = 0;
      p.answers = {};
      p.hasStopped = false;
    }
    this.broadcastState();

    // After 6 seconds of roulette, switch to playing (3s spinning + 3s viewing)
    setTimeout(() => {
      // make sure we are still in roulette (nobody aborted)
      if (this.state.status === "roulette") {
        this.state.status = "playing";
        this.broadcastState();
      }
    }, 6000);
  }

  endRound() {
    if (this.state.status !== "playing") return;
    this.state.status = "scoring";
    this.calculateRoundScores();
    this.broadcastState();
  }

  calculateRoundScores() {
    const letter = this.state.currentLetter.toLowerCase();
    
    // Reset round scores
    for (const p of Object.values(this.state.players)) {
      p.roundScore = 0;
    }

    // Evaluate scores per category
    for (const cat of this.state.categories) {
      const validAnswers: { playerId: string, answer: string }[] = [];
      
      // Step 1: Collect valid answers
      for (const player of Object.values(this.state.players)) {
        const answer = player.answers[cat]?.trim().toLowerCase() || "";
        const isInvalidated = this.state.invalidatedAnswers.some(i => i.playerId === player.id && i.category === cat);
        
        // Ensure answer is valid, starts with letter, length > 1, and not explicitly invalidated
        if (answer && answer.startsWith(letter) && answer.length > 1 && !isInvalidated) {
          validAnswers.push({ playerId: player.id, answer });
        }
      }

      // Step 2: Assign points
      if (validAnswers.length === 1) {
        // Only one person has a valid answer
        this.state.players[validAnswers[0].playerId].roundScore += 15;
      } else if (validAnswers.length > 1) {
        // Multiple valid answers, check for uniqueness
        for (const va of validAnswers) {
          const isUnique = validAnswers.filter(x => x.answer === va.answer).length === 1;
          if (isUnique) {
            this.state.players[va.playerId].roundScore += 10;
          } else {
            this.state.players[va.playerId].roundScore += 5;
          }
        }
      }
    }
  }

  broadcastState() {
    const msg: ServerMessage = { type: "state_update", state: this.state };
    this.room.broadcast(JSON.stringify(msg));
    this.room.storage.put("gameState", this.state);
  }
}
