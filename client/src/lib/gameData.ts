export interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  players: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "Solo" | "Multiplayer" | "Both";
  playable: boolean;
  instructions?: GameInstructions;
}

export interface GameInstructions {
  howToPlay: string[];
  controls: string[];
  tips: string[];
  winCondition: string;
}

export const GAME_INSTRUCTIONS: Record<string, GameInstructions> = {
  "memory-match": {
    howToPlay: [
      "Tap any card to flip it and reveal the Doro face hidden underneath.",
      "Flip a second card to try to find a matching pair.",
      "If both cards match, they stay face up. If not, they flip back after a moment.",
      "Continue until all 8 pairs are matched.",
    ],
    controls: ["Tap/click any face-down card to flip it."],
    tips: [
      "Try to remember where each face was when cards flip back.",
      "Start from one corner and work systematically.",
      "Fewer moves = better score. Aim to beat your personal best!",
    ],
    winCondition: "Match all 8 pairs in as few moves as possible.",
  },
  "doro-clicker": {
    howToPlay: [
      "Click or tap the Doro character to earn coins.",
      "Spend coins on upgrades to boost your clicking power or earn passive income.",
      "Each upgrade can be purchased multiple times, with cost increasing each time.",
      "Your progress saves automatically.",
    ],
    controls: ["Tap/click Doro to earn coins.", "Tap any upgrade card to purchase it."],
    tips: [
      "Start with Doro Paw for instant click power.",
      "Fan Club and Meme Factory generate coins over time, even while idle.",
      "Balance click upgrades and passive income for maximum efficiency.",
      "Higher-tier upgrades have better returns per coin spent.",
    ],
    winCondition: "Reach as many coins as possible! There is no limit.",
  },
  "doro-battle": {
    howToPlay: [
      "Your Doro faces another Doro in turn-based combat.",
      "Each turn, pick one of your 4 moves from your moveset.",
      "Type advantages deal 1.5x damage (Fire > Ice > Grass > Water > Fire).",
      "Status effects like Burn, Freeze, and Poison add strategic depth.",
      "Reduce the enemy Doro's HP to 0 to win.",
    ],
    controls: [
      "Tap a move button to attack, buff, or use a status move.",
      "Switch difficulty using Easy / Medium / Hard buttons.",
      "Tap 'New Battle' to fight a different opponent.",
    ],
    tips: [
      "Watch for type advantage indicators on your moves.",
      "Status moves can turn the tide - Burn deals damage over time!",
      "On Hard mode, the bot plays strategically - use status effects wisely.",
      "Build a win streak for bragging rights!",
    ],
    winCondition: "Defeat the enemy Doro by reducing its HP to zero.",
  },
  "doro-runner": {
    howToPlay: [
      "Doro runs automatically through an endless cosmic track.",
      "Jump over low obstacles (red blocks) and duck under high obstacles (purple blocks).",
      "Collect golden stars for bonus points (+10 each).",
      "The game speeds up over time, making it progressively harder.",
    ],
    controls: [
      "Space bar or Up arrow or Tap to jump.",
      "Down arrow or hold Duck button to duck (mobile).",
      "Tap the canvas or press Space to restart after game over.",
    ],
    tips: [
      "Time your jumps early - Doro has a slight float at peak height.",
      "Duck only for purple (high) obstacles; jumping also avoids them but uses more time.",
      "Stars are worth 10 points each, but don't risk a collision for them.",
      "Speed increases every few seconds - stay focused!",
    ],
    winCondition: "Survive as long as possible and beat your high score!",
  },
  "doro-tictactoe": {
    howToPlay: [
      "You play as (^.^) against the Doro Bot (o.o) on a 3x3 grid.",
      "Take turns placing your symbol. You always go first.",
      "Get 3 in a row (horizontal, vertical, or diagonal) to win.",
      "The bot uses AI strategy that adapts to your chosen difficulty.",
    ],
    controls: [
      "Tap an empty cell to place your symbol.",
      "Switch difficulty with the Easy / Medium / Hard buttons.",
      "Tap 'Watch' to see two bots play against each other.",
      "Tap 'Reset' to start a new game.",
    ],
    tips: [
      "On Easy, the bot plays randomly - good for practice.",
      "On Medium, the bot mixes random and smart moves.",
      "On Hard, the bot uses near-perfect play (minimax) - draws are your best outcome!",
      "Taking the center square first gives you the best starting advantage.",
    ],
    winCondition: "Get 3 of your symbols in a row before the bot does.",
  },
  "doro-slots": {
    howToPlay: [
      "Choose your bet amount using the bet buttons (5 to 100 coins).",
      "Press SPIN to start the reels spinning.",
      "When the reels stop, matching Doro faces on the payline wins coins.",
      "Match 2 faces for 1.5x your bet, match 3 for the symbol's multiplier.",
    ],
    controls: [
      "Tap bet buttons (5/10/25/50/100) to set your wager.",
      "Tap SPIN to spin the reels.",
      "Tap Reset if you run out of coins (resets to 500).",
    ],
    tips: [
      "Diamond Doro (hat) has the highest payout at 10x!",
      "Star Doro pays 5x, making it the second best symbol.",
      "Start with small bets to build your bankroll.",
      "Even matching just 2 symbols gives you 1.5x your bet back.",
    ],
    winCondition: "Build your coin balance as high as you can!",
  },
  "multiplayer-tictactoe": {
    howToPlay: [
      "Create a room and share the 5-letter code with your friend.",
      "Your friend enters the code to join your room.",
      "Take turns placing your symbol on the 3x3 grid.",
      "Get 3 in a row (horizontal, vertical, or diagonal) to win.",
    ],
    controls: [
      "Tap an empty cell to place your symbol during your turn.",
      "Send reactions to your opponent using the emoji bar.",
      "Request a rematch after the game ends.",
    ],
    tips: [
      "The center square is the strongest opening move.",
      "Watch your opponent's patterns and block their lines.",
      "Corner moves create more winning opportunities than edges.",
      "Send reactions to keep things fun and competitive!",
    ],
    winCondition: "Get 3 of your symbols in a row before your opponent does.",
  },
};

