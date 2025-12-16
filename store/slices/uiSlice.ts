import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { SpeechBubble } from "@/types/game";

export const createUISlice: StateCreator<
  GameStore,
  [],
  [],
  Pick<
    GameStore,
    | "setInputMethod"
    | "advanceDialogue"
    | "startCutscene" // NOUVEAU
    | "advanceCutscene" // NOUVEAU
    | "addLog"
    | "closeUi"
    | "triggerAttackAnim"
    | "addSpeechBubble"
    | "removeSpeechBubble"
  >
> = (set, get) => ({
  logs: [],
  floatingTexts: [],
  particles: [],
  screenShake: 0,
  isLoading: true,
  currentDialogue: undefined,
  currentCutsceneId: null, // Initialisation
  currentMerchantId: undefined,
  attackAnims: [],
  speechBubbles: [],
  inputMethod: "keyboard",

  setInputMethod: (method: "keyboard" | "gamepad") => {
    if (get().inputMethod !== method) {
      set({ inputMethod: method });
    }
  },

  // Ancien système (texte simple)
  advanceDialogue: () => {
    set({ currentDialogue: undefined, gameState: "playing" });
  },

  // --- NOUVEAU SYSTÈME VISUAL NOVEL ---

  startCutscene: (id: string) => {
    set({
      currentCutsceneId: id,
      gameState: "dialogue", // Met le jeu en pause
    });
  },

  advanceCutscene: () => {
    // Cette fonction est appelée par StoryOverlay quand la scène est finie
    set({
      currentCutsceneId: null,
      gameState: "playing", // Reprend le jeu
    });
  },

  // ------------------------------------

  addLog: (msg: string) => {
    set((state) => ({ logs: [...state.logs, msg].slice(-20) }));
  },

  closeUi: () => {
    set({ gameState: "playing", currentMerchantId: undefined });
  },

  triggerAttackAnim: (x: number, y: number, dir: string, type: string) => {
    const id = Math.random().toString();
    // On doit s'assurer que 'dir' est bien de type Direction
    const validDir =
      dir === "up" || dir === "down" || dir === "left" || dir === "right"
        ? dir
        : "down";

    set((state) => ({
      attackAnims: [
        ...state.attackAnims,
        { x, y, dir: validDir, type, progress: 0, id },
      ],
    }));

    let p = 0;
    const interval = setInterval(() => {
      p += 0.1;
      if (p >= 1) {
        clearInterval(interval);
        set((s) => ({
          attackAnims: s.attackAnims.filter((a) => a.id !== id),
        }));
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
    set((state) => ({
      speechBubbles: [...state.speechBubbles, bubble],
    }));
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
