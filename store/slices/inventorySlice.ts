import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Item, Direction } from "@/types/game";
import { SPELL_DB } from "@/lib/data/spells";

export const createInventorySlice: StateCreator<GameStore, [], [], any> = (
  set,
  get
) => ({
  inventory: [],
  selectedInventoryIndex: 0,
  selectedShopIndex: 0,

  toggleInventory: () => {
    const { gameState } = get();
    if (gameState === "playing")
      set({ gameState: "inventory", selectedInventoryIndex: 0 });
    else if (gameState === "inventory") set({ gameState: "playing" });
  },

  navigateInventory: (dir: Direction) => {
    const { selectedInventoryIndex, inventory } = get();
    if (inventory.length === 0) return;
    let newIndex = selectedInventoryIndex;
    const cols = 4;
    if (dir === "right") newIndex++;
    else if (dir === "left") newIndex--;
    else if (dir === "up") newIndex -= cols;
    else if (dir === "down") newIndex += cols;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= inventory.length) newIndex = inventory.length - 1;
    set({ selectedInventoryIndex: newIndex });
  },

  useSelectedInventoryItem: () => {
    const { inventory, selectedInventoryIndex, equipItem, useItem } = get();
    const item = inventory[selectedInventoryIndex];
    if (!item) return;
    if (item.type === "consumable") useItem(item);
    else equipItem(item);
    const newLen = get().inventory.length;
    if (get().selectedInventoryIndex >= newLen)
      set({ selectedInventoryIndex: Math.max(0, newLen - 1) });
  },

  navigateShop: (dir: Direction) => {
    const { selectedShopIndex, enemies, currentMerchantId } = get();
    const merchant = enemies.find((e) => e.id === currentMerchantId);
    if (
      !merchant ||
      !merchant.shopInventory ||
      merchant.shopInventory.length === 0
    )
      return;
    let newIndex = selectedShopIndex;
    if (dir === "right" || dir === "down") newIndex++;
    else if (dir === "left" || dir === "up") newIndex--;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= merchant.shopInventory.length)
      newIndex = merchant.shopInventory.length - 1;
    set({ selectedShopIndex: newIndex });
  },

  buySelectedShopItem: () => {
    const { enemies, currentMerchantId, selectedShopIndex, buyItem } = get();
    const merchant = enemies.find((e) => e.id === currentMerchantId);
    if (!merchant || !merchant.shopInventory) return;
    const item = merchant.shopInventory[selectedShopIndex];
    if (item) {
      buyItem(item);
      const newLen =
        get().enemies.find((e) => e.id === currentMerchantId)?.shopInventory
          ?.length || 0;
      if (get().selectedShopIndex >= newLen)
        set({ selectedShopIndex: Math.max(0, newLen - 1) });
    }
  },

  addItem: (item: Item) => {
    const { player, inventory, addLog } = get();
    if (item.type === "spellbook" && item.spellId) {
      if (player.spells.find((s) => s.id === item.spellId)) {
        addLog("Sort déjà connu !");
        return;
      }
      const spellData = SPELL_DB[item.spellId];
      if (spellData) {
        let newEquipped = [...player.equippedSpells];
        const emptyIdx = newEquipped.indexOf("");
        if (emptyIdx !== -1) newEquipped[emptyIdx] = spellData.id;
        set({
          player: {
            ...player,
            spells: [...player.spells, spellData],
            equippedSpells: newEquipped,
          },
        });
        addLog(`Appris : ${spellData.name}`);
      }
      return;
    }
    if (inventory.length >= 20) {
      addLog("Inventaire plein !");
      return;
    }
    set({ inventory: [...inventory, item] });
    addLog(`Obtenu : ${item.name}`);
  },

  equipItem: (item: Item) => {
    const { player, inventory, calculateStats, addLog } = get();
    const newInventory = inventory.filter((i) => i.id !== item.id);
    let oldItem: Item | null = null;
    let newEquipment = { ...player.equipment };
    if (item.type === "weapon") {
      oldItem = newEquipment.weapon;
      newEquipment.weapon = item;
    }
    if (item.type === "armor") {
      oldItem = newEquipment.armor;
      newEquipment.armor = item;
    }
    if (item.type === "accessory") {
      oldItem = newEquipment.accessory;
      newEquipment.accessory = item;
    }
    if (oldItem) newInventory.push(oldItem);
    set({
      player: { ...player, equipment: newEquipment },
      inventory: newInventory,
    });
    addLog(`Équipé : ${item.name}`);
    calculateStats();
  },

  useItem: (item: Item) => {
    const { player, inventory, addEffects, addLog } = get();
    if (item.type !== "consumable") return;
    const heal = item.stats?.hp || 50;
    const newHp = Math.min(player.stats.maxHp, player.stats.hp + heal);
    set({
      player: { ...player, stats: { ...player.stats, hp: newHp } },
      inventory: inventory.filter((i) => i.id !== item.id),
    });
    addLog(`Utilisé : ${item.name} (+${heal} PV)`);
    addEffects(
      player.position.x,
      player.position.y,
      "#f43f5e",
      15,
      `+${heal}`,
      "#fff"
    );
  },

  buyItem: (item: Item) => {
    const { player, enemies, currentMerchantId, addItem, addLog } = get();
    if (player.gold < item.value) {
      addLog("Pas assez d'or !");
      return;
    }
    const merchant = enemies.find((e) => e.id === currentMerchantId);
    if (merchant && merchant.shopInventory) {
      const newInventory = merchant.shopInventory.filter(
        (i) => i.id !== item.id
      );
      const newEnemies = enemies.map((e) =>
        e.id === currentMerchantId
          ? { ...merchant, shopInventory: newInventory }
          : e
      );
      set({
        enemies: newEnemies,
        player: { ...player, gold: player.gold - item.value },
      });
      addLog(`Acheté : ${item.name}`);
      addItem(item);
    }
  },

  closeShop: () => set({ gameState: "playing", currentMerchantId: null }),
});
