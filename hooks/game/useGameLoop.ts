import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";

export const useGameLoop = (
  updateShake: () => void,
  keysPressed: React.MutableRefObject<Record<string, boolean>>,
  pollGamepad: (
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
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // 1. Mise à jour visuelle (Shake)
      updateShake();

      // 2. Logique du jeu
      if (gameState === "playing") {
        updateGameLogic(deltaTime);

        // 3. Mouvement Clavier (Lissage)
        const MOVEMENT_COOLDOWN = 110;
        if (time - lastMoveTime.current > MOVEMENT_COOLDOWN) {
          const k = keysPressed.current;
          let moved = false;
          if (k["ArrowUp"] || k["z"] || k["Z"] || k["w"] || k["W"]) {
            movePlayer("up");
            moved = true;
          } else if (k["ArrowDown"] || k["s"] || k["S"]) {
            movePlayer("down");
            moved = true;
          } else if (k["ArrowLeft"] || k["q"] || k["Q"] || k["a"] || k["A"]) {
            movePlayer("left");
            moved = true;
          } else if (k["ArrowRight"] || k["d"] || k["D"]) {
            movePlayer("right");
            moved = true;
          }

          if (moved) lastMoveTime.current = time;
        }
      }

      // 4. Gestion Manette
      pollGamepad(Date.now(), lastMoveTime);

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
    keysPressed, // Ref stable
  ]);
};
