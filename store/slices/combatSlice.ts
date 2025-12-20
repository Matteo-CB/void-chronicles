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
  damageFlash: 0, // Init safe

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

  triggerDamageFlash: () => {
    set({ damageFlash: 0.8 });
    setTimeout(() => {
      const current = (get() as any).damageFlash;
      if (current > 0) set({ damageFlash: 0 });
    }, 500);
  },

  // AJOUT DE LA FONCTION MANQUANTE SPAWNPARTICLES
  spawnParticles: (
    x: number,
    y: number,
    color: string,
    count: number,
    type: "blood" | "spark" | "normal" | "debris" = "normal"
  ) => {
    let newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed =
        type === "spark"
          ? Math.random() * 0.5 + 0.2
          : Math.random() * 0.4 + 0.1;
      const life =
        type === "blood" ? 2.0 + Math.random() : 0.4 + Math.random() * 0.3;

      newParticles.push({
        x: x + (Math.random() - 0.5) * 0.4,
        y: y + (Math.random() - 0.5) * 0.4,
        color: type === "spark" && Math.random() > 0.5 ? "#ffffff" : color,
        life,
        size: Math.random() * 0.15 + 0.05, // Taille ajustée (relative à la grille)
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: type === "blood" || type === "debris" ? 0.02 : 0,
      });
    }
    set((s) => ({ particles: [...s.particles, ...newParticles] } as any));
  },

  addEffects: (
    x: number,
    y: number,
    color: string,
    count: number,
    text?: string,
    textColor?: string
  ) => {
    // Si des particules sont demandées, on utilise spawnParticles si possible ou on génère manuellement
    if (count > 0) {
      // On appelle la fonction locale si elle est accessible via get(), sinon on duplique la logique simple
      const spawner = (get() as any).spawnParticles;
      if (spawner) {
        spawner(x, y, color, count, "spark");
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

      return { floatingTexts: newTexts } as any;
    });
  },
});
