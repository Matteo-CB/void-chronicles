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
  if (level >= 100) return "Seigneur du Vide";
  if (level >= 80) return "Maître Absolu";
  if (level >= 60) return "Conquérant";
  if (level >= 40) return "Vétéran";
  if (level >= 20) return "Combattant";
  if (level >= 10) return "Aventurier";
  return "Recrue";
}

export function getEntityRarityColor(level: number, isBoss: boolean): string {
  if (isBoss) return "#ef4444";
  if (level > 80) return "#fbbf24";
  if (level > 50) return "#a855f7";
  if (level > 20) return "#3b82f6";
  return "#ffffff";
}

// THEME NEUTRE / FANTASY / VOID
const ADJECTIFS_NIVEAU = [
  "Corrompu",
  "Sombre",
  "Oublié",
  "Interdit",
  "Cosmique",
  "Abyssal",
  "Mécanique",
  "Toxique",
  "Glacial",
  "Volcanique",
  "Silencieux",
  "Instable",
];

const LIEUX_NIVEAU = [
  "Donjon",
  "Souterrain",
  "Bastion",
  "Laboratoire",
  "Ruines",
  "Hall",
  "Forteresse",
  "Dédale",
  "Observatoire",
  "Refuge",
  "Prison",
  "Fosse",
];

const AMBIANCES = [
  "Une pression invisible pèse sur vos épaules.",
  "Le sol vibre d'une énergie inconnue.",
  "Des ombres mouvantes vous observent.",
  "L'air est chargé d'électricité statique.",
  "Le silence est total, presque surnaturel.",
];

export const SPELL_DB: Record<string, Spell> = {
  fireball: {
    id: "fireball",
    name: "Boule de Feu",
    cost: 15,
    range: 5,
    damage: 30,
    description: "Explosion thermique à distance.",
    cooldown: 4,
    currentCooldown: 0,
    color: "#f97316",
    effect: "damage",
  },
  heal: {
    id: "heal",
    name: "Soin Vital",
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
    description: "Déplacement instantané.",
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
    description: "Projectile perforant.",
    cooldown: 2,
    currentCooldown: 0,
    color: "#38bdf8",
    effect: "damage",
  },
  rage: {
    id: "rage",
    name: "Adrénaline",
    cost: 30,
    range: 0,
    damage: 0,
    description: "Boost Dégâts temporaire.",
    cooldown: 15,
    currentCooldown: 0,
    color: "#ef4444",
    effect: "buff",
  },
  lightning: {
    id: "lightning",
    name: "Décharge",
    cost: 20,
    range: 4,
    damage: 20,
    description: "Zone électrique.",
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
    description: "Dégâts sur la durée.",
    cooldown: 5,
    currentCooldown: 0,
    color: "#a3e635",
    effect: "damage",
  },
  nova: {
    id: "nova",
    name: "Nova du Vide",
    cost: 50,
    range: 3,
    damage: 60,
    description: "Onde de choc massive.",
    cooldown: 12,
    currentCooldown: 0,
    color: "#fbbf24",
    effect: "damage",
  },
};

const BASE_MOBS = [
  {
    key: "RAT",
    name: "Rat Géant",
    hp: 15,
    atk: 4,
    sprite: "RAT",
    ai: "aggressive",
    scale: 0.8,
  },
  {
    key: "BAT",
    name: "Chauve-souris",
    hp: 12,
    atk: 3,
    sprite: "BAT",
    ai: "aggressive",
    scale: 0.8,
  },
  {
    key: "ARCHER",
    name: "Squelette Archer",
    hp: 30,
    atk: 8,
    sprite: "SKELETON",
    ai: "archer",
    scale: 1.0,
    weapon: "bow",
  },
  {
    key: "MAGE",
    name: "Arcaniste Rebelle",
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
    name: "Guerrier Orc",
    hp: 60,
    atk: 12,
    sprite: "ORC",
    ai: "aggressive",
    scale: 1.2,
    weapon: "sword",
  },
  {
    key: "KNIGHT",
    name: "Chevalier Noir",
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
    name: "Pillard Tireur",
    hp: 50,
    atk: 20,
    sprite: "BANDIT",
    ai: "archer",
    scale: 1.1,
    weapon: "pistol",
  },
  {
    key: "LICH",
    name: "Spectre Ancien",
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
    name: "Wyverne",
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
      name: "Gardiens du Seuil",
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
      spriteKey: `WEAPON_${wType.toUpperCase()}`,
    };
  }

  const mobSpells: Spell[] = [];
  if (base.spells) {
    base.spells.forEach((sid) => {
      if (SPELL_DB[sid]) mobSpells.push({ ...SPELL_DB[sid] });
    });
  }

  if (isBoss) {
    name = `COLOSSE: ${base.name}`;
    visualScale = 2.5;
    mobSpells.push(SPELL_DB["fireball"], SPELL_DB["rage"], SPELL_DB["nova"]);
  }

  return {
    id: `${key}_${Math.random()}`,
    type: "enemy",
    name,
    position: pos,
    // CORRECTION : suppression de la ligne 'direction: "down"' qui causait l'erreur
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
      attackSpeed: 1,
      defense: Math.floor(level * 0.8),
      speed: 1,
      xpValue: Math.floor(20 * power * (isBoss ? 50 : 1)),
      // Initialisation des propriétés manquantes
      critChance: 0,
      critDamage: 1.5,
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
    },
    rarityColor: getEntityRarityColor(level, isBoss),
  };
}

