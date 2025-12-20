import { Quest } from "@/types/game";

// --- BASE DE DONNÉES DES QUÊTES ---
// Structure enrichie pour un Roguelike progressif et addictif
// Inclus : Quêtes Tuto, Arc Narratif Principal.
// Les Quêtes secondaires sont désormais générées procéduralement (voir lib/questGen.ts).

export const QUEST_DB: Record<string, Quest> = {
  // ==========================================
  // 🟢 INTRODUCTION & TUTORIEL
  // ==========================================

  TUTO_FIRST_STEPS: {
    id: "TUTO_FIRST_STEPS",
    title: "L'Éveil du Néant",
    description:
      "Votre conscience revient lentement. Une voix caverneuse résonne : 'Prouve ta valeur ou deviens poussière'. Nettoyez la vermine pour vous échauffer.",
    status: "active",
    autoComplete: true,
    objectives: [
      {
        id: "obj_kill_rats",
        type: "kill",
        targetId: "RAT",
        description: "Exterminer les Rats du Néant",
        current: 0,
        required: 5,
        isCompleted: false,
      },
    ],
    rewards: {
      xp: 150,
      gold: 50,
      items: [
        {
          id: "potion_hp_small",
          name: "Fiole de Sang Mineure",
          type: "potion",
          spriteKey: "POTION",
          value: 15,
          visualColor: "#ef4444", // Rouge
          description: "Un liquide épais qui restaure 40 PV.",
          onHitEffect: { type: "heal", chance: 1, value: 40 },
        },
      ],
    },
  },

  TUTO_EQUIPMENT: {
    id: "TUTO_EQUIPMENT",
    title: "Préparatifs de Guerre",
    description:
      "Tuer à mains nues est noble, mais inefficace. Trouvez un équipement digne de ce nom dans les coffres ou sur les cadavres.",
    status: "active",
    autoComplete: true,
    objectives: [
      {
        id: "obj_loot_weapon",
        type: "collect",
        targetId: "weapon",
        description: "Trouver une Arme",
        current: 0,
        required: 1,
        isCompleted: false,
      },
      {
        id: "obj_equip_item",
        type: "collect",
        targetId: "any_equipment",
        description: "S'équiper d'un objet",
        current: 0,
        required: 1,
        isCompleted: false,
      },
    ],
    rewards: {
      xp: 200,
      gold: 0,
      items: [
        {
          id: "scroll_identify",
          name: "Parchemin de Savoir",
          type: "scroll",
          spriteKey: "SPELLBOOK",
          value: 30,
          visualColor: "#3b82f6", // Bleu
          description: "Révèle les propriétés cachées d'un objet.",
        },
      ],
    },
  },

  // ==========================================
  // 🔵 ACTE I : LES PROFONDEURS OUBLIÉES
  // ==========================================

  ACT1_EXPLORATION: {
    id: "ACT1_EXPLORATION",
    title: "Descente aux Enfers",
    description:
      "L'air devient lourd. Les légendes parlent d'un Temple enfoui au 5ème sous-sol. C'est votre première véritable épreuve.",
    status: "active",
    autoComplete: true,
    objectives: [
      {
        id: "obj_reach_lvl5",
        type: "explore",
        targetId: "5",
        description: "Atteindre le Niveau 5 du Donjon",
        current: 0,
        required: 5,
        isCompleted: false,
      },
    ],
    rewards: {
      xp: 500,
      gold: 200,
      items: [
        {
          id: "spell_magic_missile",
          name: "Grimoire: Projectile Magique",
          type: "scroll",
          spriteKey: "SPELLBOOK",
          value: 100,
          visualColor: "#a855f7", // Violet
          description: "Apprend le sort Projectile Magique.",
          spellId: "magic_missile",
        },
      ],
    },
  },

  ACT1_BOSS: {
    id: "ACT1_BOSS",
    title: "Le Gardien du Seuil",
    description:
      "Une abomination de pierre et de runes garde l'accès à l'étage inférieur. Il ne vous laissera pas passer vivant.",
    status: "active",
    autoComplete: true,
    objectives: [
      {
        id: "obj_kill_golem_boss",
        type: "kill",
        targetId: "BOSS_GOLEM",
        description: "Vaincre le Golem Ancestral",
        current: 0,
        required: 1,
        isCompleted: false,
      },
    ],
    rewards: {
      xp: 2000,
      gold: 1000,
      items: [
        {
          id: "accessory_pendant_stone",
          name: "Cœur de Pierre",
          type: "accessory",
          spriteKey: "RELIC",
          rarity: "epic",
          value: 500,
          visualColor: "#9ca3af", // Gris pierre
          stats: { defense: 5, maxHp: 50 },
          description: "Une amulette lourde qui durcit la peau.",
        },
      ],
    },
  },
};
