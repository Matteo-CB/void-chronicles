import { Item, ItemType, Rarity, WeaponType } from "@/types/game";
import { SPELL_DB } from "./spells";

const PREFIXES = [
  { name: "Acéré", stat: "attack", val: 0.2 },
  { name: "Lourd", stat: "knockback", val: 1 },
  { name: "Mystique", stat: "mana", val: 20 },
  { name: "Vital", stat: "hp", val: 30 },
  { name: "Royal", stat: "all", val: 0.1 },
];

const SUFFIXES = [
  { name: "de Feu", effect: "burn", color: "#f97316" },
  { name: "de Glace", effect: "freeze", color: "#0ea5e9" },
  { name: "du Vampire", effect: "lifesteal", color: "#ef4444" },
  { name: "de la Tempête", effect: "stun", color: "#facc15" },
  { name: "de Destruction", effect: "crit", color: "#a855f7" },
];

const BASE_WEAPONS: Record<
  WeaponType,
  { name: string; range: number; dmg: number }[]
> = {
  sword: [
    { name: "Épée", range: 1, dmg: 8 },
    { name: "Katana", range: 1, dmg: 10 },
    { name: "Claymore", range: 1, dmg: 14 },
  ],
  bow: [
    { name: "Arc Court", range: 5, dmg: 8 },
    { name: "Arc Long", range: 7, dmg: 12 },
  ],
  pistol: [
    { name: "Pistolet", range: 5, dmg: 12 },
    { name: "Revolver", range: 6, dmg: 16 },
  ],
  staff: [
    { name: "Bâton", range: 3, dmg: 6 },
    { name: "Sceptre", range: 4, dmg: 9 },
  ],
  dagger: [{ name: "Dague", range: 1, dmg: 6 }],
  axe: [{ name: "Hache", range: 1, dmg: 12 }],
  spear: [{ name: "Lance", range: 2, dmg: 10 }],
  wand: [{ name: "Baguette", range: 4, dmg: 8 }],
};

export const POTION_ITEM: Item = {
  id: "potion",
  name: "Potion de Soin",
  type: "potion",
  rarity: "common",
  value: 50,
  description: "Restaure 50 PV",
  visualColor: "#f43f5e",
  color: "#f43f5e",
  stats: {
    hp: 50,
  },
  spriteKey: "POTION",
};

// --- BASE DE DONNÉES DES ARMES UNIQUES (POUR QUÊTES) ---
export const WEAPON_DB: Record<string, Item> = {
  SWORD_RARE: {
    id: "template_sword_rare",
    name: "Lame du Gardien",
    type: "weapon",
    rarity: "rare",
    spriteKey: "WEAPON_SWORD",
    value: 150,
    description:
      "Une lame offerte par un garde mourant. Elle vibre d'une énergie protectrice.",
    visualColor: "#3b82f6",
    color: "#3b82f6",
    weaponType: "sword",
    range: 1,
    stats: {
      attack: 18,
      critChance: 0.1,
      defense: 2,
    },
  },
  BOW_EPIC: {
    id: "template_bow_epic",
    name: "Arc des Ombres",
    type: "weapon",
    rarity: "epic",
    spriteKey: "WEAPON_BOW",
    value: 300,
    description: "Tire des flèches silencieuses.",
    visualColor: "#a855f7",
    color: "#a855f7",
    weaponType: "bow",
    range: 6,
    stats: {
      attack: 25,
      critChance: 0.2,
    },
  },
};

