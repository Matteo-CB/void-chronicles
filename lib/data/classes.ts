import { Stats } from "@/types/game";

export interface ClassConfig {
  id: string;
  name: string;
  description: string;
  spriteKey: string;
  baseStats: Partial<Stats>;
  startingEquipment: {
    weaponKey: string;
    potionCount: number;
  };
  color: string;
}

export const CLASSES: ClassConfig[] = [
  {
    id: "knight",
    name: "Chevalier",
    description:
      "Un guerrier robuste en armure lourde. Excelle en défense et au corps-à-corps.",
    spriteKey: "PLAYER",
    color: "#3b82f6",
    baseStats: {
      hp: 150,
      maxHp: 150,
      defense: 5,
      strength: 3,
      endurance: 4,
      speed: 0.9,
    },
    startingEquipment: {
      weaponKey: "sword_start",
      potionCount: 2,
    },
  },
  {
    id: "rogue",
    name: "Voleur",
    description:
      "Rapide et mortel. Frappe fort dans les points vitaux mais reste fragile.",
    spriteKey: "PLAYER",
    color: "#a855f7",
    baseStats: {
      hp: 90,
      maxHp: 90,
      attack: 12,
      agility: 5,
      luck: 3,
      critChance: 0.15,
      speed: 1.2,
    },
    startingEquipment: {
      weaponKey: "dagger_start",
      potionCount: 1,
    },
  },
  {
    id: "ranger",
    name: "Rôdeur",
    description:
      "Chasseur expert. Élimine ses cibles à distance avant qu'elles n'approchent.",
    spriteKey: "PLAYER",
    color: "#22c55e",
    baseStats: {
      hp: 100,
      maxHp: 100,
      accuracy: 5,
      agility: 3,
      attack: 10,
    },
    startingEquipment: {
      weaponKey: "bow_start",
      potionCount: 2,
    },
  },
];
