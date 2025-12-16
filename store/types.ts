import {
  Entity,
  Item,
  LevelTheme,
  Particle,
  Projectile,
  SpeechBubble,
  Tile,
  FloatingText,
  Direction,
  AttackAnim,
  Equipment,
} from "@/types/game";

export interface PlayerState {
  position: { x: number; y: number };
  direction: Direction;
  stats: {
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    attack: number;
    defense: number;
    speed: number;
    xpValue: number;
    critChance: number;
    critDamage: number;
    dodgeChance: number;
    lifesteal: number;
    armorPen: number;
    cooldownReduction: number;
    spellPower: number;
    strength: number;
    endurance: number;
    agility: number;
    wisdom: number;
    willpower: number;
    luck: number;
    accuracy: number;
    arcane: number;
  };
  gold: number;
  xp: number;
  xpToNext: number;
  level: number;
  equipment: Equipment;
  spells: any[];
  learnedSpells: string[];
  equippedSpells: (string | null)[];
  statusEffects: any[];
  attributePoints: number;
  masteryPoints: number;
  masteries: any[];
  lastAttackTime?: number;
  name?: string;
}

export interface GameStore {
  // État
  map: Tile[][];
  player: PlayerState;
  enemies: Entity[];
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  logs: string[]; // CORRECTION: Nom standardisé
  inventory: (Item | null)[];
  dungeonLevel: number;
  gameState:
    | "start"
    | "playing"
    | "inventory"
    | "shop"
    | "gameover"
    | "dialogue"
    | "spellbook"
    | "levelup";
  levelTheme: LevelTheme;
  screenShake: number;
  isLoading: boolean;

  // Dialogues & Cutscenes (Mise à jour pour Visual Novel)
  currentDialogue?: string;
  currentCutsceneId?: string | null; // NOUVEAU

  currentMerchantId?: string;
  speechBubbles: SpeechBubble[];
  attackAnims: AttackAnim[];
  inputMethod: "keyboard" | "gamepad";
  menuSelectionIndex: number;

  // Actions
  initGame: (loadSave?: boolean) => Promise<void>;
  saveGame: () => void;
  updateGameLogic: (dt: number) => void;

  // Actions Joueur
  movePlayer: (dir: Direction) => void;
  performAttack: (type: "light" | "heavy") => void;
  castSpell: (index: number) => void;
  interact: () => void;
  equipSpell: (spellId: string, slotIndex: number) => void;
  incrementAttribute: (attr: string) => void;
  unlockMastery: (masteryId: string) => void;
  calculateStats: () => void;

  // Logique Map (interne mais exposée au store pour les slices)
  movePlayerMapLogic: (direction: Direction) => void;
  interactMapLogic: () => void;

  // UI & Inventaire
  toggleInventory: () => void;
  equipItem: (item: Item) => void;
  unequipItem: (slot: string) => void;
  useItem: (itemId: string) => void;
  addItem: (item: Item) => void;
  closeLevelUp: () => void;

  // Shop
  closeShop: () => void;
  buyItem: (item: Item) => void;

  // Navigation Menu
  navigateMenu: (dir: Direction) => void;
  selectMenuItem: () => void;

  // Système
  addLog: (msg: string) => void;
  addProjectile: (p: Projectile) => void;
  addEffects: (
    x: number,
    y: number,
    color: string,
    count: number,
    text?: string,
    textColor?: string
  ) => void;
  spawnParticles: (x: number, y: number, color: string, count: number) => void;
  triggerAttackAnim: (
    x: number,
    y: number,
    dir: Direction,
    type: string
  ) => void;

  // UI Helpers
  closeUi: () => void;
  setInputMethod: (method: "keyboard" | "gamepad") => void;

  // Gestion Histoire (NOUVEAU)
  advanceDialogue: () => void; // Gardé pour compatibilité
  startCutscene: (id: string) => void; // NOUVEAU
  advanceCutscene: () => void; // NOUVEAU

  // Speech
  addSpeechBubble: (bubble: SpeechBubble) => void;
  removeSpeechBubble: (id: string) => void;
}
