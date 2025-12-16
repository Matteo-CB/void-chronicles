import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Direction, Item, Stats } from "@/types/game";
import { POTION_ITEM } from "@/lib/data/items";

// Extension correcte qui respecte l'interface Item
interface WeaponItem extends Item {
  onHitEffect?: {
    type: string;
    value: number;
    chance: number; // Ajout de chance pour matcher l'interface Item
  };
}

export const createPlayerSlice: StateCreator<
  GameStore,
  [],
  [],
  Pick<
    GameStore,
    | "movePlayer"
    | "interact"
    | "calculateStats"
    | "equipSpell"
    | "incrementAttribute"
    | "unlockMastery"
    | "closeLevelUp"
  >
> = (set, get) => ({
  movePlayer: (direction: Direction) => {
    const { gameState, movePlayerMapLogic } = get();
    if (gameState !== "playing") return;
    movePlayerMapLogic(direction);
  },

  interact: () => {
    const { gameState, interactMapLogic, advanceDialogue } = get();
    if (gameState === "dialogue") {
      advanceDialogue();
      return;
    }
    if (gameState !== "playing") return;
    interactMapLogic();
  },

  calculateStats: () => {
    const { player } = get();

    // 1. Stats de base depuis les attributs
    let atk = 5 + player.stats.strength * 1.5;
    let maxHp = 100 + player.stats.endurance * 12;
    let maxMana = 50 + player.stats.wisdom * 10;
    let crit = 0.05 + player.stats.agility * 0.015;
    let dodge = 0 + player.stats.agility * 0.01;
    let armorPen = 0 + player.stats.accuracy * 2;
    let spellPwr = 0 + player.stats.arcane * 3;
    let cdr = 0 + player.stats.willpower * 0.01;
    let critDmg = 1.5 + player.stats.luck * 0.05;
    let lifesteal = 0;
    let def = 0 + player.stats.willpower * 0.5;

    // 2. Bonus d'équipement
    if (player.equipment.weapon) {
      atk += player.equipment.weapon.stats?.attack || 0;
      crit += player.equipment.weapon.stats?.critChance || 0;

      const weapon = player.equipment.weapon as WeaponItem;
      if (weapon.onHitEffect?.type === "lifesteal") {
        lifesteal += weapon.onHitEffect.value;
      }
    }
    // ... (reste inchangé)
    if (player.equipment.armor) {
      def += player.equipment.armor.stats?.defense || 0;
      maxHp += player.equipment.armor.stats?.maxHp || 0;
    }
    if (player.equipment.accessory) {
      maxHp += player.equipment.accessory.stats?.maxHp || 0;
      maxMana += player.equipment.accessory.stats?.maxMana || 0;
      crit += player.equipment.accessory.stats?.critChance || 0;
      critDmg = Math.max(
        critDmg,
        player.equipment.accessory.stats?.critDamage || 1.5
      );
    }

    // 3. Bonus de Maîtrises (Passifs)
    if (player.masteries) {
      player.masteries.forEach((m: any) => {
        if (m.type === "passive" && m.currentRank > 0) {
          if (m.id === "m_ring_might") atk *= 1 + 0.05 * m.currentRank;
          if (m.id === "m_relic_life") maxHp += 25 * m.currentRank;
          if (m.id === "m_boots_speed") dodge += 0.02 * m.currentRank;
          if (m.id === "m_gem_focus") cdr += 0.05 * m.currentRank;
        }
      });
    }

    set((state) => ({
      player: {
        ...state.player,
        stats: {
          ...state.player.stats,
          attack: Math.floor(atk),
          defense: Math.floor(def),
          maxHp: Math.floor(maxHp),
          maxMana: Math.floor(maxMana),
          critChance: Math.min(0.8, crit),
          dodgeChance: Math.min(0.6, dodge),
          critDamage: critDmg,
          lifesteal: lifesteal,
          armorPen: armorPen,
          spellPower: spellPwr,
          cooldownReduction: Math.min(0.5, cdr),
          hp: Math.min(state.player.stats.hp, Math.floor(maxHp)),
          mana: Math.min(state.player.stats.mana, Math.floor(maxMana)),
        },
      },
    }));
  },

  equipSpell: (spellId: string, slotIndex: number) => {
    const { player } = get();
    // Gestion des types null/string pour equippedSpells
    const newEquipped = [...player.equippedSpells];
    newEquipped[slotIndex] = spellId;
    set({ player: { ...player, equippedSpells: newEquipped } });
  },

  incrementAttribute: (attr: string) => {
    const { player, calculateStats } = get();
    if (!player.attributePoints || player.attributePoints <= 0) return;

    if (attr in player.stats) {
      const key = attr as keyof Stats;
      const currentVal = player.stats[key];

      const newStats = { ...player.stats, [key]: currentVal + 1 };
      set({
        player: {
          ...player,
          stats: newStats,
          attributePoints: player.attributePoints - 1,
        },
      });
      calculateStats();
    }
  },

  unlockMastery: (masteryId: string) => {
    const { player, addItem, calculateStats, addLog } = get();
    if (!player.masteryPoints || player.masteryPoints <= 0) return;

    const newMasteries = [...player.masteries];
    const mIndex = newMasteries.findIndex((m) => m.id === masteryId);
    if (mIndex === -1) return;

    const mastery = { ...newMasteries[mIndex] };
    if (player.masteryPoints < mastery.cost) return;
    if (mastery.type === "passive" && mastery.currentRank >= mastery.maxRank)
      return;

    const newPoints = player.masteryPoints - mastery.cost;

    if (mastery.type === "consumable") {
      if (mastery.id === "m_potion_pack") {
        addItem({ ...POTION_ITEM, id: `pot_${Math.random()}` });
        addItem({ ...POTION_ITEM, id: `pot_${Math.random()}` });
        addLog("2 Potions reçues !");
      } else if (mastery.id === "m_scroll_knowledge") {
        set((s) => ({
          player: {
            ...s.player,
            mana: s.player.stats.maxMana,
            xp: s.player.xp + 20,
          },
        }));
        addLog("Savoir ancien acquis !");
      }
    } else {
      mastery.currentRank += 1;
      addLog(`Amélioré : ${mastery.name} (Rang ${mastery.currentRank})`);
    }

    newMasteries[mIndex] = mastery;

    set({
      player: { ...player, masteries: newMasteries, masteryPoints: newPoints },
    });
    calculateStats();
  },

  closeLevelUp: () => {
    set({ gameState: "playing" });
  },
});
