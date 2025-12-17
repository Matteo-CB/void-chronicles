import { StoreApi } from "zustand";
import { Direction, Item } from "@/types/game";
import { POTION_ITEM } from "@/lib/data/items";
import { generateDungeon } from "@/lib/dungeon";
import { calculateFOV } from "@/lib/dungeon/fov"; // IMPORT NOUVEAU
import { GameStore } from "../../types";
import storyData from "@/lib/data/storyData.json";

type SetState = StoreApi<GameStore>["setState"];
type GetState = StoreApi<GameStore>["getState"];

export const handleMovePlayer = (
  set: SetState,
  get: GetState,
  direction: Direction
) => {
  const {
    player,
    map,
    interactMapLogic,
    addLog,
    dungeonLevel,
    saveGame,
    startCutscene,
  } = get();

  // 1. Rotation
  if (player.direction !== direction) {
    set((state) => ({ player: { ...state.player, direction } }));
  }

  // 2. Position Cible
  let dx = 0,
    dy = 0;
  switch (direction) {
    case "up":
      dy = -1;
      break;
    case "down":
      dy = 1;
      break;
    case "left":
      dx = -1;
      break;
    case "right":
      dx = 1;
      break;
  }
  const targetX = player.position.x + dx;
  const targetY = player.position.y + dy;

  // 3. Limites
  if (
    targetY < 0 ||
    targetY >= map.length ||
    targetX < 0 ||
    targetX >= map[0].length
  )
    return;
  if (map[Math.round(targetY)]?.[Math.round(targetX)]?.type === "wall") return;

  const currentEnemies = get().enemies;

  // 4. Bloqueurs
  const blocker = currentEnemies.find(
    (e) =>
      Math.round(e.position.x) === targetX &&
      Math.round(e.position.y) === targetY &&
      !e.isDead &&
      !e.isHidden &&
      e.type !== "rubble" &&
      (e.isHostile || e.type === "barrel")
  );
  if (blocker) {
    addLog(`Bloqué par : ${blocker.name}`);
    return;
  }

  // 5. Interactions
  const interactable = currentEnemies.find(
    (e) =>
      Math.round(e.position.x) === targetX &&
      Math.round(e.position.y) === targetY &&
      !e.isDead &&
      !e.isHidden &&
      (e.type === "chest" || e.type === "merchant" || e.type === "shrine")
  );
  if (interactable) {
    interactMapLogic();
    return;
  }

  // 6. DÉPLACEMENT & VISIBILITÉ
  set((state) => {
    const itemsToLoot = state.enemies.filter(
      (e) =>
        Math.round(e.position.x) === targetX &&
        Math.round(e.position.y) === targetY &&
        !e.isDead &&
        !e.isHidden &&
        (e.type === "gold" || e.type === "potion" || e.type === "item")
    );

    // Mouvement simple sans loot
    if (itemsToLoot.length === 0) {
      // MISE A JOUR FOV
      const newMap = calculateFOV(state.map, { x: targetX, y: targetY });

      return {
        map: newMap, // On met à jour la map avec le nouveau FOV
        player: { ...state.player, position: { x: targetX, y: targetY } },
      };
    }

    // Gestion Loot (identique à avant)
    let goldGained = 0;
    let potionFound = false;
    let inventoryFull = false;
    const idsToRemove = new Set<string>();
    const textsToAdd: any[] = [];
    const particlesToAdd: any[] = [];

    itemsToLoot.forEach((item) => {
      idsToRemove.add(item.id);
      if (item.type === "gold") {
        const val = item.value || Math.floor(Math.random() * 6) + 4;
        goldGained += val;
        textsToAdd.push({
          id: Math.random(),
          x: targetX,
          y: targetY - 0.6,
          text: `+${val}`,
          color: "#fbbf24",
          life: 0.8,
          isCrit: true,
        });
        for (let i = 0; i < 3; i++) {
          particlesToAdd.push({
            x: targetX + 0.5,
            y: targetY + 0.5,
            vx: (Math.random() - 0.5) * 0.1,
            vy: -0.1,
            life: 0.5,
            color: "#fbbf24",
            size: 3,
          });
        }
      } else if (item.type === "potion") {
        potionFound = true;
        textsToAdd.push({
          id: Math.random(),
          x: targetX,
          y: targetY - 0.5,
          text: "POTION",
          color: "#ef4444",
          life: 1.0,
        });
      }
    });

    let newInventory = [...state.inventory];
    if (potionFound) {
      const emptyIdx = newInventory.findIndex((i) => i === null);
      if (emptyIdx !== -1)
        newInventory[emptyIdx] = { ...POTION_ITEM, id: `loot_${Date.now()}` };
      else if (newInventory.length < 30)
        newInventory.push({ ...POTION_ITEM, id: `loot_${Date.now()}` });
      else inventoryFull = true;
    }

    const newEnemies = state.enemies.filter((e) => !idsToRemove.has(e.id));
    let currentGold = state.player.gold;
    if (typeof currentGold !== "number") currentGold = Number(currentGold) || 0;
    const finalGold = currentGold + goldGained;

    let newLogs = state.logs;
    if (goldGained > 0)
      newLogs = [...state.logs, `+${goldGained} Or`].slice(-20);

    // MISE A JOUR FOV AVEC LOOT
    const newMap = calculateFOV(state.map, { x: targetX, y: targetY });

    return {
      map: newMap,
      player: {
        ...state.player,
        position: { x: targetX, y: targetY },
        gold: finalGold,
      },
      enemies: newEnemies,
      inventory: newInventory,
      floatingTexts: [...state.floatingTexts, ...textsToAdd],
      particles: [...state.particles, ...particlesToAdd],
      logs: newLogs,
    };
  });

  // 7. Sortie (Post-Mouvement) - Identique
  const freshEnemies = get().enemies;
  const stairs = freshEnemies.find(
    (e) =>
      Math.round(e.position.x) === targetX &&
      Math.round(e.position.y) === targetY &&
      e.type === "stairs"
  );

  if (stairs) {
    const living = freshEnemies.filter(
      (e) => e.isHostile && !e.isDead && e.type !== "barrel"
    );
    if (living.length > 0) {
      addLog(`Zone verrouillée ! ${living.length} ennemis.`);
      set({ screenShake: 5 });
      return;
    }

    set({ isLoading: true });
    const next = dungeonLevel + 1;
    setTimeout(() => {
      const { map, spawn, entities, levelConfig } = generateDungeon(next);
      // Calcul du FOV initial pour le nouveau niveau !
      const mapWithFOV = calculateFOV(map, spawn);

      const story = storyData as any;
      const evt = story.levelEvents[next.toString()];

      set({
        map: mapWithFOV,
        enemies: entities,
        player: { ...player, position: spawn },
        dungeonLevel: next,
        levelTheme: {
          floorColor: levelConfig.floorColor,
          wallColor: levelConfig.wallColor,
          wallSideColor: levelConfig.wallSideColor,
          name: levelConfig.name,
        },
        isLoading: false,
      });
      if (evt?.introCutsceneId) startCutscene(evt.introCutsceneId);
      else {
        set({ gameState: "playing" });
        addLog(`Niveau ${next}`);
      }
      saveGame();
    }, 800);
  }
};
