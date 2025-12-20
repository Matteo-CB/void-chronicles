import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { SpeechBubble, GameState, Direction } from "@/types/game";
import { MASTERY_TREE } from "@/lib/data/masteries";

// --- AJOUT SÉCURITÉ ---
// Variable locale hors du store pour gérer le délai sans modifier tes types globaux
let lastTabActionTime = 0;

export const createUISlice: StateCreator<
  GameStore,
  [],
  [],
  Pick<
    GameStore,
    | "setInputMethod"
    | "advanceDialogue"
    | "startCutscene"
    | "advanceCutscene"
    | "addLog"
    | "closeUi"
    | "triggerAttackAnim"
    | "addSpeechBubble"
    | "removeSpeechBubble"
    | "setGameState"
    | "navigateMenu"
    | "spawnParticles"
    | "setMenuSelectionIndex"
    | "cycleMenuTab"
    | "confirmMenuAction"
  >
> = (set, get) => ({
  logs: [],
  floatingTexts: [],
  particles: [],
  screenShake: 0,
  isLoading: true,
  currentDialogue: undefined,
  currentCutsceneId: null,
  currentMerchantId: undefined,
  attackAnims: [],
  speechBubbles: [],
  inputMethod: "keyboard",
  menuSelectionIndex: 0,

  setGameState: (newState: GameState) => {
    set({ gameState: newState, menuSelectionIndex: 0 });
  },

  setMenuSelectionIndex: (index: number) => {
    set({ menuSelectionIndex: index });
  },

  setInputMethod: (method: "keyboard" | "gamepad") => {
    if (get().inputMethod !== method) {
      set({ inputMethod: method });
    }
  },

  // --- CORRECTION ICI : GESTION ROBUSTE DES ONGLETS ---
  cycleMenuTab: (direction: "next" | "prev") => {
    // 1. SÉCURITÉ ANTI-DOUBLE CLIC
    // Si la fonction est rappelée moins de 200ms après la dernière fois, on ignore.
    const now = Date.now();
    if (now - lastTabActionTime < 200) return;
    lastTabActionTime = now;

    const currentState = get().gameState;
    const tabs: GameState[] = ["inventory", "spellbook", "quests", "masteries"];

    // Si on n'est pas dans un menu, on ouvre l'inventaire
    if (!tabs.includes(currentState)) {
      set({ gameState: "inventory", menuSelectionIndex: 0 });
      return;
    }

    const currentIndex = tabs.indexOf(currentState);
    let newIndex;

    // 2. LOGIQUE CIRCULAIRE
    if (direction === "next") {
      newIndex = currentIndex + 1;
      if (newIndex >= tabs.length) newIndex = 0; // Retour au début
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = tabs.length - 1; // Retour à la fin
    }

    set({ gameState: tabs[newIndex], menuSelectionIndex: 0 });
  },

  confirmMenuAction: () => {
    const state = get();
    const {
      gameState,
      menuSelectionIndex,
      unlockMastery,
      player,
      inventory,
      equipItem,
      useItem,
      equipSpell,
      enemies,
      currentMerchantId,
      buyItem,
      unequipItem,
    } = state;

    if (gameState === "masteries") {
      // Sécurité : on prend le noeud ou le premier par défaut pour éviter le crash
      const node = MASTERY_TREE[menuSelectionIndex] || MASTERY_TREE[0];
      if (node) {
        unlockMastery(node.id);
      }
    } else if (gameState === "inventory") {
      if (menuSelectionIndex >= 100) {
        // Déséquiper
        const slot =
          menuSelectionIndex === 100
            ? "weapon"
            : menuSelectionIndex === 101
            ? "armor"
            : "accessory";
        if (player.equipment[slot]) unequipItem(slot);
      } else {
        // Utiliser / Equiper
        const item = inventory[menuSelectionIndex];
        if (item) {
          if (
            ["potion", "scroll", "spellbook", "consumable"].includes(item.type)
          ) {
            useItem(item.id);
          } else {
            equipItem(item);
          }
        }
      }
    } else if (gameState === "spellbook") {
      if (menuSelectionIndex < 100) {
        const spell = player.spells[menuSelectionIndex];
        if (spell) equipSpell(spell.id, 0);
      }
    } else if (gameState === "shop") {
      const merchant = enemies.find((e) => e.id === currentMerchantId);
      if (merchant && merchant.shopInventory) {
        const item = merchant.shopInventory[menuSelectionIndex];
        if (item) buyItem(item);
      }
    }
  },

  navigateMenu: (dir: Direction) => {
    const state = get();
    const {
      gameState,
      menuSelectionIndex,
      player,
      enemies,
      currentMerchantId,
    } = state;

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
          if (newIndex + 1 < TOTAL_INV) newIndex += 1;
        }
        set({ menuSelectionIndex: newIndex });
      }
    } else if (gameState === "spellbook") {
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
    } else if (gameState === "quests") {
      const quests = player.quests || [];
      const maxQuests = Math.max(0, quests.length - 1);
      if (dir === "up")
        set({ menuSelectionIndex: Math.max(0, menuSelectionIndex - 1) });
      if (dir === "down")
        set({
          menuSelectionIndex: Math.min(maxQuests, menuSelectionIndex + 1),
        });
    } else if (gameState === "masteries") {
      // --- NAVIGATION ARBRE DE TALENTS ---
      let currentIndex = menuSelectionIndex;
      if (currentIndex < 0 || currentIndex >= MASTERY_TREE.length)
        currentIndex = 0;

      const current = MASTERY_TREE[currentIndex];
      if (!current || current.x === undefined || current.y === undefined) {
        set({ menuSelectionIndex: 0 });
        return;
      }

      const currentX = current.x;
      const currentY = current.y;

      let bestCandidate = -1;
      let minDist = 9999;

      MASTERY_TREE.forEach((node, idx) => {
        if (idx === currentIndex) return;
        if (node.x === undefined || node.y === undefined) return;

        let isValidDirection = false;
        const dx = node.x - currentX;
        const dy = node.y - currentY;

        switch (dir) {
          case "up":
            isValidDirection = dy < 0 && Math.abs(dx) <= Math.abs(dy) * 1.5;
            break;
          case "down":
            isValidDirection = dy > 0 && Math.abs(dx) <= Math.abs(dy) * 1.5;
            break;
          case "left":
            isValidDirection = dx < 0 && Math.abs(dy) <= Math.abs(dx) * 1.5;
            break;
          case "right":
            isValidDirection = dx > 0 && Math.abs(dy) <= Math.abs(dx) * 1.5;
            break;
        }

        if (isValidDirection) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            bestCandidate = idx;
          }
        }
      });

      if (bestCandidate !== -1) {
        set({ menuSelectionIndex: bestCandidate });
      }
    } else if (gameState === "shop") {
      const merchant = enemies.find((e) => e.id === currentMerchantId);
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
        if (newIndex > 0) newIndex -= 1;
      } else if (dir === "right") {
        if (newIndex + 1 < totalItems) newIndex += 1;
      }
      set({ menuSelectionIndex: newIndex });
    } else if (gameState === "levelup") {
      if (dir === "up" && menuSelectionIndex > 0)
        set({ menuSelectionIndex: menuSelectionIndex - 1 });
      if (dir === "down" && menuSelectionIndex < 3)
        set({ menuSelectionIndex: menuSelectionIndex + 1 });
    }
  },

  advanceDialogue: () => {
    set({ currentDialogue: undefined, gameState: "playing" });
  },
  startCutscene: (id: string) => {
    set({ currentCutsceneId: id, gameState: "dialogue" });
  },
  advanceCutscene: () => {
    set({ currentCutsceneId: null, gameState: "playing" });
  },
  addLog: (msg: string) => {
    set((state) => ({ logs: [...state.logs, msg].slice(-20) }));
  },
  closeUi: () => {
    set({ gameState: "playing", currentMerchantId: undefined });
  },
  triggerAttackAnim: (x: number, y: number, dir: string, type: string) => {
    const id = Math.random().toString();
    const validDir = ["up", "down", "left", "right"].includes(dir)
      ? dir
      : "down";
    set((state) => ({
      attackAnims: [
        ...state.attackAnims,
        { x, y, dir: validDir as any, type, progress: 0, id },
      ],
    }));
    let p = 0;
    const interval = setInterval(() => {
      p += 0.1;
      if (p >= 1) {
        clearInterval(interval);
        set((s) => ({ attackAnims: s.attackAnims.filter((a) => a.id !== id) }));
      } else {
        set((s) => ({
          attackAnims: s.attackAnims.map((a) =>
            a.id === id ? { ...a, progress: p } : a
          ),
        }));
      }
    }, 30);
  },
  addSpeechBubble: (bubble: SpeechBubble) => {
    set((state) => ({ speechBubbles: [...state.speechBubbles, bubble] }));
    setTimeout(() => {
      get().removeSpeechBubble(bubble.id);
    }, bubble.duration);
  },
  removeSpeechBubble: (id: string) => {
    set((state) => ({
      speechBubbles: state.speechBubbles.filter((b) => b.id !== id),
    }));
  },
  spawnParticles: (
    x: number,
    y: number,
    color: string,
    count: number,
    type: "blood" | "spark" | "normal" = "normal"
  ) => {
    const newParticles: any[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.15;
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: color,
        size: Math.random() * 0.1 + 0.05,
        gravity: type === "blood" ? 0.02 : 0,
        type: type,
      });
    }
    set((s) => ({ particles: [...s.particles, ...newParticles] } as any));
  },
});
