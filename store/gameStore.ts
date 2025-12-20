import { create } from "zustand";
import { GameStore } from "./types";
import { createMapSlice } from "./slices/mapSlice";
import { createPlayerSlice } from "./slices/playerSlice";
import { createUISlice } from "./slices/uiSlice";
import { createInventorySlice } from "./slices/inventorySlice";
import { createCombatSlice } from "./slices/combatSlice";
import { createQuestSlice } from "./slices/questSlice";
import { createMasterySlice } from "./slices/masterySlice";

export const useGameStore = create<GameStore>()((...a) => ({
  ...createMapSlice(...a),
  ...createPlayerSlice(...a),
  ...createUISlice(...a),
  ...createInventorySlice(...a),
  ...createCombatSlice(...a),
  ...createQuestSlice(...a),
  ...createMasterySlice(...a),

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
      critChance: 0.05,
      critDamage: 1.5,
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
    },
    spriteKey: "PLAYER",
    isHostile: false,
    level: 1,
    xp: 0,
    xpToNext: 100,
    gold: 0,
    attributePoints: 0,
    masteryPoints: 0,
    equipment: { weapon: null, armor: null, accessory: null },
    spells: [],
    learnedSpells: [],
    equippedSpells: ["", "", ""],
    masteries: [],
    quests: [],
    statusEffects: [],
  },
  enemies: [],
  inventory: [],
  logs: [],
  turn: 0,
  gameState: "start",
  currentDialogue: null,
  dungeonLevel: 1,
  particles: [],
  floatingTexts: [],
  screenShake: 0,
  currentMerchantId: null,
  showResetConfirmation: false,
  isLoading: false,
  currentBiomeId: "cave",
  menuSelectionIndex: 0,
  inputMethod: "keyboard",
}));

export default useGameStore;
