import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";

export const useKeyboard = (triggerShake: (amount: number) => void) => {
  const keysPressed = useRef<Record<string, boolean>>({});

  const gameState = useGameStore((state) => state.gameState);
  const isLoading = useGameStore((state) => state.isLoading);
  const setInputMethod = useGameStore((state) => state.setInputMethod);
  const advanceDialogue = useGameStore((state) => state.advanceDialogue);
  const toggleInventory = useGameStore((state) => state.toggleInventory);
  const closeShop = useGameStore((state) => state.closeShop);
  const navigateMenu = useGameStore((state) => state.navigateMenu);
  const selectMenuItem = useGameStore((state) => state.selectMenuItem);
  const interact = useGameStore((state) => state.interact);
  const performAttack = useGameStore((state) => state.performAttack);
  const castSpell = useGameStore((state) => state.castSpell);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      keysPressed.current[e.key] = true;

      // Force le mode clavier dès qu'une touche est pressée
      setInputMethod("keyboard");

      if (isLoading) return;

      // 1. DIALOGUE
      if (gameState === "dialogue") {
        if (["Enter", " ", "e", "E", "Escape"].includes(e.key))
          advanceDialogue();
        return;
      }

      // 2. MENUS (Inventaire, Shop, etc.)
      const isMenuOpen = ["inventory", "shop", "spellbook", "levelup"].includes(
        gameState
      );
      if (isMenuOpen) {
        // Navigation (Flèches ou ZQSD)
        if (["ArrowUp", "z", "Z", "w", "W"].includes(e.key)) navigateMenu("up");
        else if (["ArrowDown", "s", "S"].includes(e.key)) navigateMenu("down");
        else if (["ArrowLeft", "q", "Q", "a", "A"].includes(e.key))
          navigateMenu("left");
        else if (["ArrowRight", "d", "D"].includes(e.key))
          navigateMenu("right");
        // Validation / Action
        else if (["Enter", " ", "e", "E"].includes(e.key)) selectMenuItem();
        // Fermeture
        else if (["Escape", "Backspace", "i", "I", "Tab"].includes(e.key)) {
          if (gameState === "inventory") toggleInventory();
          else if (gameState === "shop") closeShop();
          else useGameStore.setState({ gameState: "playing" } as any);
        }
        return;
      }

      // 3. JEU (Exploration/Combat)
      if (gameState === "playing") {
        // Intéragir
        if ([" ", "Enter", "e", "E"].includes(e.key)) interact();

        // Attaques
        if (["j", "J", "ArrowLeft"].includes(e.key)) {
          performAttack("light");
          triggerShake(3);
        }
        if (["k", "K", "ArrowRight"].includes(e.key)) {
          performAttack("heavy");
          triggerShake(6);
        }

        // Menus
        if (["i", "I", "Tab"].includes(e.key)) toggleInventory();
        if (["l", "L"].includes(e.key))
          useGameStore.setState({ gameState: "spellbook" } as any);

        // Sorts
        if (["1", "&"].includes(e.key)) castSpell(0);
        if (["2", "é"].includes(e.key)) castSpell(1);
        if (["3", '"'].includes(e.key)) castSpell(2);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    gameState,
    isLoading,
    advanceDialogue,
    navigateMenu,
    selectMenuItem,
    toggleInventory,
    closeShop,
    interact,
    performAttack,
    castSpell,
    triggerShake,
    setInputMethod,
  ]);

  return keysPressed;
};