export const GAMES: GameInfo[] = [
  {
    id: "memory-match",
    name: "Doro Memory",
    description: "Match pairs of adorable Doro cards. Train your memory with cute expressions!",
    icon: "brain",
    color: "#E879A0",
    players: "1 Player",
    difficulty: "Easy",
    type: "Solo",
    playable: true,
    instructions: GAME_INSTRUCTIONS["memory-match"],
  },
  {
    id: "doro-clicker",
    name: "Doro Clicker",
    description: "Tap Doro to earn coins! Buy upgrades and build your idle empire.",
    icon: "mouse-pointer-click",
    color: "#A78BFA",
    players: "1 Player",
    difficulty: "Easy",
    type: "Solo",
    playable: true,
    instructions: GAME_INSTRUCTIONS["doro-clicker"],
  },
  {
    id: "doro-battle",
    name: "Doro Battle",
    description: "Epic turn-based Doro vs Doro combat with 60+ moves, type advantages, and status effects!",
    icon: "swords",
    color: "#F97316",
    players: "1 Player",
    difficulty: "Medium",
    type: "Solo",
    playable: true,
    instructions: GAME_INSTRUCTIONS["doro-battle"],
  },
  {
    id: "doro-runner",
    name: "Doro Runner",
    description: "Endless runner through a cosmic galaxy! Dodge obstacles and collect stars.",
    icon: "zap",
    color: "#34D399",
    players: "1 Player",
    difficulty: "Medium",
    type: "Solo",
    playable: true,
    instructions: GAME_INSTRUCTIONS["doro-runner"],
  },
  {
    id: "doro-tictactoe",
    name: "Doro Tic-Tac-Toe",
    description: "Classic strategy with a Doro twist! Play against smart AI or watch bots compete.",
    icon: "grid-3x3",
    color: "#60A5FA",
    players: "1-2 Players",
    difficulty: "Easy",
    type: "Both",
    playable: true,
    instructions: GAME_INSTRUCTIONS["doro-tictactoe"],
  },
  {
    id: "doro-slots",
    name: "Doro Slots",
    description: "Spin the reels and match Doro faces for coin prizes!",
    icon: "dices",
    color: "#FFD700",
    players: "1 Player",
    difficulty: "Easy",
    type: "Solo",
    playable: true,
    instructions: GAME_INSTRUCTIONS["doro-slots"],
  },
  {
    id: "multiplayer-tictactoe",
    name: "Doro Arena",
    description: "Real-time multiplayer Tic-Tac-Toe! Create a room and battle your friends online.",
    icon: "users",
    color: "#06B6D4",
    players: "2 Players",
    difficulty: "Medium",
    type: "Multiplayer",
    playable: true,
    instructions: GAME_INSTRUCTIONS["multiplayer-tictactoe"],
  },
  {
    id: "doro-quiz",
    name: "Doro Trivia",
    description: "Test your knowledge about crypto, memecoins, and Solana lore.",
    icon: "help-circle",
    color: "#FBBF24",
    players: "1 Player",
    difficulty: "Medium",
    type: "Solo",
    playable: false,
  },
  {
    id: "doro-tower",
    name: "Doro Tower",
    description: "Stack Doro blocks perfectly to build the tallest tower!",
    icon: "building",
    color: "#C084FC",
    players: "1 Player",
    difficulty: "Hard",
    type: "Solo",
    playable: false,
  },
  {
    id: "doro-puzzle",
    name: "Doro Puzzle",
    description: "Solve sliding puzzles featuring different Doro artworks.",
    icon: "puzzle",
    color: "#F472B6",
    players: "1 Player",
    difficulty: "Hard",
    type: "Solo",
    playable: false,
  },
];