export function generateLoot(level: number): Item {
  // --- LOOT INTELLIGENT ---
  // On ajoute un bonus de chance basé sur le niveau (1% par niveau, max 30%)
  const levelLuckBonus = Math.min(0.3, level * 0.01);
  const roll = Math.random() + levelLuckBonus;

  let rarity: Rarity = "common";
  let mult = 1;
  // Plus on est profond, plus on a de chance d'avoir des affixes (préfixe/suffixe)
  let affixChance = 0.2 + level * 0.005;

  // Seuils ajustés pour une progression gratifiante
  // Au niveau 1 (bonus 0.01), roll max = 1.01 -> Mythique impossible (faut > 1.15)
  // Au niveau 20 (bonus 0.20), roll max = 1.20 -> Mythique possible
  if (roll > 1.15) {
    rarity = "mythic";
    mult = 5;
    affixChance = 1.0; // Toujours des affixes sur du mythique
  } else if (roll > 0.98) {
    rarity = "legendary";
    mult = 3.5;
    affixChance = 0.8;
  } else if (roll > 0.85) {
    rarity = "epic";
    mult = 2;
    affixChance = 0.6;
  } else if (roll > 0.6) {
    rarity = "rare";
    mult = 1.5;
    affixChance = 0.4;
  }

  const typeRoll = Math.random();
  let type: ItemType = "weapon";

  if (typeRoll > 0.95) type = "potion";
  else if (typeRoll > 0.45) type = "armor";
  else if (typeRoll > 0.75) type = "accessory";
  else if (typeRoll > 0.92) type = "spellbook";

  if (type === "potion") {
    return {
      ...POTION_ITEM,
      id: `loot_pot_${Math.random()}`,
      value: 20,
    };
  }

  const rarityColor =
    rarity === "mythic"
      ? "#ef4444"
      : rarity === "legendary"
      ? "#fbbf24"
      : rarity === "epic"
      ? "#a855f7"
      : rarity === "rare"
      ? "#3b82f6"
      : "#fff";

  let spriteKey = "ROCK";
  if (type === "armor") spriteKey = "ARMOR";
  else if (type === "accessory") spriteKey = "RELIC";
  else if (type === "spellbook") spriteKey = "SPELLBOOK";

  let item: Item = {
    id: Math.random().toString(),
    name: "Objet",
    type,
    rarity,
    spriteKey,
    value: Math.floor(level * 15 * mult),
    visualColor: rarityColor,
    color: rarityColor,
    description: "",
    stats: {
      critChance: 0.05,
      critDamage: 1.5,
      attack: 0,
      defense: 0,
      hp: 0,
      mana: 0,
      maxHp: 0,
      maxMana: 0,
    },
  };

  const hasPrefix = Math.random() < affixChance;
  const hasSuffix = Math.random() < affixChance;
  let prefix = hasPrefix
    ? PREFIXES[Math.floor(Math.random() * PREFIXES.length)]
    : null;
  let suffix = hasSuffix
    ? SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]
    : null;

  if (type === "weapon") {
    const wTypes: WeaponType[] = ["sword", "bow", "pistol", "staff"];
    const wt = wTypes[Math.floor(Math.random() * wTypes.length)];
    const baseList = BASE_WEAPONS[wt] || BASE_WEAPONS["sword"];
    const base = baseList[Math.floor(Math.random() * baseList.length)];

    item.name = base.name;
    item.weaponType = wt;
    item.spriteKey = `WEAPON_${wt.toUpperCase()}`;
    item.range = base.range;
    let atk = Math.floor((base.dmg + level * 2) * mult);

    if (prefix) {
      item.name = `${prefix.name} ${item.name}`;
      if (prefix.stat === "attack") atk = Math.floor(atk * (1 + prefix.val));
      if (prefix.stat === "knockback")
        item.onHitEffect = { type: "knockback", chance: 1, value: 1 };
    }

    item.stats!.attack = atk;

    if (suffix) {
      item.name = `${item.name} ${suffix.name}`;
      if (suffix.effect === "burn")
        item.applyStatus = {
          type: "burn",
          chance: 0.3,
          duration: 3,
          power: Math.max(1, level / 2),
        };
      if (suffix.effect === "freeze")
        item.applyStatus = {
          type: "freeze",
          chance: 0.2,
          duration: 2,
          power: 0,
        };
      if (suffix.effect === "lifesteal")
        item.onHitEffect = { type: "lifesteal", chance: 1, value: 0.1 };
      if (suffix.effect === "crit") item.stats!.critChance = 0.25;
      item.visualColor = suffix.color;
    }
  } else if (type === "spellbook") {
    const keys = Object.keys(SPELL_DB);
    const spellKey = keys[Math.floor(Math.random() * keys.length)];
    const spell = SPELL_DB[spellKey as keyof typeof SPELL_DB];
    if (spell) {
      item.name = `Grimoire: ${spell.name}`;
      item.spellId = spellKey;
      item.description = "Apprendre le sort.";
      item.visualColor = spell.color;
      item.color = spell.color;
    }
  } else if (type === "accessory") {
    item.name = "Relique";
    if (prefix) {
      item.name = `${prefix.name} ${item.name}`;
      item.stats!.maxHp = 20 * level;
    }
    if (suffix) {
      item.name = `${item.name} ${suffix.name}`;
      item.stats!.critChance = 0.1;
    }
    if (!prefix && !suffix) item.stats!.maxMana = 20 * level;
  } else {
    // Armor
    item.name = "Plastron";
    item.stats!.defense = Math.floor(3 * mult * level);
    item.stats!.maxHp = Math.floor(15 * mult * level);
    if (prefix && prefix.stat === "hp")
      item.stats!.maxHp = Math.floor(item.stats!.maxHp! * 1.5);
  }

  if (rarity === "mythic") item.name = `[MYTHIQUE] ${item.name}`;

  return item;
}
