import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";

export const useGameLoop = (
  updateShake?: (amount: number) => void,
  keysPressed?: React.MutableRefObject<Record<string, boolean>>,
  pollGamepad?: (
    now: number,
    lastMoveTime: React.MutableRefObject<number>
  ) => void
) => {
  const lastTimeRef = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const gameState = useGameStore((state) => state.gameState);
  const updateGameLogic = useGameStore((state) => state.updateGameLogic);
  const movePlayer = useGameStore((state) => state.movePlayer);

  useEffect(() => {
    const gameLoop = (time: number) => {
      // Initialisation du temps
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // 1. Mise à jour visuelle (Shake)
      if (updateShake) updateShake(0);

      // 2. Logique du jeu
      if (gameState === "playing") {
        // CORRECTION MAJEURE : On envoie des MILLISECONDES (ms).
        // On ne divise plus par 1000 ici, car combatLogic et enemies.ts gèrent la conversion eux-mêmes.
        const safeDt = Math.min(deltaTime, 100); // Cap à 100ms pour éviter les sauts (lag)
        updateGameLogic(safeDt);

        // 3. Mouvement Clavier (Lissage)
        const MOVEMENT_COOLDOWN = 110;
        let keyboardActive = false;

        if (keysPressed && time - lastMoveTime.current > MOVEMENT_COOLDOWN) {
          const k = keysPressed.current;
          let moved = false;

          if (k["ArrowUp"] || k["KeyW"] || k["KeyZ"]) {
            movePlayer("up");
            moved = true;
          } else if (k["ArrowDown"] || k["KeyS"]) {
            movePlayer("down");
            moved = true;
          } else if (k["ArrowLeft"] || k["KeyA"] || k["KeyQ"]) {
            movePlayer("left");
            moved = true;
          } else if (k["ArrowRight"] || k["KeyD"]) {
            movePlayer("right");
            moved = true;
          }

          if (moved) {
            lastMoveTime.current = time;
            keyboardActive = true;
          }
        }

        // 4. Gestion Manette
        if (pollGamepad) {
          // On poll toujours la manette, mais on ignore le stick si le clavier vient d'être utilisé
          pollGamepad(time, lastMoveTime);
        }
      } else {
        // Si pas en jeu (Menus), on poll la manette pour la navigation
        if (pollGamepad) pollGamepad(time, lastMoveTime);
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [
    gameState,
    updateGameLogic,
    updateShake,
    movePlayer,
    pollGamepad,
    keysPressed,
  ]);
};
