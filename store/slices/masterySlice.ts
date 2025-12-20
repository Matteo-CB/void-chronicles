import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { MASTERY_TREE } from "@/lib/data/masteries";

export interface MasterySlice {
  unlockMastery: (id: string) => void;
}

export const createMasterySlice: StateCreator<
  GameStore,
  [],
  [],
  MasterySlice
> = (set, get) => ({
  unlockMastery: (id: string) => {
    const { player, addLog } = get();
    const mastery = MASTERY_TREE.find((m) => m.id === id);

    if (!mastery) {
      console.warn(`Mastery ${id} not found.`);
      return;
    }

    // VÉRIFICATION DE SÉCURITÉ :
    // Assure que player.masteries est un tableau avant d'utiliser .some
    const currentMasteries = Array.isArray(player.masteries)
      ? player.masteries
      : [];

    const alreadyLearned = currentMasteries.some((m: any) => {
      // Support rétroactif: si m est un string ou un objet
      const learnedId = typeof m === "string" ? m : m.id;
      return learnedId === id;
    });

    if (alreadyLearned) {
      addLog("Talent déjà maîtrisé.");
      return;
    }

    if (player.masteryPoints < mastery.cost) {
      addLog(`Points insuffisants (${player.masteryPoints}/${mastery.cost}).`);
      return;
    }

    if (mastery.parentId) {
      const parentLearned = currentMasteries.some((m: any) => {
        const learnedId = typeof m === "string" ? m : m.id;
        return learnedId === mastery.parentId;
      });

      if (!parentLearned) {
        addLog("Talent précédent requis.");
        return;
      }
    }

    // Application des bonus de stats
    const newStats = { ...player.stats };

    if (mastery.stats) {
      Object.entries(mastery.stats).forEach(([key, value]) => {
        const k = key as keyof typeof newStats;
        // @ts-ignore : Confiance dans le mapping des clés
        newStats[k] = (newStats[k] || 0) + (value || 0);
      });

      // Soin immédiat en cas d'augmentation de maxHp/maxMana
      if (mastery.stats.maxHp) newStats.hp += mastery.stats.maxHp;
      if (mastery.stats.maxMana) newStats.mana += mastery.stats.maxMana;
    }

    // Création de l'objet Maîtrise
    const newMasteryObject = {
      id: mastery.id,
      unlockedAt: Date.now(),
      currentRank: 1,
    };

    set({
      player: {
        ...player,
        masteryPoints: player.masteryPoints - mastery.cost,
        masteries: [...currentMasteries, newMasteryObject] as any,
        stats: newStats,
      },
      screenShake: 5, // Feedback visuel fort
    });

    addLog(`Talent débloqué : ${mastery.name}`);

    // Feedback sonore via UI Slice (si disponible) ou simplement effet visuel pour l'instant
    // (Implémenté via les composants UI qui surveillent les changements)
  },
});
