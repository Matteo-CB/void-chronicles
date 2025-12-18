import { Entity } from "@/types/game";

export interface NPCConfig extends Partial<Entity> {
  dialogueId: string;
  portrait?: string; // Pour une future UI de dialogue
}

export const NPC_DB: Record<string, NPCConfig> = {
  WOUNDED_GUARD: {
    name: "Garde Blessé",
    // Changement ici : On utilise MERCHANT (humain) au lieu de PLAYER
    spriteKey: "MERCHANT",
    stats: {
      hp: 10,
      maxHp: 10,
      mana: 0,
      maxMana: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      xpValue: 0,
      critChance: 0,
      critDamage: 0,
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
    visualScale: 1,
    isHostile: false,
    dialogueId: "intro_guard",
    rarityColor: "#ef4444", // Le rouge sera appliqué comme teinte
  },
};

// Base de données des dialogues (Simple Arbre)
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
        action: "accept_quest_survive", // Action déclenchée
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
  // Dialogue par défaut si on lui reparle
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
