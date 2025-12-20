import { Tile, Entity, Stats, LevelTheme } from "@/types/game";
import { LEVELS } from "../data/levels";
import {
  Room,
  MAX_ROOMS,
  ROOM_MIN_SIZE,
  ROOM_MAX_SIZE,
  RoomType,
} from "./types";
import {
  spawnEntitiesInRoom,
  spawnBossInArena,
  ensureMinimumEnemies,
} from "./spawner";
import { generateLoot } from "@/lib/data/items";
import { createDecoration } from "../data/decorations";
import { NPC_DB } from "../data/npcs"; // Import Nouveaux PNJ

// --- CONFIGURATION DES BIOMES ---
const BIOMES: Record<string, LevelTheme> = {
  CRYPT: {
    name: "Crypte Oubliée",
    floorColor: "#27272a",
    wallColor: "#52525b",
    wallSideColor: "#3f3f46",
  },
  SEWERS: {
    name: "Égouts Toxiques",
    floorColor: "#064e3b",
    wallColor: "#10b981",
    wallSideColor: "#047857",
  },
  RUINS: {
    name: "Ruines Antiques",
    floorColor: "#451a03",
    wallColor: "#d97706",
    wallSideColor: "#92400e",
  },
  VOLCANO: {
    name: "Cœur de Magma",
    floorColor: "#450a0a",
    wallColor: "#ef4444",
    wallSideColor: "#991b1b",
  },
  BOSS_ROOM: {
    name: "Antre du Titan",
    floorColor: "#312e81",
    wallColor: "#6366f1",
    wallSideColor: "#4338ca",
  },
};

