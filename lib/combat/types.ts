import { Projectile } from "@/types/game";

export type CombatCallbacks = {
  addProjectile: (p: Projectile) => void;
  triggerAttackAnim: (x: number, y: number, dir: string, type: string) => void;

  // Nouveaux callbacks indispensables pour le "Game Juice"
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
  damagePlayer: (amount: number) => void;

  // Signature mise à jour avec isCrit
  damageEnemy: (id: string, amount: number, isCrit?: boolean) => void;

  killEnemy: (id: string) => void;
  shakeScreen: (amount: number) => void;
  grantXp: (amount: number) => void;

  // Signature mise à jour avec le type de particule "debris" ajouté
  spawnParticles: (
    x: number,
    y: number,
    color: string,
    count: number,
    type?: "blood" | "spark" | "normal" | "debris"
  ) => void;
};
