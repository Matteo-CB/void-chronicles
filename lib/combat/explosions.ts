import { Entity } from "@/types/game";
// CHANGEMENT ICI : On utilise le type local pour éviter les dépendances circulaires
import { CombatCallbacks } from "./types";

export function triggerBarrelExplosion(
  barrel: Entity,
  enemies: Entity[],
  player: Entity,
  callbacks: CombatCallbacks
) {
  callbacks.addLog("Le baril explose violemment !");

  // IMPACT VISUEL IMMÉDIAT
  callbacks.shakeScreen(20);
  callbacks.triggerScreenFlash(0.6);

  const x = barrel.position.x;
  const y = barrel.position.y;

  // COUCHE 1 : CŒUR (Blanc/Jaune)
  callbacks.spawnParticles(x, y, "#fffbeb", 20, "spark");
  callbacks.spawnParticles(x, y, "#fbbf24", 30, "normal");

  // COUCHE 2 : FEU (Orange/Rouge)
  callbacks.spawnParticles(x, y, "#ef4444", 40, "normal");
  callbacks.spawnParticles(x, y, "#f97316", 40, "normal");

  // COUCHE 3 : FUMÉE (Utilisation de "blood" pour la gravité/lourdeur)
  callbacks.spawnParticles(x, y, "#27272a", 30, "blood");

  // Onde de choc (simulation visuelle)
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16;
    // On pourrait ajouter des particules directionnelles ici
  }

  callbacks.addEffects(x, y, "#ef4444", 0, "BOOM!", "#fbbf24");

  const radius = 4.5;
  const damage = 120;

  // Dégâts ennemis
  enemies.forEach((e) => {
    if (!e.isDead && e.id !== barrel.id) {
      const dist = Math.sqrt(
        Math.pow(e.position.x - x, 2) + Math.pow(e.position.y - y, 2)
      );

      if (dist <= radius) {
        const distFactor = 1 - dist / radius;
        const actualDmg = Math.floor(damage * distFactor) + 20;

        callbacks.damageEnemy(e.id, actualDmg, true); // Toujours critique

        callbacks.addEffects(
          e.position.x,
          e.position.y,
          "#f97316",
          0,
          `-${actualDmg}`,
          "#fff"
        );

        // Recul
        const angle = Math.atan2(e.position.y - y, e.position.x - x);
        const force = 3.0 * distFactor;

        // Modification directe pour la physique immédiate
        (e as any).knockbackX = Math.cos(angle) * force;
        (e as any).knockbackY = Math.sin(angle) * force;

        if (!(e as any).statusEffects) (e as any).statusEffects = [];
        (e as any).statusEffects.push("stun");
      }
    }
  });

  // Dégâts Joueur
  const distPlayer = Math.sqrt(
    Math.pow(player.position.x - x, 2) + Math.pow(player.position.y - y, 2)
  );
  if (distPlayer <= radius) {
    const pDmg = Math.floor(damage * 0.3);
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

  callbacks.shakeScreen(8);
  callbacks.spawnParticles(x, y, p.color || "#f97316", 25, "spark");
  callbacks.addEffects(x, y, p.color, 0, "BANG!");

  enemies.forEach((e) => {
    if (!e.isDead && e.isHostile) {
      const dist = Math.sqrt(
        Math.pow(e.position.x - x, 2) + Math.pow(e.position.y - y, 2)
      );
      if (dist <= radius) {
        callbacks.damageEnemy(e.id, dmg);
        const angle = Math.atan2(e.position.y - y, e.position.x - x);
        (e as any).knockbackX = Math.cos(angle) * 1.5;
        (e as any).knockbackY = Math.sin(angle) * 1.5;
      }
    }
  });
}
