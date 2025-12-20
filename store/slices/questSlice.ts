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

    if (player.quests.some((q) => q.id === quest.id)) return;

    const newQuests = [
      ...player.quests,
      { ...quest, status: "active" as QuestStatus },
    ];

    set({ player: { ...player, quests: newQuests } });
    addLog(`NOUVELLE QUÊTE : ${quest.title}`);
  },

  updateQuestProgress: (type: string, targetId: string, amount: number = 1) => {
    const { player, addLog, completeQuest } = get();
    let globalUpdated = false;
    let completedQuestId: string | null = null;

    const newQuests = player.quests.map((q) => {
      if (q.status !== "active") return q;

      let questUpdated = false;

      const newObjectives = q.objectives.map((obj) => {
        // Support pour les jokers "ANY" (ex: "kill ANY monster")
        // ou correspondance exacte de l'ID cible
        if (
          obj.type === type &&
          (obj.targetId === targetId ||
            obj.targetId === "ANY" ||
            targetId.includes(obj.targetId)) &&
          !obj.isCompleted
        ) {
          const newCurrent = Math.min(obj.required, obj.current + amount);

          if (newCurrent !== obj.current) {
            questUpdated = true;
            globalUpdated = true;
            const isCompleted = newCurrent >= obj.required;
            return { ...obj, current: newCurrent, isCompleted };
          }
        }
        return obj;
      });

      if (questUpdated) {
        const allCompleted = newObjectives.every((obj) => obj.isCompleted);

        if (allCompleted) {
          completedQuestId = q.id;
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

    if (globalUpdated) {
      // CORRECTION : Utilisation de (state) => pour éviter d'écraser des mises à jour concurrentes
      set((state) => ({
        player: {
          ...state.player,
          quests: newQuests as Quest[],
        },
      }));

      if (completedQuestId) {
        const quest = newQuests.find((q) => q.id === completedQuestId);
        if (quest) {
          if (quest.autoComplete) {
            completeQuest(quest.id);
          } else {
            addLog(
              `QUÊTE TERMINÉE : ${quest.title} (Retournez voir le donneur)`
            );
          }
        }
      }
    }
  },

  completeQuest: (questId: string) => {
    const { player, addLog, addItem, gainXp } = get();
    const questIndex = player.quests.findIndex((q) => q.id === questId);

    if (questIndex === -1) return;

    const quest = player.quests[questIndex];

    // Protection double validation
    if (quest.status === "completed" && !quest.autoComplete) return;

    // --- RÉCOMPENSES ---
    const rewardsLog: string[] = [];

    if (quest.rewards) {
      if (quest.rewards.xp) {
        // Gain d'XP (Le store se met à jour ici : niveau 1 -> 2)
        gainXp(quest.rewards.xp);
        rewardsLog.push(`${quest.rewards.xp} XP`);
      }

      if (quest.rewards.gold) {
        set((s) => ({
          player: {
            ...s.player,
            gold: s.player.gold + (quest.rewards.gold || 0),
          },
        }));
        rewardsLog.push(`${quest.rewards.gold} Or`);
      }

      if (quest.rewards.items && quest.rewards.items.length > 0) {
        quest.rewards.items.forEach((item) => {
          const added = addItem(item);
          if (added) {
            rewardsLog.push(item.name);
          } else {
            addLog(`Inventaire plein ! ${item.name} perdu.`);
          }
        });
      }
    }

    // Mise à jour finale du statut de la quête
    // CORRECTION CRITIQUE ICI : On utilise (state) => pour récupérer le 'player' qui est DÉJÀ passé niveau 2
    // au lieu d'utiliser la variable 'player' du début de la fonction qui est encore niveau 1.
    set((state) => {
      const updatedQuests = [...state.player.quests];
      // On retrouve la quête dans le tableau à jour
      const idx = updatedQuests.findIndex((q) => q.id === questId);
      if (idx !== -1) {
        updatedQuests[idx] = { ...updatedQuests[idx], status: "completed" };
      }

      return {
        player: {
          ...state.player,
          quests: updatedQuests,
        },
      };
    });

    // Feedback gratifiant
    addLog(`🏆 QUÊTE ACCOMPLIE : ${quest.title}`);
    if (rewardsLog.length > 0) {
      addLog(`Reçu : ${rewardsLog.join(", ")}`);
    }
  },

  abandonQuest: (questId: string) => {
    const { player, addLog } = get();
    const quest = player.quests.find((q) => q.id === questId);
    set((state) => ({
      player: {
        ...state.player,
        quests: state.player.quests.filter((q) => q.id !== questId),
      },
    }));
    if (quest) addLog(`Quête abandonnée : ${quest.title}`);
  },
});
