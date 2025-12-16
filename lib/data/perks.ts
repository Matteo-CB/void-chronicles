import { Perk, Player } from "@/types/game";

export const PERKS_DB: Perk[] = [
  {
    id: "vitality",
    name: "Cœur de Titan",
    description: "+30 PV Max. Vous vous sentez indestructible.",
    rarity: "common",
    icon: "❤️",
    effect: (p: Player) => {
      p.stats.maxHp += 30;
      p.stats.hp += 30;
    },
  },
  {
    id: "strength",
    name: "Force Brute",
    description: "+5 Attaque. Vos coups font trembler le sol.",
    rarity: "common",
    icon: "💪",
    effect: (p: Player) => {
      p.stats.attack += 5;
    },
  },
  {
    id: "vampire",
    name: "Soif de Sang",
    description: "+5% Vol de Vie. Le sang de vos ennemis vous nourrit.",
    rarity: "rare",
    icon: "🩸",
    effect: (p: Player) => {
      p.stats.lifesteal = (p.stats.lifesteal || 0) + 0.05;
    },
  },
  {
    id: "crit_master",
    name: "Œil de Faucon",
    description: "+10% Chance Critique. Vos coups trouvent les failles.",
    rarity: "rare",
    icon: "🎯",
    effect: (p: Player) => {
      p.stats.critChance += 0.1;
    },
  },
  {
    id: "dodge",
    name: "Pas de l'Ombre",
    description: "+10% Esquive. Vous êtes insaisissable.",
    rarity: "epic",
    icon: "👻",
    effect: (p: Player) => {
      p.stats.dodgeChance = (p.stats.dodgeChance || 0) + 0.1;
    },
  },
  {
    id: "mana_flow",
    name: "Esprit Clair",
    description: "+20 Mana Max & Regen. La magie coule à flots.",
    rarity: "common",
    icon: "💧",
    effect: (p: Player) => {
      p.stats.maxMana += 20;
      p.stats.mana += 20;
    },
  },
  {
    id: "executioner",
    name: "Exécuteur",
    description: "+50% Dégâts Critiques. Vos critiques sont dévastateurs.",
    rarity: "epic",
    icon: "☠️",
    effect: (p: Player) => {
      p.stats.critDamage += 0.5;
    },
  },
  {
    id: "glass_cannon",
    name: "Tout ou Rien",
    description: "+15 Attaque mais -20 PV Max. Risqué mais mortel.",
    rarity: "legendary",
    icon: "⚔️",
    effect: (p: Player) => {
      p.stats.attack += 15;
      p.stats.maxHp = Math.max(1, p.stats.maxHp - 20);
      p.stats.hp = Math.min(p.stats.hp, p.stats.maxHp);
    },
  },
];

export function getRandomPerks(count: number): Perk[] {
  const shuffled = [...PERKS_DB].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
