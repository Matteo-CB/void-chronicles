import { Entity, Item, Stats } from "@/types/game";
import { createEnemy } from "@/lib/data/enemies";
import { Room } from "./types";
import { POTION_ITEM } from "@/lib/data/items"; // Import Potion

function createDecoration(
  id: string,
  type: string,
  name: string,
  spriteKey: string,
  x: number,
  y: number
): Entity {
  return {
    id,
    type,
    name,
    spriteKey,
    position: { x, y },
    stats: { hp: 10, maxHp: 10, defense: 0, xpValue: 0 } as Stats,
    isHostile: false,
    visualScale: 1,
    knockbackX: 0,
    knockbackY: 0,
  };
}

export function spawnEntitiesInRoom(
  room: Room,
  level: number,
  entities: Entity[],
  config: any
) {
  const enemyCount = Math.floor((room.w * room.h) / 12) + 1;

  for (let k = 0; k < enemyCount; k++) {
    const ex = room.x + Math.floor(Math.random() * room.w);
    const ey = room.y + Math.floor(Math.random() * room.h);

    let type = "RAT";
    const roll = Math.random();

    if (level > 2) {
      if (roll > 0.7) type = "GOBLIN";
      else if (roll > 0.4) type = "BAT";
    }
    if (level > 4) {
      if (roll > 0.8) type = "SKELETON";
      else if (roll > 0.6) type = "ARCHER";
    }
    if (level > 7) {
      if (roll > 0.85) type = "SORCERER";
      else if (roll > 0.6) type = "SLIME";
    }
    if (level > 12) {
      if (roll > 0.9) type = "GOLEM";
    }

    const enemy = createEnemy(type, { x: ex, y: ey }, level);
    enemy.stats.hp = Math.floor(enemy.stats.hp * (0.9 + Math.random() * 0.2));
    entities.push(enemy);
  }

  // --- SPAWN POTION RARE (NOUVEAU) ---
  // 5% de chance par salle d'avoir une potion au sol
  if (Math.random() < 0.05) {
    const px = room.x + Math.floor(Math.random() * room.w);
    const py = room.y + Math.floor(Math.random() * room.h);
    if (!entities.some((e) => e.position.x === px && e.position.y === py)) {
      entities.push({
        id: `ground_pot_${Math.random()}`,
        type: "potion", // Type important pour le ramassage
        name: "Potion Oubliée",
        spriteKey: "POTION",
        position: { x: px, y: py },
        stats: { hp: 1, maxHp: 1 } as Stats, // Stats dummy pour l'entité au sol
        isHostile: false,
        visualScale: 0.8,
        value: 0, // Pas de valeur monétaire, juste du soin
      });
    }
  }
}

export function spawnDecorations(
  rooms: Room[],
  entities: Entity[],
  config: any
) {
  rooms.forEach((room) => {
    if (Math.random() < 0.2) {
      const dx = room.x + Math.floor(Math.random() * room.w);
      const dy = room.y + Math.floor(Math.random() * room.h);

      if (!entities.some((e) => e.position.x === dx && e.position.y === dy)) {
        const typeRoll = Math.random();
        let decorType = "rubble";
        let sprite = "RUBBLE";
        let name = "Débris";

        if (typeRoll > 0.7) {
          decorType = "barrel";
          sprite = "BARREL";
          name = "Tonneau";
        } else if (typeRoll > 0.9) {
          decorType = "statue";
          sprite = "STATUE";
          name = "Statue";
        }

        const decor = createDecoration(
          `decor_${Math.random()}`,
          decorType,
          name,
          sprite,
          dx,
          dy
        );

        if (decorType === "barrel") {
          decor.stats.hp = 15;
          decor.stats.maxHp = 15;
        }

        entities.push(decor);
      }
    }
  });
}

export function ensureMinimumEnemies(
  entities: Entity[],
  rooms: Room[],
  level: number,
  config: any
) {
  const minEnemies = 3 + Math.floor(level / 2);
  const hostileCount = entities.filter((e) => e.isHostile).length;

  if (hostileCount < minEnemies && rooms.length > 1) {
    const room = rooms[rooms.length - 1];
    const missing = minEnemies - hostileCount;

    for (let i = 0; i < missing; i++) {
      const x = room.x + Math.floor(Math.random() * room.w);
      const y = room.y + Math.floor(Math.random() * room.h);
      entities.push(createEnemy("SKELETON", { x, y }, level));
    }
  }
}

export function spawnBossInArena(
  level: number,
  width: number,
  height: number,
  entities: Entity[]
) {
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  let bossKey = "GOBLIN";
  if (level === 5) bossKey = "GOBLIN";
  else if (level === 10) bossKey = "SORCERER";
  else if (level === 15) bossKey = "SKELETON";
  else bossKey = "SLIME";

  const boss = createEnemy(bossKey, { x: centerX, y: centerY }, level + 5);

  boss.name = `BOSS DU NIVEAU ${level}`;
  boss.visualScale = 2.0;
  boss.stats.hp *= 8;
  boss.stats.maxHp *= 8;
  boss.stats.attack = Math.floor(boss.stats.attack * 1.5);
  boss.aiBehavior = "boss";
  boss.id = "boss_main";
  boss.stats.willpower = 999;

  entities.push(boss);

  const guardsCount = 2 + Math.floor(level / 5);
  for (let i = 0; i < guardsCount; i++) {
    const angle = (Math.PI * 2 * i) / guardsCount;
    const gx = centerX + Math.cos(angle) * 4;
    const gy = centerY + Math.sin(angle) * 4;

    const guard = createEnemy(
      level > 5 ? "SKELETON" : "RAT",
      { x: gx, y: gy },
      level
    );
    guard.aiBehavior = "chaser";
    entities.push(guard);
  }
}
