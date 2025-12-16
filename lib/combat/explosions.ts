import { Entity } from "@/types/game";
import { CombatCallbacks } from "./types";

export function triggerBarrelExplosion(
  barrel: Entity,
  enemies: Entity[],
  player: Entity,
  callbacks: CombatCallbacks
) {
  callbacks.addLog("Le baril explose violemment !");

  // Shake réduit mais toujours présent pour l'impact
  callbacks.shakeScreen(15);

  // FX 1 : Le cœur de l'explosion (Feu intense)
  callbacks.spawnParticles(barrel.position.x, barrel.position.y, "#f97316", 50);

  // FX 2 : La fumée noire autour
  callbacks.spawnParticles(barrel.position.x, barrel.position.y, "#27272a", 30);

  // FX 3 : Onde de choc visuelle (Texte vide avec effet visuel si implémenté, ou juste + de particules)
  // On utilise addEffects avec un texte spécial pour déclencher des effets visuels custom dans GameView
  callbacks.addEffects(
    barrel.position.x,
    barrel.position.y,
    "#ef4444",
    0,
    "BOOM!",
    "#fbbf24"
  );

  // Rayon d'explosion augmenté
  const radius = 4.0;
  const damage = 80; // Dégâts massifs

  // Dégâts aux ennemis
  enemies.forEach((e) => {
    if (!e.isDead && e.id !== barrel.id) {
      const dist = Math.sqrt(
        Math.pow(e.position.x - barrel.position.x, 2) +
          Math.pow(e.position.y - barrel.position.y, 2)
      );

      if (dist <= radius) {
        // Dégâts dégressifs selon la distance
        const distFactor = 1 - dist / radius;
        const actualDmg = Math.floor(damage * distFactor) + 10;

        callbacks.damageEnemy(e.id, actualDmg);

        // Texte flottant critique
        callbacks.addEffects(
          e.position.x,
          e.position.y,
          "#f97316",
          5,
          `-${actualDmg} CRIT!`
        );

        // RECUL MASSIF (Knockback)
        const angle = Math.atan2(
          e.position.y - barrel.position.y,
          e.position.x - barrel.position.x
        );
        const force = 2.0 * distFactor; // Très fort si proche
        (e as any).knockbackX = Math.cos(angle) * force;
        (e as any).knockbackY = Math.sin(angle) * force;
      }
    }
  });

  // Dégâts au joueur (réduits de 50%)
  const distPlayer = Math.sqrt(
    Math.pow(player.position.x - barrel.position.x, 2) +
      Math.pow(player.position.y - barrel.position.y, 2)
  );
  if (distPlayer <= radius) {
    const pDmg = Math.floor(damage * 0.4);
    callbacks.damagePlayer(pDmg);
    callbacks.addEffects(
      player.position.x,
      player.position.y,
      "#ef4444",
      10,
      `-${pDmg}`
    );
  }
}

export function handleExplosion(
  x: number,
  y: number,
  p: any,
  enemies: any[],
  player: any,
  callbacks: CombatCallbacks
) {
  const radius = p.radius || 3.0;
  const dmg = p.damage || 30;

  callbacks.addLog("Impact magique !");
  callbacks.shakeScreen(8);

  // Effet visuel
  callbacks.spawnParticles(x, y, p.color || "#f97316", 25);
  callbacks.addEffects(x, y, p.color, 0, "BANG!");

  enemies.forEach((e) => {
    if (!e.isDead && e.isHostile) {
      const dist = Math.sqrt(
        Math.pow(e.position.x - x, 2) + Math.pow(e.position.y - y, 2)
      );
      if (dist <= radius) {
        callbacks.damageEnemy(e.id, dmg);
        callbacks.addEffects(
          e.position.x,
          e.position.y,
          p.color,
          8,
          `-${dmg}`,
          "#fff"
        );

        // Recul modéré
        const angle = Math.atan2(e.position.y - y, e.position.x - x);
        (e as any).knockbackX = Math.cos(angle) * 0.8;
        (e as any).knockbackY = Math.sin(angle) * 0.8;
      }
    }
  });
}
