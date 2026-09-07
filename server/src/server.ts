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
      roundTimer: null,
      roundNumber: 0,
      maxRounds: 5,
    };
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {}

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message) as ClientMessage;

    switch (data.type) {
      case "join": {
        const playerCount = Object.keys(this.state.players).length;
        if (playerCount >= 8 && !this.state.players[sender.id]) {
          const msg: ServerMessage = { type: "error", message: "Room is full (max 8 players)" };
          sender.send(JSON.stringify(msg));
          return;
        }

        const isFirst = playerCount === 0;
        this.state.players[sender.id] = {
          id: sender.id,
          name: data.name,
          avatar: data.avatar,
          score: 0,
          isReady: false,
          answers: {},
          hasStopped: false,
        };
        if (isFirst || !this.state.adminId) {
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
        const playerCount = Object.keys(this.state.players).length;
        if (playerCount >= 2 && sender.id === this.state.adminId && (this.state.status === "lobby" || this.state.status === "finished")) {
          this.state.roundNumber = 1;
          for (const p of Object.values(this.state.players)) {
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
    delete this.state.players[connection.id];
    if (this.state.adminId === connection.id) {
      const remainingPlayers = Object.keys(this.state.players);
      this.state.adminId = remainingPlayers.length > 0 ? remainingPlayers[0] : null;
    }
    this.broadcastState();
  }

  startNewRound() {
    this.state.status = "roulette";
    this.state.roundTimer = null;
    this.state.currentLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    for (const p of Object.values(this.state.players)) {
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
    
    const letter = this.state.currentLetter.toLowerCase();
    
    // Evaluate scores per category
    for (const cat of this.state.categories) {
      const validAnswers: { playerId: string, answer: string }[] = [];
      
      // Step 1: Collect valid answers
      for (const player of Object.values(this.state.players)) {
        const answer = player.answers[cat]?.trim().toLowerCase() || "";
        if (answer && answer.startsWith(letter)) {
          validAnswers.push({ playerId: player.id, answer });
        }
      }

      // Step 2: Assign points
      if (validAnswers.length === 1) {
        // Only one person has a valid answer
        this.state.players[validAnswers[0].playerId].score += 15;
      } else if (validAnswers.length > 1) {
        // Multiple valid answers, check for uniqueness
        for (const va of validAnswers) {
          const isUnique = validAnswers.filter(x => x.answer === va.answer).length === 1;
          if (isUnique) {
            this.state.players[va.playerId].score += 10;
          } else {
            this.state.players[va.playerId].score += 5;
          }
        }
      }
    }
    
    this.broadcastState();
  }

  broadcastState() {
    const msg: ServerMessage = { type: "state_update", state: this.state };
    this.room.broadcast(JSON.stringify(msg));
  }
}
