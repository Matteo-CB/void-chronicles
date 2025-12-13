import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Direction } from "@/types/game";

export const createPlayerSlice: StateCreator<GameStore, [], [], any> = (
  set,
  get
) => ({
  calculateStats: () => {
    const { player } = get();
    let attack = 10 + player.level * 2;
    let defense = 0 + player.level * 1;

    if (player.equipment.weapon) {
      attack += player.equipment.weapon.stats?.attack || 0;
      defense += player.equipment.weapon.stats?.defense || 0;
    }

    if (player.equipment.armor) {
      attack += player.equipment.armor.stats?.attack || 0;
      defense += player.equipment.armor.stats?.defense || 0;
    }

    if (player.equipment.accessory) {
      attack += player.equipment.accessory.stats?.attack || 0;
      defense += player.equipment.accessory.stats?.defense || 0;
    }

    set({
      player: { ...player, stats: { ...player.stats, attack, defense } },
    });
  },

  equipSpell: (spellId: string, slotIndex: number) => {
    const { player } = get();
    if (slotIndex < 0 || slotIndex > 2) return;
    const newEquipped = [...player.equippedSpells];
    const existingIdx = newEquipped.indexOf(spellId);
    if (existingIdx !== -1) newEquipped[existingIdx] = "";
    newEquipped[slotIndex] = spellId;
    set({ player: { ...player, equippedSpells: newEquipped } });
  },

  movePlayer: (direction: Direction) => {
    get().movePlayerMapLogic(direction);
  },

  interact: () => {
    get().interactMapLogic();
  },
});
