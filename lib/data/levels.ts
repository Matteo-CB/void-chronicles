import { BiomeType } from "@/types/game";
import { hslToHex } from "@/lib/utils";
import { MOBS_KEYS } from "./enemies";

const ADJECTIFS = [
  "Humide",
  "Sombre",
  "Oublié",
  "Ancien",
  "Céleste",
  "Abyssal",
  "Mécanique",
  "Toxique",
  "Glacial",
  "Infernal",
  "Silencieux",
  "Hurlant",
];
const LIEUX = [
  "Cave",
  "Egouts",
  "Prison",
  "Laboratoire",
  "Nécropole",
  "Temple",
  "Forteresse",
  "Dédale",
  "Observatoire",
  "Sanctuaire",
  "Abîme",
  "Fosse",
];
const AMBIANCES = [
  "Une odeur de moisissure règne ici.",
  "Vous entendez des grattements derrière les murs.",
  "L'air devient plus lourd à chaque pas.",
  "Des runes brillent faiblement dans l'obscurité.",
  "La mort semble avoir élu domicile ici.",
];

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
  const hue = (level * 15) % 360;
  const sat = 10 + (level % 40);
  const light = Math.max(15, 30 - level * 0.2);

  let biome: BiomeType = "cave";
  if (level > 20) biome = "ruins";
  if (level > 40) biome = "crystal";
  if (level > 70) biome = "volcano";

  // Progression lissée : Au niveau 1, index ~0. Au niveau 100, index max.
  // On prend une fenêtre de 3 monstres possibles pour varier un peu.
  // MOBS_KEYS est maintenant trié par difficulté dans enemies.ts.
  const progressRatio = Math.min(1, (level - 1) / 60);
  const maxMobIndex = MOBS_KEYS.length - 1;
  const centerIndex = Math.floor(progressRatio * maxMobIndex);

  // Niveau 1 : pool [0, 1, 2] (Rat, Slime, Bat)
  // Plus le niveau monte, plus la fenêtre glisse vers la droite.
  const startIndex = Math.max(0, centerIndex - 1);
  const endIndex = Math.min(maxMobIndex, startIndex + 3);

  const mobPool = MOBS_KEYS.slice(startIndex, endIndex + 1);

  // Sécurité pour avoir toujours au moins des mobs faibles si pool vide (ne devrait pas arriver)
  if (mobPool.length === 0) mobPool.push("RAT", "BAT");

  let boss = null;
  if (level % 10 === 0) {
    const bossIndex = Math.min(
      MOBS_KEYS.length - 1,
      4 + Math.floor(level / 10)
    );
    boss = {
      name: "Gardien",
      spriteBase: MOBS_KEYS[bossIndex],
    };
  }

  return {
    id: level,
    name: `${LIEUX[i % LIEUX.length]} ${ADJECTIFS[i % ADJECTIFS.length]}`,
    biome,
    width: Math.min(60, 30 + level),
    height: Math.min(60, 20 + level),
    colors: {
      floor: hslToHex(hue, sat, light),
      wall: hslToHex(hue, sat - 5, light + 10),
      wallSide: hslToHex(hue, sat - 10, light - 10),
    },
    mobs: mobPool,
    boss,
    decorations: ["ROCK", "MUSHROOM", "HERB"],
    mobDensity: Math.min(0.12, 0.03 + level * 0.001),
    description: AMBIANCES[i % AMBIANCES.length],
  };
});
