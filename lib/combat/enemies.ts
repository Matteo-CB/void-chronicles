import { Entity, MapTile } from "@/types/game";
import { CombatCallbacks } from "@/store/slices/combat/combatCallbacks";
import { checkLineOfSight, getDistance } from "./utils";
import { createEnemy } from "../data/enemies"; // Import nécessaire pour l'invocation

export const updateEnemiesLogic = (
  enemies: Entity[],
  player: Entity,
  map: MapTile[][],
  dt: number,
  callbacks: CombatCallbacks
): Entity[] => {
  const dtSec = dt / 1000;
  let spawnedEntities: Entity[] = []; // Liste temporaire pour les invocations

  const updatedEnemies = enemies.map((e) => {
    // --- 1. FILTRES & SÉCURITÉS ---
    if (
      e.isDead ||
      !e.isHostile ||
      e.type === "rubble" ||
      e.type === "barrel"
    ) {
      return e;
    }
    if (
      ["chest", "gold", "potion", "item", "merchant", "stairs"].includes(e.type)
    ) {
      if (e.knockbackX || e.knockbackY)
        return { ...e, knockbackX: 0, knockbackY: 0 };
      return e;
    }

    // --- 2. STATUS EFFECTS ---
    if (e.statusEffects) {
      if (e.statusEffects.includes("freeze")) return e;
      if (e.statusEffects.includes("stun")) return e;
      if (e.statusEffects.includes("burn") && Math.random() < 0.05) {
        callbacks.damageEnemy(e.id, 1);
        callbacks.addEffects(e.position.x, e.position.y, "#f97316", 1);
      }
    }

    // --- 3. PHYSIQUE (RECUL) ---
    if (
      Math.abs(e.knockbackX || 0) > 0.01 ||
      Math.abs(e.knockbackY || 0) > 0.01
    ) {
      const drag = 0.9;
      const nextX = e.position.x + (e.knockbackX || 0);
      const nextY = e.position.y + (e.knockbackY || 0);

      if (!isWall(map, nextX, nextY)) {
        return {
          ...e,
          position: { x: nextX, y: nextY },
          knockbackX: (e.knockbackX || 0) * drag,
          knockbackY: (e.knockbackY || 0) * drag,
        };
      } else {
        return { ...e, knockbackX: 0, knockbackY: 0 };
      }
    }

    // --- 4. IA GENERALE ---
    let newMoveTimer = (e.moveTimer || 0) + dt;
    let newAttackTimer = (e.attackTimer || 0) + dt;
    const distToPlayer = getDistance(e.position, player.position);

    const aggroRange = e.aiBehavior === "boss" ? 999 : e.aggroRange || 12;
    if (distToPlayer > aggroRange) {
      return { ...e, moveTimer: newMoveTimer, attackTimer: newAttackTimer };
    }

    // --- 5. LOGIQUE SPÉCIALE BOSS ---
    if (e.aiBehavior === "boss") {
      return handleBossAI(
        e,
        player,
        map,
        distToPlayer,
        dtSec,
        newAttackTimer,
        callbacks
      );
    }

    // --- 6. LOGIQUE IA AVANCÉE ---
    const behavior = e.aiBehavior || "chaser";
    let speed = (e.stats.speed || 1) * 2.5;

    // Vecteurs vers le joueur
    const vecX = player.position.x - e.position.x;
    const vecY = player.position.y - e.position.y;
    const length = Math.sqrt(vecX * vecX + vecY * vecY);
    const dirX = length > 0 ? vecX / length : 0;
    const dirY = length > 0 ? vecY / length : 0;

    let dx = 0;
    let dy = 0;
    let shouldMove = true;
    const minDistance = e.minDistance || 0;
    const range = e.range || 1;

    // A. COMPORTEMENT DE MOUVEMENT
    if (["archer", "caster", "summoner", "healer"].includes(behavior)) {
      // FUITE INTELLIGENTE
      if (distToPlayer < minDistance) {
        // Essayer de fuir à l'opposé
        let fleeX = -dirX;
        let fleeY = -dirY;

        // Vérification : Est-ce qu'on va dans un mur ?
        if (isWall(map, e.position.x + fleeX, e.position.y + fleeY)) {
          // Si bloqué, essayer de strafe (glisser sur le côté)
          // Essai +90 deg
          if (!isWall(map, e.position.x - dirY, e.position.y + dirX)) {
            fleeX = -dirY;
            fleeY = dirX;
          }
          // Essai -90 deg
          else if (!isWall(map, e.position.x + dirY, e.position.y - dirX)) {
            fleeX = dirY;
            fleeY = -dirX;
          }
        }

        dx = fleeX;
        dy = fleeY;
        speed *= 0.8; // Malus vitesse en reculant
      }
      // APPROCHE (Si trop loin pour agir)
      else if (distToPlayer > range) {
        dx = dirX;
        dy = dirY;
      }
      // POSITIONNEMENT (Danse)
      else {
        shouldMove = false;
        // Petit mouvement aléatoire pour ne pas être statique
        if (Math.random() < 0.02) {
          const randAngle = Math.random() * Math.PI * 2;
          dx = Math.cos(randAngle);
          dy = Math.sin(randAngle);
          shouldMove = true;
        }
      }
    } else {
      // CHASER / TANK : Foncer dans le tas
      if (distToPlayer > 0.8) {
        dx = dirX;
        dy = dirY;
      } else shouldMove = false;
    }

    // B. ANTI-STACKING (Éviter que les mobs se chevauchent)
    let repulX = 0;
    let repulY = 0;
    enemies.forEach((other) => {
      if (other.id === e.id || other.isDead || !other.isHostile) return;
      const d = getDistance(e.position, other.position);
      if (d < 0.7) {
        const pushX = e.position.x - other.position.x;
        const pushY = e.position.y - other.position.y;
        const force = 1.2 / (pushX * pushX + pushY * pushY + 0.1);
        repulX += pushX * force;
        repulY += pushY * force;
      }
    });
    if (shouldMove || Math.abs(repulX) > 0.1) {
      dx += repulX;
      dy += repulY;
    }

    // C. APPLICATION MOUVEMENT
    const finalLen = Math.sqrt(dx * dx + dy * dy);
    if (finalLen > 0) {
      dx = (dx / finalLen) * speed * dtSec;
      dy = (dy / finalLen) * speed * dtSec;
    }

    let nextX = e.position.x;
    let nextY = e.position.y;

    if (shouldMove || finalLen > 0) {
      // Glissement sur les murs
      if (!isWall(map, nextX + dx, nextY + dy)) {
        nextX += dx;
        nextY += dy;
      } else if (!isWall(map, nextX + dx, nextY)) {
        nextX += dx;
      } else if (!isWall(map, nextX, nextY + dy)) {
        nextY += dy;
      }
    }

    // --- 7. ACTIONS (ATTAQUE / SOIN / INVOCATION) ---
    const attackCooldown = e.attackCooldown || 1500;
    const hasLOS = checkLineOfSight(
      map,
      e.position.x,
      e.position.y,
      player.position.x,
      player.position.y
    );

    if (newAttackTimer >= attackCooldown && hasLOS) {
      // -- A. INVOCATION --
      if (behavior === "summoner" && (e as any).summonType) {
        // Vérifier nombre de minions actuels
        const myMinions = enemies.filter(
          (minion) => minion.name === (e as any).summonType && !minion.isDead
        ).length;
        const maxSummons = (e as any).maxSummons || 3;

        if (myMinions < maxSummons) {
          newAttackTimer = 0;
          callbacks.triggerAttackAnim(
            e.position.x,
            e.position.y,
            "down",
            "cast_enemy"
          );
          callbacks.addLog(`${e.name} invoque des renforts !`);

          // Spawn autour du Summoner
          for (let i = 0; i < 1; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spawnX = e.position.x + Math.cos(angle);
            const spawnY = e.position.y + Math.sin(angle);

            if (!isWall(map, spawnX, spawnY)) {
              const minion = createEnemy(
                (e as any).summonType,
                { x: spawnX, y: spawnY },
                1
              );
              // On réduit l'XP des minions pour éviter le farming abusif
              minion.stats.xpValue = 0;
              minion.moveTimer = 0; // Prêt à bouger
              spawnedEntities.push(minion);

              callbacks.spawnParticles(spawnX, spawnY, "#a855f7", 10, "spark");
            }
          }
        }
      }

      // -- B. SOIN --
      else if (behavior === "healer") {
        // Chercher allié blessé à portée
        const healRange = e.range || 5;
        const targetAlly = enemies.find(
          (ally) =>
            ally.isHostile &&
            !ally.isDead &&
            ally.id !== e.id &&
            ally.stats.hp < ally.stats.maxHp &&
            getDistance(e.position, ally.position) <= healRange
        );

        if (targetAlly) {
          newAttackTimer = 0;
          const healAmount = (e as any).healAmount || 20;
          callbacks.triggerAttackAnim(
            e.position.x,
            e.position.y,
            "down",
            "cast_enemy"
          );

          // Effet visuel sur la cible
          callbacks.spawnParticles(
            targetAlly.position.x,
            targetAlly.position.y,
            "#22c55e",
            10,
            "spark"
          );
          callbacks.addEffects(
            targetAlly.position.x,
            targetAlly.position.y,
            "#22c55e",
            1,
            `+${healAmount}`
          );

          // On triche un peu : on modifie les HP directement ici (ou via callback si on voulait être puriste)
          // Comme on est dans map(), on ne peut pas modifier 'other' directement dans ce tour
          // Solution : Le healer lance un projectile de soin ou on utilise damageEnemy avec valeur négative ?
          // Pour simplifier ici : on utilise damageEnemy avec -healAmount si le système le supporte,
          // sinon on suppose que le système de combat gère ça.
          // Hack : On va utiliser damageEnemy(-valeur).
          callbacks.damageEnemy(targetAlly.id, -healAmount);
        }
      }

      // -- C. ATTAQUE DISTANCE --
      else if (
        (behavior === "archer" ||
          behavior === "caster" ||
          behavior === "summoner") &&
        distToPlayer <= (e.range || 5)
      ) {
        newAttackTimer = 0;
        const animType = behavior === "archer" ? "bow_enemy" : "cast_enemy";
        callbacks.triggerAttackAnim(
          e.position.x,
          e.position.y,
          getFaceDir(vecX, vecY),
          animType
        );

        const angle = Math.atan2(vecY, vecX);
        callbacks.addProjectile({
          id: `proj_${Math.random()}`,
          startX: e.position.x + Math.cos(angle) * 0.6,
          startY: e.position.y + Math.sin(angle) * 0.6,
          targetX: player.position.x,
          targetY: player.position.y,
          damage: e.stats.attack,
          color: e.projectileColor || "#ef4444",
          speed: 0.15,
          isEnemy: true,
          projectileType: behavior === "archer" ? "arrow" : "fireball",
          explodeOnHit: behavior !== "archer",
          radius: 2,
          progress: 0,
          trail: [],
        });
      }

      // -- D. ATTAQUE MELEE --
      else if (distToPlayer <= 1.2) {
        newAttackTimer = 0;
        const dmg = Math.max(
          1,
          e.stats.attack - Math.floor(player.stats.defense / 2)
        );
        callbacks.damagePlayer(dmg);
        callbacks.addEffects(
          player.position.x,
          player.position.y,
          "#ef4444",
          10,
          `-${dmg}`
        );
        callbacks.shakeScreen(3);
        callbacks.triggerAttackAnim(
          e.position.x,
          e.position.y,
          getFaceDir(vecX, vecY),
          "slash_enemy"
        );
      }
    }

    return {
      ...e,
      position: { x: nextX, y: nextY },
      moveTimer: newMoveTimer,
      attackTimer: newAttackTimer,
    };
  });

  // On ajoute les nouvelles invocations à la liste finale
  return [...updatedEnemies, ...spawnedEntities];
};

