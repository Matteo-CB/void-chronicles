export type CombatCallbacks = {
  addProjectile: (p: any) => void;
  triggerAttackAnim: (x: number, y: number, dir: string, type: string) => void;
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
  damageEnemy: (id: string, amount: number) => void;
  killEnemy: (id: string) => void;
  shakeScreen: (amount: number) => void;
  grantXp: (amount: number) => void;
  spawnParticles: (x: number, y: number, color: string, count: number) => void;
};
