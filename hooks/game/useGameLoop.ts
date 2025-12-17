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
        let keyboardActive = false;

        if (time - lastMoveTime.current > MOVEMENT_COOLDOWN) {
          const k = keysPressed.current;
          let moved = false;

          // Utilisation des CODES physiques (KeyW = Z sur Azerty / W sur Qwerty)
          // Cela répare le problème ZQSD sur tous les claviers
          if (k["ArrowUp"] || k["KeyW"] || k["KeyZ"]) {
            // KeyZ ajouté par sécurité
            movePlayer("up");
            moved = true;
          } else if (k["ArrowDown"] || k["KeyS"]) {
            movePlayer("down");
            moved = true;
          } else if (k["ArrowLeft"] || k["KeyA"] || k["KeyQ"]) {
            // KeyQ ajouté par sécurité
            movePlayer("left");
            moved = true;
          } else if (k["ArrowRight"] || k["KeyD"]) {
            movePlayer("right");
            moved = true;
          }

          if (moved) {
            lastMoveTime.current = time;
            keyboardActive = true; // On signale que le clavier a pris la main
          }
        }

        // 4. Gestion Manette
        // On ne poll la manette pour le mouvement QUE si le clavier n'est pas utilisé
        // Cela évite qu'un joystick qui "drift" (bouge tout seul) bloque le clavier
        if (!keyboardActive) {
          pollGamepad(Date.now(), lastMoveTime);
        } else {
          // On poll quand même pour les boutons (attaques, etc) mais on ignore le stick
          // (pollGamepad gère tout, mais ici on simplifie en laissant pollGamepad faire son travail
          // car il utilise aussi lastMoveTime. Si lastMoveTime vient d'être mis à jour par le clavier,
          // pollGamepad verra qu'il est en cooldown et ne bougera pas. C'est sécurisé.)
          pollGamepad(Date.now(), lastMoveTime);
        }
      } else {
        // Si pas en jeu, on poll quand même pour les menus
        pollGamepad(Date.now(), lastMoveTime);
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
