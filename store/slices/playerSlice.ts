import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Direction, Item, Stats } from "@/types/game";
import { POTION_ITEM } from "@/lib/data/items";
import { CLASSES } from "@/lib/data/classes";

interface WeaponItem extends Item {
  onHitEffect?: {
    type: string;
    value: number;
    chance: number;
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
    | "startGameWithClass"
    | "dash"
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
          // On s'assure que les HP/Mana actuels ne dépassent pas le nouveau max
          hp: Math.min(state.player.stats.hp, Math.floor(maxHp)),
          mana: Math.min(state.player.stats.mana, Math.floor(maxMana)),
        },
      },
    }));
  },

  equipSpell: (spellId: string, slotIndex: number) => {
    const { player } = get();
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
      player: {
        ...player,
        masteries: newMasteries,
        masteryPoints: newPoints,
      },
    });
    calculateStats();
  },

  closeLevelUp: () => {
    set({ gameState: "playing" });
  },

  startGameWithClass: (classId: string) => {
    const { initGame } = get();
    const selectedClass = CLASSES.find((c) => c.id === classId) || CLASSES[0];

    // On lance le jeu normalement (reset map etc)
    initGame(false);

    // On applique ensuite le template de classe
    set((state) => {
      const newStats = { ...state.player.stats, ...selectedClass.baseStats };
      // S'assurer que HP/Mana sont au max au départ
      newStats.hp = newStats.maxHp;
      newStats.mana = newStats.maxMana;

      // Inventaire de départ
      const startInv = [...state.inventory];
      if (selectedClass.startingEquipment.potionCount > 0) {
        for (let i = 0; i < selectedClass.startingEquipment.potionCount; i++) {
          const emptyIdx = startInv.findIndex((item) => item === null);
          const potion = { ...POTION_ITEM, id: `start_pot_${i}_${Date.now()}` };
          if (emptyIdx !== -1) startInv[emptyIdx] = potion;
          else if (startInv.length < 30) startInv.push(potion);
        }
      }

      return {
        player: {
          ...state.player,
          classId: selectedClass.id,
          stats: newStats,
          inventory: startInv,
        },
      };
    });

    get().calculateStats();
  },

  dash: () => {
    const { player, map, spawnParticles, addLog } = get();
    const now = Date.now();
    const COOLDOWN = 1000;

    if (player.lastDashTime && now - player.lastDashTime < COOLDOWN) return;

    const DASH_DIST = 3;
    let dx = 0,
      dy = 0;
    switch (player.direction) {
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

    let finalX = player.position.x;
    let finalY = player.position.y;

    for (let i = 1; i <= DASH_DIST; i++) {
      const checkX = Math.round(player.position.x + dx * i);
      const checkY = Math.round(player.position.y + dy * i);
      if (
        checkY < 0 ||
        checkY >= map.length ||
        checkX < 0 ||
        checkX >= map[0].length
      )
        break;
      if (map[checkY][checkX].type === "wall") break;
      finalX = checkX;
      finalY = checkY;
    }

    if (finalX !== player.position.x || finalY !== player.position.y) {
      spawnParticles(player.position.x, player.position.y, "#fff", 5, "normal");

      set((state) => ({
        player: {
          ...state.player,
          position: { x: finalX, y: finalY },
          lastDashTime: now,
        },
        screenShake: 2,
      }));
      addLog("Dash !");
    }
  },
});