export type MoveCategory = "physical" | "special" | "status";
export type StatusEffect = "burn" | "freeze" | "poison" | "stun" | "buff-atk" | "buff-def" | "debuff-atk" | "debuff-def";
export type ElementType = "fire" | "water" | "ice" | "electric" | "grass" | "cosmic" | "dark" | "psychic" | "normal" | "dragon";

export interface BattleMoveData {
  id: string;
  name: string;
  type: ElementType;
  category: MoveCategory;
  power: number;
  accuracy: number;
  effect?: StatusEffect;
  effectChance?: number;
  description: string;
  animation: "slash" | "beam" | "blast" | "wave" | "pulse" | "strike" | "shield" | "spark" | "flame" | "frost" | "bolt" | "shadow" | "heal" | "buff" | "debuff" | "meteor" | "vortex" | "nova";
}

export const BATTLE_MOVES: BattleMoveData[] = [
  { id: "love-beam", name: "Love Beam", type: "cosmic", category: "special", power: 40, accuracy: 100, description: "A beam of pure love energy", animation: "beam" },
  { id: "star-crash", name: "Star Crash", type: "cosmic", category: "physical", power: 55, accuracy: 95, description: "Crashes into the enemy like a falling star", animation: "strike" },
  { id: "galaxy-slam", name: "Galaxy Slam", type: "cosmic", category: "physical", power: 80, accuracy: 85, description: "A devastating cosmic slam", animation: "meteor" },
  { id: "heal-purr", name: "Heal Purr", type: "normal", category: "status", power: -30, accuracy: 100, description: "A soothing purr that restores HP", animation: "heal" },
  { id: "moonbeam", name: "Moonbeam", type: "cosmic", category: "special", power: 50, accuracy: 95, description: "A concentrated beam of moonlight", animation: "beam" },
  { id: "nebula-burst", name: "Nebula Burst", type: "cosmic", category: "special", power: 70, accuracy: 90, description: "Explodes with the power of a nebula", animation: "nova" },
  { id: "cosmic-shield", name: "Cosmic Shield", type: "cosmic", category: "status", power: 0, accuracy: 100, effect: "buff-def", effectChance: 100, description: "Raises defense with cosmic energy", animation: "shield" },
  { id: "astral-pulse", name: "Astral Pulse", type: "psychic", category: "special", power: 45, accuracy: 100, description: "A pulse from the astral plane", animation: "pulse" },

  { id: "flame-paw", name: "Flame Paw", type: "fire", category: "physical", power: 45, accuracy: 100, description: "A fiery swipe with burning paws", animation: "flame" },
  { id: "blaze-rush", name: "Blaze Rush", type: "fire", category: "physical", power: 60, accuracy: 95, description: "Charges with blazing speed", animation: "strike" },
  { id: "inferno", name: "Inferno", type: "fire", category: "special", power: 85, accuracy: 80, effect: "burn", effectChance: 50, description: "Engulfs the target in flames", animation: "blast" },
  { id: "ember-shot", name: "Ember Shot", type: "fire", category: "special", power: 35, accuracy: 100, effect: "burn", effectChance: 20, description: "Shoots small embers at the target", animation: "spark" },
  { id: "fire-spin", name: "Fire Spin", type: "fire", category: "special", power: 50, accuracy: 90, description: "Traps the target in a fire vortex", animation: "vortex" },
  { id: "heat-wave", name: "Heat Wave", type: "fire", category: "special", power: 65, accuracy: 90, effect: "burn", effectChance: 30, description: "A scorching wave of heat", animation: "wave" },
  { id: "flare-blitz", name: "Flare Blitz", type: "fire", category: "physical", power: 90, accuracy: 85, description: "An all-out fiery charge", animation: "strike" },
  { id: "lava-plume", name: "Lava Plume", type: "fire", category: "special", power: 70, accuracy: 90, effect: "burn", effectChance: 40, description: "Erupts lava from beneath", animation: "blast" },

  { id: "bubble-beam", name: "Bubble Beam", type: "water", category: "special", power: 45, accuracy: 100, description: "Shoots a stream of bubbles", animation: "beam" },
  { id: "tidal-wave", name: "Tidal Wave", type: "water", category: "special", power: 75, accuracy: 85, description: "Summons a massive tidal wave", animation: "wave" },
  { id: "aqua-jet", name: "Aqua Jet", type: "water", category: "physical", power: 40, accuracy: 100, description: "A quick water-propelled strike", animation: "strike" },
  { id: "hydro-pump", name: "Hydro Pump", type: "water", category: "special", power: 85, accuracy: 80, description: "A powerful blast of water", animation: "blast" },
  { id: "water-pulse", name: "Water Pulse", type: "water", category: "special", power: 50, accuracy: 100, description: "Sends a pulsing wave of water", animation: "pulse" },
  { id: "surf", name: "Surf", type: "water", category: "special", power: 60, accuracy: 95, description: "Rides a massive wave into the enemy", animation: "wave" },
  { id: "rain-dance", name: "Rain Dance", type: "water", category: "status", power: 0, accuracy: 100, effect: "buff-atk", effectChance: 100, description: "Calls rain to boost water power", animation: "buff" },

  { id: "frost-bite", name: "Frost Bite", type: "ice", category: "physical", power: 45, accuracy: 100, effect: "freeze", effectChance: 15, description: "Bites with icy fangs", animation: "frost" },
  { id: "blizzard", name: "Blizzard", type: "ice", category: "special", power: 80, accuracy: 80, effect: "freeze", effectChance: 30, description: "Summons a fierce blizzard", animation: "blast" },
  { id: "ice-beam", name: "Ice Beam", type: "ice", category: "special", power: 60, accuracy: 95, effect: "freeze", effectChance: 20, description: "A freezing beam of ice", animation: "beam" },
  { id: "avalanche", name: "Avalanche", type: "ice", category: "physical", power: 70, accuracy: 90, description: "Drops an avalanche on the target", animation: "meteor" },
  { id: "frost-breath", name: "Frost Breath", type: "ice", category: "special", power: 40, accuracy: 100, description: "Exhales freezing cold air", animation: "wave" },
  { id: "icicle-crash", name: "Icicle Crash", type: "ice", category: "physical", power: 75, accuracy: 85, description: "Crashes with giant icicles", animation: "strike" },
  { id: "hail-storm", name: "Hail Storm", type: "ice", category: "special", power: 55, accuracy: 95, description: "Pelts the enemy with hail", animation: "blast" },

  { id: "spark-punch", name: "Spark Punch", type: "electric", category: "physical", power: 45, accuracy: 100, description: "A punch charged with electricity", animation: "spark" },
  { id: "thunder-bolt", name: "Thunder Bolt", type: "electric", category: "special", power: 65, accuracy: 95, effect: "stun", effectChance: 20, description: "A powerful bolt of lightning", animation: "bolt" },
  { id: "volt-tackle", name: "Volt Tackle", type: "electric", category: "physical", power: 80, accuracy: 85, description: "A reckless electric charge", animation: "strike" },
  { id: "discharge", name: "Discharge", type: "electric", category: "special", power: 55, accuracy: 100, effect: "stun", effectChance: 15, description: "Releases electricity in all directions", animation: "pulse" },
  { id: "thunder-wave", name: "Thunder Wave", type: "electric", category: "status", power: 0, accuracy: 95, effect: "stun", effectChance: 100, description: "Paralyzes the target with electricity", animation: "bolt" },
  { id: "electro-ball", name: "Electro Ball", type: "electric", category: "special", power: 50, accuracy: 100, description: "Launches an electric sphere", animation: "blast" },
  { id: "wild-charge", name: "Wild Charge", type: "electric", category: "physical", power: 75, accuracy: 90, description: "A wild electrical tackle", animation: "strike" },

  { id: "vine-whip", name: "Vine Whip", type: "grass", category: "physical", power: 40, accuracy: 100, description: "Whips with magical vines", animation: "slash" },
  { id: "solar-beam", name: "Solar Beam", type: "grass", category: "special", power: 85, accuracy: 85, description: "Fires a concentrated beam of sunlight", animation: "beam" },
  { id: "leaf-blade", name: "Leaf Blade", type: "grass", category: "physical", power: 60, accuracy: 95, description: "Slashes with a razor-sharp leaf", animation: "slash" },
  { id: "petal-dance", name: "Petal Dance", type: "grass", category: "special", power: 70, accuracy: 90, description: "Dances while scattering petals", animation: "vortex" },
  { id: "seed-bomb", name: "Seed Bomb", type: "grass", category: "physical", power: 55, accuracy: 100, description: "Launches explosive seeds", animation: "blast" },
  { id: "giga-drain", name: "Giga Drain", type: "grass", category: "special", power: 50, accuracy: 100, description: "Drains HP from the target", animation: "pulse" },
  { id: "synthesis", name: "Synthesis", type: "grass", category: "status", power: -25, accuracy: 100, description: "Restores HP using sunlight", animation: "heal" },
  { id: "spore-cloud", name: "Spore Cloud", type: "grass", category: "status", power: 0, accuracy: 90, effect: "poison", effectChance: 100, description: "Releases toxic spores", animation: "wave" },

  { id: "shadow-claw", name: "Shadow Claw", type: "dark", category: "physical", power: 55, accuracy: 95, description: "Strikes with a shadowy claw", animation: "slash" },
  { id: "dark-pulse", name: "Dark Pulse", type: "dark", category: "special", power: 60, accuracy: 95, description: "Releases a wave of dark energy", animation: "pulse" },
  { id: "night-slash", name: "Night Slash", type: "dark", category: "physical", power: 50, accuracy: 100, description: "Slashes under cover of darkness", animation: "slash" },
  { id: "shadow-ball", name: "Shadow Ball", type: "dark", category: "special", power: 65, accuracy: 95, effect: "debuff-def", effectChance: 25, description: "Hurls a shadowy blob", animation: "blast" },
  { id: "phantom-force", name: "Phantom Force", type: "dark", category: "physical", power: 75, accuracy: 90, description: "Vanishes then strikes from the shadows", animation: "strike" },
  { id: "nightmare", name: "Nightmare", type: "dark", category: "status", power: 0, accuracy: 90, effect: "debuff-atk", effectChance: 100, description: "Haunts the target reducing attack", animation: "debuff" },

  { id: "psybeam", name: "Psybeam", type: "psychic", category: "special", power: 50, accuracy: 100, description: "A peculiar ray of psychic energy", animation: "beam" },
  { id: "psychic-blast", name: "Psychic Blast", type: "psychic", category: "special", power: 70, accuracy: 90, description: "A massive psychic explosion", animation: "blast" },
  { id: "mind-crush", name: "Mind Crush", type: "psychic", category: "special", power: 60, accuracy: 95, effect: "debuff-atk", effectChance: 20, description: "Crushes the mind of the target", animation: "pulse" },
  { id: "zen-headbutt", name: "Zen Headbutt", type: "psychic", category: "physical", power: 55, accuracy: 95, description: "A focused headbutt", animation: "strike" },
  { id: "calm-mind", name: "Calm Mind", type: "psychic", category: "status", power: 0, accuracy: 100, effect: "buff-atk", effectChance: 100, description: "Calms mind to raise attack", animation: "buff" },
  { id: "dream-eater", name: "Dream Eater", type: "psychic", category: "special", power: 65, accuracy: 90, description: "Feeds on the target's dreams", animation: "pulse" },

  { id: "tackle", name: "Tackle", type: "normal", category: "physical", power: 35, accuracy: 100, description: "A basic body tackle", animation: "strike" },
  { id: "quick-attack", name: "Quick Attack", type: "normal", category: "physical", power: 40, accuracy: 100, description: "A lightning-fast strike", animation: "strike" },
  { id: "body-slam", name: "Body Slam", type: "normal", category: "physical", power: 60, accuracy: 95, effect: "stun", effectChance: 15, description: "A full-body slam", animation: "strike" },
  { id: "hyper-beam", name: "Hyper Beam", type: "normal", category: "special", power: 90, accuracy: 80, description: "An overwhelmingly powerful beam", animation: "beam" },
  { id: "mega-punch", name: "Mega Punch", type: "normal", category: "physical", power: 55, accuracy: 95, description: "A powerful punch", animation: "strike" },
  { id: "rest", name: "Rest", type: "normal", category: "status", power: -50, accuracy: 100, description: "Falls asleep to fully restore HP", animation: "heal" },

  { id: "dragon-claw", name: "Dragon Claw", type: "dragon", category: "physical", power: 60, accuracy: 95, description: "Slashes with draconic claws", animation: "slash" },
  { id: "dragon-pulse", name: "Dragon Pulse", type: "dragon", category: "special", power: 70, accuracy: 90, description: "Fires a shockwave from the mouth", animation: "pulse" },
  { id: "dragon-rage", name: "Dragon Rage", type: "dragon", category: "special", power: 55, accuracy: 100, description: "Unleashes draconic fury", animation: "flame" },
  { id: "outrage", name: "Outrage", type: "dragon", category: "physical", power: 85, accuracy: 85, description: "A rampage of draconic power", animation: "strike" },
  { id: "dragon-breath", name: "Dragon Breath", type: "dragon", category: "special", power: 45, accuracy: 100, effect: "stun", effectChance: 20, description: "Breathes draconic energy", animation: "wave" },
];

