import { Entity, Stats } from "@/types/game";

// Stats bidons pour les décors
const DECOR_STATS: Stats = {
  hp: 1,
  maxHp: 1,
  mana: 0,
  xpRegen: 0,
  hpGain: 0,
  maxMana: 0,
  attack: 0,
  attackSpeed: 0,
  defense: 0,
  speed: 0,
  xpValue: 0,
  critChance: 0,
  critDamage: 0,
  dodgeChance: 0,
  lifesteal: 0,
  armorPen: 0,
  cooldownReduction: 0,
  spellPower: 0,
  strength: 0,
  endurance: 0,
  agility: 0,
  wisdom: 0,
  willpower: 0,
  luck: 0,
  accuracy: 0,
  arcane: 0,
};

// Base de données étendue
export const DECORATION_DB: Record<string, Partial<Entity>> = {
  // --- BASE ---
  RUBBLE: { name: "Débris", spriteKey: "RUBBLE", visualScale: 1 },
  ROCK: { name: "Rocher", spriteKey: "ROCK", visualScale: 1.2 },
  MUSHROOM: {
    name: "Champignon Lumineux",
    spriteKey: "MUSHROOM",
    visualScale: 0.8,
  },
  CRACK: { name: "Sol Fissuré", spriteKey: "CRACK", visualScale: 1 },
  VENT: { name: "Ventilation", spriteKey: "VENT", visualScale: 1 },
  PIPE: { name: "Tuyau Rouillé", spriteKey: "PIPE", visualScale: 1 },
  BONES: { name: "Ossements", spriteKey: "BONES", visualScale: 0.9 },

  // --- MEUBLES ---
  BARREL: { name: "Tonneau", spriteKey: "BARREL", visualScale: 1 },
  CRATE: { name: "Caisse", spriteKey: "CRATE", visualScale: 1 },
  BOOKSHELF: {
    name: "Bibliothèque Ancienne",
    spriteKey: "CRATE",
    visualScale: 1.1,
    rarityColor: "#8b5cf6",
  },
  TABLE: { name: "Table", spriteKey: "RUBBLE", visualScale: 1 },
  PILLAR: { name: "Pilier", spriteKey: "ROCK", visualScale: 1.3 },
  TORCH: {
    name: "Torche Murale",
    spriteKey: "MUSHROOM",
    visualScale: 0.6,
    projectileColor: "#fbbf24",
  },
  SHRINE: {
    name: "Autel Oublié",
    spriteKey: "CHEST",
    visualScale: 1.2,
    rarityColor: "#ef4444",
  },

  // --- VÉGÉTATION ---
  VINE: {
    name: "Lianes",
    spriteKey: "MUSHROOM",
    visualScale: 0.9,
    rarityColor: "#22c55e",
  },
  GRASS: { name: "Herbes Folles", spriteKey: "MUSHROOM", visualScale: 0.5 },

  // --- PIÈGES (NOUVEAU) ---
  SPIKES: {
    name: "Pics",
    spriteKey: "TRAP_SPIKES", // Il faudra mapper ce sprite ou utiliser un placeholder
    visualScale: 1,
    isHostile: false, // Inerte mais dangereux
    stats: { ...DECOR_STATS, attack: 10 }, // Dégâts de base
  },
  POISON_POOL: {
    name: "Flaque de Poison",
    spriteKey: "MUSHROOM", // Placeholder temporaire (vert)
    visualScale: 1.2,
    rarityColor: "#10b981", // Vert toxique
    stats: { ...DECOR_STATS, attack: 5 },
  },
};

export const createDecoration = (key: string, x: number, y: number): Entity => {
  const template = DECORATION_DB[key] || DECORATION_DB["RUBBLE"];
  return {
    id: `decor_${key}_${x}_${y}_${Math.random()}`,
    type: key === "SPIKES" || key === "POISON_POOL" ? "trap" : "rubble", // On type les pièges
    name: template.name || "Décor",
    position: { x, y },
    spriteKey: template.spriteKey || "RUBBLE",
    stats: { ...DECOR_STATS, ...template.stats }, // On récupère l'attaque du piège
    isHostile: false,
    visualScale: template.visualScale || 1,
    projectileColor: template.projectileColor,
    rarityColor: template.rarityColor,
  } as Entity;
};
