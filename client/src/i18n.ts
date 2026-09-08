export type Language = 'en' | 'pl';

export const translations = {
  en: {
    enterName: "Enter your name",
    enterCode: "Enter room code",
    createGame: "Create a new game",
    createRoom: "CREATE ROOM",
    or: "OR",
    joinGame: "Join a game",
    join: "JOIN",
    roomCode: "Room Code",
    round: "Round",
    playersInRoom: "Players in Room",
    admin: "Admin",
    categoriesForGame: "Categories for this game:",
    customCategory: "Custom category...",
    add: "Add",
    suggest: "Suggest",
    suggestions: "Suggestions from players:",
    imReady: "I'm Ready!",
    clickWhenReady: "Click when Ready",
    startGame: "START GAME!",
    needMorePlayers: "Need at least 2 players to start!",
    waitingForReady: "Waiting for all players to be ready!",
    waitingForAdmin: "Waiting for the admin to start...",
    letter: "Letter:",
    waitingForOthers: "Waiting for others...",
    stop: "STOP!",
    roundOver: "Round Over!",
    player: "Player",
    total: "Total",
    finishGame: "Finish Game",
    nextRound: "Next Round",
    gameFinished: "Game Finished!",
    finalStandings: "Final Standings",
    playAgain: "Play Again",
    quit: "Quit",
    waitingToRestart: "Waiting for admin to restart...",
    catCountry: "Country",
    catCity: "City",
    catAnimal: "Animal",
    catPlant: "Plant",
    catThing: "Thing",
    codePlaceholder: "CODE"
  },
  pl: {
    enterName: "Wpisz swoje imię",
    enterCode: "Wpisz kod pokoju",
    createGame: "Utwórz nową grę",
    createRoom: "UTWÓRZ POKÓJ",
    or: "LUB",
    joinGame: "Dołącz do gry",
    join: "DOŁĄCZ",
    roomCode: "Kod Pokoju",
    round: "Runda",
    playersInRoom: "Gracze w Pokoju",
    admin: "Admin",
    categoriesForGame: "Kategorie dla tej gry:",
    customCategory: "Własna kategoria...",
    add: "Dodaj",
    suggest: "Zaproponuj",
    suggestions: "Propozycje graczy:",
    imReady: "Gotowy!",
    clickWhenReady: "Kliknij, gdy będziesz gotowy",
    startGame: "ROZPOCZNIJ GRĘ!",
    needMorePlayers: "Potrzeba co najmniej 2 graczy, by zacząć!",
    waitingForReady: "Czekamy, aż wszyscy będą gotowi!",
    waitingForAdmin: "Oczekiwanie na start przez admina...",
    letter: "Litera:",
    waitingForOthers: "Oczekiwanie na pozostałych...",
    stop: "STOP!",
    roundOver: "Koniec Rundy!",
    player: "Gracz",
    total: "Suma",
    finishGame: "Zakończ Grę",
    nextRound: "Następna Runda",
    gameFinished: "Koniec Gry!",
    finalStandings: "Wyniki Końcowe",
    playAgain: "Zagraj Ponownie",
    quit: "Wyjdź",
    waitingToRestart: "Oczekiwanie na ponowny start przez admina...",
    catCountry: "Państwo",
    catCity: "Miasto",
    catAnimal: "Zwierzę",
    catPlant: "Roślina",
    catThing: "Rzecz",
    codePlaceholder: "KOD"
  }
};

export function getInitialLanguage(): Language {
  const saved = localStorage.getItem('language') as Language;
  if (saved === 'en' || saved === 'pl') return saved;
  const userLang = navigator.language;
  if (userLang && userLang.toLowerCase().startsWith('pl')) return 'pl';
  return 'en';
}

export function translateCategory(cat: string, lang: Language): string {
  const t = translations[lang];
  const c = cat.trim().toLowerCase();
  if (c === 'country' || c === 'państwo' || c === 'panstwo') return t.catCountry;
  if (c === 'city' || c === 'miasto') return t.catCity;
  if (c === 'animal' || c === 'zwierzę' || c === 'zwierze') return t.catAnimal;
  if (c === 'plant' || c === 'roślina' || c === 'roslina') return t.catPlant;
  if (c === 'thing' || c === 'rzecz') return t.catThing;
  return cat; // custom ones are kept as is
}

export function canonicalizeCategory(cat: string): string {
  return translateCategory(cat, 'en');
}
