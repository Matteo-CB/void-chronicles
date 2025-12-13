import { Entity, Position, WeaponType, Spell, Item } from "@/types/game";
import { getEntityRarityColor } from "@/lib/utils";
import { SPELL_DB } from "./spells";

const BASE_MOBS = [
  {
    key: "RAT",
    name: "Rat d'égout",
    hp: 10,
    atk: 3,
    sprite: "RAT",
    ai: "aggressive",
    scale: 0.8,
    xp: 5,
  },
  {
    key: "SLIME",
    name: "Gelée Verte",
    hp: 15,
    atk: 2,
    sprite: "SLIME",
    ai: "passive",
    scale: 0.9,
    xp: 8,
  },
  {
    key: "BAT",
    name: "Chauve-souris",
    hp: 8,
    atk: 2,
    sprite: "BAT",
    ai: "aggressive",
    scale: 0.7,
    xp: 6,
  },
  {
    key: "WOLF",
    name: "Loup Gris",
    hp: 20,
    atk: 5,
    sprite: "WOLF",
    ai: "aggressive",
    scale: 1.0,
    xp: 12,
  },
  {
    key: "GOBLIN",
    name: "Gobelin",
    hp: 25,
    atk: 6,
    sprite: "GOBLIN",
    ai: "aggressive",
    scale: 0.9,
    weapon: "sword",
    xp: 15,
  },
  {
    key: "BANDIT",
    name: "Bandit",
    hp: 35,
    atk: 8,
    sprite: "BANDIT",
    ai: "aggressive",
    scale: 1.0,
    weapon: "sword",
    xp: 20,
  },
  {
    key: "ARCHER",
    name: "Squelette Archer",
    hp: 30,
    atk: 10,
    sprite: "SKELETON",
    ai: "archer",
    scale: 1.0,
    weapon: "bow",
    xp: 25,
  },
  {
    key: "SNIPER",
    name: "Tireur d'élite",
    hp: 45,
    atk: 15,
    sprite: "BANDIT",
    ai: "archer",
    scale: 1.1,
    weapon: "pistol",
    xp: 35,
  },
  {
    key: "ORC",
    name: "Guerrier Orc",
    hp: 80,
    atk: 18,
    sprite: "ORC",
    ai: "aggressive",
    scale: 1.2,
    weapon: "sword",
    xp: 50,
  },
  {
    key: "MAGE",
    name: "Sorcier",
    hp: 40,
    atk: 12,
    sprite: "SORCERER",
    ai: "caster",
    scale: 1.0,
    weapon: "staff",
    spells: ["fireball", "ice_spike"],
    xp: 60,
  },
  {
    key: "KNIGHT",
    name: "Chevalier Noir",
    hp: 120,
    atk: 25,
    sprite: "KNIGHT",
    ai: "guardian",
    scale: 1.3,
    weapon: "sword",
    xp: 80,
  },
  {
    key: "GOLEM",
    name: "Golem de Pierre",
    hp: 250,
    atk: 40,
    sprite: "GOLEM",
    ai: "aggressive",
    scale: 1.5,
    xp: 150,
  },
  {
    key: "LICH",
    name: "Liche",
    hp: 180,
    atk: 30,
    sprite: "GHOST",
    ai: "caster",
    scale: 1.2,
    weapon: "staff",
    spells: ["lightning", "poison", "heal"],
    xp: 200,
  },
  {
    key: "DRAGON",
    name: "Dragon Rouge",
    hp: 500,
    atk: 60,
    sprite: "DRAGON",
    ai: "aggressive",
    scale: 2.2,
    spells: ["nova", "rage"],
    xp: 500,
  },
];

export function createEnemy(
  key: string,
  pos: Position,
  level: number,
  bossConfig?: any
): Entity {
  const isBoss = !!bossConfig;
  const base = BASE_MOBS.find((m) => m.key === key) || BASE_MOBS[0];

  const powerScaling = 1 + (level - 1) * 0.1;

  let name = base.name;
  let visualScale = base.scale || 1;
  let weapon: Item | null = null;

  if (base.weapon) {
    const wType = base.weapon as WeaponType;
    weapon = {
      id: "w_mob",
      name: "Arme",
      type: "weapon",
      weaponType: wType,
      rarity: "common",
      value: 0,
      visualColor: "#fff",
      color: "#fff",
      description: "",
      range: wType === "bow" || wType === "pistol" ? 5 : 1,
    };
  }

  const mobSpells: Spell[] = [];
  if (base.spells) {
    base.spells.forEach((sid: string) => {
      if (SPELL_DB[sid]) mobSpells.push({ ...SPELL_DB[sid] });
    });
  }

  if (isBoss) {
    name = `TITAN: ${base.name}`;
    visualScale = 2.5;
    mobSpells.push(SPELL_DB["fireball"], SPELL_DB["rage"], SPELL_DB["nova"]);
  }

  return {
    id: `${key}_${Math.random()}`,
    type: "enemy",
    name,
    position: pos,
    direction: "down",
    spriteKey: base.sprite,
    isHostile: true,
    aiBehavior: base.ai as any,
    visualScale,
    isBoss,
    spells: mobSpells,
    equipment: { weapon, armor: null, accessory: null },
    stats: {
      hp: Math.floor(base.hp * powerScaling * (isBoss ? 15 : 1)),
      maxHp: Math.floor(base.hp * powerScaling * (isBoss ? 15 : 1)),
      mana: 100,
      maxMana: 100,
      attack: Math.floor(base.atk * powerScaling * (isBoss ? 1.5 : 1)),
      defense: Math.floor(level * 0.5),
      speed: 1,
      xpValue: Math.floor((base.xp || 10) * powerScaling * (isBoss ? 10 : 1)),
    },
    rarityColor: getEntityRarityColor(level, isBoss),
  };
}

export const MOBS_KEYS = BASE_MOBS.map((m) => m.key);
