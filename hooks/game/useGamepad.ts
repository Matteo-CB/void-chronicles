import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";

export const useGamepad = (triggerShake: () => void) => {
  const movePlayer = useGameStore((state) => state.movePlayer);
  // On utilise performAttack au lieu de playerAttack pour distinguer les types
  const performAttack = useGameStore((state) => state.performAttack);
  const setInputMethod = useGameStore((state) => state.setInputMethod);
  const interact = useGameStore((state) => state.interact);
  const advanceDialogue = useGameStore((state) => state.advanceDialogue);

  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const closeUi = useGameStore((state) => state.closeUi);

  // État des boutons pour éviter le "spam" (appui unique)
  const buttonStates = useRef<Record<number, boolean>>({});

  const pollGamepad = (
    now: number,
    lastMoveTime: React.MutableRefObject<number>
  ) => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];

    if (!gp) return;

    // Détection d'activité manette
    if (
      Math.abs(gp.axes[0]) > 0.1 ||
      Math.abs(gp.axes[1]) > 0.1 ||
      gp.buttons.some((b) => b.pressed)
    ) {
      setInputMethod("gamepad");
    }

    // --- GESTION DES MENUS GLOBAUX ---

    // START (Btn 9) -> PAUSE
    if (gp.buttons[9]?.pressed) {
      if (!buttonStates.current[9]) {
        if (gameState === "playing") setGameState("pause_menu");
        else if (gameState === "pause_menu") setGameState("playing");
        buttonStates.current[9] = true;
      }
    } else {
      buttonStates.current[9] = false;
    }

    // SELECT (Btn 8) -> MANAGEMENT (Inventaire/Grimoire)
    if (gp.buttons[8]?.pressed) {
      if (!buttonStates.current[8]) {
        if (gameState === "playing") setGameState("management_menu");
        else if (
          gameState === "management_menu" ||
          gameState === "inventory" ||
          gameState === "spellbook"
        )
          setGameState("playing");
        else if (gameState === "shop" || gameState === "levelup") closeUi();

        buttonStates.current[8] = true;
      }
    } else {
      buttonStates.current[8] = false;
    }

    // B (Btn 1) -> RETOUR / FERMER
    if (gp.buttons[1]?.pressed) {
      if (!buttonStates.current[1]) {
        if (
          gameState === "management_menu" ||
          gameState === "inventory" ||
          gameState === "spellbook" ||
          gameState === "pause_menu"
        ) {
          setGameState("playing");
        } else if (gameState === "shop" || gameState === "levelup") {
          closeUi();
        }
        buttonStates.current[1] = true;
      }
    } else {
      buttonStates.current[1] = false;
    }

    if (gameState !== "playing" && gameState !== "dialogue") return;

    // --- GAMEPLAY JOUEUR ---

    // 1. Mouvement
    const axisX = gp.axes[0];
    const axisY = gp.axes[1];
    const MOVEMENT_COOLDOWN = 120;

    if (now - lastMoveTime.current > MOVEMENT_COOLDOWN) {
      if (axisY < -0.5 || gp.buttons[12]?.pressed) {
        movePlayer("up");
        lastMoveTime.current = now;
      } else if (axisY > 0.5 || gp.buttons[13]?.pressed) {
        movePlayer("down");
        lastMoveTime.current = now;
      } else if (axisX < -0.5 || gp.buttons[14]?.pressed) {
        movePlayer("left");
        lastMoveTime.current = now;
      } else if (axisX > 0.5 || gp.buttons[15]?.pressed) {
        movePlayer("right");
        lastMoveTime.current = now;
      }
    }

    // 2. Actions
    // A (Btn 0) -> Interact / Dialogue
    if (gp.buttons[0]?.pressed) {
      if (!buttonStates.current[0]) {
        if (gameState === "dialogue") advanceDialogue();
        else interact();
        buttonStates.current[0] = true;
      }
    } else {
      buttonStates.current[0] = false;
    }

    // X (Btn 2) -> Attaque Rapide (LIGHT)
    if (gp.buttons[2]?.pressed) {
      if (!buttonStates.current[2]) {
        performAttack("light");
        buttonStates.current[2] = true;
      }
    } else {
      buttonStates.current[2] = false;
    }

    // Y (Btn 3) ou RT (Btn 7) -> Attaque Lourde (HEAVY)
    if (gp.buttons[3]?.pressed || gp.buttons[7]?.pressed) {
      if (!buttonStates.current[3]) {
        performAttack("heavy");
        buttonStates.current[3] = true;
      }
    } else {
      buttonStates.current[3] = false;
    }
  };

  return { pollGamepad };
};