const STAIRS_STATS: Stats = {
  hp: 1000,
  maxHp: 1000,
  mana: 0,
  xpRegen: 0,
  hpGain: 0,
  maxMana: 0,
  attack: 0,
  attackSpeed: 0,
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
const MERCHANT_STATS: Stats = {
  hp: 9999,
  maxHp: 9999,
  mana: 0,
  xpRegen: 0,
  hpGain: 0,
  maxMana: 0,
  attack: 0,
  attackSpeed: 1,
  defense: 999,
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

export function generateDungeon(
  level: number
): {
  map: Tile[][];
  spawn: { x: number; y: number };
  entities: Entity[];
  levelConfig: LevelTheme;
} {
  // 1. CHOIX DU BIOME
  let themeKey = "CRYPT";
  if (level % 5 === 0) themeKey = "BOSS_ROOM";
  else if (level > 10) themeKey = "VOLCANO";
  else if (level > 5) themeKey = "RUINS";
  else if (level > 2) themeKey = "SEWERS";

  const theme = BIOMES[themeKey];
  const config = LEVELS[Math.min(LEVELS.length - 1, Math.max(0, level - 1))];

  const width = Math.min(60, config.width + Math.floor(level / 2));
  const height = Math.min(40, config.height + Math.floor(level / 2));

  if (level % 5 === 0) {
    return generateBossLevel(width, height, level, theme);
  }

  let map: Tile[][] = [];
  let rooms: Room[] = [];
  let entities: Entity[] = [];
  let attempts = 0;

  // 2. GÉNÉRATION PROCEDURALE
  do {
    attempts++;
    map = Array(height)
      .fill(null)
      .map((_, y) =>
        Array(width)
          .fill(null)
          .map((_, x) => ({ x, y, type: "wall", visibility: "hidden" }))
      );
    rooms = [];
    entities = [];

    for (let i = 0; i < MAX_ROOMS + Math.floor(level / 3); i++) {
      const w =
        Math.floor(Math.random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE + 1)) +
        ROOM_MIN_SIZE;
      const h =
        Math.floor(Math.random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE + 1)) +
        ROOM_MIN_SIZE;
      const x = Math.floor(Math.random() * (width - w - 2)) + 1;
      const y = Math.floor(Math.random() * (height - h - 2)) + 1;

      const newRoom: Room = { x, y, w, h, roomType: "normal" };
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

        // ATTRIBUTION TYPE DE SALLE
        if (rooms.length === 0) newRoom.roomType = "spawn";
        else {
          const rand = Math.random();
          if (rand < 0.15) newRoom.roomType = "storage";
          else if (rand < 0.3) newRoom.roomType = "library";
          else if (rand < 0.4 && w > 8 && h > 8) newRoom.roomType = "arena";
          else if (rand < 0.5) newRoom.roomType = "garden";
          else newRoom.roomType = "normal";
        }

        rooms.push(newRoom);
      }
    }
  } while (rooms.length < 4 && attempts < 50);

  if (rooms.length > 0) rooms[rooms.length - 1].roomType = "exit";

  // 3. SPAWN JOUEUR
  const spawnRoom = rooms[0];
  const spawn = {
    x: spawnRoom.x + Math.floor(spawnRoom.w / 2),
    y: spawnRoom.y + Math.floor(spawnRoom.h / 2),
  };

  // --- SPAWN PNJ (GARDE) AU NIVEAU 1 ---
  if (level === 1) {
    const npcConfig = NPC_DB.WOUNDED_GUARD;
    // On le place un peu à côté du spawn
    entities.push({
      id: "npc_guard_start",
      type: "npc",
      name: npcConfig.name!,
      spriteKey: npcConfig.spriteKey!,
      position: { x: spawn.x + 2, y: spawn.y + 1 }, // Décalé
      stats: npcConfig.stats!,
      isHostile: false,
      visualScale: 1,
      dialogueId: npcConfig.dialogueId,
      rarityColor: npcConfig.rarityColor,
    } as Entity);
  }

  // 4. REMPLISSAGE & DÉCORATION AVANCÉE
  if (rooms.length > 0) {
    rooms.forEach((room, index) => {
      fillSpecialRoom(room, entities, themeKey); // Décoration thématique

      if (index > 0) {
        spawnEntitiesInRoom(room, level, entities, config);
      }
    });

    decorateContextual(map, entities, themeKey);
    ensureMinimumEnemies(entities, rooms, level, config);

    // Coffres & Marchand (Code Original préservé)
    rooms.forEach((room, idx) => {
      if (idx > 0 && room.roomType !== "arena" && Math.random() < 0.3) {
        const cx = room.x + Math.floor(room.w / 2);
        const cy = room.y + Math.floor(room.h / 2);
        if (!entities.some((e) => e.position.x === cx && e.position.y === cy)) {
          entities.push({
            id: `chest_${Math.random()}`,
            type: "chest",
            name: "Coffre Ancien",
            spriteKey: "CHEST",
            position: { x: cx, y: cy },
            stats: { ...STAIRS_STATS, hp: 1 },
            isHostile: false,
            isOpen: false,
            visualScale: 1,
          });
        }
      }
    });

    // ... (Reste de la logique Marchand et Sortie inchangée)
    if (rooms.length > 2) {
      let merchantRoomIndex =
        Math.floor(Math.random() * (rooms.length - 1)) + 1;
      if (merchantRoomIndex === 0) merchantRoomIndex = 1;
      const merchantRoom = rooms[merchantRoomIndex];
      const mx = merchantRoom.x + Math.floor(merchantRoom.w / 2);
      const my = merchantRoom.y + Math.floor(merchantRoom.h / 2);

      if (!entities.some((e) => e.position.x === mx && e.position.y === my)) {
        entities.push({
          id: `merchant_${level}`,
          type: "merchant",
          name: "Marchand Itinérant",
          spriteKey: "MERCHANT",
          position: { x: mx, y: my },
          stats: MERCHANT_STATS,
          isHostile: false,
          visualScale: 1,
          isOpen: false,
          shopInventory: Array.from({ length: 6 }).map(() =>
            generateLoot(level)
          ),
        });
      }
    }

    const exitRoom = rooms[rooms.length - 1];
    let sx = exitRoom.x + Math.floor(exitRoom.w / 2);
    let sy = exitRoom.y + Math.floor(exitRoom.h / 2);
    if (sx === spawn.x && sy === spawn.y) {
      sx = Math.min(width - 2, sx + 2);
    }
    let safetyLoop = 0;
    while (
      entities.some((e) => e.position.x === sx && e.position.y === sy) &&
      safetyLoop < 50
    ) {
      sx++;
      if (sx >= exitRoom.x + exitRoom.w - 1) {
        sx = exitRoom.x + 1;
        sy++;
      }
      safetyLoop++;
    }
    entities.push({
      id: "stairs_exit",
      type: "stairs",
      name: "Sortie",
      spriteKey: "STAIRS",
      position: { x: sx, y: sy },
      stats: STAIRS_STATS,
      isHostile: false,
      visualScale: 1,
      isHidden: true,
    });
  }

  // 5. NETTOYAGE
  const SAFE_RADIUS = 8;
  entities = entities.filter((e) => {
    if (
      e.type === "stairs" ||
      e.type === "merchant" ||
      e.type === "chest" ||
      e.type === "npc"
    )
      return true;
    const dist = Math.sqrt(
      Math.pow(e.position.x - spawn.x, 2) + Math.pow(e.position.y - spawn.y, 2)
    );
    if (dist < SAFE_RADIUS && (e.isHostile || e.type === "enemy")) return false;
    return true;
  });

  const occupiedPositions = new Set<string>();
  occupiedPositions.add(`${spawn.x},${spawn.y}`);
  entities = entities.filter((e) => {
    const key = `${Math.round(e.position.x)},${Math.round(e.position.y)}`;
    if (occupiedPositions.has(key)) {
      if (e.type === "stairs") return true;
      return false;
    }
    occupiedPositions.add(key);
    return true;
  });

  return { map, spawn, entities, levelConfig: theme };
}

// --- FONCTIONS DE DÉCORATION AVANCÉES ---

