import { Entity, Stats } from "@/types/game";

// Stats bidons pour les décors (ils sont inertes)
const DECOR_STATS: Stats = {
  hp: 1,
  maxHp: 1,
  mana: 0,
  maxMana: 0,
  attack: 0,
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

export const DECORATION_DB: Record<string, Partial<Entity>> = {
  RUBBLE: { name: "Débris", spriteKey: "RUBBLE", visualScale: 1 },
  ROCK: { name: "Rocher", spriteKey: "ROCK", visualScale: 1.2 },
  MUSHROOM: { name: "Champignon", spriteKey: "MUSHROOM", visualScale: 0.8 },
  CRACK: { name: "Fissure", spriteKey: "CRACK", visualScale: 1 },
  VENT: { name: "Ventilation", spriteKey: "VENT", visualScale: 1 },
  PIPE: { name: "Tuyau", spriteKey: "PIPE", visualScale: 1 },
  BONES: { name: "Ossements", spriteKey: "BONES", visualScale: 0.9 },
};

export const createDecoration = (key: string, x: number, y: number): Entity => {
  const template = DECORATION_DB[key] || DECORATION_DB["RUBBLE"];
  return {
    id: `decor_${x}_${y}_${Math.random()}`,
    type: "rubble", // Important pour ne pas être ciblé comme ennemi
    name: template.name || "Décor",
    position: { x, y },
    spriteKey: template.spriteKey || "RUBBLE",
    stats: { ...DECOR_STATS },
    isHostile: false,
    visualScale: template.visualScale || 1,
  } as Entity;
};
