import { StoreApi } from "zustand";
import { GameStore } from "../../types";
// IMPORT ESSENTIEL POUR L'EXPLOSION
import { triggerBarrelExplosion } from "@/lib/combat/explosions";
import { Projectile, Particle, Entity, Direction } from "@/types/game";

type SetState = StoreApi<GameStore>["setState"];
type GetState = StoreApi<GameStore>["getState"];

export interface DamageEvent {
  id: string;
  amount: number;
  isCrit: boolean;
  sourceType?: "player" | "enemy" | "trap";
}

export interface CombatCallbacks {
  addProjectile: (p: Projectile) => void;
  triggerAttackAnim: (x: number, y: number, dir: string, type: string) => void;
  triggerHitStop: (durationMs: number) => void;
  triggerScreenFlash: (opacity?: number) => void;
  addEffects: (
    x: number,
    y: number,
    color: string,
    count: number,
    text?: string,
    textColor?: string
  ) => void;
  addLog: (msg: string) => void;
  spawnParticles: (
    x: number,
    y: number,
    color: string,
    count: number,
    type?: "blood" | "spark" | "normal" | "debris"
  ) => void;
  damagePlayer: (amount: number) => void;
  damageEnemy: (id: string, amount: number, isCrit?: boolean) => void;
  killEnemy: (id: string) => void;
  shakeScreen: (amount: number) => void;
  grantXp: (amount: number) => void;
}

export const createCombatCallbacks = (set: SetState, get: GetState) => {
  const newProjectilesToAdd: Projectile[] = [];
  const newLogsToAdd: string[] = [];
  const damageEvents: DamageEvent[] = [];

  // 1. DÉFINITION DES FONCTIONS INDIVIDUELLES

  const addProjectile = (p: Projectile) => {
    // SECURITY CHECK: On n'ajoute PAS le projectile si ses coordonnées sont corrompues (NaN/Infinity)
    if (
      Number.isFinite(p.startX) &&
      Number.isFinite(p.startY) &&
      Number.isFinite(p.targetX) &&
      Number.isFinite(p.targetY)
    ) {
      newProjectilesToAdd.push(p);
    }
  };

  const triggerAttackAnim = (
    x: number,
    y: number,
    dir: string,
    type: string
  ) => {
    const validDir: Direction = ["up", "down", "left", "right"].includes(dir)
      ? (dir as Direction)
      : "down";
    get().triggerAttackAnim(x, y, validDir, type);
  };

  const triggerHitStop = (durationMs: number) => {
    const currentStop = get().hitStop || 0;
    if (durationMs > currentStop) set({ hitStop: durationMs });
  };

  const triggerScreenFlash = (opacity: number = 0.3) => {
    set({ damageFlash: opacity });
  };

  const shakeScreen = (amount: number) => {
    set((s) => ({
      screenShake: Math.min(s.screenShake + amount, 25),
    }));
  };

  const spawnParticles = (
    x: number,
    y: number,
    color: string,
    count: number,
    type: "blood" | "spark" | "normal" | "debris" = "normal"
  ) => {
    const parts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed =
        type === "spark"
          ? Math.random() * 0.5 + 0.2
          : Math.random() * 0.4 + 0.1;
      const life =
        type === "blood" ? 2.0 + Math.random() : 0.4 + Math.random() * 0.3;

      parts.push({
        x: x + (Math.random() - 0.5) * 0.4,
        y: y + (Math.random() - 0.5) * 0.4,
        color: type === "spark" && Math.random() > 0.5 ? "#ffffff" : color,
        life,
        size: Math.random() * 4 + 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        // @ts-ignore
        gravity: type === "blood" || type === "debris" ? 0.02 : 0,
      });
    }
    set((s) => ({ particles: [...s.particles, ...parts] }));
  };

  const addEffects = (
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
            x: x + (Math.random() - 0.5) * 0.5,
            y: y - 0.5,
            text,
            color: textColor || color,
            life: 1.0,
            isCrit: text.includes("!"),
          },
        ],
      }));
    }
    if (count > 0) spawnParticles(x, y, color, count, "spark");
  };

  const addLog = (msg: string) => {
    newLogsToAdd.push(msg);
  };

  const damagePlayer = (amount: number) => {
    const p = get().player;
    // Protection contre les valeurs négatives ou NaN
    const safeAmount = Math.max(0, amount || 0);
    const newHp = p.stats.hp - safeAmount;

    set({ player: { ...p, stats: { ...p.stats, hp: newHp } } });

    // Appel direct des fonctions locales (plus sûr)
    triggerScreenFlash(0.5);
    shakeScreen(10);
    triggerHitStop(150);

    if (newHp <= 0) set({ gameState: "gameover" });
  };

  const damageEnemy = (id: string, amount: number, isCrit: boolean = false) => {
    damageEvents.push({ id, amount, isCrit, sourceType: "player" });
  };

  const killEnemy = (id: string) => {
    damageEvents.push({
      id,
      amount: 999999,
      isCrit: true,
      sourceType: "player",
    });
  };

  const grantXp = (amount: number) => {
    set((s) => ({ player: { ...s.player, xp: s.player.xp + amount } }));
  };

  // 2. ASSEMBLAGE DE L'OBJET FINAL
  const callbacks: CombatCallbacks = {
    addProjectile,
    triggerAttackAnim,
    triggerHitStop,
    triggerScreenFlash,
    addEffects,
    addLog,
    spawnParticles,
    damagePlayer,
    damageEnemy,
    killEnemy,
    shakeScreen,
    grantXp,
  };

  return { callbacks, newProjectilesToAdd, newLogsToAdd, damageEvents };
};

