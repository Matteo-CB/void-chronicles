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
  | "levelup"
  | "pause_menu"
  | "management_menu"
  | "quests"
  | "masteries"; // AJOUT : État pour l'arbre de talents

export interface Position {
  x: number;
  y: number;
}

// Alias pour compatibilité
export type MapTile = Tile;

export type BiomeType = "cave" | "ruins" | "volcano" | "crystal";

export interface Stats {
  hp: number;
  hpRegen: number;
  xpGain: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  attackSpeed: number;
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

// --- QUÊTES ---
export type QuestType = "kill" | "collect" | "explore" | "interact";
export type QuestStatus =
  | "active"
  | "completed"
  | "failed"
  | "ready_to_turn_in";

export interface QuestObjective {
  id: string;
  type: QuestType;
  targetId: string | undefined;
  description: string;
  current: number;
  required: number;
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: {
    xp?: number;
    gold?: number;
    items?: Item[];
  };
  autoComplete?: boolean;
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
  isBoss?: boolean;

  // IA & Combat
  aiBehavior?:
    | "chaser"
    | "archer"
    | "caster"
    | "tank"
    | "boss"
    | "static"
    | "aggressive"
    | "guardian"
    | "summoner"
    | "healer";

  range?: number;
  projectileColor?: string;
  moveTimer?: number;

  // IA Properties
  attackTimer?: number;
  attackCooldown?: number;
  aggroRange?: number;
  minDistance?: number;

  summonType?: string;
  maxSummons?: number;
  healAmount?: number;

  statusEffects?: string[];
  knockbackX?: number;
  knockbackY?: number;

  // Spécifique Shop/Coffre
  isOpen?: boolean;
  shopInventory?: Item[];
  value?: number;

  // Propriétés étendues
  equipment?: Equipment;
  spells?: Spell[];
  rarityColor?: string;

  // Pour le ramassage de quête
  quest?: Quest;
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
  weaponType?: WeaponType;
  range?: number;
  onHitEffect?: { type: string; chance: number; value: number };
  applyStatus?: {
    type: string;
    chance: number;
    duration: number;
    power: number;
  };
  spellId?: string;

  // Propriété pour les items de quête (parchemins)
  quest?: Quest;
}

// CORRECTION : Ajout de InventoryItem
export type InventoryItem = Item;

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

// --- SYSTÈME DE PROGRESSION ---
export interface Player {
  classId?: string;
  stats: Stats;
  xp: number;
  gold: number;
  attributePoints: number;
  masteryPoints: number;
  level: number;
  xpToNext: number;
  direction: Direction;
  position: Position;
  equipment: Equipment;
  inventory: (Item | null)[];

  spells: Spell[];
  learnedSpells: string[];
  equippedSpells: (string | null)[];

  // ADAPTATION : string[] est requis pour le nouveau système (stocke les IDs)
  masteries: string[];
  quests: Quest[];

  lastAttackTime?: number;
  lastDashTime?: number;
  statusEffects: string[];
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

  // Champs fusionnés (Ancien système + Nouveau système)
  // Les champs optionnels (?) permettent la compatibilité avec tes anciens fichiers
  type?: "passive" | "consumable";
  maxRank?: number;
  currentRank?: number;
  effect?: (p: Player) => void;

  // Nouveaux champs pour l'Arbre de Talents
  parentId?: string | null;
  category?: "offense" | "defense" | "utility";
  stats?: Partial<Stats>;
  x?: number; // Position X dans la grille
  y?: number; // Position Y dans la grille
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
  range?: number;
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
  type?: "blood" | "spark" | "normal";
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
  targetId: string | undefined;
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
  lightLevel?: number;
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
