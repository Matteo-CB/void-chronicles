import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { InputMethod } from "@/types/game";

export const createUISlice: StateCreator<GameStore, [], [], any> = (
  set,
  get
) => ({
  log: [],
  particles: [],
  floatingTexts: [],
  screenShake: 0,
  currentDialogue: "Chargement...",
  showResetConfirmation: false,
  inputMethod: "keyboard",

  setInputMethod: (method: InputMethod) => {
    if (get().inputMethod !== method) {
      set({ inputMethod: method });
    }
  },

  toggleResetConfirmation: () =>
    set((state) => ({ showResetConfirmation: !state.showResetConfirmation })),

  addLog: (msg: string) => set((s) => ({ log: [msg, ...s.log].slice(0, 50) })),

  advanceDialogue: () => {
    const { player, initGame } = get();
    if (player.stats.hp <= 0) {
      initGame();
    } else {
      set({ currentDialogue: null, gameState: "playing" });
    }
  },

  addEffects: (
    x: number,
    y: number,
    color: string,
    count: number,
    text?: string,
    textColor?: string
  ) => {
    const TILE_SIZE = 48;
    const newParticles = Array.from({ length: count }).map(() => ({
      id: Math.random().toString(),
      x: x * TILE_SIZE + TILE_SIZE / 2,
      y: y * TILE_SIZE + TILE_SIZE / 2,
      color,
      size: Math.random() * 6 + 3,
      life: 50 + Math.random() * 30,
      maxLife: 80,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
    }));

    let newTexts = [...get().floatingTexts];
    if (text && textColor) {
      newTexts.push({
        id: Math.random().toString(),
        x: x * TILE_SIZE + TILE_SIZE / 2,
        y: y * TILE_SIZE,
        text,
        color: textColor,
        life: 100,
        vy: -1.5,
      });
    }
    set((s) => ({
      particles: [...s.particles, ...newParticles],
      floatingTexts: newTexts,
    }));
  },

  updateVisuals: () => {
    set((s) => {
      const shake = Math.max(0, s.screenShake - 1);
      const parts = s.particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 1.5,
          vy: p.vy + 0.2,
          size: Math.max(0, p.size - 0.1),
        }))
        .filter((p) => p.life > 0 && p.size > 0);
      const txts = s.floatingTexts
        .map((t) => ({
          ...t,
          y: t.y + t.vy,
          life: t.life - 1,
          vy: t.vy * 0.98,
        }))
        .filter((t) => t.life > 0);
      return { screenShake: shake, particles: parts, floatingTexts: txts };
    });
  },
});
