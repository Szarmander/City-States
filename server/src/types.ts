export type Player = {
  id: string;
  name: string;
  avatar: string;
  accessory?: string;
  score: number;
  roundScore: number;
  isReady: boolean;
  answers: Record<string, string>;
  hasStopped: boolean;
};

export type GameState = {
  status: "lobby" | "roulette" | "playing" | "scoring" | "finished";
  players: Record<string, Player>;
  adminId: string | null;
  categories: string[];
  proposedCategories: string[];
  currentLetter: string;
  usedLetters: string[];
  roundTimer: number | null; // Timestamp (ms) when round ends due to stop, or null
  roundNumber: number;
  maxRounds: number;
  reportedAnswers: { playerId: string, category: string }[];
  invalidatedAnswers: { playerId: string, category: string }[];
};

export type ClientMessage = 
  | { type: "join"; name: string; avatar: string; accessory?: string }
  | { type: "start_game" }
  | { type: "submit_answers"; answers: Record<string, string> }
  | { type: "stop_round" }
  | { type: "next_round" }
  | { type: "propose_category"; category: string }
  | { type: "handle_proposal"; category: string; accept: boolean }
  | { type: "add_category"; category: string }
  | { type: "remove_category"; category: string }
  | { type: "set_max_rounds"; maxRounds: number }
  | { type: "report_answer"; playerId: string; category: string }
  | { type: "invalidate_answer"; playerId: string; category: string }
  | { type: "toggle_ready" };

export type ServerMessage = 
  | { type: "state_update"; state: GameState }
  | { type: "error"; message: string };
