import { Quest } from "@/types/game";
import { ENEMIES } from "./data/enemies";
import { ITEMS } from "./data/items";

// Algorithme de génération procédurale de quêtes
export const generateProceduralQuest = (dungeonLevel: number): Quest | null => {
  // 1. Filtrage des cibles valides pour ce niveau
  // On ne veut que des ennemis qui peuvent spawner à cet étage
  const validTargets = Object.values(ENEMIES).filter((enemy) => {
    // Si l'ennemi n'a pas de level range défini, on suppose qu'il est générique (sauf les boss)
    const min = enemy.minLevel || 1;
    const max = enemy.maxLevel || 99;

    // On exclut les boss des quêtes aléatoires de base
    const isBoss = enemy.aiBehavior === "boss";

    return !isBoss && dungeonLevel >= min && dungeonLevel <= max;
  });

  if (validTargets.length === 0) {
    console.warn(
      `Aucune cible valide pour les quêtes au niveau ${dungeonLevel}`
    );
    return null;
  }

  // 2. Sélection aléatoire d'une cible
  const targetEnemy =
    validTargets[Math.floor(Math.random() * validTargets.length)];

  // 3. Calcul de la difficulté et des objectifs
  // Plus le niveau est haut, plus on demande de tuer de monstres, mais avec un cap
  const baseCount = 3;
  const countMultiplier = Math.floor(dungeonLevel / 2);
  const targetCount = Math.min(
    10,
    baseCount + Math.floor(Math.random() * countMultiplier)
  );

  // 4. Calcul des récompenses (Algorithme de cohérence)
  // XP = (XP du monstre * nombre) * bonus de complétion
  const monsterXp = targetEnemy.xpReward || 10;
  const totalMobXp = monsterXp * targetCount;
  const questXpReward = Math.floor(totalMobXp * 1.5); // 50% de bonus par rapport au grind pur

  // Or = (Niveau du donjon * 10) + variable aléatoire
  const goldReward = Math.floor(dungeonLevel * 15 + Math.random() * 20);

  // 5. Génération des textes (Flavor text)
  const titles = [
    `Chasse : ${targetEnemy.name}`,
    `Menace : ${targetEnemy.name}`,
    `Purge des ${targetEnemy.name}s`,
    `Contrat : ${targetEnemy.name}`,
    `Éliminer les ${targetEnemy.name}s`,
  ];

  const descriptions = [
    `Ces créatures infestent l'étage ${dungeonLevel}. Un marchand offre une prime pour leur tête.`,
    `Leurs cris empêchent les esprits de reposer en paix. Faites-les taire.`,
    `Une menace grandissante. Réduisez leur nombre avant qu'ils ne se regroupent.`,
    `C'est un travail sale, mais quelqu'un doit le faire. Tuez-en plusieurs.`,
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];
  const description =
    descriptions[Math.floor(Math.random() * descriptions.length)];

  // 6. Construction de l'objet Quête
  const questId = `proc_quest_${Date.now()}_${Math.floor(
    Math.random() * 1000
  )}`;

  // Chance de récompense d'objet (20%)
  const items = [];
  if (Math.random() < 0.2) {
    items.push(ITEMS.potion_hp_small); // Pourrait être amélioré pour donner des items du niveau
  }

  return {
    id: questId,
    title: title,
    description: description,
    status: "active", // Sera activé dès la lecture du parchemin
    autoComplete: true, // Pas besoin de retourner voir un PNJ inexistant
    objectives: [
      {
        id: `${questId}_obj`,
        type: "kill",
        // IMPORTANT: On utilise le spriteKey comme ID de cible fiable, ou le nom en fallback
        targetId: targetEnemy.spriteKey || targetEnemy.name,
        description: `Tuer ${targetCount} ${targetEnemy.name}`,
        current: 0,
        required: targetCount,
        isCompleted: false,
      },
    ],
    rewards: {
      xp: questXpReward,
      gold: goldReward,
      items: items.length > 0 ? items : undefined,
    },
  };
};
