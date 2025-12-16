import { BiomeType } from "@/types/game";
import { hslToHex } from "@/lib/utils";
import { ENEMY_DB } from "./enemies";

// --- CONFIGURATION DE L'IA DIRECTEUR ---
const MOBS_KEYS = Object.keys(ENEMY_DB);

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

const ADJECTIFS = [
  "Silencieux",
  "Oublié",
  "Vibrant",
  "Corrompu",
  "Instable",
  "Éternel",
  "Fracturé",
  "Absolu",
];
const LIEUX = [
  "Secteur",
  "Zone",
  "Couloir",
  "Atrium",
  "Nexus",
  "Puits",
  "Abysse",
  "Horizon",
];

// Algorithme de génération procédurale des 200 niveaux
export const LEVELS: LevelConfig[] = Array.from({ length: 200 }, (_, i) => {
  const level = i + 1;

  // 1. BIOME & AMBIANCE (Progression Visuelle)
  let biome: BiomeType = "cave";
  if (level > 20) biome = "ruins";
  if (level > 50) biome = "volcano"; // "Secteur Industriel"
  if (level > 100) biome = "crystal"; // "Secteur Noyau"

  const hue = (200 + level * 2) % 360;
  const sat = Math.max(0, 40 - level * 0.1);
  const light = Math.max(10, 30 - level * 0.05);

  // 2. COURBE DE DIFFICULTÉ (Le "Flow")
  // Onde sinusoïdale pour alterner tension et relâchement
  // Cycle de 10 niveaux (Facile -> Dur -> Facile)
  const wavePosition = (level % 10) / 10;
  const sineFactor = Math.sin(wavePosition * Math.PI * 2);

  // Progression linéaire de base (0.02 à 0.08)
  const baseDensity = 0.02 + (level / 200) * 0.06;

  // Application de la vague (+/- 0.015)
  let density = baseDensity + sineFactor * 0.015;

  // Sécurité : Bornage strict pour éviter le vide ou la surcharge
  // Minimum 0.025 (~2-3 monstres min garantie par la densité)
  // Maximum 0.10 (Pas trop étouffant)
  density = Math.max(0.025, Math.min(0.1, density));

  // Cas Spécial : Boss (Tous les 10 niveaux) -> Moins de sbires
  if (level % 10 === 0) density = 0.02;

  // 3. PROGRESSION DES MONSTRES
  // On débloque de nouveaux monstres progressivement
  const unlockedCount = Math.min(MOBS_KEYS.length, 2 + Math.floor(level / 12));
  // On retire les monstres trop faibles des premiers niveaux (Fenêtre glissante)
  const minMobIndex = Math.max(0, unlockedCount - 6);

  let mobPool = MOBS_KEYS.slice(minMobIndex, unlockedCount);
  if (mobPool.length === 0) mobPool = ["RAT", "SLIME"];

  // 4. BOSS
  let boss = null;
  if (level % 10 === 0) {
    boss = {
      name: `Gardien du Secteur ${level}`,
      spriteBase: level > 50 ? "DRAGON" : "GOLEM",
      statsMultiplier: 1 + level * 0.15, // +15% stats par boss
    };
  }

  return {
    id: level,
    name: `${LIEUX[i % LIEUX.length]} ${ADJECTIFS[i % ADJECTIFS.length]}`,
    biome,
    width: Math.min(50, 25 + Math.floor(level / 4)),
    height: Math.min(50, 20 + Math.floor(level / 4)),
    colors: {
      floor: hslToHex(hue, sat, light),
      wall: hslToHex(hue, sat - 10, light + 10),
      wallSide: hslToHex(hue, sat - 20, light - 5),
    },
    mobs: mobPool,
    boss,
    decorations: ["RUBBLE", "CRACK", "VENT", "PIPE"],
    mobDensity: density,
    description: `Secteur ${level} | Menace: ${Math.floor(density * 1000)}`,
  };
});
