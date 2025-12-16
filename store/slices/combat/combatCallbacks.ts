import { StoreApi } from "zustand";
import { GameStore } from "../../types";
import { triggerBarrelExplosion } from "@/lib/combatEngine";
import { Projectile, Particle, Entity, Direction } from "@/types/game";

type SetState = StoreApi<GameStore>["setState"];
type GetState = StoreApi<GameStore>["getState"];

export interface DamageEvent {
  id: string;
  amount: number;
}

export const createCombatCallbacks = (set: SetState, get: GetState) => {
  const newProjectilesToAdd: Projectile[] = [];
  const newLogsToAdd: string[] = [];
  const damageEvents: DamageEvent[] = [];

  const callbacks = {
    addProjectile: (p: Projectile) => {
      newProjectilesToAdd.push(p);
    },

    triggerAttackAnim: (x: number, y: number, dir: string, type: string) => {
      const validDir: Direction = ["up", "down", "left", "right"].includes(dir)
        ? (dir as Direction)
        : "down";
      get().triggerAttackAnim(x, y, validDir, type);
    },

    addEffects: (
      x: number,
      y: number,
      color: string,
      count: number,
      text?: string,
      textColor?: string
    ) => {
      if (text) {
        set((s) => ({
          floatingTexts: [
            ...s.floatingTexts,
            {
              id: Math.random(),
              x,
              y,
              text,
              color: textColor || color,
              life: 1.0,
              isCrit: text.includes("!"),
            },
          ],
        }));
      }
      if (count > 0) {
        callbacks.spawnParticles(x, y, color, count);
      }
    },

    addLog: (msg: string) => {
      newLogsToAdd.push(msg);
    },

    spawnParticles: (x: number, y: number, color: string, count: number) => {
      const parts: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const speed = Math.random() * 0.2 + 0.05;
        const angle = Math.random() * Math.PI * 2;

        parts.push({
          x: x + (Math.random() - 0.5) * 0.5,
          y: y + (Math.random() - 0.5) * 0.5,
          color,
          life: 1.0 + Math.random() * 0.5,
          size: Math.random() * 4 + 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }
      set((s) => ({ particles: [...s.particles, ...parts] }));
    },

    damagePlayer: (amount: number) => {
      const p = get().player;
      const newHp = p.stats.hp - amount;
      set({ player: { ...p, stats: { ...p.stats, hp: newHp } } });
      if (newHp <= 0) set({ gameState: "gameover" });
    },

    damageEnemy: (id: string, amount: number) => {
      damageEvents.push({ id, amount });
    },

    killEnemy: (id: string) => {
      damageEvents.push({ id, amount: 999999 });
    },

    shakeScreen: (amount: number) =>
      set((s) => ({
        screenShake: Math.min(s.screenShake + amount, 15),
      })),

    grantXp: (amount: number) =>
      set((s) => ({ player: { ...s.player, xp: s.player.xp + amount } })),
  };

  return { callbacks, newProjectilesToAdd, newLogsToAdd, damageEvents };
};

export const processDamageQueue = (
  currentEnemies: Entity[],
  damageEvents: DamageEvent[],
  set: SetState,
  get: GetState,
  callbacks: any,
  logsRef: string[]
) => {
  let processedEnemies = [...currentEnemies];
  const { player } = get();

  for (let i = 0; i < damageEvents.length; i++) {
    const { id, amount } = damageEvents[i];

    const targetIndex = processedEnemies.findIndex((e) => e.id === id);
    if (targetIndex === -1) continue;

    const target = processedEnemies[targetIndex];

    if (target.isDead || target.type === "rubble") continue;

    const newHp = target.stats.hp - amount;

    if (newHp <= 0) {
      // --- MORT ---
      if (target.type === "barrel") {
        // EXPLOSION BARIL
        const playerEntity: Entity = {
          id: "player",
          type: "player",
          name: "Héros",
          position: player.position,
          spriteKey: "PLAYER",
          stats: player.stats,
          isHostile: false,
          visualScale: 1,
        };

        triggerBarrelExplosion(
          target,
          processedEnemies,
          playerEntity,
          callbacks
        );

        processedEnemies[targetIndex] = {
          ...target,
          stats: { ...target.stats, hp: 0 },
          isDead: false,
          type: "rubble",
          spriteKey: "RUBBLE",
          isHostile: false,
          name: "Débris",
        };
      } else {
        // MORT ENNEMI
        processedEnemies[targetIndex] = {
          ...target,
          stats: { ...target.stats, hp: 0 },
          isDead: true,
        };

        set((s) => ({
          player: { ...s.player, xp: s.player.xp + target.stats.xpValue },
        }));
        logsRef.push(`${target.name} vaincu !`);

        // --- VÉRIFICATION VICTOIRE (Escalier) ---
        const remainingHostiles = processedEnemies.filter(
          (e) => e.isHostile && !e.isDead
        ).length;

        if (remainingHostiles === 0) {
          // On cherche l'escalier existant
          const stairs = processedEnemies.find((e) => e.type === "stairs");

          if (stairs && stairs.isHidden) {
            // 1. Révéler l'escalier
            const stairsIndex = processedEnemies.findIndex(
              (e) => e.id === stairs.id
            );
            processedEnemies[stairsIndex] = { ...stairs, isHidden: false };

            // 2. Effets Spéciaux (Tremblement + Texte + Particules)
            set((s) => ({ screenShake: 20 }));

            if (get().addSpeechBubble) {
              get().addSpeechBubble({
                id: `vic_${Date.now()}`,
                targetId: "player",
                text: "Le passage s'ouvre !",
                color: "#fbbf24",
                duration: 3000,
                createdAt: Date.now(),
              });
            }

            // Simuler particules autour de l'escalier
            callbacks.spawnParticles(
              stairs.position.x,
              stairs.position.y,
              "#fbbf24",
              30
            );

            // Ajouter un texte flottant
            callbacks.addEffects(
              stairs.position.x,
              stairs.position.y,
              "#fbbf24",
              0,
              "SORTIE RÉVÉLÉE !",
              "#fbbf24"
            );
          }
        }
      }
    } else {
      // Dégâts normaux
      processedEnemies[targetIndex] = {
        ...target,
        stats: { ...target.stats, hp: newHp },
      };
    }
  }

  return processedEnemies;
};
