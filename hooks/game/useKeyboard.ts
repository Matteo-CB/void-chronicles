import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";

export const useKeyboard = (triggerShake: () => void) => {
  // On stocke les codes de touches (ex: "KeyW" pour Z sur Azerty ou W sur Qwerty)
  // C'est plus robuste pour les jeux que de vérifier la lettre.
  const keysPressed = useRef<Record<string, boolean>>({});

  const movePlayer = useGameStore((state) => state.movePlayer);
  const performAttack = useGameStore((state) => state.performAttack);
  const interact = useGameStore((state) => state.interact);
  const advanceDialogue = useGameStore((state) => state.advanceDialogue);
  const setInputMethod = useGameStore((state) => state.setInputMethod);

  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const closeUi = useGameStore((state) => state.closeUi);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Switch auto sur clavier
      setInputMethod("keyboard");

      // On enregistre le Code physique (ex: KeyW) ET la Key (ex: z) pour compatibilité max
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;

      // --- MENUS ---
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
        if (gameState === "playing") {
          setGameState("management_menu");
        } else if (
          ["management_menu", "inventory", "spellbook"].includes(gameState)
        ) {
          setGameState("playing");
        } else if (gameState === "shop") {
          closeUi();
        }
      }

      if (gameState !== "playing" && gameState !== "dialogue") return;

      // --- ACTIONS JEU ---
      if (["Space", "Enter", "KeyE"].includes(e.code)) {
        if (gameState === "dialogue") advanceDialogue();
        else interact();
      }

      // Attaque Rapide (K)
      if (e.code === "KeyK") {
        performAttack("light");
      }
      // Attaque Lourde (L)
      if (e.code === "KeyL") {
        performAttack("heavy");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      keysPressed.current[e.key] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      setInputMethod("keyboard");
      if (gameState === "playing") {
        if (e.button === 0) performAttack("light"); // Clic Gauche
        if (e.button === 2) performAttack("heavy"); // Clic Droit
      } else if (gameState === "dialogue") {
        advanceDialogue();
      }
    };

    // Empêche le menu contextuel sur Clic Droit
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
  ]);

  return keysPressed;
};