function fillSpecialRoom(room: Room, entities: Entity[], biome: string) {
  if (room.roomType === "spawn" || room.roomType === "exit") return;

  const centerX = Math.floor(room.x + room.w / 2);
  const centerY = Math.floor(room.y + room.h / 2);

  if (room.roomType === "storage") {
    const decor = Math.random() > 0.5 ? "BARREL" : "CRATE";
    safeAddDecoration(decor, room.x, room.y, entities);
    safeAddDecoration(decor, room.x + room.w - 1, room.y, entities);
    safeAddDecoration(decor, room.x, room.y + room.h - 1, entities);
    safeAddDecoration(
      decor,
      room.x + room.w - 1,
      room.y + room.h - 1,
      entities
    );
  } else if (room.roomType === "library" && room.h > 5) {
    for (let x = room.x + 1; x < room.x + room.w - 1; x += 2) {
      safeAddDecoration("BOOKSHELF", x, room.y, entities);
    }
  } else if (room.roomType === "arena") {
    safeAddDecoration("PILLAR", centerX - 2, centerY - 2, entities);
    safeAddDecoration("PILLAR", centerX + 2, centerY - 2, entities);
    safeAddDecoration("PILLAR", centerX - 2, centerY + 2, entities);
    safeAddDecoration("PILLAR", centerX + 2, centerY + 2, entities);
  } else if (room.roomType === "garden") {
    const plant = biome === "CRYPT" ? "BONES" : "GRASS";
    for (let i = 0; i < 5; i++) {
      const rx = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
      const ry = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
      safeAddDecoration(plant, rx, ry, entities);
    }
  }
}

function decorateContextual(map: Tile[][], entities: Entity[], biome: string) {
  const height = map.length;
  const width = map[0].length;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tile = map[y][x];

      if (tile.type === "wall") {
        const below = map[y + 1]?.[x];
        if (below && below.type === "floor") {
          // Torches murales
          if (Math.random() < 0.05) {
            // Pour l'instant on ne met pas d'entité murale, ça complexifie le rendu
          }
        }
      } else if (tile.type === "floor") {
        // Débris au sol
        if (Math.random() < 0.03) {
          const decor =
            biome === "RUINS"
              ? "CRACK"
              : biome === "SEWERS"
              ? "PIPE"
              : "RUBBLE";
          safeAddDecoration(decor, x, y, entities);
        }
      }
    }
  }
}

function safeAddDecoration(
  key: string,
  x: number,
  y: number,
  entities: Entity[]
) {
  if (!entities.some((e) => e.position.x === x && e.position.y === y)) {
    entities.push(createDecoration(key, x, y));
  }
}

// --- GÉNÉRATEUR BOSS (INCHANGÉ) ---
function generateBossLevel(
  width: number,
  height: number,
  level: number,
  theme: LevelTheme
) {
  const map = Array(height)
    .fill(null)
    .map((_, y) =>
      Array(width)
        .fill(null)
        .map((_, x) => {
          if (x === 0 || y === 0 || x === width - 1 || y === height - 1)
            return { x, y, type: "wall", visibility: "hidden" };
          if (
            x % 8 === 0 &&
            y % 8 === 0 &&
            x > 5 &&
            y > 5 &&
            x < width - 5 &&
            y < height - 5
          )
            return { x, y, type: "wall", visibility: "hidden" };
          return { x, y, type: "floor", visibility: "hidden" };
        })
    ) as Tile[][];

  const spawn = { x: 4, y: Math.floor(height / 2) };
  const entities: Entity[] = [];
  spawnBossInArena(level, width, height, entities);
  entities.push({
    id: "stairs_exit_boss",
    type: "stairs",
    name: "Vers la suite...",
    spriteKey: "STAIRS",
    position: { x: width - 5, y: Math.floor(height / 2) },
    stats: STAIRS_STATS,
    isHostile: false,
    isHidden: true,
    visualScale: 1,
  });
  return { map, spawn, entities, levelConfig: theme };
}

// --- UTILITAIRES (INCHANGÉS) ---
export function createRoom(map: Tile[][], room: Room) {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
        map[y][x].type = "floor";
      }
    }
  }
}

export function connectRooms(map: Tile[][], r1: Room, r2: Room) {
  let cx1 = Math.floor(r1.x + r1.w / 2);
  let cy1 = Math.floor(r1.y + r1.h / 2);
  let cx2 = Math.floor(r2.x + r2.w / 2);
  let cy2 = Math.floor(r2.y + r2.h / 2);

  while (cx1 !== cx2) {
    if (cy1 >= 0 && cy1 < map.length && cx1 >= 0 && cx1 < map[0].length)
      map[cy1][cx1].type = "floor";
    cx1 += cx1 < cx2 ? 1 : -1;
  }
  while (cy1 !== cy2) {
    if (cy1 >= 0 && cy1 < map.length && cx1 >= 0 && cx1 < map[0].length)
      map[cy1][cx1].type = "floor";
    cy1 += cy1 < cy2 ? 1 : -1;
  }
}
