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
      // Initialisation du temps
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
        let keyboardActive = false;

        // On utilise 'time' ici (performance.now)
        if (time - lastMoveTime.current > MOVEMENT_COOLDOWN) {
          const k = keysPressed.current;
          let moved = false;

          // Codes physiques pour compatibilité AZERTY/QWERTY
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
            lastMoveTime.current = time; // On enregistre le temps compatible
            keyboardActive = true;
          }
        }

        // 4. Gestion Manette
        // CORRECTION MAJEURE : On passe 'time' au lieu de Date.now()
        // pour que le clavier et la manette partagent la même échelle de temps.
        if (!keyboardActive) {
          pollGamepad(time, lastMoveTime);
        } else {
          // On poll les boutons mais on ignore le stick pour ne pas bloquer le clavier
          pollGamepad(time, lastMoveTime);
        }
      } else {
        // Si pas en jeu (Menus), on poll la manette avec le bon temps
        pollGamepad(time, lastMoveTime);
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
