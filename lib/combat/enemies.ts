import { Entity, Tile } from "@/types/game";
import { CombatCallbacks } from "./types";
import { isValidMove, checkLineOfSight } from "./utils";

export function updateEnemiesLogic(
  enemies: Entity[],
  player: Entity,
  map: Tile[][],
  dt: number,
  callbacks: CombatCallbacks
) {
  // Conversion du delta time en secondes
  const dtSec = dt / 1000;

  return enemies.map((e: any) => {
    // Si mort ou objet inerte, on ne fait rien (sauf physique simple si besoin)
    if (
      e.isDead ||
      e.type === "rubble" ||
      (!e.isHostile && e.type !== "barrel")
    )
      return e;

    if (e.type === "barrel") return e;

    // Objets statiques ignorés par l'IA
    if (
      ["chest", "gold", "potion", "item", "merchant", "stairs"].includes(e.type)
    ) {
      e.knockbackX = 0;
      e.knockbackY = 0;
      return e;
    }

    // --- GESTION DES EFFETS DE STATUT ---
    if (e.statusEffects) {
      if (e.statusEffects.includes("freeze")) return e; // Gelé = immobile
      if (e.statusEffects.includes("stun")) return e; // Assommé = immobile
      if (e.statusEffects.includes("burn") && Math.random() < 0.05) {
        callbacks.damageEnemy(e.id, 1);
        callbacks.addEffects(e.position.x, e.position.y, "#f97316", 1);
      }
    }

    // --- GESTION PHYSIQUE (RECUL / KNOCKBACK) ---
    // Le recul est prioritaire sur l'IA volontaire
    if (
      Math.abs(e.knockbackX || 0) > 0.01 ||
      Math.abs(e.knockbackY || 0) > 0.01
    ) {
      const drag = 0.9; // Friction pour ralentir le recul
      const nextX = e.position.x + (e.knockbackX || 0);
      const nextY = e.position.y + (e.knockbackY || 0);

      // Vérification collision mur simple pour le recul
      const targetTile = map[Math.round(nextY)]?.[Math.round(nextX)];
      if (targetTile?.type !== "wall") {
        e.position.x = nextX;
        e.position.y = nextY;
      } else {
        // Si on tape un mur, on arrête le recul
        e.knockbackX = 0;
        e.knockbackY = 0;
      }

      e.knockbackX *= drag;
      e.knockbackY *= drag;

      // On s'arrête si c'est très faible pour éviter les micro-calculs
      if (Math.abs(e.knockbackX) < 0.01) e.knockbackX = 0;
      if (Math.abs(e.knockbackY) < 0.01) e.knockbackY = 0;

      return e;
    }

    // --- INTELLIGENCE ARTIFICIELLE (IA) ---

    // Vitesse ajustée pour être menaçante
    let speed = (e.stats.speed || 1) * 2.8;

    if (e.aiBehavior === "charger") speed *= 1.4;
    if (e.aiBehavior === "boss") speed *= 0.9;
    if (e.aiBehavior === "static") speed = 0;

    const dx = player.position.x - e.position.x;
    const dy = player.position.y - e.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Timer d'attaque
    let attackTimer = (e.moveTimer || 0) + dt;
    let attackCooldown = 1000;

    const hasLineOfSight = checkLineOfSight(
      map,
      e.position.x,
      e.position.y,
      player.position.x,
      player.position.y
    );

    // -- COMPORTEMENT : TIREUR (Distance) --
    if (["archer", "caster", "sniper"].includes(e.aiBehavior || "")) {
      const range = (e as any).range || 6;

      // Fuite si le joueur est trop près (Kiting)
      if (dist < 2.5) {
        const moveX = -(dx / dist) * speed * dtSec;
        const moveY = -(dy / dist) * speed * dtSec;
        tryMoveEntity(e, moveX, moveY, map, enemies, player);
      }
      // Tir si à portée et ligne de vue dégagée
      else if (dist <= range && hasLineOfSight) {
        if (attackTimer >= 1500) {
          // Cadence de tir plus lente
          const animType =
            e.aiBehavior === "caster" ? "cast_enemy" : "bow_enemy";
          let dir: any = "down";
          if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? "right" : "left";
          else dir = dy > 0 ? "down" : "up";

          callbacks.triggerAttackAnim(
            e.position.x,
            e.position.y,
            dir,
            animType
          );

          // Tir du projectile
          const angle = Math.atan2(dy, dx);
          const safeDist = 0.6; // Spawn un peu devant pour pas se toucher soi-même
          const startX = e.position.x + Math.cos(angle) * safeDist;
          const startY = e.position.y + Math.sin(angle) * safeDist;

          callbacks.addProjectile({
            id: `proj_mob_${Math.random()}`,
            startX,
            startY,
            targetX: player.position.x,
            targetY: player.position.y,
            damage: e.stats.attack,
            color: (e as any).projectileColor || "#ef4444",
            progress: 0,
            speed: 0.15,
            isEnemy: true,
            projectileType: e.aiBehavior === "caster" ? "fireball" : "arrow",
            trail: [],
            explodeOnHit: e.aiBehavior === "caster",
            radius: 2,
          });
          attackTimer = 0;
        }
      }
      // Sinon, on s'approche pour trouver une ligne de vue
      else {
        const moveX = (dx / dist) * speed * dtSec;
        const moveY = (dy / dist) * speed * dtSec;
        tryMoveEntity(e, moveX, moveY, map, enemies, player);
      }
    }
    // -- COMPORTEMENT : MÊLÉE (Chaser, Boss) --
    else {
      // Attaque au corps à corps
      if (dist <= 1.2) {
        if (attackTimer >= attackCooldown) {
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

          let dir: any = "down";
          if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? "right" : "left";
          else dir = dy > 0 ? "down" : "up";

          callbacks.triggerAttackAnim(
            e.position.x,
            e.position.y,
            dir,
            "slash_enemy"
          );
          attackTimer = 0;
        }
      }
      // Poursuite avec Wall Sliding (Glissement)
      else if (dist < 18) {
        // Distance d'agro augmentée
        const moveX = (dx / dist) * speed * dtSec;
        const moveY = (dy / dist) * speed * dtSec;
        tryMoveEntity(e, moveX, moveY, map, enemies, player);
      }
    }

    return { ...e, moveTimer: attackTimer };
  });
}

// Fonction de mouvement intelligente avec "Slide" (Glissement sur les murs)
function tryMoveEntity(
  e: any,
  dx: number,
  dy: number,
  map: Tile[][],
  enemies: Entity[],
  player: Entity
) {
  const nextX = e.position.x + dx;
  const nextY = e.position.y + dy;

  // 1. Essai direct (Diagonale)
  // AJOUT : on passe e.id pour ignorer l'auto-collision
  if (isValidMove(map, enemies, nextX, nextY, player, e.id)) {
    e.position.x = nextX;
    e.position.y = nextY;
    return;
  }

  // 2. Si bloqué, on essaie de glisser sur l'axe X uniquement
  if (
    Math.abs(dx) > 0.001 &&
    isValidMove(map, enemies, e.position.x + dx, e.position.y, player, e.id)
  ) {
    e.position.x += dx;
    return;
  }

  // 3. Sinon on essaie de glisser sur l'axe Y uniquement
  if (
    Math.abs(dy) > 0.001 &&
    isValidMove(map, enemies, e.position.x, e.position.y + dy, player, e.id)
  ) {
    e.position.y += dy;
    return;
  }

  // Si tout est bloqué, l'ennemi attend
}
