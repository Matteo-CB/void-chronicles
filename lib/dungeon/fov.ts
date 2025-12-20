import { Tile } from "@/types/game";

// AUGMENTATION DU RAYON DE VISION (8 -> 12)
const RADIUS = 12;

export function calculateFOV(
  map: Tile[][],
  position: { x: number; y: number }
): Tile[][] {
  const newMap = map.map((row) =>
    row.map((tile) => ({
      ...tile,
      // Si la tuile était visible, elle devient "fog" (brouillard de guerre / exploré).
      // Sinon elle reste dans son état précédent (hidden ou fog).
      visibility:
        tile.visibility === "visible" ? "fog" : tile.visibility || "hidden",
    }))
  );

  const startX = Math.round(position.x);
  const startY = Math.round(position.y);

  // Algorithme de FOV : Raycasting simple mais efficace pour les roguelikes
  for (let i = 0; i < 360; i += 0.5) {
    // Pas angulaire plus fin (0.5) pour éviter les trous à longue distance
    const rad = (i * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    let x = startX + 0.5;
    let y = startY + 0.5;

    for (let j = 0; j < RADIUS; j++) {
      const tx = Math.floor(x);
      const ty = Math.floor(y);

      if (ty < 0 || ty >= newMap.length || tx < 0 || tx >= newMap[0].length) {
        break;
      }

      // Marquer comme visible
      // On force le cast ici pour satisfaire le compilateur si le type Tile est strict
      (newMap[ty][tx] as any).visibility = "visible";

      // Calcul de la lumière basé sur la distance (dégradé)
      // 1.0 au centre, 0.4 à la limite du rayon
      const dist = Math.sqrt((tx - startX) ** 2 + (ty - startY) ** 2);
      const intensity = Math.max(0.4, 1 - dist / (RADIUS + 2));
      newMap[ty][tx].lightLevel = intensity;

      // Vérification du type pour bloquer la lumière.
      // On utilise 'as any' pour vérifier 'door' même si le type ne l'autorise pas explicitement
      const tileType = (newMap[ty][tx] as any).type;
      if (tileType === "wall" || tileType === "door") {
        break; // La lumière s'arrête aux murs
      }

      x += dx;
      y += dy;
    }
  }

  // Assurer que la case du joueur est toujours visible
  if (
    startY >= 0 &&
    startY < newMap.length &&
    startX >= 0 &&
    startX < newMap[0].length
  ) {
    (newMap[startY][startX] as any).visibility = "visible";
    newMap[startY][startX].lightLevel = 1.0;
  }

  return newMap;
}