const WEAPONS: Record<WeaponType, any[]> = {
  sword: [
    { name: "Épée Rouillée", atk: 5 },
    { name: "Glaive", atk: 12 },
    { name: "Lame Runique", atk: 25 },
    { name: "Lame d'Ether", atk: 50 },
    { name: "Cataclysme", atk: 80 },
  ],
  bow: [
    { name: "Arc Court", atk: 4 },
    { name: "Arc Composite", atk: 10 },
    { name: "Arc Elfique", atk: 20 },
    { name: "Arc Stellaire", atk: 40 },
    { name: "Chasseur", atk: 70 },
  ],
  pistol: [
    { name: "Vieux Pistolet", atk: 8 },
    { name: "Revolver", atk: 18 },
    { name: "Blaster", atk: 35 },
    { name: "Annihilateur", atk: 60 },
    { name: "Arbitre", atk: 100 },
  ],
  staff: [
    { name: "Bâton Noueux", atk: 3 },
    { name: "Bâton de Mage", atk: 8 },
    { name: "Sceptre Royal", atk: 15 },
    { name: "Bâton du Vide", atk: 30 },
    { name: "Singularité", atk: 60 },
  ],
  dagger: [
    { name: "Dague", atk: 4 },
    { name: "Surin", atk: 10 },
    { name: "Lame de l'Ombre", atk: 22 },
    { name: "Croc de Dragon", atk: 45 },
    { name: "Dent du Vide", atk: 75 },
  ],
  axe: [
    { name: "Hachette", atk: 6 },
    { name: "Hache de Guerre", atk: 14 },
    { name: "Couperet", atk: 28 },
    { name: "Déchiqueteuse", atk: 55 },
    { name: "Destructeur", atk: 90 },
  ],
  spear: [
    { name: "Pique", atk: 5 },
    { name: "Lance", atk: 13 },
    { name: "Hallebarde", atk: 26 },
    { name: "Trident", atk: 52 },
    { name: "Lance-Foudre", atk: 85 },
  ],
  wand: [
    { name: "Baguette", atk: 2 },
    { name: "Baguette Magique", atk: 6 },
    { name: "Bâtonnet de Cristal", atk: 12 },
    { name: "Branche de Vie", atk: 25 },
    { name: "Conducteur", atk: 50 },
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
    spriteKey: "CHEST",
  };

  if (type === "weapon") {
    const wTypes: WeaponType[] = [
      "sword",
      "bow",
      "pistol",
      "staff",
      "dagger",
      "axe",
      "spear",
      "wand",
    ];
    const wt = wTypes[Math.floor(Math.random() * wTypes.length)];
    const baseList = WEAPONS[wt];
    const base =
      baseList[Math.min(baseList.length - 1, Math.floor(level / 15))];
    item.name = `${base.name}`;
    item.weaponType = wt;
    item.range =
      wt === "bow" || wt === "pistol" || wt === "wand"
        ? 5
        : wt === "staff" || wt === "spear"
        ? 3
        : 1;
    item.stats = { attack: Math.floor(base.atk * mult * (1 + level * 0.1)) };
    item.spriteKey = `WEAPON_${wt.toUpperCase()}`;
    if (rarity !== "common") item.name += ` +${Math.floor(mult)}`;
  } else if (type === "spellbook") {
    const keys = Object.keys(SPELL_DB);
    const spellKey = keys[Math.floor(Math.random() * keys.length)];
    const spell = SPELL_DB[spellKey];
    item.name = `Manuel: ${spell.name}`;
    item.spellId = spellKey;
    item.description = "Utiliser pour apprendre.";
    item.visualColor = spell.color;
    item.spriteKey = "SPELLBOOK";
  } else if (type === "accessory") {
    item.name = "Anneau de Force";
    item.stats = {
      maxHp: Math.floor(20 * mult * level),
      maxMana: Math.floor(10 * mult * level),
    };
    item.spriteKey = "RELIC";
  } else {
    item.name = "Plastron Renforcé";
    item.stats = { defense: Math.floor(5 * mult * level) };
    item.spriteKey = "ARMOR";
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
  spriteKey: "POTION",
};
