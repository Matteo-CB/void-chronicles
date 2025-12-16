import { Tile, Entity, Stats } from "@/types/game";
import { LEVELS } from "../data/levels";
import { Room, MAX_ROOMS, ROOM_MIN_SIZE, ROOM_MAX_SIZE } from "./types";
import {
  spawnEntitiesInRoom,
  ensureMinimumEnemies,
  spawnDecorations,
} from "./spawner";

const STAIRS_STATS: Stats = {
  hp: 1000,
  maxHp: 1000,
  mana: 0,
  maxMana: 0,
  attack: 0,
  defense: 0,
  speed: 0,
  xpValue: 0,
  critChance: 0,
  critDamage: 0,
  dodgeChance: 0,
  lifesteal: 0,
  armorPen: 0,
  cooldownReduction: 0,
  spellPower: 0,
  strength: 0,
  endurance: 0,
  agility: 0,
  wisdom: 0,
  willpower: 0,
  luck: 0,
  accuracy: 0,
  arcane: 0,
};

export function generateDungeon(level: number): {
  map: Tile[][];
  spawn: { x: number; y: number };
  entities: Entity[];
  levelConfig: any;
} {
  const config = LEVELS[Math.min(LEVELS.length - 1, Math.max(0, level - 1))];
  const width = config.width;
  const height = config.height;

  const map: Tile[][] = Array(height)
    .fill(null)
    .map((_, y) =>
      Array(width)
        .fill(null)
        .map((_, x) => ({ x, y, type: "wall", visibility: "hidden" }))
    );

  const rooms: Room[] = [];
  const entities: Entity[] = [];

  for (let i = 0; i < MAX_ROOMS; i++) {
    const w =
      Math.floor(Math.random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE + 1)) +
      ROOM_MIN_SIZE;
    const h =
      Math.floor(Math.random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE + 1)) +
      ROOM_MIN_SIZE;
    const x = Math.floor(Math.random() * (width - w - 2)) + 1;
    const y = Math.floor(Math.random() * (height - h - 2)) + 1;

    const newRoom: Room = { x, y, w, h };
    let failed = false;

    for (const other of rooms) {
      if (
        newRoom.x <= other.x + other.w + 1 &&
        newRoom.x + newRoom.w >= other.x - 1 &&
        newRoom.y <= other.y + other.h + 1 &&
        newRoom.y + newRoom.h >= other.y - 1
      ) {
        failed = true;
        break;
      }
    }

    if (!failed) {
      createRoom(map, newRoom);
      if (rooms.length > 0) {
        connectRooms(map, rooms[rooms.length - 1], newRoom);
      }
      rooms.push(newRoom);

      // Spawn Monstres (sauf salle 1)
      if (rooms.length > 1) {
        spawnEntitiesInRoom(newRoom, level, entities, config);
      }
    }
  }

  // 1. DÉCORS
  spawnDecorations(rooms, entities, config);

  // 2. SÉCURITÉ MONSTRES
  ensureMinimumEnemies(entities, rooms, level, config);

  const spawnRoom = rooms[0];
  const spawn = {
    x: spawnRoom.x + Math.floor(spawnRoom.w / 2),
    y: spawnRoom.y + Math.floor(spawnRoom.h / 2),
  };

  // 3. ESCALIER (CACHÉ)
  if (rooms.length > 0) {
    const exitRoom = rooms[rooms.length - 1];
    entities.push({
      id: "stairs_exit",
      type: "stairs",
      name: "Sortie",
      spriteKey: "STAIRS",
      position: {
        x: exitRoom.x + Math.floor(exitRoom.w / 2),
        y: exitRoom.y + Math.floor(exitRoom.h / 2),
      },
      stats: STAIRS_STATS,
      isHostile: false,
      visualScale: 1,
      isHidden: true, // IMPORTANT : Caché par défaut
    });
  }

  return { map, spawn, entities, levelConfig: config };
}

export function createRoom(map: Tile[][], room: Room) {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      map[y][x].type = "floor";
    }
  }
}

export function connectRooms(map: Tile[][], r1: Room, r2: Room) {
  let cx1 = Math.floor(r1.x + r1.w / 2);
  let cy1 = Math.floor(r1.y + r1.h / 2);
  let cx2 = Math.floor(r2.x + r2.w / 2);
  let cy2 = Math.floor(r2.y + r2.h / 2);

  while (cx1 !== cx2) {
    map[cy1][cx1].type = "floor";
    cx1 += cx1 < cx2 ? 1 : -1;
  }
  while (cy1 !== cy2) {
    map[cy1][cx1].type = "floor";
    cy1 += cy1 < cy2 ? 1 : -1;
  }
}
