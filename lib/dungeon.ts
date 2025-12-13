import { Tile, Position, Entity } from "@/types/game";
import { createEnemy } from "./data/enemies";
import { generateLoot } from "./data/items";
import { LEVELS } from "./data/levels";

function isChokePoint(map: Tile[][], x: number, y: number): boolean {
  if (y <= 0 || y >= map.length - 1 || x <= 0 || x >= map[0].length - 1)
    return true;
  const n = map[y - 1][x].type === "wall";
  const s = map[y + 1][x].type === "wall";
  const w = map[y][x - 1].type === "wall";
  const e = map[y][x + 1].type === "wall";
  return (n && s) || (w && e);
}

export function generateDungeon(level: number): {
  map: Tile[][];
  spawn: Position;
  entities: Entity[];
  levelConfig: any;
} {
  const config = LEVELS[Math.min(level - 1, 99)];
  const WIDTH = Math.max(40, config.width);
  const HEIGHT = Math.max(30, config.height);

  let map: Tile[][] = Array(HEIGHT)
    .fill(null)
    .map((_, y) =>
      Array(WIDTH)
        .fill(null)
        .map((_, x) => ({
          x,
          y,
          type: Math.random() < 0.45 ? "wall" : "floor",
          variant: 0,
        }))
    );

  for (let i = 0; i < 4; i++) map = applyCellularAutomata(map, WIDTH, HEIGHT);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
        map[y][x].type = "wall";
      }
    }
  }

  map = keepLargestComponent(map, WIDTH, HEIGHT);

  const floors: Position[] = [];
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      if (map[y][x].type === "floor") floors.push({ x, y });
    }
  }

  if (floors.length < 50) return generateDungeon(level);

  floors.sort(() => Math.random() - 0.5);

  const spawn = floors.pop()!;
  const entities: Entity[] = [];

  const getValidSpawn = (avoidChokePoints: boolean): Position | null => {
    if (!floors.length) return null;

    if (avoidChokePoints) {
      for (let i = floors.length - 1; i >= 0; i--) {
        const pos = floors[i];
        if (!isChokePoint(map, pos.x, pos.y)) {
          floors.splice(i, 1);
          return pos;
        }
      }
    }
    return floors.pop() || null;
  };

  const addEntity = (
    type: any,
    name: string,
    sprite: string,
    hostile: boolean,
    stats: any,
    extra: any = {},
    isBlocking: boolean = false
  ) => {
    const pos = getValidSpawn(isBlocking);
    if (!pos) return;
    entities.push({
      id: `${type}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name,
      position: pos,
      direction: "down",
      stats,
      spriteKey: sprite,
      isHostile: hostile,
      ...extra,
    });
  };

  if (config.boss) {
    const bossPos = getValidSpawn(false);
    if (bossPos)
      entities.push(
        createEnemy(config.boss.spriteBase, bossPos, level, config.boss)
      );
  }

  const mobCount = Math.floor(floors.length * 0.05 * config.mobDensity) + 5;
  for (let i = 0; i < mobCount; i++) {
    const mobKey = config.mobs[Math.floor(Math.random() * config.mobs.length)];
    const pos = getValidSpawn(false);
    if (mobKey && pos) entities.push(createEnemy(mobKey, pos, level));
  }

  if (Math.random() > 0.4) {
    addEntity(
      "shrine",
      "Autel de Puissance",
      "PILLAR",
      false,
      {
        hp: 1,
        maxHp: 1,
        mana: 0,
        maxMana: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        xpValue: 0,
      },
      {},
      true
    );
  }

  if (!config.boss && Math.random() < 0.25) {
    const shopItems = Array.from({ length: 5 }).map(() => {
      const item = generateLoot(level + 1);
      return { ...item, value: item.value * 5 };
    });
    addEntity(
      "merchant",
      "Marchand",
      "MERCHANT",
      false,
      {
        hp: 999,
        maxHp: 999,
        mana: 0,
        maxMana: 0,
        attack: 0,
        defense: 999,
        speed: 0,
        xpValue: 0,
      },
      { shopInventory: shopItems },
      true
    );
  }

  const chestCount = 3 + Math.floor(level / 3);
  for (let i = 0; i < chestCount; i++) {
    addEntity(
      "chest",
      "Coffre",
      "CHEST",
      false,
      {
        hp: 1,
        maxHp: 1,
        mana: 0,
        maxMana: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        xpValue: 0,
      },
      { isOpen: false },
      true
    );
  }

  const decorCount = Math.floor(floors.length * 0.08);
  for (let i = 0; i < decorCount; i++) {
    const decors = ["ROCK", "ROCK", "MUSHROOM", "HERB"];
    const decorKey = decors[Math.floor(Math.random() * decors.length)];
    addEntity(
      "decoration",
      "Décor",
      decorKey,
      false,
      {
        hp: 1,
        maxHp: 1,
        mana: 0,
        maxMana: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        xpValue: 0,
      },
      {},
      true
    );
  }

  const goldCount = Math.floor(floors.length * 0.08);
  for (let i = 0; i < goldCount; i++) {
    const val = Math.floor(Math.random() * 10 * level) + 5;
    addEntity(
      "gold",
      "Or",
      "GOLD",
      false,
      {
        hp: 1,
        maxHp: 1,
        mana: 0,
        maxMana: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        xpValue: 0,
      },
      { value: val },
      false
    );
  }

  const potionCount = Math.max(2, Math.floor(level / 3));
  for (let i = 0; i < potionCount; i++) {
    addEntity(
      "potion",
      "Potion",
      "POTION",
      false,
      {
        hp: 1,
        maxHp: 1,
        mana: 0,
        maxMana: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        xpValue: 0,
      },
      {},
      false
    );
  }

  const stairPos = getValidSpawn(true);
  if (stairPos) {
    entities.push({
      id: "stairs",
      type: "stairs",
      name: "Sortie",
      position: stairPos,
      direction: "down",
      stats: {
        hp: 999,
        maxHp: 999,
        mana: 0,
        maxMana: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        xpValue: 0,
      },
      spriteKey: "STAIRS",
      isHostile: false,
      isHidden: true,
    });
  }

  return { map, spawn, entities, levelConfig: config };
}

function applyCellularAutomata(
  map: Tile[][],
  width: number,
  height: number
): Tile[][] {
  const newMap = map.map((row) => row.map((t) => ({ ...t })));
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if (dx || dy) if (map[y + dy][x + dx].type === "wall") neighbors++;
      if (neighbors > 4) newMap[y][x].type = "wall";
      else if (neighbors < 4) newMap[y][x].type = "floor";
    }
  }
  return newMap;
}

function keepLargestComponent(
  map: Tile[][],
  width: number,
  height: number
): Tile[][] {
  const visited = new Set<string>();
  const regions: Position[][] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map[y][x].type === "floor" && !visited.has(`${x},${y}`)) {
        const region: Position[] = [];
        const queue: Position[] = [{ x, y }];
        visited.add(`${x},${y}`);
        while (queue.length > 0) {
          const curr = queue.pop()!;
          region.push(curr);
          [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
          ].forEach(([dx, dy]) => {
            const nx = curr.x + dx,
              ny = curr.y + dy;
            if (
              nx >= 0 &&
              nx < width &&
              ny >= 0 &&
              ny < height &&
              map[ny][nx].type === "floor" &&
              !visited.has(`${nx},${ny}`)
            ) {
              visited.add(`${nx},${ny}`);
              queue.push({ x: nx, y: ny });
            }
          });
        }
        regions.push(region);
      }
    }
  }
  if (regions.length === 0) return map;
  regions.sort((a, b) => b.length - a.length);
  const largest = regions[0];
  const valid = new Set(largest.map((p) => `${p.x},${p.y}`));
  const newMap = map.map((row) => row.map((t) => ({ ...t })));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (newMap[y][x].type === "floor" && !valid.has(`${x},${y}`)) {
        newMap[y][x].type = "wall";
      }
    }
  }
  return newMap;
}
