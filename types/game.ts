// --- TYPES DE BASE ---
export type Direction = "up" | "down" | "left" | "right";

export type GameState =
  | "start"
  | "playing"
  | "inventory"
  | "shop"
  | "gameover"
  | "dialogue"
  | "spellbook"
  | "levelup";

export interface Position {
  x: number;
  y: number;
}

export type BiomeType = "cave" | "ruins" | "volcano" | "crystal";

export interface Stats {
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
}

// --- ENTITÉS & OBJETS ---

export type ItemType =
  | "weapon"
  | "armor"
  | "potion"
  | "gold"
  | "item"
  | "scroll"
  | "accessory"
  | "consumable"
  | "spellbook";
export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type WeaponType =
  | "sword"
  | "bow"
  | "pistol"
  | "staff"
  | "dagger"
  | "axe"
  | "spear"
  | "wand";

export interface Entity {
  id: string;
  type: string;
  name: string;
  position: Position;
  spriteKey: string;
  stats: Stats;
  isHostile: boolean;
  isDead?: boolean;
  isHidden?: boolean;
  visualScale: number;

  // IA & Combat
  aiBehavior?: string;
  range?: number;
  projectileColor?: string;
  moveTimer?: number;
  statusEffects?: string[];
  knockbackX?: number;
  knockbackY?: number;

  // Spécifique Shop/Coffre
  isOpen?: boolean;
  shopInventory?: Item[];
  value?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  spriteKey: string;
  value?: number;
  stats?: Partial<Stats>;
  description?: string;
  level?: number;
  color?: string;
  visualColor?: string;
  rarity?: Rarity;

  // Spécifique Arme
  weaponType?: WeaponType;
  range?: number;
  onHitEffect?: { type: string; chance: number; value: number };
  applyStatus?: {
    type: string;
    chance: number;
    duration: number;
    power: number;
  };

  // Spécifique Grimoire
  spellId?: string;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

// --- SYSTÈME DE PROGRESSION ---

export interface Player {
  // Subset de PlayerState utilisé pour les effets (perks/masteries)
  stats: Stats;
  xp: number;
  // On peut ajouter d'autres champs si nécessaire
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon: string;
  effect: (p: Player) => void;
}

export interface Mastery {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: "passive" | "consumable";
  maxRank: number;
  currentRank: number;
  effect: (p: Player) => void;
}

// --- COMBAT & MONDE ---

export interface Spell {
  id: string;
  name: string;
  cost: number;
  cooldown: number;
  currentCooldown: number;
  damage: number;
  description: string;
  effect?: string;
  color?: string;
}

export interface Projectile {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  damage: number;
  color: string;
  progress: number;
  speed: number;
  trail: Position[];
  projectileType: string;
  isEnemy: boolean;
  critChance?: number;
  critMult?: number;
  knockback?: number;
  piercing?: number;
  hitList?: string[];
  explodeOnHit?: boolean;
  radius?: number;
  homing?: number;
  statusEffect?: string;
}

export interface Particle {
  x: number;
  y: number;
  color: string;
  life: number;
  size: number;
  vx: number;
  vy: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  isCrit: boolean;
}

export interface SpeechBubble {
  id: string;
  targetId: string;
  text: string;
  color: string;
  duration: number;
  createdAt: number;
}

export interface Tile {
  x: number;
  y: number;
  type: "floor" | "wall";
  visibility: "visible" | "hidden" | "fog";
}

export interface LevelTheme {
  floorColor: string;
  wallColor: string;
  wallSideColor: string;
  name: string;
}

export interface AttackAnim {
  id: string;
  x: number;
  y: number;
  dir: Direction;
  type: string;
  progress: number;
}
