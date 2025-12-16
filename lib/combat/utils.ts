export function isValidMove(
  map: any,
  enemies: any,
  x: number,
  y: number,
  player: any,
  ignoreId?: string // NOUVEAU : ID à ignorer (l'entité qui bouge)
) {
  // 1. Limites de la carte
  if (x < 0 || y < 0 || y >= map.length || x >= map[0].length) return false;

  // 2. Murs
  if (map[Math.round(y)]?.[Math.round(x)]?.type === "wall") return false;

  // 3. Autres Ennemis (sauf soi-même)
  if (
    enemies.some(
      (e: any) =>
        e.id !== ignoreId && // CRITIQUE : On ne se bloque pas soi-même
        !e.isDead &&
        e.type !== "rubble" &&
        Math.round(e.position.x) === Math.round(x) &&
        Math.round(e.position.y) === Math.round(y)
    )
  )
    return false;

  // 4. Joueur
  if (
    Math.round(player.position.x) === Math.round(x) &&
    Math.round(player.position.y) === Math.round(y)
  )
    return false;

  return true;
}

export function checkLineOfSight(
  map: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  let x = x1,
    y = y1;
  const dx = Math.abs(x2 - x1),
    dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1,
    sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  let i = 0;
  while (i < 60) {
    if (Math.abs(x - x2) < 0.5 && Math.abs(y - y2) < 0.5) return true;
    if (map[Math.round(y)]?.[Math.round(x)]?.type === "wall") return false;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
    i++;
  }
  return false;
}
