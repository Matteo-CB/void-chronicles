import { Entity, Stats } from "@/types/game";

const BASE_STATS: Stats = {
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  attack: 10,
  defense: 2,
  speed: 1,
  xpValue: 10,
  critChance: 0.05,
  critDamage: 1.5,
  dodgeChance: 0,
  lifesteal: 0,
  armorPen: 0,
  cooldownReduction: 0,
  spellPower: 0,
  strength: 1,
  endurance: 1,
  agility: 1,
  wisdom: 1,
  willpower: 1,
  luck: 1,
  accuracy: 1,
  arcane: 1,
};

// Interface étendue pour les comportements IA avancés
export interface EnemyConfig extends Partial<Entity> {
  aiBehavior:
    | "chaser"
    | "archer"
    | "caster"
    | "tank"
    | "boss"
    | "summoner"
    | "healer"; // Nouveaux comportements
  aggroRange?: number;
  fleeHealthThreshold?: number;
  minDistance?: number;
  attackCooldown?: number;
  summonType?: string; // Quel ennemi invoquer ?
  maxSummons?: number; // Combien max ?
  healAmount?: number; // Combien de PV soigner ?
  minLevel?: number; // AJOUT : Niveau min pour spawn
  maxLevel?: number; // AJOUT : Niveau max pour spawn
  xpReward?: number; // AJOUT : Pour questGen
}

export const ENEMY_DB: Record<string, EnemyConfig> = {
  RAT: {
    name: "Rat Géant",
    type: "rat",
    spriteKey: "RAT",
    stats: {
      ...BASE_STATS,
      hp: 30,
      maxHp: 30,
      attack: 5,
      speed: 1.3,
      xpValue: 5,
    },
    aiBehavior: "chaser",
    aggroRange: 8,
    visualScale: 0.8,
    minLevel: 1,
    maxLevel: 5,
    xpReward: 10,
  },
  GOBLIN: {
    name: "Gobelin",
    type: "goblin",
    spriteKey: "GOBLIN",
    stats: {
      ...BASE_STATS,
      hp: 50,
      maxHp: 50,
      attack: 8,
      speed: 1.0,
      xpValue: 10,
    },
    aiBehavior: "chaser",
    aggroRange: 10,
    visualScale: 1,
    minLevel: 2,
    maxLevel: 8,
    xpReward: 20,
  },
  SKELETON: {
    name: "Squelette",
    type: "skeleton",
    spriteKey: "SKELETON",
    stats: {
      ...BASE_STATS,
      hp: 40,
      maxHp: 40,
      attack: 12,
      speed: 0.8,
      xpValue: 12,
    },
    aiBehavior: "tank",
    aggroRange: 12,
    visualScale: 1,
    minLevel: 4,
    maxLevel: 15,
    xpReward: 35,
  },
  ARCHER: {
    name: "Archer Squelette",
    type: "skeleton_archer", // type distinct pour questGen
    spriteKey: "ARCHER",
    stats: {
      ...BASE_STATS,
      hp: 35,
      maxHp: 35,
      attack: 10,
      speed: 0.9,
      xpValue: 15,
    },
    aiBehavior: "archer",
    range: 6,
    minDistance: 4,
    aggroRange: 10,
    visualScale: 1,
    minLevel: 5,
    maxLevel: 15,
    xpReward: 40,
  },
  BAT: {
    name: "Chauve-souris",
    type: "bat",
    spriteKey: "BAT",
    stats: {
      ...BASE_STATS,
      hp: 20,
      maxHp: 20,
      attack: 6,
      speed: 1.6,
      xpValue: 8,
      dodgeChance: 0.2,
    },
    aiBehavior: "chaser",
    aggroRange: 7,
    visualScale: 0.7,
    minLevel: 2,
    maxLevel: 10,
    xpReward: 15,
  },
  SLIME: {
    name: "Slime",
    type: "slime",
    spriteKey: "SLIME",
    stats: {
      ...BASE_STATS,
      hp: 60,
      maxHp: 60,
      attack: 7,
      speed: 0.6,
      xpValue: 12,
    },
    aiBehavior: "chaser",
    aggroRange: 5,
    visualScale: 1,
    minLevel: 6,
    maxLevel: 20,
    xpReward: 50,
  },
  SORCERER: {
    name: "Sorcier Noir",
    type: "cultist", // type distinct
    spriteKey: "SORCERER",
    stats: {
      ...BASE_STATS,
      hp: 45,
      maxHp: 45,
      attack: 15,
      speed: 0.8,
      xpValue: 25,
    },
    aiBehavior: "caster",
    range: 6,
    minDistance: 5,
    aggroRange: 11,
    projectileColor: "#8b5cf6",
    visualScale: 1,
    minLevel: 8,
    maxLevel: 25,
    xpReward: 60,
  },
  // --- NOUVEAUX ENNEMIS ---
  ORC_WARRIOR: {
    name: "Guerrier Orc",
    type: "orc",
    spriteKey: "ORC_WARRIOR",
    stats: {
      ...BASE_STATS,
      hp: 120,
      maxHp: 120,
      attack: 18,
      defense: 5,
      speed: 0.7,
      xpValue: 40,
    },
    aiBehavior: "tank",
    aggroRange: 8,
    visualScale: 1.1,
    minLevel: 10,
    maxLevel: 30,
    xpReward: 80,
  },
  NECROMANCER: {
    name: "Nécromancien",
    type: "necromancer",
    spriteKey: "NECROMANCER",
    stats: {
      ...BASE_STATS,
      hp: 60,
      maxHp: 60,
      attack: 8,
      speed: 0.7,
      xpValue: 50,
    },
    aiBehavior: "summoner",
    summonType: "SKELETON",
    maxSummons: 3,
    range: 7,
    minDistance: 6,
    aggroRange: 12,
    visualScale: 1,
    minLevel: 12,
    maxLevel: 35,
    xpReward: 100,
  },
  CLERIC: {
    name: "Clerc Corrompu",
    type: "cleric",
    spriteKey: "PRIEST",
    stats: {
      ...BASE_STATS,
      hp: 50,
      maxHp: 50,
      attack: 5,
      speed: 0.9,
      xpValue: 30,
    },
    aiBehavior: "healer",
    healAmount: 20,
    range: 5,
    minDistance: 5,
    aggroRange: 10,
    visualScale: 0.9,
    minLevel: 10,
    maxLevel: 30,
    xpReward: 70,
  },
  GOLEM: {
    name: "Golem de Pierre",
    type: "golem",
    spriteKey: "GOLEM",
    stats: {
      ...BASE_STATS,
      hp: 150,
      maxHp: 150,
      attack: 15,
      defense: 10,
      speed: 0.5,
      xpValue: 150,
    },
    aiBehavior: "tank",
    minLevel: 10,
    maxLevel: 30,
    xpReward: 150,
  },
};

