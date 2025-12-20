import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";

// CORRECTION: On type explicitement l'argument triggerShake
export const useKeyboard = (triggerShake: (amount: number) => void) => {
  const keysPressed = useRef<Record<string, boolean>>({});

  const movePlayer = useGameStore((state) => state.movePlayer);
  const performAttack = useGameStore((state) => state.performAttack);
  const interact = useGameStore((state) => state.interact);
  const advanceDialogue = useGameStore((state) => state.advanceDialogue);
  const setInputMethod = useGameStore((state) => state.setInputMethod);
  const dash = useGameStore((state) => state.dash);

  // Actions de Menu
  const navigateMenu = useGameStore((state) => state.navigateMenu);
  const equipItem = useGameStore((state) => state.equipItem);
  const useItem = useGameStore((state) => state.useItem);
  const unequipItem = useGameStore((state) => state.unequipItem);
  const equipSpell = useGameStore((state) => state.equipSpell);
  const buyItem = useGameStore((state) => state.buyItem);

  // NOUVEAU : Import des fonctions de navigation globale
  const cycleMenuTab = useGameStore((state) => state.cycleMenuTab);
  const confirmMenuAction = useGameStore((state) => state.confirmMenuAction);

  const inventory = useGameStore((state) => state.inventory);
  const menuSelectionIndex = useGameStore((state) => state.menuSelectionIndex);
  const player = useGameStore((state) => state.player);
  const enemies = useGameStore((state) => state.enemies);
  const currentMerchantId = useGameStore((state) => state.currentMerchantId);

  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const closeUi = useGameStore((state) => state.closeUi);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setInputMethod("keyboard");
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;

      // CORRECTION : Ajout de "masteries" ici pour que le menu soit considéré ouvert
      const isMenuOpen = [
        "inventory",
        "spellbook",
        "quests",
        "masteries",
      ].includes(gameState);

      // --- 1. OUVERTURE / FERMETURE (I) ---
      if (e.code === "KeyI") {
        if (isMenuOpen) {
          setGameState("playing");
        } else if (gameState === "playing") {
          setGameState("inventory");
        }
        return;
      }

      // --- 2. NAVIGATION ONGLETS (TAB) ---
      if (e.code === "Tab") {
        e.preventDefault();

        // --- CORRECTION CRITIQUE : Empêche le double saut d'onglet ---
        if (e.repeat) return;

        // Utilisation de la fonction du store pour cycler proprement incluant les talents
        if (gameState === "playing") {
          setGameState("inventory");
        } else {
          cycleMenuTab(e.shiftKey ? "prev" : "next");
        }
        return;
      }

      // --- 3. NAVIGATION DANS LES MENUS ---
      if (
        gameState === "inventory" ||
        gameState === "spellbook" ||
        gameState === "shop" ||
        gameState === "levelup" ||
        gameState === "quests" ||
        gameState === "masteries" // CORRECTION : Ajout de masteries
      ) {
        e.preventDefault();

        if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "KeyZ")
          navigateMenu("up");
        if (e.code === "ArrowDown" || e.code === "KeyS") navigateMenu("down");
        if (e.code === "ArrowLeft" || e.code === "KeyA" || e.code === "KeyQ")
          navigateMenu("left");
        if (e.code === "ArrowRight" || e.code === "KeyD") navigateMenu("right");

        if (e.code === "Enter" || e.code === "Space") {
          // --- CORRECTION CRITIQUE : Empêche les actions multiples involontaires ---
          if (e.repeat) return;

          if (gameState === "inventory") {
            if (menuSelectionIndex >= 100) {
              const slot =
                menuSelectionIndex === 100
                  ? "weapon"
                  : menuSelectionIndex === 101
                  ? "armor"
                  : "accessory";
              if (player.equipment[slot]) unequipItem(slot);
            } else {
              const item = inventory[menuSelectionIndex];
              if (item) {
                if (
                  item.type === "potion" ||
                  (item as any).type === "scroll" ||
                  item.type === "spellbook" ||
                  item.type === "consumable"
                )
                  useItem(item.id);
                else equipItem(item);
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
          } else if (gameState === "masteries") {
            // CORRECTION : Appel de l'action de confirmation pour les talents
            confirmMenuAction();
          }
        }

        if (gameState === "spellbook" && menuSelectionIndex < 100) {
          const spell = player.spells[menuSelectionIndex];
          if (spell) {
            if (e.key === "1") equipSpell(spell.id, 0);
            if (e.key === "2") equipSpell(spell.id, 1);
            if (e.key === "3") equipSpell(spell.id, 2);
          }
        }
      }

      // --- 4. ECHAP & RETOUR ---
      if (e.code === "Escape") {
        if (gameState === "playing") {
          setGameState("pause_menu");
        } else if (
          isMenuOpen ||
          gameState === "pause_menu" ||
          gameState === "management_menu"
        ) {
          setGameState("playing");
        } else if (gameState === "shop" || gameState === "levelup") {
          closeUi();
        }
      }

      // --- CORRECTION: Empêcher le scroll en jeu ---
      if (gameState === "playing") {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
            e.code
          )
        ) {
          e.preventDefault();
        }

        // --- AJOUT DASH ---
        if (e.code === "Space" || e.code === "ShiftLeft") {
          dash();
          // triggerShake(2); // Optionnel si dash ne le fait pas déjà via store
        }
      }

      if (gameState !== "playing" && gameState !== "dialogue") return;

      // --- 5. ACTIONS DE JEU ---
      if (["Space", "Enter", "KeyE"].includes(e.code)) {
        if (gameState === "dialogue") advanceDialogue();
        else interact();
      }

      if (e.code === "KeyK") performAttack("light");
      if (e.code === "KeyL") performAttack("heavy");
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      keysPressed.current[e.key] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      setInputMethod("keyboard");
      if (gameState === "playing") {
        if (e.button === 0) performAttack("light");
        if (e.button === 2) performAttack("heavy");
      } else if (gameState === "dialogue") advanceDialogue();
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (gameState === "playing") e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [
    gameState,
    movePlayer,
    performAttack,
    interact,
    advanceDialogue,
    setInputMethod,
    setGameState,
    closeUi,
    navigateMenu,
    equipItem,
    useItem,
    unequipItem,
    inventory,
    menuSelectionIndex,
    player,
    equipSpell,
    buyItem,
    enemies,
    currentMerchantId,
    dash,
    triggerShake, // Ajout dépendance
    cycleMenuTab, // Ajout dépendance
    confirmMenuAction, // Ajout dépendance
  ]);

  return keysPressed;
};
