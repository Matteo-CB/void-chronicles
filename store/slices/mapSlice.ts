import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { generateDungeon } from "@/lib/dungeon";
import { POTION_ITEM } from "@/lib/data/items";
import { Direction } from "@/types/game";
import { getInitialMasteries } from "@/lib/data/masteries";
import { handleMovePlayer } from "./map/mapMovement";
import storyData from "@/lib/data/storyData.json";

export const createMapSlice: StateCreator<
  GameStore,
  [],
  [],
  Pick<
    GameStore,
    "initGame" | "saveGame" | "movePlayerMapLogic" | "interactMapLogic"
  >
> = (set, get) => ({
  map: [],
  dungeonLevel: 1,

  initGame: async (loadSave: boolean = false) => {
    set({ isLoading: true });
    if (!loadSave) await new Promise((r) => setTimeout(r, 500));

    let currentLevel = 1;
    let loadedData: any = null;

    if (loadSave) {
      const saved = localStorage.getItem("void_chronicles_save");
      if (saved) {
        try {
          loadedData = JSON.parse(saved);
          currentLevel = loadedData.dungeonLevel || 1;
        } catch (e) {
          console.error(e);
        }
      }
    }

    // --- CORRECTION : Utilisation de undefined au lieu de null pour currentDialogue ---
    set({
      currentCutsceneId: null, // Autorisé car typé string | null
      currentDialogue: undefined, // CORRECTION: Typé string | undefined
      gameState: "playing",
      isLoading: false,
    });

    if (loadedData) {
      set({ ...loadedData, isLoading: false, gameState: "playing" });
    } else {
      const { map, spawn, entities, levelConfig } =
        generateDungeon(currentLevel);

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
          ...(get().player || {}),
          position: spawn,
          level: 1,
          stats: {
            hp: 150,
            maxHp: 150,
            mana: 100,
            maxMana: 100,
            attack: 10,
            defense: 2,
            speed: 1,
            xpValue: 0,
            critChance: 0.05,
            critDamage: 1.5,
            dodgeChance: 0,
            lifesteal: 0,
            armorPen: 0,
            cooldownReduction: 0,
            spellPower: 0,
            strength: 1,
            endurance: 1,
            agility: 1,
            wisdom: 1,
            willpower: 1,
            luck: 1,
            accuracy: 1,
            arcane: 1,
          },
          spells: [],
          learnedSpells: [],
          equippedSpells: [null, null, null],
          statusEffects: [],
          xpToNext: 100,
          attributePoints: 0,
          masteryPoints: 0,
          masteries: getInitialMasteries(),
        },
        gameState: "playing",
        dungeonLevel: currentLevel,
        inventory: [{ ...POTION_ITEM, id: "p1" }],
        logs: [],
        particles: [],
        floatingTexts: [],
        projectiles: [],
        screenShake: 0,
        speechBubbles: [],
        isLoading: false,
      });
    }

    // --- GESTION DE L'HISTOIRE ---
    const story = storyData as any;
    const levelEvent = story.levelEvents[currentLevel.toString()];

    // On ne lance la cutscene QUE si un événement existe
    if (levelEvent && levelEvent.introCutsceneId) {
      get().startCutscene(levelEvent.introCutsceneId);
    }
  },

  saveGame: () => {
    const state = get();
    const saveState = {
      map: state.map,
      player: state.player,
      enemies: state.enemies,
      inventory: state.inventory,
      dungeonLevel: state.dungeonLevel,
      levelTheme: state.levelTheme,
    };
    localStorage.setItem("void_chronicles_save", JSON.stringify(saveState));
  },

  movePlayerMapLogic: (direction: Direction) => {
    handleMovePlayer(set, get, direction);
  },

  interactMapLogic: () => {
    const { player, enemies, addItem, addLog } = get();
    let dx = 0;
    let dy = 0;
    if (player.direction === "up") dy = -1;
    if (player.direction === "down") dy = 1;
    if (player.direction === "left") dx = -1;
    if (player.direction === "right") dx = 1;
    const tX = player.position.x + dx;
    const tY = player.position.y + dy;

    const target = enemies.find(
      (e) =>
        e.position.x === tX &&
        e.position.y === tY &&
        !e.isHidden &&
        !e.isDead &&
        e.type !== "rubble"
    );

    if (target) {
      if (target.type === "chest" && !target.isOpen) {
        const currentLevel = get().dungeonLevel || 1;
        const loot = require("@/lib/data/items").generateLoot(currentLevel);
        addItem(loot);
        addLog(`Trouvé : ${loot.name}`);
        set({
          enemies: enemies.map((e) =>
            e.id === target.id ? { ...e, isOpen: true } : e
          ),
        });
      } else if (target.type === "merchant") {
        set({ gameState: "shop", currentMerchantId: target.id });
      } else if (target.type === "stairs") {
        const nextLevel = (get().dungeonLevel || 1) + 1;

        set({ isLoading: true });

        setTimeout(async () => {
          // Réinitialisation forcée avant le prochain niveau
          set({
            currentCutsceneId: null,
            currentDialogue: undefined, // CORRECTION ICI AUSSI
            gameState: "playing",
          });

          const { map, spawn, entities, levelConfig } =
            generateDungeon(nextLevel);
          const story = storyData as any;
          const levelEvent = story.levelEvents[nextLevel.toString()];

          set({
            map,
            enemies: entities,
            levelTheme: {
              floorColor: levelConfig.colors.floor,
              wallColor: levelConfig.colors.wall,
              wallSideColor: levelConfig.colors.wallSide,
              name: levelConfig.name,
            },
            player: { ...get().player, position: spawn },
            dungeonLevel: nextLevel,
            isLoading: false,
            gameState: "playing",
          });

          if (levelEvent && levelEvent.introCutsceneId) {
            get().startCutscene(levelEvent.introCutsceneId);
          }
        }, 500);
      }
    }
  },
});
