import { Quest } from "@/types/game";
import { WEAPON_DB } from "./items";

export const QUEST_DB: Record<string, Quest> = {
  SURVIVE_DEPTHS: {
    id: "SURVIVE_DEPTHS",
    title: "Survivre aux Profondeurs",
    description:
      "Le garde mourant vous a confié sa mission. Descendez au niveau 5 et éliminez la menace qui y rôde.",
    status: "active",
    autoComplete: true, // Se valide automatiquement une fois les objectifs faits
    objectives: [
      {
        id: "obj_kill_rats",
        type: "kill",
        targetId: "RAT", // ID de l'ennemi dans ENEMY_DB
        description: "Éliminer des Rats Géants",
        current: 0,
        required: 5,
        isCompleted: false,
      },
      {
        id: "obj_reach_lvl5",
        type: "explore",
        targetId: "5", // Niveau du donjon cible
        description: "Atteindre le Secteur 5",
        current: 1,
        required: 5,
        isCompleted: false,
      },
    ],
    rewards: {
      xp: 200,
      gold: 50,
      items: [{ ...WEAPON_DB.SWORD_RARE, id: "quest_reward_sword" }],
    },
  },
};
