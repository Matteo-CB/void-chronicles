import {
  Entity,
  Position,
  Item,
  Rarity,
  ItemType,
  BiomeType,
  Spell,
  WeaponType,
} from "../types/game";

export function getPlayerRank(level: number): string {
  if (level >= 100) return "Dieu de la Guerre";
  if (level >= 80) return "Légende Vivante";
  if (level >= 60) return "Conquérant";
  if (level >= 40) return "Maître d'Armes";
  if (level >= 20) return "Chevalier";
  if (level >= 10) return "Mercenaire";
  return "Recrue";
}

export function getEntityRarityColor(level: number, isBoss: boolean): string {
  if (isBoss) return "#ef4444";
  if (level > 80) return "#fbbf24";
  if (level > 50) return "#a855f7";
  if (level > 20) return "#3b82f6";
  return "#ffffff";
}

const ADJECTIFS_NIVEAU = [
  "Maudit",
  "Sanglant",
  "Oublié",
  "Interdit",
  "Céleste",
  "Abyssal",
  "Mécanique",
  "Toxique",
  "Glacial",
  "Infernal",
  "Silencieux",
  "Hurlant",
];

const LIEUX_NIVEAU = [
  "Donjon",
  "Crypte",
  "Bastion",
  "Laboratoire",
  "Nécropole",
  "Temple",
  "Forteresse",
  "Dédale",
  "Observatoire",
  "Sanctuaire",
  "Prison",
  "Fosse",
];

const AMBIANCES = [
  "Une aura oppressante écrase vos sens.",
  "Le sol tremble sous le poids d'anciennes machines.",
  "Des murmures invisibles vous guettent.",
  "L'air est saturé de magie instable.",
  "La mort semble avoir élu domicile ici.",
];

export const SPELL_DB: Record<string, Spell> = {
  fireball: {
    id: "fireball",
    name: "Boule de Feu",
    cost: 15,
    range: 5,
    damage: 30,
    description: "Explosion à distance.",
    cooldown: 4,
    currentCooldown: 0,
    color: "#f97316",
    effect: "damage",
  },
  heal: {
    id: "heal",
    name: "Soin Divin",
    cost: 25,
    range: 0,
    damage: 0,
    description: "Restaure 40% PV.",
    cooldown: 8,
    currentCooldown: 0,
    color: "#22c55e",
    effect: "heal",
  },
  blink: {
    id: "blink",
    name: "Transfert",
    cost: 10,
    range: 6,
    damage: 0,
    description: "Téléportation.",
    cooldown: 5,
    currentCooldown: 0,
    color: "#0ea5e9",
    effect: "buff",
  },
  ice_spike: {
    id: "ice_spike",
    name: "Javelot de Glace",
    cost: 12,
    range: 6,
    damage: 25,
    description: "Tir précis.",
    cooldown: 2,
    currentCooldown: 0,
    color: "#38bdf8",
    effect: "damage",
  },
  rage: {
    id: "rage",
    name: "Fureur",
    cost: 30,
    range: 0,
    damage: 0,
    description: "Boost Dégâts.",
    cooldown: 15,
    currentCooldown: 0,
    color: "#ef4444",
    effect: "buff",
  },
  lightning: {
    id: "lightning",
    name: "Tonnerre",
    cost: 20,
    range: 4,
    damage: 20,
    description: "Zone large.",
    cooldown: 6,
    currentCooldown: 0,
    color: "#facc15",
    effect: "damage",
  },
  poison: {
    id: "poison",
    name: "Toxine",
    cost: 18,
    range: 3,
    damage: 5,
    description: "Dégâts/Temps.",
    cooldown: 5,
    currentCooldown: 0,
    color: "#a3e635",
    effect: "damage",
  },
  nova: {
    id: "nova",
    name: "Nova Solaire",
    cost: 50,
    range: 3,
    damage: 60,
    description: "Explosion massive autour.",
    cooldown: 12,
    currentCooldown: 0,
    color: "#fbbf24",
    effect: "damage",
  },
};