export const TYPE_CHART_ADV: Record<ElementType, ElementType[]> = {
  fire: ["ice", "grass"],
  water: ["fire"],
  ice: ["grass", "dragon"],
  electric: ["water"],
  grass: ["water", "electric"],
  cosmic: ["psychic", "dark"],
  dark: ["psychic", "cosmic"],
  psychic: ["grass"],
  normal: [],
  dragon: ["dragon"],
};

export const TYPE_CHART_WEAK: Record<ElementType, ElementType[]> = {
  fire: ["water"],
  water: ["electric", "grass"],
  ice: ["fire"],
  electric: ["grass"],
  grass: ["fire", "ice"],
  cosmic: ["dark"],
  dark: ["cosmic"],
  psychic: ["dark"],
  normal: [],
  dragon: ["ice", "dragon"],
};

export const TYPE_COLORS_BATTLE: Record<ElementType, string> = {
  fire: "#FF6347",
  water: "#4FC3F7",
  ice: "#87CEEB",
  electric: "#FFD700",
  grass: "#4ADE80",
  cosmic: "#9B59B6",
  dark: "#4A4A6A",
  psychic: "#FF69B4",
  normal: "#A8A8A8",
  dragon: "#7B68EE",
};

export const TYPE_EMOJI: Record<ElementType, string> = {
  fire: "🔥",
  water: "💧",
  ice: "❄️",
  electric: "⚡",
  grass: "🌿",
  cosmic: "✨",
  dark: "🌑",
  psychic: "🔮",
  normal: "⭐",
  dragon: "🐉",
};

