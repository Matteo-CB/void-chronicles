import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";

export const useKeyboard = (triggerShake: () => void) => {
  const keysPressed = useRef<Record<string, boolean>>({});

  const movePlayer = useGameStore((state) => state.movePlayer);
  const performAttack = useGameStore((state) => state.performAttack);
  const interact = useGameStore((state) => state.interact);
  const advanceDialogue = useGameStore((state) => state.advanceDialogue);
  const setInputMethod = useGameStore((state) => state.setInputMethod);

  // Actions de Menu
  const navigateMenu = useGameStore((state) => state.navigateMenu);
  const equipItem = useGameStore((state) => state.equipItem);
  const useItem = useGameStore((state) => state.useItem);
  const unequipItem = useGameStore((state) => state.unequipItem);
  const equipSpell = useGameStore((state) => state.equipSpell);

  const inventory = useGameStore((state) => state.inventory);
  const menuSelectionIndex = useGameStore((state) => state.menuSelectionIndex);
  const player = useGameStore((state) => state.player);

  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const closeUi = useGameStore((state) => state.closeUi);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setInputMethod("keyboard");
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;

      // --- 1. NAVIGATION DANS LES MENUS (INVENTAIRE / GRIMOIRE) ---
      if (gameState === "inventory" || gameState === "spellbook") {
        e.preventDefault(); // Empêche le scroll navigateur

        // Déplacement du curseur
        if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "KeyZ")
          navigateMenu("up");
        if (e.code === "ArrowDown" || e.code === "KeyS") navigateMenu("down");
        if (e.code === "ArrowLeft" || e.code === "KeyA" || e.code === "KeyQ")
          navigateMenu("left");
        if (e.code === "ArrowRight" || e.code === "KeyD") navigateMenu("right");

        // Validation (Entrée / Espace)
        if (e.code === "Enter" || e.code === "Space") {
          if (gameState === "inventory") {
            // Gestion Équipement vs Inventaire
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
                if (item.type === "potion" || (item as any).type === "scroll")
                  useItem(item.id);
                else equipItem(item);
              }
            }
          } else if (gameState === "spellbook") {
            // Gestion Grimoire
            if (menuSelectionIndex < 100) {
              const spell = player.spells[menuSelectionIndex];
              if (spell) equipSpell(spell.id, 0);
            }
          }
        }

        // Touches spécifiques Grimoire (1, 2, 3 pour équiper dans slot spécifique)
        if (gameState === "spellbook" && menuSelectionIndex < 100) {
          const spell = player.spells[menuSelectionIndex];
          if (spell) {
            if (e.key === "1") equipSpell(spell.id, 0);
            if (e.key === "2") equipSpell(spell.id, 1);
            if (e.key === "3") equipSpell(spell.id, 2);
          }
        }
      }

      // --- 2. GESTION DES ETATS GLOBAUX ---
      if (e.code === "Escape") {
        if (gameState === "playing") {
          setGameState("pause_menu");
        } else if (
          ["pause_menu", "management_menu", "inventory", "spellbook"].includes(
            gameState
          )
        ) {
          setGameState("playing");
        } else if (gameState === "shop" || gameState === "levelup") {
          closeUi();
        }
      }

      if (e.code === "Tab" || e.key === "i" || e.key === "I") {
        e.preventDefault();
        if (gameState === "playing") setGameState("management_menu");
        else if (
          ["management_menu", "inventory", "spellbook"].includes(gameState)
        )
          setGameState("playing");
        else if (gameState === "shop") closeUi();
      }

      // Si on est dans un menu, on arrête ici pour ne pas bouger le perso
      if (gameState !== "playing" && gameState !== "dialogue") return;

      // --- 3. ACTIONS DE JEU (Mouvement géré par useGameLoop) ---
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
  ]);

  return keysPressed;
};
