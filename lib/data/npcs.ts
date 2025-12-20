import { Entity, Stats } from "@/types/game";

// On étend Partial<Entity> pour être sûr que TS accepte les champs spécifiques
// tout en gardant l'autocomplétion
type NPCConfig = Partial<Entity> & {
  dialogueId?: string;
  questId?: string;
  // On redéclare explicitement pour éviter les conflits d'inférence
  interactable?: boolean;
  dialogue?: string[];
  shopInventory?: any[];
};

export const NPC_DB: Record<string, NPCConfig> = {
  MERCHANT: {
    type: "merchant",
    name: "Marchand Ambulant",
    spriteKey: "MERCHANT",
    isHostile: false,
    visualScale: 1.2,
    stats: { hp: 100, maxHp: 100 } as Stats,
    interactable: true,
    dialogue: [
      "J'ai des articles rares...",
      "L'or est la seule langue que je parle.",
      "C'est dangereux dehors, achetez une potion.",
    ],
  },
  WOUNDED_GUARD: {
    type: "npc",
    name: "Garde Blessé",
    spriteKey: "MERCHANT",
    stats: { hp: 10, maxHp: 10 } as Stats,
    visualScale: 1,
    isHostile: false,
    interactable: true,
    dialogueId: "intro_guard",
    questId: "q_rats_1",
    rarityColor: "#ef4444",
  },
  OLD_MAN: {
    type: "npc",
    name: "Vieux Sage",
    spriteKey: "MERCHANT",
    rarityColor: "#3b82f6",
    isHostile: false,
    visualScale: 0.9,
    stats: { hp: 30, maxHp: 30 } as Stats,
    interactable: true,
    questId: "q_skeleton_king",
    dialogue: [
      "Le Roi Squelette s'éveille...",
      "Les murs murmurent son retour.",
    ],
  },
};

export const DIALOGUE_DB: Record<
  string,
  {
    text: string;
    responses: { text: string; action?: string; next?: string }[];
  }
> = {
  intro_guard: {
    text: "Argh... Vous... Vous n'êtes pas l'un d'eux... Écoutez, je ne vais pas tenir longtemps. Les créatures... elles viennent des profondeurs du Secteur 5.",
    responses: [
      {
        text: "Qui êtes-vous ?",
        next: "intro_guard_2",
      },
      {
        text: "Tenez bon !",
        next: "intro_guard_2",
      },
    ],
  },
  intro_guard_2: {
    text: "Peu importe... Prenez ceci. Descendez et purgez ce mal avant qu'il ne remonte à la surface. C'est... ma dernière volonté.",
    responses: [
      {
        text: "J'accepte la mission. (Accepter Quête)",
        action: "accept_quest_survive",
        next: "intro_guard_end",
      },
    ],
  },
  intro_guard_end: {
    text: "Bonne chance... (Le garde perd connaissance)",
    responses: [
      {
        text: "Partir",
        action: "close_dialogue",
      },
    ],
  },
  intro_guard_repeat: {
    text: "(Le garde respire difficilement et ne répond plus.)",
    responses: [
      {
        text: "Partir",
        action: "close_dialogue",
      },
    ],
  },
};

export const createNPC = (key: string, x: number, y: number): Entity => {
  const template = NPC_DB[key] || NPC_DB["MERCHANT"];
  return {
    id: `npc_${key}_${Date.now()}_${Math.random()}`,
    type: template.type || "npc",
    name: template.name || "Inconnu",
    position: { x, y },
    spriteKey: template.spriteKey || "MERCHANT",
    stats: { ...(template.stats || { hp: 10, maxHp: 10 }) },
    isHostile: false,
    interactable: true,
    dialogue: template.dialogue,
    dialogueId: template.dialogueId,
    shopInventory: template.shopInventory,
    questId: template.questId,
    visualScale: template.visualScale || 1,
    rarityColor: template.rarityColor,
  } as Entity;
};