export interface DoroBattler {
  id: string;
  name: string;
  type: ElementType;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  color: string;
  moveIds: string[];
  emoji: string;
}

export const BATTLE_DOROS: DoroBattler[] = [
  { id: "classic", name: "Classic Doro", type: "cosmic", hp: 100, attack: 14, defense: 10, speed: 11, color: "#FFB6C1", moveIds: ["love-beam", "star-crash", "heal-purr", "galaxy-slam"], emoji: "(^.^)" },
  { id: "fire", name: "Blaze Doro", type: "fire", hp: 90, attack: 16, defense: 8, speed: 13, color: "#FF6347", moveIds: ["flame-paw", "blaze-rush", "inferno", "heat-wave"], emoji: "(>.<)" },
  { id: "water", name: "Aqua Doro", type: "water", hp: 110, attack: 12, defense: 12, speed: 9, color: "#4FC3F7", moveIds: ["bubble-beam", "tidal-wave", "aqua-jet", "rain-dance"], emoji: "(~.~)" },
  { id: "ice", name: "Frost Doro", type: "ice", hp: 95, attack: 11, defense: 14, speed: 8, color: "#87CEEB", moveIds: ["frost-bite", "blizzard", "ice-beam", "frost-breath"], emoji: "(*.*)" },
  { id: "electric", name: "Volt Doro", type: "electric", hp: 85, attack: 17, defense: 7, speed: 15, color: "#FFD700", moveIds: ["spark-punch", "thunder-bolt", "discharge", "thunder-wave"], emoji: "(⚡.⚡)" },
  { id: "grass", name: "Leaf Doro", type: "grass", hp: 100, attack: 13, defense: 11, speed: 10, color: "#4ADE80", moveIds: ["vine-whip", "solar-beam", "giga-drain", "synthesis"], emoji: "(🌿.🌿)" },
  { id: "dark", name: "Shadow Doro", type: "dark", hp: 88, attack: 15, defense: 9, speed: 14, color: "#4A4A6A", moveIds: ["shadow-claw", "dark-pulse", "phantom-force", "nightmare"], emoji: "(x.x)" },
  { id: "psychic", name: "Mystic Doro", type: "psychic", hp: 92, attack: 14, defense: 10, speed: 12, color: "#FF69B4", moveIds: ["psybeam", "psychic-blast", "mind-crush", "calm-mind"], emoji: "(◉.◉)" },
  { id: "dragon", name: "Drake Doro", type: "dragon", hp: 105, attack: 16, defense: 11, speed: 10, color: "#7B68EE", moveIds: ["dragon-claw", "dragon-pulse", "outrage", "dragon-breath"], emoji: "(🐉.🐉)" },
  { id: "normal", name: "Chill Doro", type: "normal", hp: 120, attack: 12, defense: 12, speed: 10, color: "#A8A8A8", moveIds: ["tackle", "quick-attack", "body-slam", "rest"], emoji: "(-.-)" },
  { id: "cosmic-prime", name: "Nova Doro", type: "cosmic", hp: 95, attack: 15, defense: 9, speed: 13, color: "#9B59B6", moveIds: ["nebula-burst", "astral-pulse", "cosmic-shield", "moonbeam"], emoji: "(★.★)" },
  { id: "fire-legend", name: "Inferno Doro", type: "fire", hp: 85, attack: 18, defense: 7, speed: 14, color: "#FF4500", moveIds: ["flare-blitz", "lava-plume", "fire-spin", "ember-shot"], emoji: "(🔥.🔥)" },
  { id: "ice-legend", name: "Glacier Doro", type: "ice", hp: 100, attack: 13, defense: 15, speed: 7, color: "#B0E0E6", moveIds: ["icicle-crash", "hail-storm", "avalanche", "frost-breath"], emoji: "(❄.❄)" },
  { id: "grass-legend", name: "Flora Doro", type: "grass", hp: 105, attack: 14, defense: 12, speed: 9, color: "#32CD32", moveIds: ["leaf-blade", "petal-dance", "seed-bomb", "spore-cloud"], emoji: "(🌸.🌸)" },
  { id: "hybrid-cosmic", name: "Stardust Doro", type: "cosmic", hp: 98, attack: 13, defense: 11, speed: 12, color: "#DDA0DD", moveIds: ["love-beam", "moonbeam", "heal-purr", "nebula-burst"], emoji: "(✿.✿)" },
];

