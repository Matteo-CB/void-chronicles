import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Quest, QuestStatus } from "@/types/game";

export const createQuestSlice: StateCreator<
  GameStore,
  [],
  [],
  Pick<
    GameStore,
    "acceptQuest" | "updateQuestProgress" | "completeQuest" | "abandonQuest"
  >
> = (set, get) => ({
  acceptQuest: (quest: Quest) => {
    const { player, addLog } = get();
    // Vérifie si la quête existe déjà
    if (player.quests.some((q) => q.id === quest.id)) return;

    const newQuests = [
      ...player.quests,
      { ...quest, status: "active" as QuestStatus },
    ];

    set({ player: { ...player, quests: newQuests } });
    addLog(`Quête acceptée : ${quest.title}`);
  },

  updateQuestProgress: (type: string, targetId: string, amount: number = 1) => {
    const { player, addLog } = get();
    let updated = false;
    let completedQuestTitle = "";

    const newQuests = player.quests.map((q) => {
      if (q.status !== "active") return q;

      let questUpdated = false;
      const newObjectives = q.objectives.map((obj) => {
        if (
          obj.type === type &&
          obj.targetId === targetId &&
          !obj.isCompleted
        ) {
          const newCurrent = Math.min(obj.required, obj.current + amount);
          if (newCurrent !== obj.current) {
            questUpdated = true;
            updated = true;
            const isCompleted = newCurrent >= obj.required;
            if (isCompleted) {
              // Petit feedback visuel ou sonore pourrait être ajouté ici
            }
            return { ...obj, current: newCurrent, isCompleted };
          }
        }
        return obj;
      });

      if (questUpdated) {
        const allCompleted = newObjectives.every((obj) => obj.isCompleted);
        if (allCompleted) {
          completedQuestTitle = q.title;
          return {
            ...q,
            objectives: newObjectives,
            status: q.autoComplete ? "completed" : "ready_to_turn_in",
          };
        }
        return { ...q, objectives: newObjectives };
      }
      return q;
    });

    if (updated) {
      set({ player: { ...player, quests: newQuests as Quest[] } });
      if (completedQuestTitle) {
        // Si autoComplete est actif, on donne les récompenses immédiatement
        const quest = newQuests.find((q) => q.title === completedQuestTitle);
        if (quest && quest.autoComplete && quest.status === "completed") {
          get().completeQuest(quest.id);
        } else {
          addLog(`Quête prête : ${completedQuestTitle}`);
        }
      }
    }
  },

  completeQuest: (questId: string) => {
    const { player, addLog, addItem, gainXp } = get();
    const questIndex = player.quests.findIndex((q) => q.id === questId);
    if (questIndex === -1) return;

    const quest = player.quests[questIndex];
    if (quest.status === "completed") return; // Déjà fini

    // Donner Récompenses
    if (quest.rewards.xp) gainXp(quest.rewards.xp);
    if (quest.rewards.gold) {
      set((s) => ({
        player: {
          ...s.player,
          gold: s.player.gold + (quest.rewards.gold || 0),
        },
      }));
    }
    if (quest.rewards.items) {
      quest.rewards.items.forEach((item) => addItem(item));
    }

    const newQuests = [...player.quests];
    newQuests[questIndex] = { ...quest, status: "completed" };

    set({ player: { ...player, quests: newQuests } });
    addLog(`Quête terminée : ${quest.title}`);
  },

  abandonQuest: (questId: string) => {
    const { player } = get();
    set({
      player: {
        ...player,
        quests: player.quests.filter((q) => q.id !== questId),
      },
    });
  },
});