// --- CERVEAU DU BOSS (Inchangé pour l'instant) ---
function handleBossAI(
  boss: Entity,
  player: Entity,
  map: MapTile[][],
  dist: number,
  dtSec: number,
  attackTimer: number,
  callbacks: CombatCallbacks
): Entity {
  const isEnraged = boss.stats.hp < boss.stats.maxHp * 0.5;
  const speedMult = isEnraged ? 1.5 : 1.0;

  if (isEnraged && Math.random() < 0.1) {
    callbacks.spawnParticles(
      boss.position.x,
      boss.position.y,
      "#ef4444",
      3,
      "spark"
    );
  }

  let speed = (boss.stats.speed || 0.8) * speedMult * 2.0;
  const vecX = player.position.x - boss.position.x;
  const vecY = player.position.y - boss.position.y;
  const len = Math.sqrt(vecX * vecX + vecY * vecY);
  const dirX = len > 0 ? vecX / len : 0;
  const dirY = len > 0 ? vecY / len : 0;

  let dx = dirX * speed * dtSec;
  let dy = dirY * speed * dtSec;
  let nextX = boss.position.x;
  let nextY = boss.position.y;

  if (!isWall(map, nextX + dx, nextY + dy)) {
    nextX += dx;
    nextY += dy;
  } else if (!isWall(map, nextX + dx, nextY)) {
    nextX += dx;
  } else if (!isWall(map, nextX, nextY + dy)) {
    nextY += dy;
  }

  const cooldown = isEnraged ? 2000 : 3000;

  if (attackTimer > cooldown) {
    const hasLOS = checkLineOfSight(
      map,
      boss.position.x,
      boss.position.y,
      player.position.x,
      player.position.y
    );

    if (hasLOS) {
      attackTimer = 0;
      callbacks.triggerAttackAnim(
        boss.position.x,
        boss.position.y,
        getFaceDir(vecX, vecY),
        "cast_enemy"
      );

      const roll = Math.random();

      if (roll < (isEnraged ? 0.6 : 0.4)) {
        callbacks.addLog(`${boss.name} déchaîne son pouvoir !`);
        callbacks.shakeScreen(5);
        const count = isEnraged ? 12 : 8;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          callbacks.addProjectile({
            id: `boss_nova_${Math.random()}`,
            startX: boss.position.x,
            startY: boss.position.y,
            targetX: boss.position.x + Math.cos(angle) * 10,
            targetY: boss.position.y + Math.sin(angle) * 10,
            damage: boss.stats.attack,
            color: isEnraged ? "#ef4444" : "#a855f7",
            speed: 0.12,
            isEnemy: true,
            projectileType: "fireball",
            explodeOnHit: true,
            radius: 2,
            progress: 0,
            trail: [],
          });
        }
      } else if (roll < 0.7) {
        const baseAngle = Math.atan2(vecY, vecX);
        const count = 5;
        const spread = 0.5;
        for (let i = 0; i < count; i++) {
          const angle = baseAngle - spread / 2 + (spread * i) / (count - 1);
          callbacks.addProjectile({
            id: `boss_shot_${Math.random()}`,
            startX: boss.position.x + Math.cos(angle),
            startY: boss.position.y + Math.sin(angle),
            targetX: boss.position.x + Math.cos(angle) * 15,
            targetY: boss.position.y + Math.sin(angle) * 15,
            damage: Math.floor(boss.stats.attack * 0.8),
            color: "#fbbf24",
            speed: 0.25,
            isEnemy: true,
            projectileType: "arrow",
            progress: 0,
            trail: [],
          });
        }
      } else if (dist < 2.5) {
        const dmg = Math.floor(boss.stats.attack * 1.5);
        callbacks.damagePlayer(dmg);
        callbacks.addEffects(
          player.position.x,
          player.position.y,
          "#dc2626",
          15,
          `-${dmg} CRIT`
        );
        callbacks.shakeScreen(10);
      }
    }
  }

  return {
    ...boss,
    position: { x: nextX, y: nextY },
    moveTimer: (boss.moveTimer || 0) + dtSec * 1000,
    attackTimer,
  };
}

function isWall(map: MapTile[][], x: number, y: number): boolean {
  const tX = Math.round(x);
  const tY = Math.round(y);
  if (tY < 0 || tY >= map.length || tX < 0 || tX >= map[0].length) return true;
  return map[tY][tX]?.type === "wall";
}

function getFaceDir(vx: number, vy: number): any {
  if (Math.abs(vx) > Math.abs(vy)) return vx > 0 ? "right" : "left";
  return vy > 0 ? "down" : "up";
}
