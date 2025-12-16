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

    let newIndex = menuSelectionIndex;
    let maxIndex = 0;
    let cols = 1;

    if (gameState === "inventory") {
      maxIndex = 29;
      cols = 6;
    } else if (gameState === "shop") {
      const merchant = enemies.find((e) => e.id === currentMerchantId) as
        | MerchantEntity
        | undefined;
      maxIndex = (merchant?.shopInventory?.length || 1) - 1;
      cols = 2;
    } else if (gameState === "spellbook") {
      maxIndex = (player.spells.length || 1) - 1;
      cols = 1;
    } else if (gameState === "levelup") {
      const statsCount = 5;
      const masteriesCount = player.masteries?.length || 0;
      maxIndex = statsCount + masteriesCount - 1;
      cols = 1;
    }

    if (dir === "right") newIndex++;
    else if (dir === "left") newIndex--;
    else if (dir === "up") newIndex -= cols;
    else if (dir === "down") newIndex += cols;

    if (newIndex < 0) newIndex = 0;
    if (newIndex > maxIndex) newIndex = maxIndex;

    set({ menuSelectionIndex: newIndex });
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
      incrementAttribute,
      unlockMastery,
    } = get();

    if (gameState === "inventory") {
      const item = inventory[menuSelectionIndex];
      if (!item) return;

      // Correction: Vérification large des types consommables
      if (
        item.type === "potion" ||
        item.type === "consumable" ||
        (item as any).type === "scroll"
      ) {
        useItem(item.id);
      } else {
        equipItem(item);
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
      const spell = player.spells[menuSelectionIndex];
      if (spell) {
        const emptySlot = player.equippedSpells.indexOf("");
        const slotToUse = emptySlot === -1 ? 0 : emptySlot;
        equipSpell(spell.id, slotToUse);
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

  addItem: (item: Item) => {
    const { player, inventory, addLog } = get();

    if (item.type === "accessory") {
      const alreadyHas =
        inventory.some((i) => i && i.name === item.name) ||
        player.equipment.accessory?.name === item.name;
      if (alreadyHas) {
        addLog("Vous possédez déjà cet accessoire !");
        return;
      }
    }

    if ((item as any).type === "spellbook" && (item as any).spellId) {
      const spellId = (item as any).spellId;
      if (player.spells.find((s: any) => s.id === spellId)) {
        addLog("Sort déjà connu !");
        return;
      }
      const spellData = SPELL_DB[spellId as keyof typeof SPELL_DB];
      if (spellData) {
        let newEquipped = [...player.equippedSpells];
        const emptyIdx = newEquipped.indexOf("");
        if (emptyIdx !== -1) newEquipped[emptyIdx] = spellData.id;
        set((s) => ({
          player: {
            ...s.player,
            spells: [...s.player.spells, spellData],
            equippedSpells: newEquipped,
          },
        }));
        addLog(`Appris : ${spellData.name}`);
      }
      return;
    }

    const firstEmptyIndex = inventory.findIndex((i) => i === null);
    if (firstEmptyIndex !== -1) {
      const newInv = [...inventory];
      newInv[firstEmptyIndex] = item;
      set({ inventory: newInv });
      addLog(`Obtenu : ${item.name}`);
    } else if (inventory.length < 30) {
      set({ inventory: [...inventory, item] });
      addLog(`Obtenu : ${item.name}`);
    } else {
      addLog("Inventaire plein !");
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

    // On trouve l'index exact de l'objet pour l'enlever proprement
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
    } else {
      return;
    }

    if (oldItem && itemIndex !== -1) {
      newInventory[itemIndex] = oldItem;
    } else if (oldItem) {
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
    // On trouve l'index exact pour ne supprimer que CELUI-LA
    const itemIndex = inventory.findIndex((i) => i && i.id === itemId);
    const item = inventory[itemIndex];

    if (!item) return;

    const heal = item.stats?.hp || 50;
    const newHp = Math.min(player.stats.maxHp, player.stats.hp + heal);

    const newInventory = [...inventory];
    newInventory[itemIndex] = null; // On vide le slot utilisé

    set({
      player: { ...player, stats: { ...player.stats, hp: newHp } },
      inventory: newInventory,
    });

    addLog(`Utilisé : ${item.name} (+${heal} PV)`);
    // Effet visuel
    addEffects(
      player.position.x,
      player.position.y,
      "#f43f5e",
      20,
      `+${heal}`,
      "#fff"
    );
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
      addItem(item);
    }
  },

  closeShop: () => set({ gameState: "playing", currentMerchantId: undefined }),
});
