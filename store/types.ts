import { GameState, Direction, Item, InputMethod } from "../types/game";

export type StoreState = GameState;

export interface PlayerSlice {
  movePlayer: (dir: Direction) => void;
  interact: () => void;
  calculateStats: () => void;
  equipSpell: (spellId: string, slotIndex: number) => void;
}

export interface CombatSlice {
  processEnemyTurn: () => void;
  castSpell: (index: number) => void;
}

export interface InventorySlice {
  addItem: (item: Item) => void;
  removeItem: (item: Item) => void; // AJOUT
  equipItem: (item: Item) => void;
  useItem: (item: Item) => void;
  toggleInventory: () => void;
  buyItem: (item: Item) => void;
  closeShop: () => void;
  navigateInventory: (direction: Direction) => void;
  useSelectedInventoryItem: () => void;
  navigateShop: (direction: Direction) => void;
  buySelectedShopItem: () => void;
}

export interface MapSlice {
  initGame: (loadSave?: boolean) => void;
  saveGame: () => void;
  movePlayerMapLogic: (dir: Direction) => void;
  interactMapLogic: () => void;
}

export interface UISlice {
  advanceDialogue: () => void;
  updateVisuals: () => void;
  addEffects: (
    x: number,
    y: number,
    color: string,
    count: number,
    text?: string,
    textColor?: string
  ) => void;
  addLog: (msg: string) => void;
  toggleResetConfirmation: () => void;
  setInputMethod: (method: InputMethod) => void;
}

export type GameStore = StoreState &
  PlayerSlice &
  CombatSlice &
  InventorySlice &
  MapSlice &
  UISlice;