const BASE_MOBS = [
  {
    key: "RAT",
    name: "Rat Muté",
    hp: 15,
    atk: 4,
    sprite: "RAT",
    ai: "aggressive",
    scale: 0.8,
  },
  {
    key: "BAT",
    name: "Vampire Ailé",
    hp: 12,
    atk: 3,
    sprite: "BAT",
    ai: "aggressive",
    scale: 0.8,
  },
  {
    key: "ARCHER",
    name: "Traqueur Osseux",
    hp: 30,
    atk: 8,
    sprite: "SKELETON",
    ai: "archer",
    scale: 1.0,
    weapon: "bow",
  },
  {
    key: "MAGE",
    name: "Sorcier du Culte",
    hp: 25,
    atk: 5,
    sprite: "SORCERER",
    ai: "caster",
    scale: 1.0,
    weapon: "staff",
    spells: ["fireball", "ice_spike"],
  },
  {
    key: "ORC",
    name: "Berserker Orc",
    hp: 60,
    atk: 12,
    sprite: "ORC",
    ai: "aggressive",
    scale: 1.2,
    weapon: "sword",
  },
  {
    key: "KNIGHT",
    name: "Chevalier Déchu",
    hp: 100,
    atk: 15,
    sprite: "KNIGHT",
    ai: "guardian",
    scale: 1.3,
    weapon: "sword",
  },
  {
    key: "GOLEM",
    name: "Gardien de Pierre",
    hp: 200,
    atk: 25,
    sprite: "GOLEM",
    ai: "aggressive",
    scale: 1.5,
  },
  {
    key: "SNIPER",
    name: "Bandit Tireur",
    hp: 50,
    atk: 20,
    sprite: "BANDIT",
    ai: "archer",
    scale: 1.1,
    weapon: "pistol",
  },
  {
    key: "LICH",
    name: "Liche Ancienne",
    hp: 150,
    atk: 10,
    sprite: "GHOST",
    ai: "caster",
    scale: 1.2,
    weapon: "staff",
    spells: ["lightning", "poison", "heal"],
  },
  {
    key: "DRAGON",
    name: "Dragonnet",
    hp: 300,
    atk: 35,
    sprite: "DRAGON",
    ai: "aggressive",
    scale: 2.0,
    spells: ["nova"],
  },
];

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export interface LevelConfig {
  id: number;
  name: string;
  biome: BiomeType;
  width: number;
  height: number;
  colors: { floor: string; wall: string; wallSide: string };
  mobs: string[];
  boss: any;
  decorations: string[];
  mobDensity: number;
  description: string;
}

export const LEVELS: LevelConfig[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const hue = (level * 18) % 360;
  const sat = 20 + (level % 30);
  const light = Math.max(10, 25 - level * 0.15);

  let biome: BiomeType = "cave";
  if (level > 25) biome = "ruins";
  if (level > 50) biome = "volcano";
  if (level > 75) biome = "crystal";

  const mobStartIndex = Math.floor((level / 100) * (BASE_MOBS.length - 4));
  const mobPool = BASE_MOBS.slice(mobStartIndex, mobStartIndex + 5).map(
    (m) => m.key
  );

  return {
    id: level,
    name: `${LIEUX_NIVEAU[i % LIEUX_NIVEAU.length]} ${
      ADJECTIFS_NIVEAU[i % ADJECTIFS_NIVEAU.length]
    }`,
    biome,
    width: Math.min(80, 25 + level),
    height: Math.min(80, 20 + level),
    colors: {
      floor: hslToHex(hue, sat, light),
      wall: hslToHex(hue, sat - 10, light + 10),
      wallSide: hslToHex(hue, sat - 5, light - 5),
    },
    mobs: mobPool,
    boss: {
      name: "Seigneur",
      spriteBase:
        BASE_MOBS[Math.min(BASE_MOBS.length - 1, Math.floor(level / 8) + 2)]
          .key,
    },
    decorations: ["ROCK"],
    mobDensity: Math.min(0.15, 0.04 + level * 0.001),
    description: AMBIANCES[i % AMBIANCES.length],
  };
});

export function createEnemy(
  key: string,
  pos: Position,
  level: number,
  bossConfig?: any
): Entity {
  const isBoss = !!bossConfig;
  const base = BASE_MOBS.find((m) => m.key === key) || BASE_MOBS[0];
  const power =
    1 + level * 0.15 + (level > 50 ? Math.pow(level - 50, 1.2) * 0.05 : 0);

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
    base.spells.forEach((sid) => {
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
      hp: Math.floor(base.hp * power * (isBoss ? 20 : 1)),
      maxHp: Math.floor(base.hp * power * (isBoss ? 20 : 1)),
      mana: 100,
      maxMana: 100,
      attack: Math.floor(base.atk * power * (isBoss ? 1.5 : 1)),
      defense: Math.floor(level * 0.8),
      speed: 1,
      xpValue: Math.floor(20 * power * (isBoss ? 50 : 1)),
    },
    rarityColor: getEntityRarityColor(level, isBoss),
  };
}

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
