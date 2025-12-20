import {
  Player,
  MapTile,
  Entity,
  Item,
  Direction,
  GameState,
  Particle,
  FloatingText,
  Projectile,
  AttackAnim,
  SpeechBubble,
  LevelTheme,
  Quest,
} from "@/types/game";

export interface GameStore {
  // --- ÉTAT DU JEU ---
  map: MapTile[][];
  player: Player;
  enemies: Entity[];
  inventory: (Item | null)[];
  logs: string[];
  levelTheme: LevelTheme;

  dungeonLevel: number;
  gameState: GameState;
  isLoading: boolean;
  inputMethod: "keyboard" | "gamepad";
  menuSelectionIndex: number;

  currentSlot: number;
  screenShake: number;
  hitStop: number;
  damageFlash: number;

  // Dialogues & Cutscenes
  currentDialogue?: string;
  currentCutsceneId?: string | null;
  currentMerchantId?: string;
  speechBubbles: SpeechBubble[];
  attackAnims: AttackAnim[];

  // Effets Visuels
  particles: Particle[];
  floatingTexts: FloatingText[];
  projectiles: Projectile[];

  // --- ACTIONS ---

  // Système
  initGame: (loadSave?: boolean, slotId?: number) => Promise<void>;
  saveGame: () => void;
  updateGameLogic: (dt: number) => void;
  combatLoopLogic: (dt: number) => void;

  // Initialisation Nouvelle Partie avec Classe
  startGameWithClass: (classId: string) => void;

  setGameState: (state: GameState) => void;
  playerAttack: () => void;

  // Actions Joueur
  movePlayer: (dir: Direction) => void;
  movePlayerMapLogic: (direction: Direction) => void;

  // --- AJOUT DASH ICI ---
  dash: () => void;

  performAttack: (type: "light" | "heavy") => void;
  performAttackAction: (type: "light" | "heavy") => void;

  castSpell: (index: number) => void;
  castSpellAction: (index: number) => void;

  interact: () => void;
  interactMapLogic: () => void;

  equipSpell: (spellId: string, slotIndex: number) => void;
  incrementAttribute: (stat: string) => void;
  unlockMastery: (id: string) => void;
  calculateStats: () => void;

  // UI & Inventaire
  toggleInventory: () => void;
  navigateMenu: (dir: Direction) => void;
  cycleMenuTab: (direction: "next" | "prev") => void;
  confirmMenuAction: () => void;
  selectMenuItem: () => void;
  setMenuSelectionIndex: (index: number) => void; // <--- AJOUT CRITIQUE

  addItem: (item: Item) => boolean;
  equipItem: (item: Item) => void;
  unequipItem: (slot: string) => void;
  useItem: (itemId: string) => void;
  buyItem: (item: Item) => void;

  // CORRECTION : Ajout des méthodes manquantes pickupItem et dropItem
  pickupItem: (item: any) => void;
  dropItem: (index: number) => void;

  closeShop: () => void;
  closeLevelUp: () => void;
  closeUi: () => void;
  setInputMethod: (method: "keyboard" | "gamepad") => void;

  // Feedback & Logs
  addLog: (msg: string) => void;
  addProjectile: (p: Projectile) => void;
  addParticle: (p: Particle) => void;
  addFloatingText: (t: FloatingText) => void;

  addEffects: (
    x: number,
    y: number,
    color: string,
    count: number,
    text?: string,
    textColor?: string
  ) => void;

  spawnParticles: (
    x: number,
    y: number,
    color: string,
    count: number,
    type?: "blood" | "spark" | "normal"
  ) => void;

  triggerAttackAnim: (
    x: number,
    y: number,
    dir: Direction,
    type: string
  ) => void;

  // Histoire
  startCutscene: (id: string) => void;
  advanceDialogue: () => void;
  advanceCutscene: () => void;
  skipCutscene: () => void;

  // Speech
  addSpeechBubble: (b: SpeechBubble) => void;
  removeSpeechBubble: (id: string) => void;

  // Progression
  gainXp: (amount: number) => void;
  levelUp: () => void;

  // Quêtes
  acceptQuest: (quest: Quest) => void;
  updateQuestProgress: (
    type: string,
    targetId: string,
    amount?: number
  ) => void;
  completeQuest: (id: string) => void;
  abandonQuest: (id: string) => void;
}
