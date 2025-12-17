import { Tile, Position } from "@/types/game";

// On garde une bonne portée pour ne pas se sentir enfermé
const VIEW_RADIUS = 11.0;

/**
 * Calcule le FOV avec une atténuation douce pour un rendu "agréable".
 */
export function calculateFOV(map: Tile[][], playerPos: Position): Tile[][] {
  const h = map.length;
  const w = map[0].length;

  // 1. Reset : On garde la mémoire de l'exploration
  const newMap: Tile[][] = map.map((row) =>
    row.map((tile) => ({
      ...tile,
      visibility: tile.visibility === "visible" ? "fog" : tile.visibility,
      // On reset la lumière active, mais on garde une "ambiance" de base pour le fog
      lightLevel: 0,
    }))
  );

  const precision = 360; // Bonne précision
  const stepSize = 0.3; // Optimisation légère

  for (let i = 0; i < precision; i++) {
    const angle = (i / precision) * 2 * Math.PI;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    for (let r = 0; r <= VIEW_RADIUS; r += stepSize) {
      const x = Math.round(playerPos.x + cos * r);
      const y = Math.round(playerPos.y + sin * r);

      if (x < 0 || x >= w || y < 0 || y >= h) break;

      const tile = newMap[y][x];
      const dist = Math.sqrt(
        Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2)
      );

      // COURBE DE LUMIÈRE "DOUCE" (Linear Ease-Out)
      // 1.0 proche du joueur, descend doucement vers 0
      // C'est beaucoup moins agressif que la courbe quadratique précédente
      let light = 1.0 - dist / VIEW_RADIUS;

      // On booste un peu les tons moyens pour y voir clair
      light = light * 1.2;

      light = Math.max(0, Math.min(1, light));

      // Mise à jour de la tuile
      if (light > (tile.lightLevel || 0) || tile.visibility !== "visible") {
        newMap[y][x] = {
          ...tile,
          visibility: "visible",
          lightLevel: light,
        };
      }

      if (tile.type === "wall") {
        // On éclaire le mur, mais on ne voit pas derrière
        break;
      }
    }
  }

  // Joueur toujours éclairé
  const px = Math.round(playerPos.x);
  const py = Math.round(playerPos.y);
  if (px >= 0 && px < w && py >= 0 && py < h) {
    newMap[py][px] = {
      ...newMap[py][px],
      visibility: "visible",
      lightLevel: 1.0,
    };
  }

  return newMap;
}
