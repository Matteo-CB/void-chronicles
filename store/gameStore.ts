import { create } from "zustand";
import { GameStore } from "./types";
import { createMapSlice } from "./slices/mapSlice";
import { createPlayerSlice } from "./slices/playerSlice";
import { createUISlice } from "./slices/uiSlice";
import { createInventorySlice } from "./slices/inventorySlice";
import { createCombatSlice } from "./slices/combatSlice";

export const useGameStore = create<GameStore>()((...a) => ({
  ...createMapSlice(...a),
  ...createPlayerSlice(...a),
  ...createUISlice(...a),
  ...createInventorySlice(...a),
  ...createCombatSlice(...a),

  map: [],
  levelTheme: {
    name: "",
    floorColor: "#000",
    wallColor: "#fff",
    wallSideColor: "#888",
  },
  player: {
    id: "player",
    type: "player",
    name: "Héros",
    position: { x: 0, y: 0 },
    direction: "down",
    stats: {
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      attack: 10,
      defense: 0,
      speed: 1,
      xpValue: 0,
    },
    spriteKey: "PLAYER",
    isHostile: false,
    level: 1,
    xp: 0,
    xpToNext: 100,
    gold: 0,
    equipment: { weapon: null, armor: null, accessory: null },
    spells: [],
    learnedSpells: [],
    equippedSpells: ["", "", ""],
  },
  enemies: [],
  inventory: [],
  log: [],
  turn: 0,
  gameState: "menu",
  currentDialogue: null,
  dungeonLevel: 1,
  particles: [],
  floatingTexts: [],
  screenShake: 0,
  currentMerchantId: null,
  showResetConfirmation: false,
  isLoading: false,
  currentBiomeId: "cave",
  selectedInventoryIndex: 0,
  selectedShopIndex: 0,
  inputMethod: "keyboard",
}));

export default useGameStore;