export const DORO_SKINS = [
  { id: "classic", name: "Classic Doro", color: "#FFB6C1", rarity: "Common", category: "basic" },
  { id: "golden", name: "Golden Doro", color: "#FFD700", rarity: "Rare", category: "basic" },
  { id: "cosmic", name: "Cosmic Doro", color: "#9B59B6", rarity: "Epic", category: "elemental" },
  { id: "ice", name: "Ice Doro", color: "#87CEEB", rarity: "Common", category: "elemental" },
  { id: "fire", name: "Fire Doro", color: "#FF6347", rarity: "Rare", category: "elemental" },
  { id: "shadow", name: "Shadow Doro", color: "#2C3E50", rarity: "Epic", category: "elemental" },
  { id: "ocean", name: "Ocean Doro", color: "#4FC3F7", rarity: "Common", category: "elemental" },
  { id: "sakura", name: "Sakura Doro", color: "#F8BBD0", rarity: "Rare", category: "seasonal" },
  { id: "emerald", name: "Emerald Doro", color: "#2ECC71", rarity: "Epic", category: "elemental" },
  { id: "sunset", name: "Sunset Doro", color: "#FF8A65", rarity: "Common", category: "seasonal" },
  { id: "nebula", name: "Nebula Doro", color: "#7C4DFF", rarity: "Legendary", category: "mythical" },
  { id: "diamond", name: "Diamond Doro", color: "#00BCD4", rarity: "Legendary", category: "mythical" },
  { id: "thunder", name: "Thunder Doro", color: "#FFD700", rarity: "Rare", category: "elemental" },
  { id: "dragon", name: "Dragon Doro", color: "#7B68EE", rarity: "Epic", category: "mythical" },
  { id: "mystic", name: "Mystic Doro", color: "#FF69B4", rarity: "Epic", category: "mythical" },
  { id: "cherry", name: "Cherry Doro", color: "#DC143C", rarity: "Common", category: "seasonal" },
  { id: "mint", name: "Mint Doro", color: "#98FB98", rarity: "Common", category: "seasonal" },
  { id: "lavender", name: "Lavender Doro", color: "#E6E6FA", rarity: "Rare", category: "seasonal" },
  { id: "aurora", name: "Aurora Doro", color: "#00CED1", rarity: "Epic", category: "mythical" },
  { id: "rose-gold", name: "Rose Gold Doro", color: "#E8B4B8", rarity: "Rare", category: "basic" },
  { id: "neon", name: "Neon Doro", color: "#39FF14", rarity: "Rare", category: "cyber" },
  { id: "pixel", name: "Pixel Doro", color: "#FF1493", rarity: "Epic", category: "cyber" },
  { id: "hologram", name: "Hologram Doro", color: "#7FFFD4", rarity: "Legendary", category: "cyber" },
  { id: "bitcoin", name: "Bitcoin Doro", color: "#F7931A", rarity: "Epic", category: "crypto" },
  { id: "solana", name: "Solana Doro", color: "#9945FF", rarity: "Legendary", category: "crypto" },
  { id: "ethereum", name: "Ethereum Doro", color: "#627EEA", rarity: "Epic", category: "crypto" },
  { id: "pump", name: "Pump Doro", color: "#00E676", rarity: "Rare", category: "crypto" },
  { id: "whale", name: "Whale Doro", color: "#1565C0", rarity: "Legendary", category: "crypto" },
  { id: "moon", name: "Moon Doro", color: "#FFF9C4", rarity: "Rare", category: "crypto" },
  { id: "phantom", name: "Phantom Doro", color: "#AB47BC", rarity: "Legendary", category: "mythical" },
  { id: "peach", name: "Peach Doro", color: "#FFCCBC", rarity: "Common", category: "basic" },
  { id: "galaxy", name: "Galaxy Doro", color: "#1A237E", rarity: "Legendary", category: "mythical" },
];

