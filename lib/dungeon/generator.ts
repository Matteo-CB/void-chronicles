import { Tile, Entity, Stats, LevelTheme } from "@/types/game";
import { LEVELS } from "../data/levels";
import { Room, MAX_ROOMS, ROOM_MIN_SIZE, ROOM_MAX_SIZE } from "./types";
import {
  spawnEntitiesInRoom,
  spawnBossInArena,
  ensureMinimumEnemies,
  spawnDecorations,
} from "./spawner";
import { generateLoot } from "@/lib/data/items";

// --- CONFIGURATION DES BIOMES (NOUVEAU) ---
const BIOMES: Record<string, LevelTheme> = {
  CRYPT: {
    name: "Crypte Oubliée",
    floorColor: "#27272a", // Zinc-800
    wallColor: "#52525b", // Zinc-600
    wallSideColor: "#3f3f46",
  },
  SEWERS: {
    name: "Égouts Toxiques",
    floorColor: "#064e3b", // Emerald-900
    wallColor: "#10b981", // Emerald-500
    wallSideColor: "#047857",
  },
  RUINS: {
    name: "Ruines Antiques",
    floorColor: "#451a03", // Amber-950
    wallColor: "#d97706", // Amber-600
    wallSideColor: "#92400e",
  },
  VOLCANO: {
    name: "Cœur de Magma",
    floorColor: "#450a0a", // Red-950
    wallColor: "#ef4444", // Red-500
    wallSideColor: "#991b1b",
  },
  BOSS_ROOM: {
    name: "Antre du Titan",
    floorColor: "#312e81", // Indigo-900
    wallColor: "#6366f1", // Indigo-500
    wallSideColor: "#4338ca",
  },
};

// --- STATS CONSTANTS (CONSERVÉS) ---
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

const MERCHANT_STATS: Stats = {
  hp: 9999,
  maxHp: 9999,
  mana: 0,
  maxMana: 0,
  attack: 0,
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

export function generateDungeon(level: number): {
  map: Tile[][];
  spawn: { x: number; y: number };
  entities: Entity[];
  levelConfig: LevelTheme; // Changement de type pour inclure les couleurs
} {
  // 1. CHOIX DU BIOME
  let theme = BIOMES.CRYPT;
  if (level % 5 === 0) theme = BIOMES.BOSS_ROOM;
  else if (level > 10) theme = BIOMES.VOLCANO;
  else if (level > 5) theme = BIOMES.RUINS;
  else if (level > 2) theme = BIOMES.SEWERS;

  const config = LEVELS[Math.min(LEVELS.length - 1, Math.max(0, level - 1))];
  // On augmente la taille de la map avec les niveaux pour l'aspect "Exploration longue"
  const width = Math.min(60, config.width + Math.floor(level / 2));
  const height = Math.min(40, config.height + Math.floor(level / 2));

  // --- BRANCHEMENT BOSS (NOUVEAU) ---
  if (level % 5 === 0) {
    return generateBossLevel(width, height, level, theme);
  }

  let map: Tile[][] = [];
  let rooms: Room[] = [];
  let entities: Entity[] = [];
  let attempts = 0;

  // 2. GÉNÉRATION PROCEDURALE (Code Original Conservé)
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
      // Plus de salles haut niveau
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
      }
    }
  } while (rooms.length < 4 && attempts < 50); // Sécurité augmentée

  // 3. SPAWN JOUEUR
  const spawnRoom = rooms[0];
  const spawn = {
    x: spawnRoom.x + Math.floor(spawnRoom.w / 2),
    y: spawnRoom.y + Math.floor(spawnRoom.h / 2),
  };

  // 4. PEUPLEMENT (Logic Originale + Nouveaux Appels)
  if (rooms.length > 0) {
    rooms.forEach((room, index) => {
      if (index > 0) {
        // On passe le thème pour adapter les ennemis si besoin
        spawnEntitiesInRoom(room, level, entities, config);
      }
    });

    spawnDecorations(rooms, entities, config);
    ensureMinimumEnemies(entities, rooms, level, config);

    // B. Coffres (Code Original)
    rooms.forEach((room, idx) => {
      if (idx > 0 && Math.random() < 0.3) {
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

    // C. Marchand (Code Original)
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

    // D. Sortie (Code Original Sécurisé)
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
      isHidden: true, // Doit tuer les ennemis pour ouvrir
    });
  }

  // 5. --- NETTOYAGE CRITIQUE (CONSERVÉ ET RENFORCÉ) ---
  const SAFE_RADIUS = 8;
  entities = entities.filter((e) => {
    if (e.type === "stairs" || e.type === "merchant" || e.type === "chest")
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

// --- GÉNÉRATEUR D'ARÈNE DE BOSS (NOUVEAU) ---
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
          // Murs extérieurs
          if (x === 0 || y === 0 || x === width - 1 || y === height - 1)
            return { x, y, type: "wall", visibility: "hidden" };
          // Piliers
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

  // Spawn du Boss via le spawner
  spawnBossInArena(level, width, height, entities);

  // Ajout sortie secrète
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

// --- UTILITAIRES (CONSERVÉS) ---
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
