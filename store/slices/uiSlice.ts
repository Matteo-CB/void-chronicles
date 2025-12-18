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
        // 100: Arme, 101: Armure, 102: Accessoire
        if (dir === "up" && menuSelectionIndex > 100)
          set({ menuSelectionIndex: menuSelectionIndex - 1 });
        if (dir === "down" && menuSelectionIndex < 102)
          set({ menuSelectionIndex: menuSelectionIndex + 1 });

        // Retour vers la Grille (Colonne 0)
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
          // Si on est sur la colonne de gauche, on va vers l'équipement
          if (newIndex % COLS === 0) {
            const row = Math.floor(newIndex / COLS);
            const target = row < 2 ? 100 : row < 3 ? 101 : 102;
            set({ menuSelectionIndex: target });
            return;
          } else {
            newIndex -= 1;
          }
        } else if (dir === "right") {
          if (newIndex % COLS < COLS - 1 && newIndex + 1 < TOTAL_INV)
            newIndex += 1;
        }

        set({ menuSelectionIndex: newIndex });
      }
    }
    // --- LOGIQUE GRIMOIRE ---
    else if (gameState === "spellbook") {
      const maxList = Math.max(0, player.spells.length - 1);

      if (menuSelectionIndex >= 100) {
        if (dir === "left") set({ menuSelectionIndex: 0 }); // Retour liste
        if (dir === "up" && menuSelectionIndex > 100)
          set({ menuSelectionIndex: menuSelectionIndex - 1 });
        if (dir === "down" && menuSelectionIndex < 102)
          set({ menuSelectionIndex: menuSelectionIndex + 1 });
      } else {
        if (dir === "right") set({ menuSelectionIndex: 100 }); // Vers Slots
        else if (dir === "up")
          set({ menuSelectionIndex: Math.max(0, menuSelectionIndex - 1) });
        else if (dir === "down")
          set({
            menuSelectionIndex: Math.min(maxList, menuSelectionIndex + 1),
          });
      }
    }
    // --- LOGIQUE BOUTIQUE (SHOP) ---
    else if (gameState === "shop") {
      const merchant = enemies.find((e) => e.id === currentMerchantId);
      if (!merchant || !merchant.shopInventory) return;

      const totalItems = merchant.shopInventory.length;
      const COLS = 3; // On assume une grille de 3 colonnes sur desktop/large

      let newIndex = menuSelectionIndex;

      if (dir === "up") {
        if (newIndex >= COLS) newIndex -= COLS;
      } else if (dir === "down") {
        if (newIndex + COLS < totalItems) newIndex += COLS;
      } else if (dir === "left") {
        if (newIndex % COLS !== 0) newIndex -= 1;
      } else if (dir === "right") {
        if (newIndex % COLS < COLS - 1 && newIndex + 1 < totalItems)
          newIndex += 1;
      }

      set({ menuSelectionIndex: newIndex });
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
});
