import { Item, ItemType, Rarity, WeaponType } from "@/types/game";
import { SPELL_DB } from "./spells";

const WEAPONS: Record<WeaponType, any[]> = {
  sword: [
    { name: "Épée Rouillée", atk: 5 },
    { name: "Glaive", atk: 12 },
    { name: "Lamerunique", atk: 25 },
    { name: "Excalibur", atk: 50 },
    { name: "Ragnarok", atk: 80 },
  ],
  bow: [
    { name: "Arc Court", atk: 4 },
    { name: "Arc Composite", atk: 10 },
    { name: "Arc Elfique", atk: 20 },
    { name: "Arc Céleste", atk: 40 },
    { name: "Artemis", atk: 70 },
  ],
  pistol: [
    { name: "Vieux Pistolet", atk: 8 },
    { name: "Revolver", atk: 18 },
    { name: "Blaster", atk: 35 },
    { name: "Annihilateur", atk: 60 },
    { name: "Juge", atk: 100 },
  ],
  staff: [
    { name: "Bâton Noueux", atk: 3 },
    { name: "Bâton de Mage", atk: 8 },
    { name: "Sceptre Royal", atk: 15 },
    { name: "Bâton du Vide", atk: 30 },
    { name: "Infini", atk: 60 },
  ],
};

export const POTION_ITEM: Item = {
  id: "potion",
  name: "Potion de Soin",
  type: "consumable",
  rarity: "common",
  value: 50,
  description: "Soin 50%",
  visualColor: "#f43f5e",
  color: "#f43f5e",
  stats: {},
};

export function generateLoot(level: number): Item {
  const roll = Math.random();
  let rarity: Rarity = "common";
  let mult = 1;
  if (roll > 0.98) {
    rarity = "mythic";
    mult = 5;
  } else if (roll > 0.9) {
    rarity = "legendary";
    mult = 3.5;
  } else if (roll > 0.75) {
    rarity = "epic";
    mult = 2;
  } else if (roll > 0.5) {
    rarity = "rare";
    mult = 1.5;
  }

  const typeRoll = Math.random();
  let type: ItemType = "weapon";
  if (typeRoll > 0.35) type = "armor";
  if (typeRoll > 0.6) type = "accessory";
  if (typeRoll > 0.85) type = "spellbook";

  const item: Item = {
    id: Math.random().toString(),
    name: "Objet",
    type,
    rarity,
    value: level * 10 * mult,
    visualColor:
      rarity === "mythic"
        ? "#ef4444"
        : rarity === "legendary"
        ? "#fbbf24"
        : rarity === "epic"
        ? "#a855f7"
        : rarity === "rare"
        ? "#3b82f6"
        : "#fff",
    color: "#fff",
    description: "",
    stats: {},
  };

  if (type === "weapon") {
    const wTypes: WeaponType[] = ["sword", "bow", "pistol", "staff"];
    const wt = wTypes[Math.floor(Math.random() * wTypes.length)];
    const baseList = WEAPONS[wt];
    const base =
      baseList[Math.min(baseList.length - 1, Math.floor(level / 15))];
    item.name = `${base.name}`;
    item.weaponType = wt;
    item.range = wt === "bow" || wt === "pistol" ? 5 : wt === "staff" ? 3 : 1;
    item.stats = { attack: Math.floor(base.atk * mult * (1 + level * 0.1)) };
    if (rarity !== "common") item.name += ` +${Math.floor(mult)}`;
  } else if (type === "spellbook") {
    const keys = Object.keys(SPELL_DB);
    const spellKey = keys[Math.floor(Math.random() * keys.length)];
    const spell = SPELL_DB[spellKey];
    item.name = `Grimoire: ${spell.name}`;
    item.spellId = spellKey;
    item.description = "Utiliser pour apprendre.";
    item.visualColor = spell.color;
  } else if (type === "accessory") {
    item.name = "Anneau de Puissance";
    item.stats = {
      maxHp: Math.floor(20 * mult * level),
      maxMana: Math.floor(10 * mult * level),
    };
  } else {
    item.name = "Plastron Renforcé";
    item.stats = { defense: Math.floor(5 * mult * level) };
  }
  return item;
}
