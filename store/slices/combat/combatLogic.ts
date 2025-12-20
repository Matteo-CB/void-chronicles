import { StoreApi } from "zustand";
import { GameStore } from "../../types";
import { updateEnemiesLogic, updateProjectilesLogic } from "@/lib/combatEngine";
import { createCombatCallbacks, processDamageQueue } from "./combatCallbacks";
import { Entity } from "@/types/game";

type SetState = StoreApi<GameStore>["setState"];
type GetState = StoreApi<GameStore>["getState"];

export const combatLoopLogic = (set: SetState, get: GetState, dt: number) => {
  const state = get();
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
  } = state;

  if (gameState === "dialogue") return;

  let nextHitStop = hitStop;
  let nextScreenShake = screenShake;
  let nextDamageFlash = damageFlash;

  if (hitStop && hitStop > 0) {
    nextHitStop = Math.max(0, hitStop - dt);
    set({ hitStop: nextHitStop });
    return;
  }

  // DECAY TRÈS RAPIDE (Pour que le shake soit bref et sec)
  if (screenShake > 0) {
    nextScreenShake = Math.max(0, screenShake - 2.0); // -2.0 par frame
    if (nextScreenShake < 0.1) nextScreenShake = 0;
  }

  if (damageFlash && damageFlash > 0) {
    nextDamageFlash = Math.max(0, damageFlash - 0.05);
    if (nextDamageFlash < 0.01) nextDamageFlash = 0;
  }

  if (nextScreenShake !== screenShake || nextDamageFlash !== damageFlash) {
    const safeShake = Number.isFinite(nextScreenShake) ? nextScreenShake : 0;
    set({ screenShake: safeShake, damageFlash: nextDamageFlash });
  }

  const dtSec = dt / 1000;
  let spellsChanged = false;
  const newSpells = player.spells.map((s: any) => {
    if (s.currentCooldown > 0) {
      const newVal = Math.max(0, s.currentCooldown - dtSec);
      if (Math.abs(newVal - s.currentCooldown) > 0.001) {
        spellsChanged = true;
        return { ...s, currentCooldown: newVal };
      }
    }
    return s;
  });

  if (spellsChanged) {
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

  let newEnemies = updateEnemiesLogic(
    enemies,
    playerEntity,
    map,
    dt,
    callbacks
  );

  newEnemies = newEnemies.map((e) => {
    let kx = e.knockbackX || 0;
    let ky = e.knockbackY || 0;

    if (!Number.isFinite(kx)) kx = 0;
    if (!Number.isFinite(ky)) ky = 0;

    kx *= 0.8;
    ky *= 0.8;

    if (Math.abs(kx) < 0.05) kx = 0;
    if (Math.abs(ky) < 0.05) ky = 0;

    const MAX_SPEED = 0.9;
    kx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, kx));
    ky = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, ky));

    return {
      ...e,
      position: { x: e.position.x + kx, y: e.position.y + ky },
      knockbackX: kx,
      knockbackY: ky,
    };
  });

  newEnemies = newEnemies.map((ne) => {
    const old = enemies.find((oe) => oe.id === ne.id);
    let finalEnemy = { ...ne };

    if (old && (old as any).lootDropped) {
      (finalEnemy as any).lootDropped = true;
    }

    if (old && (old as any).isEnraged) {
      (finalEnemy as any).isEnraged = true;
      finalEnemy.visualScale = (old as any).visualScale;
      finalEnemy.rarityColor = old.rarityColor;
    }

    if (finalEnemy.aiBehavior === "boss" && !(finalEnemy as any).isEnraged) {
      if (finalEnemy.stats.hp < finalEnemy.stats.maxHp * 0.5) {
        const { addLog, addEffects } = get();
        if (addLog) addLog(`${finalEnemy.name} EST ENRAGÉ !`);
        if (addEffects)
          addEffects(
            finalEnemy.position.x,
            finalEnemy.position.y,
            "#ef4444",
            20,
            "ENRAGÉ !",
            "#ff0000"
          );

        set({ screenShake: 5 }); // Shake réduit

        finalEnemy = {
          ...finalEnemy,
          isEnraged: true,
          visualScale: (finalEnemy.visualScale || 1) * 1.3,
          rarityColor: "#ef4444",
          stats: {
            ...finalEnemy.stats,
            attack: Math.floor(finalEnemy.stats.attack * 1.5),
          },
        } as any;
      }
    }
    return finalEnemy;
  });

  let addedParticles: any[] = [];
  let currentShake = nextScreenShake;

  if (damageEvents.length > 0) {
    damageEvents.forEach((evt) => {
      // Shake minime sur impact
      const impact = evt.isCrit ? 2 : 1;
      currentShake = Math.min(5, currentShake + impact);

      const target = newEnemies.find((e) => e.id === evt.id);
      if (target) {
        const particleCount = evt.isCrit ? 12 : 6;
        let particleColor = "#ef4444";
        if (target.type === "barrel" || target.type === "crate")
          particleColor = "#fbbf24";
        else if (target.type === "golem" || target.type === "rubble")
          particleColor = "#9ca3af";

        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.2 + 0.05;
          addedParticles.push({
            id: Math.random(),
            x: target.position.x,
            y: target.position.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0 + Math.random() * 0.5,
            color: particleColor,
            size: Math.random() * 0.15 + 0.05,
            gravity: 0.015,
            type: "debris",
          });
        }

        if (!target.isDead && target.type !== "boss") {
          const dx = target.position.x - player.position.x;
          const dy = target.position.y - player.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const pushForce = evt.isCrit ? 0.6 : 0.2;

          const nx = target.position.x + (dx / dist) * pushForce;
          const ny = target.position.y + (dy / dist) * pushForce;

          const mapH = map.length;
          const mapW = map[0]?.length || 0;
          const tile = map[Math.floor(ny)]?.[Math.floor(nx)];

          if (
            nx >= 0 &&
            nx < mapW &&
            ny >= 0 &&
            ny < mapH &&
            tile &&
            tile.type !== "wall"
          ) {
            target.position.x = nx;
            target.position.y = ny;
          }
        }
      }
    });

    if (Math.abs(currentShake - nextScreenShake) > 0.1) {
      set({ screenShake: Math.min(5, currentShake) });
    }
  }

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

  let newParticles: any[] = [...addedParticles];
  let newFloatingTexts: any[] = [];
  let newLogs: string[] = [...newLogsToAdd];
  let entitiesToAdd: Entity[] = [];

  newEnemies = newEnemies.map((e) => {
    // --- DETECTION DE LA MORT DE L'ENNEMI ---
    if (e.isDead && !(e as any).lootDropped && e.type === "enemy") {
      newLogs.push(`${e.name} a été vaincu !`);

      // === CORRECTION : MISE À JOUR DES QUÊTES ===
      const { updateQuestProgress } = get();

      // FIX : Utiliser la spriteKey ("RAT") car "type" est générique ("enemy")
      // Cela permet de faire le lien correct avec la quête qui attend "RAT"
      const targetId = (e as any).spriteKey || e.name;

      // On valide la quête de type "kill"
      updateQuestProgress("kill", targetId, 1);
      // ===========================================

      const baseGold = 5 + (get().dungeonLevel || 1) * 2;
      const luckBonus = player.stats.luck || 0;
      const goldAmount = Math.floor(
        baseGold + Math.random() * baseGold + luckBonus
      );

      const goldEntity: Entity = {
        id: `gold_${Date.now()}_${Math.random()}`,
        type: "gold",
        name: "Tas d'or",
        spriteKey: "GOLD",
        position: { x: e.position.x, y: e.position.y },
        stats: { hp: 1, maxHp: 1 } as any,
        isHostile: false,
        value: goldAmount,
        visualScale: 0.7,
      };

      entitiesToAdd.push(goldEntity);
      return { ...e, lootDropped: true };
    }
    return e;
  });

  if (entitiesToAdd.length > 0) {
    newEnemies = [...newEnemies, ...entitiesToAdd];
  }

  let hasLivingHostiles = false;
  let stairsEntity: Entity | undefined;

  for (const e of newEnemies) {
    if (e.type === "stairs") stairsEntity = e;
    if (e.isHostile && !e.isDead && e.type !== "barrel") {
      hasLivingHostiles = true;
    }
  }

  if (!hasLivingHostiles && stairsEntity && stairsEntity.isHidden) {
    newEnemies = newEnemies.map((e) =>
      e.type === "stairs" ? { ...e, isHidden: false } : e
    );

    newLogs.push(">>> LA VOIE EST LIBRE ! <<<");
    set({ screenShake: 5, damageFlash: 0.5 }); // Shake réduit

    newFloatingTexts.push({
      id: Math.random(),
      x: stairsEntity.position.x,
      y: stairsEntity.position.y - 1.5,
      text: "SORTIE !",
      color: "#fbbf24",
      life: 4.0,
      isCrit: true,
    });
  }

  const finalProjectiles = [...activeProjectiles, ...newProjectilesToAdd];

  const activeTexts = [...floatingTexts, ...newFloatingTexts]
    .map((t) => ({
      ...t,
      life: t.life - 0.015,
      y: t.y - 0.01,
    }))
    .filter((t) => t.life > 0);

  const activeParticles = [...particles, ...newParticles]
    .map((p) => {
      const gravity = (p as any).gravity || 0;
      return {
        ...p,
        life: p.life - 0.03,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + gravity,
        vx: p.vx * 0.9,
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
