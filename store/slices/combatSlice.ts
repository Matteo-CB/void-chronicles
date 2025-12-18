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
  particles: [], // Stockage des particules de sang/effets

  updateGameLogic: (dt: number) => {
    combatLoopLogic(set, get, dt);
  },

  playerAttack: () => {
    performAttackAction(set, get, "light");
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
    // Génère des particules manuellement si demandé (ex: interaction coffre)
    let newParticles = [];
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.1;
        newParticles.push({
          id: Math.random(),
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color: color,
          size: Math.random() * 0.1 + 0.05,
          gravity: 0,
        });
      }
    }

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

      const allParticles = [...s.particles, ...newParticles];

      return { floatingTexts: newTexts, particles: allParticles } as any;
    });
  },
});
