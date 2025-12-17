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
    gameState,
    hitStop,
    damageFlash,
    logs,
  } = get();

  if (gameState === "dialogue") return;

  // --- Gestion Timers ---
  if (hitStop && hitStop > 0) {
    set({ hitStop: Math.max(0, hitStop - dt) });
    return;
  }
  if (screenShake > 0) {
    set({ screenShake: Math.max(0, screenShake - 0.8) });
  }
  if (damageFlash && damageFlash > 0) {
    set({ damageFlash: Math.max(0, damageFlash - 0.05) });
  }

  // --- Gestion Cooldowns Sorts ---
  const dtSec = dt / 1000;
  const newSpells = player.spells.map((s: any) =>
    s.currentCooldown > 0
      ? { ...s, currentCooldown: Math.max(0, s.currentCooldown - dtSec) }
      : s
  );
  if (JSON.stringify(newSpells) !== JSON.stringify(player.spells)) {
    set((s) => ({ player: { ...s.player, spells: newSpells } }));
  }

  const { callbacks, newProjectilesToAdd, newLogsToAdd, damageEvents } =
    createCombatCallbacks(set, get);

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

  // --- MISE À JOUR IA ---
  let newEnemies = updateEnemiesLogic(
    enemies,
    playerEntity,
    map,
    dt,
    callbacks
  );

  // --- CORRECTIF CRITIQUE : PERSISTANCE DES FLAGS ---
  // On s'assure que si un ennemi avait déjà drop son loot, l'info n'est pas perdue par updateEnemiesLogic
  newEnemies = newEnemies.map((ne) => {
    const old = enemies.find((oe) => oe.id === ne.id);
    if (old && (old as any).lootDropped) {
      return { ...ne, lootDropped: true };
    }
    return ne;
  });

  const activeProjectiles = updateProjectilesLogic(
    projectiles,
    map,
    newEnemies,
    playerEntity,
    callbacks
  );

  newEnemies = processDamageQueue(
    newEnemies,
    damageEvents,
    set,
    get,
    callbacks,
    newLogsToAdd
  );

  // --- SPAWN OR & LOGS ---
  let newParticles: any[] = [];
  let newFloatingTexts: any[] = [];
  let newLogs: string[] = [...newLogsToAdd];

  newEnemies = newEnemies.map((e) => {
    // On vérifie e.lootDropped pour ne pas respawn l'or
    if (e.isDead && !(e as any).lootDropped && e.type === "enemy") {
      newLogs.push(`${e.name} a été vaincu !`);

      // Spawn Or
      const baseGold = 5 + (get().dungeonLevel || 1) * 2;
      const goldAmount = Math.floor(
        baseGold + Math.random() * baseGold + (player.stats.luck || 0)
      );

      const goldEntity: Entity = {
        id: `gold_${Date.now()}_${Math.random()}`, // ID unique robuste
        type: "gold",
        name: "Tas d'or",
        spriteKey: "GOLD",
        position: { x: e.position.x, y: e.position.y },
        stats: { hp: 1, maxHp: 1 } as any,
        isHostile: false,
        value: goldAmount, // On stocke la valeur ici
        visualScale: 0.7,
      };
      (e as any)._spawnGold = goldEntity;

      return { ...e, lootDropped: true };
    }
    return e;
  });

  // Extraction et Ajout de l'Or
  const goldToSpawn = newEnemies
    .filter((e: any) => e._spawnGold)
    .map((e: any) => e._spawnGold);

  if (goldToSpawn.length > 0) {
    newEnemies = [...newEnemies, ...goldToSpawn];
  }

  // Nettoyage des propriétés temporaires
  newEnemies = newEnemies.map((e) => {
    if ((e as any)._spawnGold) {
      const { _spawnGold, ...rest } = e as any;
      return rest;
    }
    return e;
  });

  // --- RÉVÉLATION ESCALIER ---
  const livingHostiles = newEnemies.filter(
    (e) => e.isHostile && !e.isDead && e.type !== "barrel"
  ).length;
  const stairs = newEnemies.find((e) => e.type === "stairs");

  if (livingHostiles === 0 && stairs && stairs.isHidden) {
    newEnemies = newEnemies.map((e) =>
      e.type === "stairs" ? { ...e, isHidden: false } : e
    );

    newLogs.push(">>> LA VOIE EST LIBRE ! <<<");
    set({ screenShake: 15, damageFlash: 0.5 });

    newFloatingTexts.push({
      id: Math.random(),
      x: stairs.position.x,
      y: stairs.position.y - 1.5,
      text: "SORTIE !",
      color: "#fbbf24",
      life: 4.0,
      isCrit: true,
    });
  }

  const finalProjectiles = [...activeProjectiles, ...newProjectilesToAdd];

  const activeTexts = [...floatingTexts, ...newFloatingTexts]
    .map((t) => ({ ...t, life: t.life - 0.015, y: t.y - 0.01 }))
    .filter((t) => t.life > 0);

  const activeParticles = [...particles, ...newParticles]
    .map((p) => {
      const gravity = (p as any).gravity || 0;
      return {
        ...p,
        life: p.life - 0.02,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + gravity,
      };
    })
    .filter((p) => p.life > 0);

  set((s) => ({
    enemies: newEnemies,
    projectiles: finalProjectiles,
    floatingTexts: activeTexts,
    particles: activeParticles,
    logs: [...s.logs, ...newLogs].slice(-20),
  }));
};
