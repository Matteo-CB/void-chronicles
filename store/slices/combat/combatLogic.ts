import { StoreApi } from "zustand";
import { GameStore } from "../../types";
import { updateEnemiesLogic, updateProjectilesLogic } from "@/lib/combatEngine";
import { createCombatCallbacks, processDamageQueue } from "./combatCallbacks";
import { Entity } from "@/types/game";

type SetState = StoreApi<GameStore>["setState"];
type GetState = StoreApi<GameStore>["getState"];

export const combatLoopLogic = (set: SetState, get: GetState, dt: number) => {
  const {
    enemies,
    player,
    map,
    projectiles,
    floatingTexts,
    particles,
    screenShake,
    gameState, // On récupère l'état du jeu
  } = get();

  // CORRECTION MAJEURE : Si on est en dialogue, on fige le combat
  if (gameState === "dialogue") {
    return;
  }

  // 1. GESTION DU TREMBLEMENT
  if (screenShake > 0) {
    const newShake = Math.max(0, screenShake - 0.5);
    set({ screenShake: newShake });
  }

  const dtSec = dt / 1000;

  // Mise à jour des cooldowns des sorts
  const newSpells = player.spells.map((s: any) =>
    s.currentCooldown > 0
      ? { ...s, currentCooldown: Math.max(0, s.currentCooldown - dtSec) }
      : s
  );

  if (JSON.stringify(newSpells) !== JSON.stringify(player.spells)) {
    set((s) => ({ player: { ...s.player, spells: newSpells } }));
  }

  // --- CRÉATION DES CALLBACKS ET DE LA QUEUE D'EVENTS ---
  const { callbacks, newProjectilesToAdd, newLogsToAdd, damageEvents } =
    createCombatCallbacks(set, get);

  // Conversion du PlayerState en Entity pour les fonctions de combat
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

  // 2. LOGIQUE ENNEMIS (MOUVEMENT)
  let newEnemies = updateEnemiesLogic(
    enemies,
    playerEntity,
    map,
    dt,
    callbacks
  );

  // 3. LOGIQUE PROJECTILES (COLLISIONS)
  const activeProjectiles = updateProjectilesLogic(
    projectiles,
    map,
    newEnemies,
    playerEntity,
    callbacks
  );

  // 4. APPLICATION DES DÉGÂTS (CRITIQUE)
  newEnemies = processDamageQueue(
    newEnemies,
    damageEvents,
    set,
    get,
    callbacks,
    newLogsToAdd
  );

  const finalProjectiles = [...activeProjectiles, ...newProjectilesToAdd];

  const activeTexts = floatingTexts
    .map((t) => ({ ...t, life: t.life - 0.015, y: t.y - 0.01 }))
    .filter((t) => t.life > 0);

  const activeParticles = particles
    .map((p) => ({
      ...p,
      life: p.life - 0.05,
      x: p.x + p.vx,
      y: p.y + p.vy,
    }))
    .filter((p) => p.life > 0);

  // 5. SAUVEGARDE FINALE
  set((s) => ({
    enemies: newEnemies,
    projectiles: finalProjectiles,
    floatingTexts: activeTexts,
    particles: activeParticles,
    logs: [...s.logs, ...newLogsToAdd].slice(-20),
  }));
};
