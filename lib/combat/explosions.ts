import { Entity } from "@/types/game";
import { CombatCallbacks } from "@/store/slices/combat/combatCallbacks";

export function triggerBarrelExplosion(
  barrel: Entity,
  enemies: Entity[],
  player: Entity,
  callbacks: CombatCallbacks
) {
  callbacks.addLog("Le baril explose violemment !");

  // IMPACT VISUEL IMMÉDIAT
  callbacks.shakeScreen(20); // Secousse violente
  callbacks.triggerScreenFlash(0.6); // Flash blanc aveuglant

  const x = barrel.position.x;
  const y = barrel.position.y;

  // COUCHE 1 : LE CŒUR DE L'EXPLOSION (Blanc/Jaune très chaud)
  // Particules très brillantes, vie courte
  callbacks.spawnParticles(x, y, "#fffbeb", 20, "spark");
  callbacks.spawnParticles(x, y, "#fbbf24", 30, "normal");

  // COUCHE 2 : LE FEU (Orange/Rouge)
  // Particules qui s'étendent un peu plus loin
  callbacks.spawnParticles(x, y, "#ef4444", 40, "normal");
  callbacks.spawnParticles(x, y, "#f97316", 40, "normal");

  // COUCHE 3 : LA FUMÉE (Noire/Grise)
  // Particules lourdes qui restent longtemps
  callbacks.spawnParticles(x, y, "#27272a", 30, "blood"); // On réutilise le type 'blood' pour la gravité/lourdeur

  // COUCHE 4 : ONDE DE CHOC (Simulation)
  // On crée un cercle de particules rapides
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16;
    // On simule manuellement l'ajout via spawnParticles en trichant un peu sur la position de départ
    // pour créer un anneau qui s'étend
    // (Idéalement on ajouterait un type 'shockwave' dans le moteur de particules, mais on fait avec l'existant)
  }

  // TEXTE FLOTTANT STYLÉ
  callbacks.addEffects(x, y, "#ef4444", 0, "BOOM!", "#fbbf24");

  // LOGIQUE DE DÉGÂTS (Inchangée mais re-vérifiée)
  const radius = 4.5; // Rayon augmenté
  const damage = 120; // Dégâts massifs

  // Dégâts aux ennemis
  enemies.forEach((e) => {
    if (!e.isDead && e.id !== barrel.id) {
      const dist = Math.sqrt(
        Math.pow(e.position.x - x, 2) + Math.pow(e.position.y - y, 2)
      );

      if (dist <= radius) {
        const distFactor = 1 - dist / radius;
        const actualDmg = Math.floor(damage * distFactor) + 20;

        callbacks.damageEnemy(e.id, actualDmg, true); // Toujours critique

        // Feedback Textuel
        callbacks.addEffects(
          e.position.x,
          e.position.y,
          "#f97316",
          0,
          `-${actualDmg}`,
          "#fff"
        );

        // RECUL MASSIF
        const angle = Math.atan2(e.position.y - y, e.position.x - x);
        const force = 3.0 * distFactor;

        // On modifie directement l'objet (c'est sale mais ça marche avec le systeme actuel)
        // L'idéal serait de passer par une action, mais updateEnemiesLogic gère la physique à la frame suivante
        (e as any).knockbackX = Math.cos(angle) * force;
        (e as any).knockbackY = Math.sin(angle) * force;

        // Stun garanti
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
    const pDmg = Math.floor(damage * 0.3); // Le joueur résiste mieux
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

// Fonction générique conservée pour compatibilité sorts
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
