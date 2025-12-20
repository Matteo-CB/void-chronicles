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
    | "gainXp"
    | "levelUp"
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

    // 1. Stats de base (Calcul automatique)
    const levelBonus = (player.level - 1) * 0.5;

    let atk = 10 + player.stats.strength * 3.0 + levelBonus;
    let maxHp = 100 + player.stats.endurance * 12 + player.level * 10;
    let maxMana = 50 + player.stats.wisdom * 10 + player.level * 5;

    let crit = 0.05 + player.stats.agility * 0.02;
    let dodge = 0 + player.stats.agility * 0.01;
    let armorPen = 0 + player.stats.accuracy * 2;
    let spellPwr = 0 + player.stats.arcane * 4;
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
      if (player.equipment.armor.stats?.speed)
        dodge += player.equipment.armor.stats.speed * 0.1;
    }

    if (player.equipment.accessory) {
      const accStats = player.equipment.accessory.stats || {};
      maxHp += accStats.maxHp || 0;
      maxMana += accStats.maxMana || 0;
      crit += accStats.critChance || 0;
      critDmg = Math.max(critDmg, accStats.critDamage || 1.5);
      atk += accStats.attack || 0;
      def += accStats.defense || 0;
      dodge += accStats.dodgeChance || 0;
      lifesteal += accStats.lifesteal || 0;
      spellPwr += accStats.spellPower || 0;
    }

    // 3. Bonus de Maîtrises (Passifs)
    if (player.masteries) {
      player.masteries.forEach((m: any) => {
        const rank = m.currentRank || 1;
        const id = m.id || m;

        if ((m.type === "passive" || typeof m === "string") && rank > 0) {
          if (id === "m_ring_might") atk *= 1 + 0.1 * rank;
          if (id === "m_relic_life") maxHp += 25 * rank;
          if (id === "m_boots_speed") dodge += 0.02 * rank;
          if (id === "m_gem_focus") cdr += 0.05 * rank;
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
    const newEquipped = [...player.equippedSpells];
    newEquipped[slotIndex] = spellId;
    set({ player: { ...player, equippedSpells: newEquipped } });
  },

  incrementAttribute: (attr: string) => {
    // Désactivé (Auto-scale)
  },

  unlockMastery: (masteryId: string) => {
    const { createMasterySlice } = get() as any;
    if (createMasterySlice?.unlockMastery) {
      createMasterySlice.unlockMastery(masteryId);
    }
  },

  closeLevelUp: () => {
    set({ gameState: "playing" });
  },

  startGameWithClass: (classId: string) => {
    const { initGame } = get();
    const selectedClass = CLASSES.find((c) => c.id === classId) || CLASSES[0];

    initGame(false);

    set((state) => {
      const newStats = { ...state.player.stats, ...selectedClass.baseStats };
      newStats.hp = newStats.maxHp;
      newStats.mana = newStats.maxMana;

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

  // --- LOGIQUE DE PROGRESSION ROBUSTE ET ATOMIQUE ---

  gainXp: (amount: number) => {
    const { player, addLog, calculateStats } = get();

    // Copie locale des valeurs pour le calcul
    let currentXp = player.xp + amount;
    let currentLevel = player.level;
    let currentXpToNext = player.xpToNext;
    let currentMasteryPoints = player.masteryPoints;
    let currentStats = { ...player.stats };

    let leveledUp = false;
    let levelsGained = 0;

    // Boucle tant qu'on a assez d'XP pour monter
    while (currentXp >= currentXpToNext) {
      currentXp -= currentXpToNext;
      currentLevel++;

      // Augmentation progressive du coût du prochain niveau (x1.5)
      currentXpToNext = Math.floor(currentXpToNext * 1.5);

      // Récompenses
      currentMasteryPoints += 1; // +1 Point d'Âme
      levelsGained++;
      leveledUp = true;

      // Soin complet
      currentStats.hp = currentStats.maxHp;
      currentStats.mana = currentStats.maxMana;
    }

    // MISE À JOUR UNIQUE DU STORE (Évite les conflits)
    set((state) => ({
      player: {
        ...state.player,
        xp: currentXp,
        level: currentLevel,
        xpToNext: currentXpToNext,
        masteryPoints: currentMasteryPoints,
        stats: leveledUp
          ? {
              ...state.player.stats,
              hp: state.player.stats.maxHp,
              mana: state.player.stats.maxMana,
            }
          : state.player.stats,
      },
      // Effets visuels si niveau gagné
      screenShake: leveledUp ? 10 : state.screenShake,
      particles: leveledUp
        ? ([
            ...state.particles,
            ...Array.from({ length: 30 }, () => ({
              id: Math.random(),
              x: state.player.position.x,
              y: state.player.position.y,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              life: 2.0,
              color: "#fbbf24",
              size: Math.random() * 0.2 + 0.1,
              gravity: 0.01,
              type: "spark",
            })),
          ] as any)
        : state.particles,
      floatingTexts: leveledUp
        ? [
            ...state.floatingTexts,
            {
              id: Math.random(),
              x: state.player.position.x,
              y: state.player.position.y - 2,
              text: `NIVEAU ${currentLevel}!`,
              color: "#fbbf24",
              life: 3.0,
              velocity: 0.02,
              isCrit: true,
            },
          ]
        : state.floatingTexts,
    }));

    if (leveledUp) {
      addLog(`✨ NIVEAU ${currentLevel} ATTEINT ! (+${levelsGained} Talents)`);
      calculateStats(); // Recalcule les stats basées sur le nouveau niveau
    } else {
      // Log optionnel pour l'XP
      // addLog(`+${amount} XP`);
    }
  },

  // Fonction purement visuelle/helper maintenant, la logique est dans gainXp
  levelUp: () => {
    // Cette fonction est gardée pour compatibilité si appelée manuellement,
    // mais gainXp fait tout le travail maintenant.
    get().gainXp(0);
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
