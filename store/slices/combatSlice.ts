import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { combatLoopLogic } from "./combat/combatLogic";
import { performAttackAction, castSpellAction } from "./combat/combatActions";

export const createCombatSlice: StateCreator<GameStore, [], [], any> = (
  set,
  get
) => ({
  projectiles: [],
  logs: [],
  floatingTexts: [],
  particles: [],

  updateGameLogic: (dt: number) => {
    combatLoopLogic(set, get, dt);
  },

  performAttack: (type: "light" | "heavy") => {
    performAttackAction(set, get, type);
  },

  castSpell: (index: number) => {
    castSpellAction(set, get, index);
  },

  addProjectile: (p: any) =>
    set((s) => ({ projectiles: [...s.projectiles, p] } as any)),

  addEffects: (
    x: number,
    y: number,
    color: string,
    count: number,
    text?: string,
    textColor?: string
  ) => {
    set((s) => {
      const newTexts = text
        ? [
            ...s.floatingTexts,
            {
              x,
              y,
              text,
              color: textColor || color,
              life: 1.0,
              isCrit: false,
              id: Math.random(),
            },
          ]
        : s.floatingTexts;
      return { floatingTexts: newTexts } as any;
    });
  },
});