export const SKIN_CATEGORIES = [
  { id: "all", name: "All" },
  { id: "basic", name: "Basic" },
  { id: "elemental", name: "Elemental" },
  { id: "seasonal", name: "Seasonal" },
  { id: "mythical", name: "Mythical" },
  { id: "cyber", name: "Cyber" },
  { id: "crypto", name: "Crypto" },
];

export const DORO_OUTFITS = [
  { id: "default", name: "No Outfit" },
  { id: "astronaut", name: "Astronaut" },
  { id: "pirate", name: "Pirate Captain" },
  { id: "wizard", name: "Wizard" },
  { id: "ninja", name: "Ninja" },
  { id: "chef", name: "Master Chef" },
  { id: "samurai", name: "Samurai" },
  { id: "knight", name: "Knight" },
  { id: "rockstar", name: "Rockstar" },
  { id: "detective", name: "Detective" },
  { id: "superhero", name: "Superhero" },
  { id: "pharaoh", name: "Pharaoh" },
  { id: "cyborg", name: "Cyborg" },
  { id: "viking", name: "Viking" },
  { id: "pilot", name: "Pilot" },
  { id: "hoodie", name: "Hoodie" },
];

export const DORO_ACCESSORIES = [
  { id: "none", name: "None" },
  { id: "crown", name: "Crown" },
  { id: "sunglasses", name: "Sunglasses" },
  { id: "bowtie", name: "Bow Tie" },
  { id: "headphones", name: "Headphones" },
  { id: "monocle", name: "Monocle" },
  { id: "halo", name: "Halo" },
  { id: "scarf", name: "Scarf" },
  { id: "wings", name: "Angel Wings" },
  { id: "shield", name: "Mini Shield" },
  { id: "katana", name: "Katana" },
  { id: "wand", name: "Magic Wand" },
  { id: "laser-eyes", name: "Laser Eyes" },
  { id: "diamond-hands", name: "Diamond Hands" },
  { id: "rocket", name: "Rocket Pack" },
  { id: "chain", name: "Gold Chain" },
];

