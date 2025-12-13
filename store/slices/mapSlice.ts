import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { generateDungeon } from "@/lib/dungeon";
import { POTION_ITEM, generateLoot } from "@/lib/data/items";
import { Direction } from "@/types/game";

export const createMapSlice: StateCreator<GameStore, [], [], any> = (
  set,
  get
) => ({
  map: [],
  dungeonLevel: 1,

  initGame: async (loadSave: boolean = false) => {
    set({ isLoading: true });
    if (!loadSave) await new Promise((r) => setTimeout(r, 1000));

    if (loadSave) {
      const saved = localStorage.getItem("void_chronicles_save");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (!data.player.equippedSpells) {
            data.player.equippedSpells = ["", "", ""];
          }
          if (!data.player.learnedSpells) {
            data.player.learnedSpells = [];
          }
          set({ ...data, isLoading: false, gameState: "playing" });
          get().addLog("Partie chargée.");
          return;
        } catch (e) {
          console.error("Save corrupted", e);
        }
      }
    }

    const { map, spawn, entities, levelConfig } = generateDungeon(1);
    const startPotions = [
      { ...POTION_ITEM, id: "start_pot_1" },
      { ...POTION_ITEM, id: "start_pot_2" },
    ];

    set({
      map,
      enemies: entities,
      levelTheme: {
        floorColor: levelConfig.colors.floor,
        wallColor: levelConfig.colors.wall,
        wallSideColor: levelConfig.colors.wallSide,
        name: levelConfig.name,
      },
      player: {
        ...get().player,
        position: spawn,
        level: 1,
        xp: 0,
        gold: 0,
        equipment: { weapon: null, armor: null, accessory: null },
        stats: {
          hp: 150,
          maxHp: 150,
          mana: 100,
          maxMana: 100,
          attack: 15,
          defense: 5,
          speed: 1,
          xpValue: 0,
        },
        spells: [],
        learnedSpells: [],
        equippedSpells: ["", "", ""],
      },
      gameState: "dialogue",
      currentDialogue: `${levelConfig.name}\n\n${levelConfig.description}`,
      dungeonLevel: 1,
      inventory: startPotions,
      log: ["Début de l'aventure."],
      particles: [],
      floatingTexts: [],
      screenShake: 0,
      isLoading: false,
    });
  },

  saveGame: () => {
    const state = get();
    const saveState = {
      map: state.map,
      player: state.player,
      enemies: state.enemies,
      inventory: state.inventory,
      dungeonLevel: state.dungeonLevel,
      turn: state.turn,
      levelTheme: state.levelTheme,
    };
    localStorage.setItem("void_chronicles_save", JSON.stringify(saveState));
  },

  movePlayerMapLogic: (direction: Direction) => {
    const {
      player,
      map,
      enemies,
      interactMapLogic,
      processEnemyTurn,
      addItem,
      addLog,
      addEffects,
      dungeonLevel,
      saveGame,
    } = get();

    if (player.direction !== direction) {
      set({ player: { ...player, direction } });
    }

    let dx = 0,
      dy = 0;
    if (direction === "up") dy = -1;
    if (direction === "down") dy = 1;
    if (direction === "left") dx = -1;
    if (direction === "right") dx = 1;

    const targetX = player.position.x + dx;
    const targetY = player.position.y + dy;

    if (
      targetY < 0 ||
      targetY >= map.length ||
      targetX < 0 ||
      targetX >= map[0].length
    )
      return;

    const tile = map[targetY][targetX];
    if (tile.type === "wall") return;

    const entitiesOnTarget = enemies.filter(
      (e) => e.position.x === targetX && e.position.y === targetY && !e.isHidden
    );

    // CORRECTION : "stairs" retiré des bloqueurs pour pouvoir marcher dessus
    const blocker = entitiesOnTarget.find(
      (e) =>
        e.isHostile ||
        e.type === "chest" ||
        e.type === "merchant" ||
        e.type === "shrine"
    );

    if (blocker) {
      interactMapLogic();
      return;
    }

    // Déplacement
    set((state) => ({
      player: { ...state.player, position: { x: targetX, y: targetY } },
    }));

    // GESTION OBJETS (Or / Potion)
    const loot = entitiesOnTarget.filter(
      (e) => e.type === "gold" || e.type === "potion"
    );

    if (loot.length > 0) {
      let newEnemies = [...get().enemies];

      loot.forEach((item) => {
        if (item.type === "gold") {
          const amount = item.value || 10;
          set((s) => ({
            player: { ...s.player, gold: s.player.gold + amount },
          }));
          addLog(`Ramassé : ${amount} Or`);
          addEffects(targetX, targetY, "#fbbf24", 10, `+${amount}`, "#fbbf24");
          newEnemies = newEnemies.filter((e) => e.id !== item.id);
        } else if (item.type === "potion") {
          const potion = { ...POTION_ITEM, id: `found_pot_${Math.random()}` };
          addItem(potion);
          newEnemies = newEnemies.filter((e) => e.id !== item.id);
        }
      });
      set({ enemies: newEnemies });
    }

    // GESTION ESCALIERS (Si on marche dessus)
    const stairs = entitiesOnTarget.find(
      (e) => e.type === "stairs" && !e.isHidden
    );
    if (stairs) {
      addLog("Vous descendez les escaliers...");
      const next = dungeonLevel + 1;
      set({ isLoading: true });

      // Petit délai pour la transition
      setTimeout(() => {
        const { generateDungeon } = require("../../lib/dungeon");
        const { map, spawn, entities, levelConfig } = generateDungeon(next);
        set({
          map,
          enemies: entities,
          player: { ...player, position: spawn },
          dungeonLevel: next,
          levelTheme: {
            floorColor: levelConfig.colors.floor,
            wallColor: levelConfig.colors.wall,
            wallSideColor: levelConfig.colors.wallSide,
            name: levelConfig.name,
          },
          isLoading: false,
          gameState: "dialogue",
          currentDialogue: levelConfig.name,
        });
        saveGame();
      }, 500);
      return; // Pas de tour ennemi pendant le chargement
    }

    processEnemyTurn();
  },

  interactMapLogic: () => {
    const { player, enemies, dungeonLevel, addItem, addLog, addEffects } =
      get();

    let dx = 0;
    let dy = 0;
    if (player.direction === "up") dy = -1;
    if (player.direction === "down") dy = 1;
    if (player.direction === "left") dx = -1;
    if (player.direction === "right") dx = 1;

    const contactPos = { x: player.position.x + dx, y: player.position.y + dy };
    const contactTarget = enemies.find(
      (e) =>
        e.position.x === contactPos.x &&
        e.position.y === contactPos.y &&
        !e.isHidden
    );

    const weaponRange = player.equipment?.weapon?.range || 1;
    let attackTarget = null;
    for (let i = 1; i <= weaponRange; i++) {
      const tX = player.position.x + dx * i;
      const tY = player.position.y + dy * i;
      const t = enemies.find(
        (e) =>
          e.position.x === tX &&
          e.position.y === tY &&
          e.isHostile &&
          !e.isHidden
      );
      if (t) {
        attackTarget = t;
        break;
      }
      if (get().map[tY]?.[tX]?.type === "wall") break;
    }

    if (attackTarget) {
      let dmg = Math.max(1, player.stats.attack - attackTarget.stats.defense);
      const newHp = attackTarget.stats.hp - dmg;
      addEffects(
        attackTarget.position.x,
        attackTarget.position.y,
        "#fff",
        10,
        `-${dmg}`,
        "#f00"
      );
      addLog(`Coup sur ${attackTarget.name}`);
      let newEnemies = enemies.map((e) =>
        e.id === attackTarget.id
          ? { ...e, stats: { ...e.stats, hp: newHp } }
          : e
      );
      if (newHp <= 0) {
        newEnemies = newEnemies.filter((e) => e.id !== attackTarget.id);
        addLog(`${attackTarget.name} vaincu.`);
        if (Math.random() > 0.6) addItem(generateLoot(dungeonLevel));
        const xp = attackTarget.stats.xpValue || 10;
        const newXp = player.xp + xp;
        if (newXp >= player.xpToNext) {
          set((s) => ({
            player: {
              ...s.player,
              level: s.player.level + 1,
              xp: 0,
              xpToNext: Math.floor(s.player.xpToNext * 1.5),
              stats: {
                ...s.player.stats,
                maxHp: s.player.stats.maxHp + 20,
                maxMana: s.player.stats.maxMana + 10,
                hp: s.player.stats.maxHp + 20,
                mana: s.player.stats.maxMana + 10,
              },
            },
          }));
          addLog("NIVEAU SUPÉRIEUR !");
          addEffects(
            player.position.x,
            player.position.y,
            "#fbbf24",
            50,
            "LEVEL UP",
            "#fbbf24"
          );
        } else {
          set((s) => ({ player: { ...s.player, xp: newXp } }));
        }

        // --- VERIFICATION DE VICTOIRE (Escalier Apparition) ---
        const remainingHostiles = newEnemies.filter(
          (e) => e.isHostile && e.stats.hp > 0
        );

        if (remainingHostiles.length === 0) {
          const stairsIdx = newEnemies.findIndex((e) => e.type === "stairs");
          if (stairsIdx !== -1 && newEnemies[stairsIdx].isHidden) {
            newEnemies[stairsIdx] = {
              ...newEnemies[stairsIdx],
              isHidden: false,
            };
            set({ screenShake: 40 });
            addEffects(
              newEnemies[stairsIdx].position.x,
              newEnemies[stairsIdx].position.y,
              "#FCD34D",
              150,
              "DÉLIVRANCE !",
              "#FFF"
            );
            addLog("Une brèche lumineuse s'ouvre !");
          }
        }
      }
      set({ enemies: newEnemies });
      get().processEnemyTurn();
      return;
    }

    if (contactTarget) {
      if (contactTarget.type === "chest" && !contactTarget.isOpen) {
        const loot = generateLoot(dungeonLevel);
        addItem(loot);
        addLog(`Coffre: ${loot.name}`);
        set({
          enemies: enemies.map((e) =>
            e.id === contactTarget.id ? { ...e, isOpen: true } : e
          ),
        });
        addEffects(
          contactTarget.position.x,
          contactTarget.position.y,
          "#fbbf24",
          20,
          "OUVERT",
          "#fff"
        );
      } else if (contactTarget.type === "shrine") {
        addLog("Sanctuaire : Mana Infini !");
        set({
          player: { ...player, stats: { ...player.stats, mana: 999 } },
          enemies: enemies.filter((e) => e.id !== contactTarget.id),
        });
        addEffects(
          player.position.x,
          player.position.y,
          "#00ffff",
          50,
          "PUISSANCE",
          "#fff"
        );
      } else if (contactTarget.type === "merchant") {
        set({ gameState: "shop", currentMerchantId: contactTarget.id });
      }
    }
  },
});
