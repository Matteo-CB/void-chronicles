import { Entity, Projectile, Tile } from "@/types/game";
import { CombatCallbacks } from "./types";
import { handleExplosion } from "./explosions";

export function updateProjectilesLogic(
  projectiles: Projectile[],
  map: Tile[][],
  enemies: Entity[],
  player: Entity,
  callbacks: CombatCallbacks
) {
  return projectiles
    .map((p) => {
      // --- 1. GUIDAGE (HOMING) ---
      // Si le projectile a la propriété homing, il cherche une cible
      if (p.homing && p.progress < 1) {
        let targetX = p.targetX;
        let targetY = p.targetY;

        if (p.isEnemy) {
          // Si c'est un tir ennemi, il vise le joueur
          targetX = player.position.x;
          targetY = player.position.y;
        } else {
          // Si c'est un tir du joueur, il cherche l'ennemi le plus proche
          let minDist = 100; // Distance max de recherche
          let bestTarget: Entity | null = null;

          enemies.forEach((e) => {
            if (!e.isDead && (e.isHostile || e.type === "barrel")) {
              const d = Math.sqrt(
                Math.pow(e.position.x - p.startX, 2) +
                  Math.pow(e.position.y - p.startY, 2)
              );
              // Recherche de la cible la plus pertinente
              if (d < minDist) {
                minDist = d;
                bestTarget = e;
              }
            }
          });

          if (bestTarget) {
            targetX = (bestTarget as Entity).position.x;
            targetY = (bestTarget as Entity).position.y;
          }
        }

        // Lissage de la trajectoire (Lerp) pour un virage fluide
        const homingStrength = p.homing || 0.1;
        p.targetX += (targetX - p.targetX) * homingStrength;
        p.targetY += (targetY - p.targetY) * homingStrength;
      }

      // --- 2. DÉPLACEMENT ---
      const speed = p.speed || 0.3;
      const dx = p.targetX - p.startX;
      const dy = p.targetY - p.startY;
      const distTotal = Math.sqrt(dx * dx + dy * dy) || 1; // Sécurité division par zéro
      const step = speed / distTotal;

      let progress = p.progress + step;

      // Calcul de la position actuelle exacte
      const currentX = p.startX + dx * progress;
      const currentY = p.startY + dy * progress;

      // --- 3. GESTION DE LA TRAÎNÉE (TRAIL) ---
      const newTrail = [...(p.trail || [])];
      if (newTrail.length > 5) newTrail.shift(); // On garde les 5 dernières positions max
      newTrail.push({ x: currentX, y: currentY });

      // --- 4. COLLISION AVEC LES MURS ---
      const cx = Math.round(currentX);
      const cy = Math.round(currentY);

      // Vérification bounds + type mur
      if (
        cy >= 0 &&
        cy < map.length &&
        cx >= 0 &&
        cx < map[0].length &&
        map[cy][cx]?.type === "wall"
      ) {
        // Impact mur : particules grises
        callbacks.spawnParticles(currentX, currentY, "#aaa", 5);

        if (p.explodeOnHit) {
          handleExplosion(currentX, currentY, p, enemies, player, callbacks);
        }
        return null; // Le projectile est détruit
      }

      let shouldDestroy = false;

      // --- 5. COLLISIONS AVEC LES ENTITÉS ---
      if (p.isEnemy) {
        // -- Cas 1 : Ennemi tire sur Joueur --
        const distToPlayer = Math.sqrt(
          Math.pow(currentX - player.position.x, 2) +
            Math.pow(currentY - player.position.y, 2)
        );

        // Hitbox du joueur (0.6 cases)
        if (distToPlayer < 0.6) {
          callbacks.damagePlayer(p.damage);
          callbacks.addEffects(
            player.position.x,
            player.position.y,
            "#ef4444",
            10,
            `-${p.damage}`
          );
          callbacks.shakeScreen(5);
          shouldDestroy = true;
        }
      } else {
        // -- Cas 2 : Joueur tire sur Ennemis/Barils --

        // Rayon de collision généreux pour faciliter la visée (0.8 cases)
        const HIT_RADIUS = 0.8;

        const hits = enemies.filter(
          (e) =>
            !e.isDead &&
            (e.isHostile || e.type === "barrel") &&
            Math.abs(e.position.x - currentX) < HIT_RADIUS &&
            Math.abs(e.position.y - currentY) < HIT_RADIUS
        );

        for (const hit of hits) {
          // Gestion du Piercing : on ne touche pas deux fois la même cible
          if (p.hitList && p.hitList.includes(hit.id)) continue;

          // Calcul des dégâts (Critique ?)
          let dmg = p.damage;
          const isCrit = p.critChance && Math.random() < p.critChance;
          if (isCrit) dmg *= p.critMult || 1.5;
          dmg = Math.floor(dmg);

          // Application des dégâts
          callbacks.damageEnemy(hit.id, dmg);

          // Effets visuels (Texte flottant)
          callbacks.addEffects(
            hit.position.x,
            hit.position.y,
            p.color,
            10,
            `-${dmg}`,
            isCrit ? "#fbbf24" : "#fff"
          );

          // Application du Recul (Knockback)
          if (hit.type !== "barrel") {
            const angle = Math.atan2(
              hit.position.y - currentY,
              hit.position.x - currentX
            );
            // On applique le vecteur de recul à l'entité
            (hit as any).knockbackX = Math.cos(angle) * (p.knockback || 0.2);
            (hit as any).knockbackY = Math.sin(angle) * (p.knockback || 0.2);
          }

          // Gestion Piercing / Destruction
          if (!p.piercing) {
            shouldDestroy = true;
            if (p.explodeOnHit) {
              handleExplosion(
                currentX,
                currentY,
                p,
                enemies,
                player,
                callbacks
              );
            }
            break; // Stoppe la boucle si pas de piercing (1 seul ennemi touché)
          } else {
            // Si piercing activé, on décrémente et on note la cible touchée
            p.piercing--;
            if (!p.hitList) p.hitList = [];
            p.hitList.push(hit.id);

            if (p.piercing <= 0) shouldDestroy = true;
          }
        }
      }

      if (shouldDestroy) return null;

      // Fin de portée ou arrivée à destination (progress >= 1)
      if (progress >= 1) {
        if (p.explodeOnHit) {
          handleExplosion(currentX, currentY, p, enemies, player, callbacks);
        }
        return null;
      }

      // Retourne le projectile mis à jour pour la prochaine frame
      return { ...p, progress, trail: newTrail };
    })
    .filter(Boolean) as Projectile[];
}
