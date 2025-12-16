import { StoreApi } from "zustand";
import { Direction, Entity, Item } from "@/types/game";
import { POTION_ITEM } from "@/lib/data/items";
import { generateDungeon } from "@/lib/dungeon";
import { GameStore } from "../../types";

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
    enemies,
    interactMapLogic,
    addItem,
    addLog,
    addEffects,
    dungeonLevel,
    saveGame,
  } = get();

  if (player.direction !== direction) {
    set((state) => ({ player: { ...state.player, direction } }));
  }

  let dx = 0;
  let dy = 0;
  if (direction === "up") dy = -1;
  if (direction === "down") dy = 1;
  if (direction === "left") dx = -1;
  if (direction === "right") dx = 1;

  const targetX = player.position.x + dx;
  const targetY = player.position.y + dy;

  if (
    targetY < 0 ||
    targetY >= map.length ||
    targetX < 0 ||
    targetX >= map[0].length
  )
    return;

  const targetTile = map[Math.round(targetY)]?.[Math.round(targetX)];
  if (targetTile?.type === "wall") return;

  const entitiesOnTarget = enemies.filter(
    (e) => e.position.x === targetX && e.position.y === targetY && !e.isHidden
  );

  const blocker = entitiesOnTarget.find(
    (e) =>
      !e.isDead && e.type !== "rubble" && (e.isHostile || e.type === "barrel")
  );

  if (blocker) return;

  const interactable = entitiesOnTarget.find(
    (e) =>
      !e.isDead &&
      (e.type === "chest" || e.type === "merchant" || e.type === "shrine")
  );

  if (interactable) {
    interactMapLogic();
    return;
  }

  set((state) => ({
    player: { ...state.player, position: { x: targetX, y: targetY } },
  }));

  const loot = entitiesOnTarget.filter(
    (e) =>
      !e.isDead &&
      (e.type === "gold" || e.type === "potion" || e.type === "item")
  );

  if (loot.length > 0) {
    let newEnemies = [...get().enemies];
    loot.forEach((item) => {
      if (item.type === "gold") {
        const val = item.value || 10;
        set((s) => ({
          player: { ...s.player, gold: s.player.gold + val },
        }));
        addLog(`+${val} Or`);
        addEffects(targetX, targetY, "#fbbf24", 5, `+${val}`);
        newEnemies = newEnemies.filter((e) => e.id !== item.id);
      } else if (item.type === "potion") {
        const newItem: Item = { ...POTION_ITEM, id: `loot_${Math.random()}` };
        addItem(newItem);
        newEnemies = newEnemies.filter((e) => e.id !== item.id);
      }
    });
    set({ enemies: newEnemies });
  }

  const stairs = entitiesOnTarget.find((e) => e.type === "stairs");
  if (stairs) {
    const livingEnemies = enemies.filter(
      (e) => e.isHostile && !e.isDead && e.type !== "barrel"
    );

    if (livingEnemies.length > 0) {
      addLog(`La sortie est scellée ! Reste ${livingEnemies.length} ennemis.`);
      addEffects(targetX, targetY, "#ef4444", 5, "SCÉLLÉ", "#ef4444");
      set((state) => ({
        player: {
          ...state.player,
          position: { x: player.position.x, y: player.position.y },
        },
        screenShake: 2,
      }));
      return;
    }

    const next = dungeonLevel + 1;
    set({ isLoading: true });
    setTimeout(() => {
      const { map, spawn, entities, levelConfig } = generateDungeon(next);
      set({
        map,
        enemies: entities,
        player: { ...player, position: spawn },
        dungeonLevel: next,
        levelTheme: {
          floorColor: levelConfig.colors.floor,
          wallColor: levelConfig.colors.wall,
          wallSideColor: levelConfig.colors.wallSide,
          name: levelConfig.name,
        },
        isLoading: false,
        gameState: "dialogue",
        currentDialogue: `${levelConfig.name}\n\nLes ombres se densifient...`,
      });
      saveGame();
    }, 800);
  }
};
