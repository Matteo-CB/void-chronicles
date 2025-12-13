export type Position = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";
export type EntityType =
  | "player"
  | "enemy"
  | "chest"
  | "gold"
  | "stairs"
  | "potion"
  | "shrine"
  | "merchant"
  | "decoration";
export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type ItemType =
  | "weapon"
  | "armor"
  | "accessory"
  | "consumable"
  | "spellbook";
export type WeaponType = "sword" | "bow" | "staff" | "pistol";
export type BiomeType = "cave" | "ruins" | "volcano" | "crystal";
export type InputMethod = "keyboard" | "gamepad";

export interface Stats {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  xpValue: number;
}

export interface Spell {
  id: string;
  name: string;
  cost: number;
  description: string;
  cooldown: number;
  currentCooldown: number;
  color: string;
  range: number;
  damage?: number;
  effect?: "heal" | "damage" | "stun" | "buff";
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  weaponType?: WeaponType;
  rarity: Rarity;
  value: number;
  statModifier?: Partial<Stats>;
  description: string;
  visualColor: string;
  stats?: Partial<Stats>;
  color: string;
  spellId?: string;
  range?: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  position: Position;
  direction: Direction;
  stats: Stats;
  spriteKey: string;
  isHostile: boolean;
  equipment?: Equipment;
  spells?: Spell[];
  lootTable?: string[];
  isOpen?: boolean;
  value?: number;
  aiBehavior?: "aggressive" | "passive" | "guardian" | "caster" | "archer";
  shopInventory?: Item[];
  isHidden?: boolean;
  visualScale?: number;
  isBoss?: boolean;
  bossSignatureMove?: string;
  rarityColor?: string;
  buffs?: string[];
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
}

export interface Tile {
  x: number;
  y: number;
  type: "floor" | "wall" | "void";
  variant: number;
  structure?: Entity;
}

export interface LevelTheme {
  name: string;
  floorColor: string;
  wallColor: string;
  wallSideColor: string;
}

export interface GameState {
  map: Tile[][];
  levelTheme: LevelTheme;
  player: Entity & {
    level: number;
    xp: number;
    xpToNext: number;
    gold: number;
    equipment: Equipment;
    spells: Spell[];
    learnedSpells: string[];
    equippedSpells: string[];
  };
  enemies: Entity[];
  inventory: Item[];
  log: string[];
  turn: number;
  gameState:
    | "playing"
    | "menu"
    | "dialogue"
    | "levelup"
    | "gameover"
    | "inventory"
    | "shop"
    | "spellbook";
  currentDialogue: string | null;
  dungeonLevel: number;
  particles: Particle[];
  floatingTexts: FloatingText[];
  screenShake: number;
  currentMerchantId: string | null;
  showResetConfirmation: boolean;
  isLoading: boolean;
  currentBiomeId: string;
  selectedInventoryIndex: number;
  selectedShopIndex: number;
  inputMethod: InputMethod;
}