export const TRAINER_TITLES = [
  "HODL Master",
  "Diamond Hands",
  "To The Moon",
  "WAGMI Warrior",
  "Degen King",
  "Rug Dodger",
  "Pump It Up",
  "Whale Alert",
  "Ape In Chief",
  "Paper Hands",
  "GM Soldier",
  "DYOR Scholar",
  "Bag Holder",
  "Moon Walker",
  "Flip Master",
  "Alpha Hunter",
  "NFT Collector",
  "Solana Maxi",
  "Meme Lord",
  "Doro Sensei",
  "Galaxy Explorer",
  "Cosmic Guardian",
  "Nebula Knight",
  "Star Voyager",
];

export const DORO_FACES = [
  { id: "happy", emoji: "(^.^)", label: "Happy" },
  { id: "love", emoji: "(♥.♥)", label: "Love" },
  { id: "cool", emoji: "(⌐■_■)", label: "Cool" },
  { id: "excited", emoji: "(★.★)", label: "Excited" },
  { id: "sleepy", emoji: "(-.-)", label: "Sleepy" },
  { id: "angry", emoji: "(>.<)", label: "Angry" },
  { id: "surprised", emoji: "(O.O)", label: "Surprised" },
  { id: "sparkle", emoji: "(✿.✿)", label: "Sparkle" },
  { id: "wink", emoji: "(^.~)", label: "Wink" },
  { id: "cry", emoji: "(T.T)", label: "Cry" },
  { id: "blush", emoji: "(*.*)", label: "Blush" },
  { id: "dizzy", emoji: "(@.@)", label: "Dizzy" },
  { id: "smug", emoji: "(¬.¬)", label: "Smug" },
  { id: "dead", emoji: "(x.x)", label: "Dead" },
  { id: "cat", emoji: "(=^.^=)", label: "Cat" },
  { id: "moon", emoji: "(◉.◉)", label: "Moon" },
];

export const RARITY_COLORS: Record<string, string> = {
  Common: "text-zinc-400 border-zinc-400/30 bg-zinc-400/10",
  Rare: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  Epic: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  Legendary: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
};
