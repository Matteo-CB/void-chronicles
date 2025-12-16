import { Entity, Stats } from "@/types/game";
import { ENEMY_DB } from "../data/enemies";
import { DECORATION_DB, createDecoration } from "../data/decorations";
import { Room } from "./types";

// Fonction pour créer un ennemi avec des stats ajustées au niveau
export const createScaledEnemy = (
  key: string,
  x: number,
  y: number,
  level: number
): Entity => {
  const template = ENEMY_DB[key] || ENEMY_DB["RAT"];

  // CORRECTION TYPE : On force le typage car on sait que la DB est valide
  if (!template || !template.stats) {
    throw new Error(`Template manquant pour ${key}`);
  }
  const baseStats = template.stats as Stats;

  const scaleMult = Math.pow(1.08, level - 1);
  const dmgMult = Math.pow(1.05, level - 1);

  return {
    ...template,
    id: `${key}-${x}-${y}-${Math.random()}`,
    position: { x, y },
    stats: {
      ...baseStats,
      maxHp: Math.floor(baseStats.maxHp * scaleMult),
      hp: Math.floor(baseStats.maxHp * scaleMult),
      attack: Math.floor(baseStats.attack * dmgMult),
      xpValue: Math.floor(baseStats.xpValue * scaleMult),
    },
    // Propriétés par défaut pour satisfaire Entity
    type: "enemy",
    isHostile: true,
    name: template.name || "Ennemi",
    spriteKey: template.spriteKey || "RAT",
    visualScale: template.visualScale || 1,
  } as Entity;
};

export function spawnEntitiesInRoom(
  room: Room,
  level: number,
  entities: Entity[],
  config: any
) {
  const roomArea = room.w * room.h;
  const targetCount = Math.floor(roomArea * config.mobDensity);

  for (let i = 0; i < targetCount; i++) {
    const x = room.x + Math.floor(Math.random() * room.w);
    const y = room.y + Math.floor(Math.random() * room.h);

    const isOccupied = entities.some(
      (e) => e.position.x === x && e.position.y === y
    );

    if (!isOccupied) {
      const mobKey =
        config.mobs[Math.floor(Math.random() * config.mobs.length)];
      entities.push(createScaledEnemy(mobKey, x, y, level));
    }
  }
}

// --- DÉCORS ---
export function spawnDecorations(
  rooms: Room[],
  entities: Entity[],
  config: any
) {
  if (!config.decorations || config.decorations.length === 0) return;

  rooms.forEach((room) => {
    const decorCount = Math.floor(room.w * room.h * 0.05); // 5% de chance

    for (let i = 0; i < decorCount; i++) {
      const x = room.x + Math.floor(Math.random() * room.w);
      const y = room.y + Math.floor(Math.random() * room.h);

      const isOccupied = entities.some(
        (e) => e.position.x === x && e.position.y === y
      );

      if (!isOccupied) {
        const decorKey =
          config.decorations[
            Math.floor(Math.random() * config.decorations.length)
          ];
        if (DECORATION_DB && DECORATION_DB[decorKey]) {
          entities.push(createDecoration(decorKey, x, y));
        }
      }
    }
  });
}

// --- SÉCURITÉ ---
export function ensureMinimumEnemies(
  entities: Entity[],
  rooms: Room[],
  level: number,
  config: any
) {
  const enemyCount = entities.filter(
    (e) =>
      e.type !== "chest" &&
      e.type !== "merchant" &&
      e.type !== "stairs" &&
      e.type !== "rubble"
  ).length;

  if (enemyCount < 2) {
    let targetRooms = rooms;
    if (rooms.length > 1) targetRooms = rooms.slice(1);

    for (let i = 0; i < 2; i++) {
      const room = targetRooms[Math.floor(Math.random() * targetRooms.length)];
      const x = room.x + Math.floor(room.w / 2);
      const y = room.y + Math.floor(room.h / 2);
      const mobKey = config.mobs[0] || "RAT";
      entities.push(createScaledEnemy(mobKey, x, y, level));
    }
  }
}
