import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { SpeechBubble, GameState } from "@/types/game";

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

  // Implémentation requise
  setGameState: (newState: GameState) => {
    set({ gameState: newState });
  },

  setInputMethod: (method: "keyboard" | "gamepad") => {
    if (get().inputMethod !== method) {
      set({ inputMethod: method });
    }
  },

  advanceDialogue: () => {
    set({ currentDialogue: undefined, gameState: "playing" });
  },

  startCutscene: (id: string) => {
    set({
      currentCutsceneId: id,
      gameState: "dialogue",
    });
  },

  advanceCutscene: () => {
    set({
      currentCutsceneId: null,
      gameState: "playing",
    });
  },

  addLog: (msg: string) => {
    set((state) => ({ logs: [...state.logs, msg].slice(-20) }));
  },

  closeUi: () => {
    set({ gameState: "playing", currentMerchantId: undefined });
  },

  triggerAttackAnim: (x: number, y: number, dir: string, type: string) => {
    const id = Math.random().toString();
    const validDir =
      dir === "up" || dir === "down" || dir === "left" || dir === "right"
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
