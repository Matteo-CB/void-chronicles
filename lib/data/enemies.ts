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

// Base de données des ennemis (Exportée pour levels.ts)
export const ENEMY_DB: Record<string, Partial<Entity>> = {
  RAT: {
    name: "Rat Géant",
    spriteKey: "RAT",
    stats: {
      ...BASE_STATS,
      hp: 30,
      maxHp: 30,
      attack: 5,
      speed: 1.2,
      xpValue: 5,
    },
    aiBehavior: "chaser",
    visualScale: 0.8,
  },
  GOBLIN: {
    name: "Gobelin",
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
    visualScale: 1,
  },
  SKELETON: {
    name: "Squelette",
    spriteKey: "SKELETON",
    stats: {
      ...BASE_STATS,
      hp: 40,
      maxHp: 40,
      attack: 12,
      speed: 0.8,
      xpValue: 12,
    },
    aiBehavior: "chaser",
    visualScale: 1,
  },
  ARCHER: {
    name: "Archer Squelette",
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
    visualScale: 1,
  },
  BAT: {
    name: "Chauve-souris",
    spriteKey: "BAT",
    stats: {
      ...BASE_STATS,
      hp: 20,
      maxHp: 20,
      attack: 6,
      speed: 1.5,
      xpValue: 8,
    },
    aiBehavior: "chaser",
    visualScale: 0.7,
  },
  SLIME: {
    name: "Slime",
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
    visualScale: 1,
  },
  SORCERER: {
    name: "Sorcier Noir",
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
    range: 5,
    projectileColor: "#8b5cf6",
    visualScale: 1,
  },
};

// Fonction de création (Utilisée par spawner.ts)
export function createEnemy(
  key: string,
  position: { x: number; y: number },
  level: number
): Entity {
  const base = ENEMY_DB[key] || ENEMY_DB["RAT"];
  const multiplier = 1 + (level - 1) * 0.2;

  // On s'assure de cloner proprement les stats
  const stats = { ...base.stats! };
  stats.hp = Math.floor(stats.hp * multiplier);
  stats.maxHp = Math.floor(stats.maxHp * multiplier);
  stats.attack = Math.floor(stats.attack * multiplier);
  stats.xpValue = Math.floor(stats.xpValue * multiplier);

  return {
    id: `enemy_${Date.now()}_${Math.random()}`,
    type: "enemy",
    name: base.name!,
    spriteKey: base.spriteKey!,
    position: { ...position },
    stats,
    isHostile: true,
    visualScale: base.visualScale || 1,
    aiBehavior: base.aiBehavior as any,
    range: base.range,
    projectileColor: base.projectileColor,
    moveTimer: Math.random() * 1000, // Décalage initial pour éviter que tous bougent en même temps
  };
}