export const processDamageQueue = (
  currentEnemies: Entity[],
  damageEvents: DamageEvent[],
  set: SetState,
  get: GetState,
  callbacks: CombatCallbacks,
  logsRef: string[]
) => {
  let processedEnemies = [...currentEnemies];
  const { player } = get();

  for (let i = 0; i < damageEvents.length; i++) {
    const { id, amount, isCrit } = damageEvents[i];
    const targetIndex = processedEnemies.findIndex((e) => e.id === id);
    if (targetIndex === -1) continue;

    const target = processedEnemies[targetIndex];
    if (target.isDead || target.type === "rubble") continue;

    const newHp = target.stats.hp - amount;

    // Feedback Dégâts
    if (amount > 0) {
      if (isCrit || amount > target.stats.maxHp * 0.3) {
        callbacks.triggerHitStop(120);
        callbacks.shakeScreen(8);
        callbacks.triggerScreenFlash(0.1);
      } else {
        callbacks.triggerHitStop(30);
      }
      const isMech = ["golem", "construct", "barrel", "chest"].some((t) =>
        target.type.includes(t)
      );
      callbacks.spawnParticles(
        target.position.x,
        target.position.y,
        isMech ? "#fbbf24" : "#dc2626",
        isCrit ? 20 : 8,
        isMech ? "spark" : "blood"
      );
    }

    if (newHp <= 0) {
      // --- MORT ---
      if (target.type === "barrel") {
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
        processedEnemies[targetIndex] = {
          ...target,
          stats: { ...target.stats, hp: 0 },
          isDead: true,
        };
        callbacks.spawnParticles(
          target.position.x,
          target.position.y,
          "#991b1b",
          40,
          "blood"
        );
        callbacks.shakeScreen(5);
        set((s) => ({
          player: { ...s.player, xp: s.player.xp + target.stats.xpValue },
        }));
        logsRef.push(`${target.name} éliminé.`);

        // --- TRIGGER QUÊTE : KILL ---
        if (get().updateQuestProgress) {
          get().updateQuestProgress("kill", target.spriteKey || "UNKNOWN", 1);
          if (target.aiBehavior === "boss") {
            get().updateQuestProgress("kill", "BOSS_GOLEM", 1);
          }
        }

        // --- VÉRIFICATION VICTOIRE ---
        const remainingHostiles = processedEnemies.filter(
          (e) => e.isHostile && !e.isDead
        ).length;

        if (remainingHostiles === 0) {
          const stairsIndex = processedEnemies.findIndex(
            (e) => e.type === "stairs"
          );

          if (stairsIndex !== -1) {
            const stairs = processedEnemies[stairsIndex];
            processedEnemies[stairsIndex] = {
              ...stairs,
              isHidden: false,
              isHostile: false,
              name: "Sortie (Ouverte)",
            };
            set((s) => ({ screenShake: 20 }));
            if (get().addSpeechBubble) {
              get().addSpeechBubble({
                id: `vic_${Date.now()}`,
                targetId: "player",
                text: "La voie est libre !",
                color: "#fbbf24",
                duration: 3000,
                createdAt: Date.now(),
              });
            }
            logsRef.push("L'escalier apparaît !");
          }
        }
      }
    } else {
      processedEnemies[targetIndex] = {
        ...target,
        stats: { ...target.stats, hp: newHp },
      };
    }
  }

  return processedEnemies;
};