// --- AJOUT : Export lowercase pour compatibilité avec questGen ---
export const ENEMIES: Record<string, EnemyConfig> = {
  rat: ENEMY_DB.RAT,
  goblin: ENEMY_DB.GOBLIN,
  bat: ENEMY_DB.BAT,
  skeleton: ENEMY_DB.SKELETON,
  archer: ENEMY_DB.ARCHER,
  slime: ENEMY_DB.SLIME,
  sorcerer: ENEMY_DB.SORCERER,
  orc: ENEMY_DB.ORC_WARRIOR,
  necromancer: ENEMY_DB.NECROMANCER,
  cleric: ENEMY_DB.CLERIC,
  golem: ENEMY_DB.GOLEM,
};

export function createEnemy(
  key: string,
  position: { x: number; y: number },
  level: number
): Entity {
  const base = ENEMY_DB[key] || ENEMY_DB["RAT"];
  const multiplier = 1 + (level - 1) * 0.25;

  const stats = { ...base.stats! };
  stats.hp = Math.floor(stats.hp * multiplier);
  stats.maxHp = Math.floor(stats.maxHp * multiplier);
  stats.attack = Math.floor(stats.attack * multiplier);
  stats.xpValue = Math.floor(stats.xpValue * multiplier);

  const enemyData = {
    id: `enemy_${Date.now()}_${Math.random()}`,
    type: base.type || "enemy",
    name: base.name!,
    spriteKey: base.spriteKey!,
    position: { ...position },
    stats,
    isHostile: true,
    visualScale: base.visualScale || 1,
    aiBehavior: base.aiBehavior as any,
    range: base.range,
    projectileColor: base.projectileColor,
    minDistance: base.minDistance || 0,
    aggroRange: base.aggroRange || 10,
    moveTimer: Math.random() * 1000,
    attackTimer: Math.random() * 2000,
    // Propriétés spécifiques IA
    summonType: base.summonType,
    maxSummons: base.maxSummons,
    healAmount: base.healAmount,
    // Pour les quêtes
    xpReward: base.xpReward,
    minLevel: base.minLevel,
    maxLevel: base.maxLevel,
  };

  return enemyData as any as Entity;
}
