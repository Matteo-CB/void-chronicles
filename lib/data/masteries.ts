import { Mastery, Player } from "@/types/game";

export const MASTERIES_DB: Mastery[] = [
  {
    id: "m_ring_might",
    name: "Anneau de Force",
    description: "Augmente les dégâts physiques de 5% par rang.",
    icon: "💍",
    cost: 1,
    type: "passive",
    maxRank: 5,
    currentRank: 0,
    effect: (p: Player) => {
      p.stats.attack = Math.floor(p.stats.attack * 1.05);
    },
  },
  {
    id: "m_relic_life",
    name: "Relique Vitale",
    description: "Augmente les PV max de 25 par rang.",
    icon: "📿",
    cost: 1,
    type: "passive",
    maxRank: 10,
    currentRank: 0,
    effect: (p: Player) => {
      p.stats.maxHp += 25;
      p.stats.hp += 25;
    },
  },
  {
    id: "m_potion_pack",
    name: "Réserve d'Urgence",
    description: "[CONSOMMABLE] Donne immédiatement 2 Potions de Soin.",
    icon: "🎒",
    cost: 1,
    type: "consumable",
    maxRank: 99,
    currentRank: 0,
    effect: (p: Player) => {
      /* Géré dans le slice */
    },
  },
  {
    id: "m_boots_speed",
    name: "Bottes de Célérité",
    description: "Augmente l'esquive de 2% par rang.",
    icon: "👢",
    cost: 1,
    type: "passive",
    maxRank: 5,
    currentRank: 0,
    effect: (p: Player) => {
      p.stats.dodgeChance += 0.02;
    },
  },
  {
    id: "m_scroll_knowledge",
    name: "Module de Savoir",
    description: "[CONSOMMABLE] Restaure tout le Mana et donne de l'XP.",
    icon: "📜",
    cost: 1,
    type: "consumable",
    maxRank: 99,
    currentRank: 0,
    effect: (p: Player) => {
      p.stats.mana = p.stats.maxMana;
      p.xp += 20;
    },
  },
  {
    id: "m_gem_focus",
    name: "Gemme de Focus",
    description: "Réduit les temps de recharge de 5%.",
    icon: "💎",
    cost: 2,
    type: "passive",
    maxRank: 3,
    currentRank: 0,
    effect: (p: Player) => {
      p.stats.cooldownReduction += 0.05;
    },
  },
];

export function getInitialMasteries(): Mastery[] {
  return JSON.parse(JSON.stringify(MASTERIES_DB));
}
