import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Item, Direction, Entity } from "@/types/game";
import { SPELL_DB } from "@/lib/data/spells";

interface MerchantEntity extends Entity {
  shopInventory?: Item[];
}

export const createInventorySlice: StateCreator<
  GameStore,
  [],
  [],
  Pick<
    GameStore,
    | "toggleInventory"
    | "navigateMenu"
    | "selectMenuItem"
    | "addItem"
    | "equipItem"
    | "useItem"
    | "buyItem"
    | "closeShop"
    | "unequipItem"
  >
> = (set, get) => ({
  inventory: [],
  menuSelectionIndex: 0,

  toggleInventory: () => {
    const { gameState } = get();
    if (gameState === "playing")
      set({ gameState: "inventory", menuSelectionIndex: 0 });
    else if (gameState === "inventory") set({ gameState: "playing" });
  },

  navigateMenu: (dir: Direction) => {
    const {
      gameState,
      menuSelectionIndex,
      enemies,
      currentMerchantId,
      player,
    } = get();

    // --- LOGIQUE INVENTAIRE ---
    if (gameState === "inventory") {
      const COLS = 6;
      const TOTAL_INV = 30;

      if (menuSelectionIndex >= 100) {
        if (dir === "up" && menuSelectionIndex > 100)
          set({ menuSelectionIndex: menuSelectionIndex - 1 });
        if (dir === "down" && menuSelectionIndex < 102)
          set({ menuSelectionIndex: menuSelectionIndex + 1 });

        if (dir === "right") {
          const targetRow =
            menuSelectionIndex === 100 ? 0 : menuSelectionIndex === 101 ? 2 : 4;
          set({ menuSelectionIndex: targetRow * COLS });
        }
      } else {
        let newIndex = menuSelectionIndex;

        if (dir === "up") {
          if (newIndex >= COLS) newIndex -= COLS;
        } else if (dir === "down") {
          if (newIndex + COLS < TOTAL_INV) newIndex += COLS;
        } else if (dir === "left") {
          if (newIndex % COLS === 0) {
            const row = Math.floor(newIndex / COLS);
            const target = row < 2 ? 100 : row < 3 ? 101 : 102;
            set({ menuSelectionIndex: target });
            return;
          } else {
            newIndex -= 1;
          }
        } else if (dir === "right") {
          if (newIndex % COLS < COLS - 1 && newIndex + 1 < TOTAL_INV)
            newIndex += 1;
        }

        set({ menuSelectionIndex: newIndex });
      }
    }
    // --- LOGIQUE GRIMOIRE ---
    else if (gameState === "spellbook") {
      const maxList = Math.max(0, player.spells.length - 1);

      if (menuSelectionIndex >= 100) {
        if (dir === "left") set({ menuSelectionIndex: 0 });
        if (dir === "up" && menuSelectionIndex > 100)
          set({ menuSelectionIndex: menuSelectionIndex - 1 });
        if (dir === "down" && menuSelectionIndex < 102)
          set({ menuSelectionIndex: menuSelectionIndex + 1 });
      } else {
        if (dir === "right") set({ menuSelectionIndex: 100 });
        else if (dir === "up")
          set({ menuSelectionIndex: Math.max(0, menuSelectionIndex - 1) });
        else if (dir === "down")
          set({
            menuSelectionIndex: Math.min(maxList, menuSelectionIndex + 1),
          });
      }
    }
    // --- LOGIQUE QUÊTES (SÉCURISÉE) ---
    else if (gameState === "quests") {
      // PROTECTION ANTI-CRASH : Utilisation de [] si undefined
      const quests = player.quests || [];
      const maxQuests = Math.max(0, quests.length - 1);

      if (dir === "up") {
        set({ menuSelectionIndex: Math.max(0, menuSelectionIndex - 1) });
      }
      if (dir === "down") {
        set({
          menuSelectionIndex: Math.min(maxQuests, menuSelectionIndex + 1),
        });
      }
    }
    // --- LOGIQUE SHOP ---
    else if (gameState === "shop") {
      const merchant = enemies.find((e) => e.id === currentMerchantId) as
        | MerchantEntity
        | undefined;
      if (!merchant || !merchant.shopInventory) return;

      const totalItems = merchant.shopInventory.length;
      if (totalItems === 0) return;

      const COLS = 3;

      let newIndex = menuSelectionIndex;

      if (dir === "up") {
        if (newIndex >= COLS) newIndex -= COLS;
      } else if (dir === "down") {
        if (newIndex + COLS < totalItems) newIndex += COLS;
      } else if (dir === "left") {
        if (newIndex % COLS !== 0) newIndex -= 1;
      } else if (dir === "right") {
        if (newIndex % COLS < COLS - 1 && newIndex + 1 < totalItems)
          newIndex += 1;
      }

      set({ menuSelectionIndex: newIndex });
    }
    // --- LOGIQUE LEVEL UP ---
    else if (gameState === "levelup") {
      const STATS_COUNT = 5;
      const masteryCount = player.masteries?.length || 0;
      const maxIndex = STATS_COUNT + Math.max(0, masteryCount - 1);

      if (dir === "up" && menuSelectionIndex > 0) {
        set({ menuSelectionIndex: menuSelectionIndex - 1 });
      }
      if (dir === "down" && menuSelectionIndex < maxIndex) {
        set({ menuSelectionIndex: menuSelectionIndex + 1 });
      }
    }
  },

  selectMenuItem: () => {
    const {
      gameState,
      menuSelectionIndex,
      inventory,
      equipItem,
      useItem,
      buyItem,
      enemies,
      currentMerchantId,
      player,
      equipSpell,
      unequipItem,
      incrementAttribute,
      unlockMastery,
    } = get();

    if (gameState === "inventory") {
      if (menuSelectionIndex >= 100) {
        const slot =
          menuSelectionIndex === 100
            ? "weapon"
            : menuSelectionIndex === 101
            ? "armor"
            : "accessory";
        if (player.equipment[slot]) {
          unequipItem(slot);
        }
      } else {
        const item = inventory[menuSelectionIndex];
        if (!item) return;

        if (
          item.type === "potion" ||
          item.type === "consumable" ||
          (item as any).type === "scroll" ||
          item.type === "spellbook"
        ) {
          useItem(item.id);
        } else {
          equipItem(item);
        }
      }
    } else if (gameState === "shop") {
      const merchant = enemies.find((e) => e.id === currentMerchantId) as
        | MerchantEntity
        | undefined;
      if (merchant && merchant.shopInventory) {
        const item = merchant.shopInventory[menuSelectionIndex];
        if (item) buyItem(item);
      }
    } else if (gameState === "spellbook") {
      if (menuSelectionIndex < 100) {
        const spell = player.spells[menuSelectionIndex];
        if (spell) {
          const emptySlot = player.equippedSpells.indexOf("");
          const slotToUse = emptySlot === -1 ? 0 : emptySlot;
          equipSpell(spell.id, slotToUse);
        }
      }
    } else if (gameState === "levelup") {
      const STATS_KEYS = ["strength", "endurance", "wisdom", "agility", "luck"];
      if (menuSelectionIndex < STATS_KEYS.length) {
        incrementAttribute(STATS_KEYS[menuSelectionIndex]);
      } else {
        const masteryIndex = menuSelectionIndex - STATS_KEYS.length;
        if (player.masteries && player.masteries[masteryIndex]) {
          unlockMastery(player.masteries[masteryIndex].id);
        }
      }
    }
  },

  addItem: (item: Item): boolean => {
    const { player, inventory, addLog } = get();

    if (item.type === "accessory") {
      const alreadyHas =
        inventory.some((i) => i && i.name === item.name) ||
        player.equipment.accessory?.name === item.name;
      if (alreadyHas) {
        addLog("Accessoire déjà possédé !");
        return false;
      }
    }

    const firstEmptyIndex = inventory.findIndex((i) => i === null);
    if (firstEmptyIndex !== -1) {
      const newInv = [...inventory];
      newInv[firstEmptyIndex] = item;
      set({ inventory: newInv });
      addLog(`Obtenu : ${item.name}`);
      return true;
    } else if (inventory.length < 30) {
      set({ inventory: [...inventory, item] });
      addLog(`Obtenu : ${item.name}`);
      return true;
    } else {
      addLog("Inventaire plein !");
      return false;
    }
  },

  unequipItem: (slot: string) => {
    const { player, inventory, calculateStats, addLog } = get();
    if (slot !== "weapon" && slot !== "armor" && slot !== "accessory") return;
    const itemToUnequip =
      player.equipment[slot as keyof typeof player.equipment];
    if (!itemToUnequip) return;

    const hasSpace = inventory.some((i) => i === null) || inventory.length < 30;
    if (!hasSpace) {
      addLog("Inventaire plein !");
      return;
    }

    let newInventory = [...inventory];
    const emptyIdx = newInventory.findIndex((i) => i === null);
    if (emptyIdx !== -1) newInventory[emptyIdx] = itemToUnequip;
    else newInventory.push(itemToUnequip);

    set({
      player: { ...player, equipment: { ...player.equipment, [slot]: null } },
      inventory: newInventory,
    });
    addLog(`Déséquipé : ${itemToUnequip.name}`);
    calculateStats();
  },

  equipItem: (item: Item) => {
    const { player, inventory, calculateStats, addLog } = get();
    const itemIndex = inventory.findIndex((i) => i && i.id === item.id);
    const newInventory = [...inventory];
    if (itemIndex !== -1) newInventory[itemIndex] = null;

    let oldItem: Item | null = null;
    const newEquipment = { ...player.equipment };

    if (item.type === "weapon") {
      oldItem = newEquipment.weapon;
      newEquipment.weapon = item;
    } else if (item.type === "armor") {
      oldItem = newEquipment.armor;
      newEquipment.armor = item;
    } else if (item.type === "accessory") {
      oldItem = newEquipment.accessory;
      newEquipment.accessory = item;
    } else return;

    if (oldItem && itemIndex !== -1) newInventory[itemIndex] = oldItem;
    else if (oldItem) {
      const empty = newInventory.findIndex((i) => i === null);
      if (empty !== -1) newInventory[empty] = oldItem;
      else newInventory.push(oldItem);
    }

    set({
      player: { ...player, equipment: newEquipment },
      inventory: newInventory,
    });
    addLog(`Équipé : ${item.name}`);
    calculateStats();
  },

  useItem: (itemId: string) => {
    const { player, inventory, addEffects, addLog } = get();
    const itemIndex = inventory.findIndex((i) => i && i.id === itemId);
    const item = inventory[itemIndex];

    if (!item) return;

    // LOGIQUE GRIMOIRE
    if (item.type === "spellbook" && item.spellId) {
      const spellData = SPELL_DB[item.spellId as keyof typeof SPELL_DB];
      if (!spellData) return;
      if (player.spells.find((s: any) => s.id === spellData.id)) {
        addLog("Sort déjà connu !");
        return;
      }
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
      addEffects(
        player.position.x,
        player.position.y,
        "#a855f7",
        30,
        "APPRIS !",
        "#fff"
      );

      const newInventory = [...inventory];
      newInventory[itemIndex] = null;
      set({ inventory: newInventory });
      return;
    }

    // LOGIQUE POTION / CONSOMMABLE
    let heal = 0;
    if (item.stats && item.stats.hp) heal = item.stats.hp;
    else if (item.type === "potion" || item.type === "consumable") heal = 50;

    if (heal > 0) {
      const newHp = Math.min(player.stats.maxHp, player.stats.hp + heal);
      const newInventory = [...inventory];
      newInventory[itemIndex] = null;

      set({
        player: { ...player, stats: { ...player.stats, hp: newHp } },
        inventory: newInventory,
      });
      addLog(`Utilisé : ${item.name} (+${heal} PV)`);
      addEffects(
        player.position.x,
        player.position.y,
        "#f43f5e",
        20,
        `+${heal}`,
        "#fff"
      );
    } else {
      addLog("Impossible d'utiliser cet objet.");
    }
  },

  buyItem: (item: Item) => {
    const { player, enemies, currentMerchantId, addItem, addLog } = get();
    const cost = item.value || 0;
    if (player.gold < cost) {
      addLog("Pas assez d'or !");
      return;
    }
    const merchant = enemies.find((e) => e.id === currentMerchantId) as
      | MerchantEntity
      | undefined;
    if (merchant && merchant.shopInventory) {
      if (addItem(item)) {
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
          player: { ...player, gold: player.gold - cost },
        });
        addLog(`Acheté : ${item.name}`);
      }
    }
  },

  closeShop: () =>
    set({
      gameState: "playing",
      currentMerchantId: undefined,
      menuSelectionIndex: 0,
    }),
});
