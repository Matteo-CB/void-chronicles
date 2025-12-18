import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";

export const useGamepad = (triggerShake: () => void) => {
  const movePlayer = useGameStore((state) => state.movePlayer);
  const performAttack = useGameStore((state) => state.performAttack);
  const setInputMethod = useGameStore((state) => state.setInputMethod);
  const interact = useGameStore((state) => state.interact);
  const advanceDialogue = useGameStore((state) => state.advanceDialogue);

  // Actions Menus
  const navigateMenu = useGameStore((state) => state.navigateMenu);
  const equipItem = useGameStore((state) => state.equipItem);
  const useItem = useGameStore((state) => state.useItem);
  const buyItem = useGameStore((state) => state.buyItem);

  // Sélecteurs d'état
  const inventory = useGameStore((state) => state.inventory);
  const enemies = useGameStore((state) => state.enemies);
  const currentMerchantId = useGameStore((state) => state.currentMerchantId);
  const menuSelectionIndex = useGameStore((state) => state.menuSelectionIndex);
  const player = useGameStore((state) => state.player);
  const equipSpell = useGameStore((state) => state.equipSpell);

  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const closeUi = useGameStore((state) => state.closeUi);

  const buttonStates = useRef<Record<number, boolean>>({});

  const pollGamepad = (
    now: number,
    lastMoveTime: React.MutableRefObject<number>
  ) => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];

    if (!gp) return;

    // 1. Détection Active
    if (
      Math.abs(gp.axes[0]) > 0.1 ||
      Math.abs(gp.axes[1]) > 0.1 ||
      gp.buttons.some((b) => b.pressed)
    ) {
      setInputMethod("gamepad");
    }

    // 2. Gestion Globale (Pause, Retour)
    // Start (Button 9) -> Pause
    if (gp.buttons[9]?.pressed) {
      if (!buttonStates.current[9]) {
        if (gameState === "playing") setGameState("pause_menu");
        else if (gameState === "pause_menu") setGameState("playing");
        buttonStates.current[9] = true;
      }
    } else {
      buttonStates.current[9] = false;
    }

    // Select/Back (Button 8) -> Menu Gestion
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

    // B (Button 1) -> Retour / Fermer
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

    // 3. LOGIQUE SPÉCIFIQUE PAR ÉTAT

    // --- A. GAME OVER (CORRIGÉ : "gameover" sans underscore) ---
    if (gameState === "gameover") {
      if (gp.buttons[0]?.pressed || gp.buttons[9]?.pressed) {
        if (!buttonStates.current[0]) {
          // Rechargement complet pour nettoyer l'état proprement
          window.location.reload();
          buttonStates.current[0] = true;
        }
      } else {
        buttonStates.current[0] = false;
      }
      return;
    }

    // --- B. ÉCRAN TITRE (START) ---
    if (gameState === "start") {
      if (gp.buttons[0]?.pressed || gp.buttons[9]?.pressed) {
        if (!buttonStates.current[0]) {
          // Lance le jeu
          setGameState("playing");
          buttonStates.current[0] = true;
        }
      } else {
        buttonStates.current[0] = false;
      }
      return;
    }

    // --- C. MENUS DE NAVIGATION (Inventaire, Grimoire, Shop, Level Up) ---
    if (
      gameState === "inventory" ||
      gameState === "spellbook" ||
      gameState === "shop" ||
      gameState === "levelup"
    ) {
      const MENU_COOLDOWN = 120;
      const AXIS_THRESHOLD = 0.5;

      // Navigation
      if (now - lastMoveTime.current > MENU_COOLDOWN) {
        const axisX = gp.axes[0];
        const axisY = gp.axes[1];

        if (axisY < -AXIS_THRESHOLD || gp.buttons[12]?.pressed) {
          navigateMenu("up");
          lastMoveTime.current = now;
        } else if (axisY > AXIS_THRESHOLD || gp.buttons[13]?.pressed) {
          navigateMenu("down");
          lastMoveTime.current = now;
        } else if (axisX < -AXIS_THRESHOLD || gp.buttons[14]?.pressed) {
          navigateMenu("left");
          lastMoveTime.current = now;
        } else if (axisX > AXIS_THRESHOLD || gp.buttons[15]?.pressed) {
          navigateMenu("right");
          lastMoveTime.current = now;
        }
      }

      // Action (Valider / Acheter / Sélectionner)
      if (gp.buttons[0]?.pressed) {
        if (!buttonStates.current[0]) {
          if (gameState === "inventory") {
            const item = inventory[menuSelectionIndex];
            if (item) {
              if (item.type === "potion" || (item as any).type === "scroll")
                useItem(item.id);
              else equipItem(item);
            }
          } else if (gameState === "spellbook") {
            const spell = player.spells[menuSelectionIndex];
            if (spell) equipSpell(spell.id, 0);
          } else if (gameState === "shop") {
            const merchant = enemies.find((e) => e.id === currentMerchantId);
            if (merchant && merchant.shopInventory) {
              const itemToBuy = merchant.shopInventory[menuSelectionIndex];
              if (itemToBuy) buyItem(itemToBuy);
            }
          } else if (gameState === "levelup") {
            // Pour l'instant, on ferme juste l'UI car la logique de sélection
            // nécessite des fonctions supplémentaires dans le store.
            closeUi();
          }
          buttonStates.current[0] = true;
        }
      } else {
        buttonStates.current[0] = false;
      }

      // Raccourcis spécifiques Spellbook
      if (gameState === "spellbook") {
        const spell = player.spells[menuSelectionIndex];
        if (spell) {
          if (gp.buttons[4]?.pressed && !buttonStates.current[4]) {
            equipSpell(spell.id, 0);
            buttonStates.current[4] = true;
          } else if (!gp.buttons[4]?.pressed) buttonStates.current[4] = false;

          if (gp.buttons[5]?.pressed && !buttonStates.current[5]) {
            equipSpell(spell.id, 1);
            buttonStates.current[5] = true;
          } else if (!gp.buttons[5]?.pressed) buttonStates.current[5] = false;
        }
      }
      return;
    }

    // --- D. JEU (PLAYING / DIALOGUE) ---
    if (gameState !== "playing" && gameState !== "dialogue") return;

    const axisX = gp.axes[0];
    const axisY = gp.axes[1];
    const MOVEMENT_COOLDOWN = 100;
    const MOVE_THRESHOLD = 0.3;

    if (now - lastMoveTime.current > MOVEMENT_COOLDOWN) {
      if (axisY < -MOVE_THRESHOLD || gp.buttons[12]?.pressed) {
        movePlayer("up");
        lastMoveTime.current = now;
      } else if (axisY > MOVE_THRESHOLD || gp.buttons[13]?.pressed) {
        movePlayer("down");
        lastMoveTime.current = now;
      } else if (axisX < -MOVE_THRESHOLD || gp.buttons[14]?.pressed) {
        movePlayer("left");
        lastMoveTime.current = now;
      } else if (axisX > MOVE_THRESHOLD || gp.buttons[15]?.pressed) {
        movePlayer("right");
        lastMoveTime.current = now;
      }
    }

    if (gp.buttons[0]?.pressed) {
      if (!buttonStates.current[0]) {
        if (gameState === "dialogue") advanceDialogue();
        else interact();
        buttonStates.current[0] = true;
      }
    } else {
      buttonStates.current[0] = false;
    }

    if (gp.buttons[2]?.pressed) {
      if (!buttonStates.current[2]) {
        performAttack("light");
        buttonStates.current[2] = true;
      }
    } else {
      buttonStates.current[2] = false;
    }

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
