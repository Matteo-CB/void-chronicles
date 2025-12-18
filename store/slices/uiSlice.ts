import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { SpeechBubble, GameState, Direction } from "@/types/game";

export const createUISlice: StateCreator<
  GameStore,
  [],
  [],
  Pick<
    GameStore,
    | "setInputMethod"
    | "advanceDialogue"
    | "startCutscene"
    | "advanceCutscene"
    | "addLog"
    | "closeUi"
    | "triggerAttackAnim"
    | "addSpeechBubble"
    | "removeSpeechBubble"
    | "setGameState"
    | "navigateMenu"
    | "spawnParticles"
  >
> = (set, get) => ({
  logs: [],
  floatingTexts: [],
  particles: [],
  screenShake: 0,
  isLoading: true,
  currentDialogue: undefined,
  currentCutsceneId: null,
  currentMerchantId: undefined,
  attackAnims: [],
  speechBubbles: [],
  inputMethod: "keyboard",
  menuSelectionIndex: 0,

  setGameState: (newState: GameState) => {
    set({ gameState: newState, menuSelectionIndex: 0 });
  },

  setInputMethod: (method: "keyboard" | "gamepad") => {
    if (get().inputMethod !== method) {
      set({ inputMethod: method });
    }
  },

  navigateMenu: (dir: Direction) => {
    const state = get();
    const {
      gameState,
      menuSelectionIndex,
      player,
      enemies,
      currentMerchantId,
    } = state;

    // --- LOGIQUE INVENTAIRE ---
    if (gameState === "inventory") {
      const COLS = 6;
      const TOTAL_INV = 30;

      // Zone Équipement (Index 100+)
      if (menuSelectionIndex >= 100) {
        if (dir === "up" && menuSelectionIndex > 100)
          set({ menuSelectionIndex: menuSelectionIndex - 1 });
        if (dir === "down" && menuSelectionIndex < 102)
          set({ menuSelectionIndex: menuSelectionIndex + 1 });

        // Retour vers la Grille
        if (dir === "right") {
          const targetRow =
            menuSelectionIndex === 100 ? 0 : menuSelectionIndex === 101 ? 2 : 4;
          set({ menuSelectionIndex: targetRow * COLS });
        }
      }
      // Zone Grille (Index 0-29)
      else {
        let newIndex = menuSelectionIndex;

        if (dir === "up") {
          if (newIndex >= COLS) newIndex -= COLS;
        } else if (dir === "down") {
          if (newIndex + COLS < TOTAL_INV) newIndex += COLS;
        } else if (dir === "left") {
          // Vers l'équipement si colonne de gauche
          if (newIndex % COLS === 0) {
            const row = Math.floor(newIndex / COLS);
            const target = row < 2 ? 100 : row < 3 ? 101 : 102;
            set({ menuSelectionIndex: target });
            return;
          } else {
            newIndex -= 1;
          }
        } else if (dir === "right") {
          // Navigation fluide avec wrapping simple si fin de ligne
          if (newIndex + 1 < TOTAL_INV) {
            newIndex += 1;
          }
        }

        set({ menuSelectionIndex: newIndex });
      }
    }
    // --- LOGIQUE GRIMOIRE ---
    else if (gameState === "spellbook") {
      const maxList = Math.max(0, player.spells.length - 1);

      if (menuSelectionIndex >= 100) {
        if (dir === "left") set({ menuSelectionIndex: 0 });
        if (dir === "up" && menuSelectionIndex > 100)
          set({ menuSelectionIndex: menuSelectionIndex - 1 });
        if (dir === "down" && menuSelectionIndex < 102)
          set({ menuSelectionIndex: menuSelectionIndex + 1 });
      } else {
        if (dir === "right") set({ menuSelectionIndex: 100 });
        else if (dir === "up")
          set({ menuSelectionIndex: Math.max(0, menuSelectionIndex - 1) });
        else if (dir === "down")
          set({
            menuSelectionIndex: Math.min(maxList, menuSelectionIndex + 1),
          });
      }
    }
    // --- LOGIQUE QUÊTES ---
    else if (gameState === "quests") {
      const quests = player.quests || [];
      const maxQuests = Math.max(0, quests.length - 1);

      if (dir === "up") {
        set({ menuSelectionIndex: Math.max(0, menuSelectionIndex - 1) });
      }
      if (dir === "down") {
        set({
          menuSelectionIndex: Math.min(maxQuests, menuSelectionIndex + 1),
        });
      }
    }
    // --- LOGIQUE BOUTIQUE (SHOP) ---
    else if (gameState === "shop") {
      const merchant = enemies.find((e) => e.id === currentMerchantId);
      if (!merchant || !merchant.shopInventory) return;

      const totalItems = merchant.shopInventory.length;
      if (totalItems === 0) return;

      const COLS = 3; // On a forcé l'affichage à 3 colonnes, donc la logique fonctionnera

      let newIndex = menuSelectionIndex;

      if (dir === "up") {
        if (newIndex >= COLS) newIndex -= COLS;
      } else if (dir === "down") {
        if (newIndex + COLS < totalItems) newIndex += COLS;
      } else if (dir === "left") {
        // Wrapping gauche : si début de ligne, on remonte à la fin de la ligne précédente
        if (newIndex > 0) newIndex -= 1;
      } else if (dir === "right") {
        // Wrapping droite : si fin de ligne, on passe à la ligne suivante
        if (newIndex + 1 < totalItems) newIndex += 1;
      }

      set({ menuSelectionIndex: newIndex });
    }
    // --- LOGIQUE LEVEL UP ---
    else if (gameState === "levelup") {
      if (dir === "up" && menuSelectionIndex > 0)
        set({ menuSelectionIndex: menuSelectionIndex - 1 });
      if (dir === "down" && menuSelectionIndex < 3)
        set({ menuSelectionIndex: menuSelectionIndex + 1 });
    }
  },

  advanceDialogue: () => {
    set({ currentDialogue: undefined, gameState: "playing" });
  },

  startCutscene: (id: string) => {
    set({ currentCutsceneId: id, gameState: "dialogue" });
  },

  advanceCutscene: () => {
    set({ currentCutsceneId: null, gameState: "playing" });
  },

  addLog: (msg: string) => {
    set((state) => ({ logs: [...state.logs, msg].slice(-20) }));
  },

  closeUi: () => {
    set({ gameState: "playing", currentMerchantId: undefined });
  },

  triggerAttackAnim: (x: number, y: number, dir: string, type: string) => {
    const id = Math.random().toString();
    const validDir = ["up", "down", "left", "right"].includes(dir)
      ? dir
      : "down";
    set((state) => ({
      attackAnims: [
        ...state.attackAnims,
        { x, y, dir: validDir as any, type, progress: 0, id },
      ],
    }));
    let p = 0;
    const interval = setInterval(() => {
      p += 0.1;
      if (p >= 1) {
        clearInterval(interval);
        set((s) => ({ attackAnims: s.attackAnims.filter((a) => a.id !== id) }));
      } else {
        set((s) => ({
          attackAnims: s.attackAnims.map((a) =>
            a.id === id ? { ...a, progress: p } : a
          ),
        }));
      }
    }, 30);
  },

  addSpeechBubble: (bubble: SpeechBubble) => {
    set((state) => ({ speechBubbles: [...state.speechBubbles, bubble] }));
    setTimeout(() => {
      get().removeSpeechBubble(bubble.id);
    }, bubble.duration);
  },

  removeSpeechBubble: (id: string) => {
    set((state) => ({
      speechBubbles: state.speechBubbles.filter((b) => b.id !== id),
    }));
  },

  spawnParticles: (
    x: number,
    y: number,
    color: string,
    count: number,
    type: "blood" | "spark" | "normal" = "normal"
  ) => {
    const newParticles: any[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.15;
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: color,
        size: Math.random() * 0.1 + 0.05,
        gravity: type === "blood" ? 0.02 : 0,
        type: type,
      });
    }
    set((s) => ({ particles: [...s.particles, ...newParticles] } as any));
  },
});
