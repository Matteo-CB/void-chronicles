import { useRef } from "react";
import useGameStore from "@/store/gameStore";

export const useGamepad = (triggerShake: (amount: number) => void) => {
  // Stocke l'état des boutons de la frame précédente pour détecter les "clics"
  const prevGamepadButtons = useRef<boolean[]>([]);

  const {
    gameState,
    setInputMethod,
    advanceDialogue,
    movePlayer,
    performAttack,
    interact,
    toggleInventory,
    castSpell,
    closeShop,
    selectMenuItem,
    navigateMenu,
    initGame,
  } = useGameStore((state: any) => state);

  const pollGamepad = (
    now: number,
    lastMoveTime: React.MutableRefObject<number>
  ) => {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];
    if (!gp) return;

    // 1. Détection du changement de méthode d'entrée (Manette détectée)
    // On vérifie si un bouton est appuyé ou un stick bougé significativement
    const hasInput =
      gp.buttons.some((b) => b.pressed) ||
      Math.abs(gp.axes[0]) > 0.2 ||
      Math.abs(gp.axes[1]) > 0.2;
    if (hasInput) {
      setInputMethod("gamepad");
    }

    // Fonction utilitaire pour détecter l'appui initial (Just Pressed)
    const isJustPressed = (index: number) => {
      const pressed = gp.buttons[index]?.pressed;
      const wasPressed = prevGamepadButtons.current[index] || false;
      return pressed && !wasPressed;
    };

    // --- LOGIQUE MÉTIER PAR ÉTAT DE JEU ---

    // 1. DIALOGUE
    if (gameState === "dialogue") {
      if (isJustPressed(0) || isJustPressed(1)) advanceDialogue(); // A ou B pour passer
    }
    // 2. JEU (Exploration/Combat)
    else if (gameState === "playing") {
      const MOVEMENT_DELAY = 120;
      // Stick Analogique OU Croix Directionnelle
      if (now - lastMoveTime.current > MOVEMENT_DELAY) {
        if (gp.axes[1] < -0.5 || gp.buttons[12]?.pressed) {
          movePlayer("up");
          lastMoveTime.current = now;
        } else if (gp.axes[1] > 0.5 || gp.buttons[13]?.pressed) {
          movePlayer("down");
          lastMoveTime.current = now;
        } else if (gp.axes[0] < -0.5 || gp.buttons[14]?.pressed) {
          movePlayer("left");
          lastMoveTime.current = now;
        } else if (gp.axes[0] > 0.5 || gp.buttons[15]?.pressed) {
          movePlayer("right");
          lastMoveTime.current = now;
        }
      }

      if (isJustPressed(2)) {
        performAttack("light");
        triggerShake(3);
      } // X (Attaque Légère)
      if (isJustPressed(3)) {
        performAttack("heavy");
        triggerShake(6);
      } // Y (Attaque Lourde)
      if (isJustPressed(0)) interact(); // A (Intéragir)
      if (isJustPressed(9)) toggleInventory(); // Start (Inventaire)
      if (isJustPressed(8))
        useGameStore.setState({ gameState: "spellbook" } as any); // Select (Grimoire)

      // Gâchettes pour les sorts
      if (isJustPressed(4)) castSpell(0); // LB
      if (isJustPressed(5)) castSpell(1); // RB
      if (isJustPressed(7)) castSpell(2); // RT
    }
    // 3. MENUS (Inventaire, Shop, Spellbook, LevelUp)
    else if (
      ["inventory", "shop", "spellbook", "levelup"].includes(gameState)
    ) {
      const MENU_DELAY = 150; // Délai pour éviter le défilement trop rapide

      if (now - lastMoveTime.current > MENU_DELAY) {
        if (gp.axes[1] < -0.5 || gp.buttons[12]?.pressed) {
          navigateMenu("up");
          lastMoveTime.current = now;
        } else if (gp.axes[1] > 0.5 || gp.buttons[13]?.pressed) {
          navigateMenu("down");
          lastMoveTime.current = now;
        } else if (gp.axes[0] < -0.5 || gp.buttons[14]?.pressed) {
          navigateMenu("left");
          lastMoveTime.current = now;
        } else if (gp.axes[0] > 0.5 || gp.buttons[15]?.pressed) {
          navigateMenu("right");
          lastMoveTime.current = now;
        }
      }

      // Actions contextuelles
      if (isJustPressed(0)) selectMenuItem(); // A -> Valider/Acheter/Equiper

      // B (1) ou Start (9) pour FERMER/RETOUR
      if (isJustPressed(1) || isJustPressed(9)) {
        if (gameState === "inventory") toggleInventory();
        else if (gameState === "shop") closeShop();
        else useGameStore.setState({ gameState: "playing" } as any);
      }
    }
    // 4. GAMEOVER
    else if (gameState === "gameover") {
      if (isJustPressed(0) || isJustPressed(9)) initGame(false); // A ou Start pour recommencer
    }

    // IMPORTANT : Mise à jour de l'état précédent À LA FIN de la frame
    // C'est ce qui permet à isJustPressed de fonctionner correctement à la prochaine frame
    gp.buttons.forEach((b, i) => {
      prevGamepadButtons.current[i] = b.pressed;
    });
  };

  return { pollGamepad };
};
