import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { generateDungeon } from "@/lib/dungeon";
import { calculateFOV } from "@/lib/dungeon/fov";
import { POTION_ITEM } from "@/lib/data/items";
import { Direction } from "@/types/game";
// CORRECTION : Suppression de l'import incorrect
// import { getInitialMasteries } from "@/lib/data/masteries";
import { handleMovePlayer } from "./map/mapMovement";
import storyData from "@/lib/data/storyData.json";
// AJOUT : Import de la base de données des quêtes
import { QUEST_DB } from "@/lib/data/quests";

const STAIRS_STATS = {
  hp: 1000,
  maxHp: 1000,
  mana: 0,
  xpGain: 0,
  hpRegen: 0,
  maxMana: 0,
  attack: 0,
  attackSpeed: 0,
  defense: 0,
  speed: 0,
  xpValue: 0,
  critChance: 0,
  critDamage: 0,
  dodgeChance: 0,
  lifesteal: 0,
  armorPen: 0,
  cooldownReduction: 0,
  spellPower: 0,
  strength: 0,
  endurance: 0,
  agility: 0,
  wisdom: 0,
  willpower: 0,
  luck: 0,
  accuracy: 0,
  arcane: 0,
};

const SAVE_KEY_PREFIX = "void_chronicles_save_slot_";

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
  currentSlot: 1,

  initGame: async (loadSave: boolean = false, slotId: number = 1) => {
    set({ isLoading: true, currentSlot: slotId });

    await new Promise((r) => setTimeout(r, 600));

    let currentLevel = 1;
    let loadedData: any = null;
    const storageKey = `${SAVE_KEY_PREFIX}${slotId}`;

    if (loadSave) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          loadedData = JSON.parse(saved);
          if (!loadedData.map || loadedData.map.length === 0) {
            console.warn("Sauvegarde corrompue, nouvelle partie forcée.");
            loadedData = null;
          } else {
            currentLevel = loadedData.dungeonLevel || 1;
            if (loadedData.player) {
              let fixedGold = Number(loadedData.player.gold);
              if (isNaN(fixedGold)) fixedGold = 0;
              loadedData.player.gold = fixedGold;
            }
          }
        } catch (e) {
          console.error("Erreur save:", e);
          loadedData = null;
        }
      }
    }

    set({
      currentCutsceneId: null,
      currentDialogue: undefined,
      isLoading: false,
    });

    if (loadedData) {
      let enemies = loadedData.enemies || [];
      // Force le recalcul du FOV (Réparateur d'écran noir)
      let safeMap = calculateFOV(loadedData.map, loadedData.player.position);

      const hasStairs = enemies.some((e: any) => e.type === "stairs");
      if (!hasStairs) {
        let stairsX = 1;
        let stairsY = 1;
        for (let y = safeMap.length - 2; y > 1; y--) {
          for (let x = safeMap[0].length - 2; x > 1; x--) {
            if (safeMap[y][x].type === "floor") {
              stairsX = x;
              stairsY = y;
              break;
            }
          }
          if (stairsX !== 1) break;
        }
        enemies.push({
          id: "stairs_rescue",
          type: "stairs",
          name: "Sortie",
          spriteKey: "STAIRS",
          position: { x: stairsX, y: stairsY },
          stats: STAIRS_STATS,
          isHostile: false,
          isHidden: true,
        });
      }

      set({
        ...loadedData,
        map: safeMap,
        enemies,
        gameState: "playing",
        isLoading: false,
      });
    } else {
      // --- NOUVELLE PARTIE ---
      const { map, spawn, entities, levelConfig } = generateDungeon(
        currentLevel
      );
      const mapWithFOV = calculateFOV(map, spawn);

      set({
        map: mapWithFOV,
        enemies: entities,
        levelTheme: {
          floorColor: levelConfig?.floorColor || "#27272a", // Fallbacks couleurs
          wallColor: levelConfig?.wallColor || "#52525b",
          wallSideColor: levelConfig?.wallSideColor || "#3f3f46",
          name: levelConfig?.name || "Zone Inconnue",
        },
        player: {
          ...(get().player || {}),
          position: spawn,
          level: 1,
          gold: 0,
          stats: {
            hp: 150,
            maxHp: 150,
            mana: 100,
            xpGain: 0,
            hpRegen: 0,
            attackSpeed: 1,
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
          learnedSpells: [], // Préservé
          equippedSpells: [null, null, null], // NULL autorisé par ton types.ts
          statusEffects: [],
          xpToNext: 100,
          attributePoints: 0,
          masteryPoints: 0,
          // CORRECTION: Initialisation vide directe au lieu de la fonction manquante
          masteries: [],
          equipment: { weapon: null, armor: null, accessory: null },
          quests: [], // Reset des quêtes
        },
        dungeonLevel: currentLevel,
        inventory: [{ ...POTION_ITEM, id: "p1" }],
        logs: [],
        particles: [],
        floatingTexts: [],
        projectiles: [],
        screenShake: 0,
        speechBubbles: [],
        isLoading: false,
        gameState: "playing",
      });

      // --- TRIGGER QUÊTE DU TUTORIEL ---
      // On lance la première quête pour guider le joueur
      get().acceptQuest(QUEST_DB.TUTO_FIRST_STEPS);

      const story = storyData as any;
      const evt = story.levelEvents[currentLevel.toString()];
      if (evt && evt.introCutsceneId) {
        set({ gameState: "dialogue" });
        setTimeout(() => get().startCutscene(evt.introCutsceneId), 100);
      }
      get().saveGame();
    }
  },

  saveGame: () => {
    const state = get();
    if (state.gameState === "gameover" || state.isLoading) return;

    const slotId = (state as any).currentSlot || 1;
    const saveState = {
      map: state.map,
      player: state.player,
      enemies: state.enemies,
      inventory: state.inventory,
      dungeonLevel: state.dungeonLevel,
      levelTheme: state.levelTheme,
      currentSlot: slotId,
    };
    localStorage.setItem(
      `${SAVE_KEY_PREFIX}${slotId}`,
      JSON.stringify(saveState)
    );

    const metaKey = "void_chronicles_meta";
    const meta = JSON.parse(localStorage.getItem(metaKey) || "{}");
    meta[slotId] = {
      date: new Date().toLocaleDateString(),
      level: state.player.level,
      floor: state.dungeonLevel,
      gold: state.player.gold,
    };
    localStorage.setItem(metaKey, JSON.stringify(meta));
  },

  movePlayerMapLogic: (direction: Direction) =>
    handleMovePlayer(set, get, direction),

  interactMapLogic: () => {
    const {
      player,
      enemies,
      addItem,
      addLog,
      startCutscene,
      updateQuestProgress,
    } = get();
    let dx = 0,
      dy = 0;
    if (player.direction === "up") dy = -1;
    if (player.direction === "down") dy = 1;
    if (player.direction === "left") dx = -1;
    if (player.direction === "right") dx = 1;

    const tX = player.position.x + dx;
    const tY = player.position.y + dy;

    const target = enemies.find(
      (e) =>
        Math.round(e.position.x) === tX &&
        Math.round(e.position.y) === tY &&
        !e.isHidden &&
        !e.isDead &&
        e.type !== "rubble"
    );

    if (target) {
      if (target.type === "chest" && !target.isOpen) {
        const currentLevel = get().dungeonLevel || 1;
        const loot = require("@/lib/data/items").generateLoot(currentLevel);
        if (addItem(loot)) {
          addLog(`Trésor découvert : ${loot.name}`);
          set({
            enemies: enemies.map((e) =>
              e.id === target.id ? { ...e, isOpen: true } : e
            ),
          });

          // --- TRIGGER QUÊTE : COLLECTE ---
          // On notifie le système de quête qu'on a ramassé un objet
          updateQuestProgress("collect", loot.id, 1);
        }
      } else if (target.type === "merchant") {
        set({ gameState: "shop", currentMerchantId: target.id });
      } else if (target.type === "stairs") {
        const nextLevel = (get().dungeonLevel || 1) + 1;
        set({ isLoading: true });
        set({ currentCutsceneId: null, currentDialogue: undefined });

        setTimeout(() => {
          const { map, spawn, entities, levelConfig } = generateDungeon(
            nextLevel
          );
          const mapWithFOV = calculateFOV(map, spawn);
          const story = storyData as any;
          const levelEvent = story.levelEvents[nextLevel.toString()];

          set({
            map: mapWithFOV,
            enemies: entities,
            levelTheme: {
              floorColor: levelConfig?.floorColor || "#27272a",
              wallColor: levelConfig?.wallColor || "#52525b",
              wallSideColor: levelConfig?.wallSideColor || "#3f3f46",
              name: levelConfig?.name || "Zone Inconnue",
            },
            player: { ...get().player, position: spawn },
            dungeonLevel: nextLevel,
            isLoading: false,
          });

          // --- TRIGGER QUÊTE : EXPLORATION ---
          // On valide les objectifs de type "Atteindre le niveau X"
          updateQuestProgress("explore", nextLevel.toString());

          if (levelEvent && levelEvent.introCutsceneId) {
            startCutscene(levelEvent.introCutsceneId);
          } else {
            set({ gameState: "playing", currentDialogue: undefined });
          }
          get().saveGame();
        }, 500);
      }
    }
  },
});
