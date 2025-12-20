"use client";

import useGameStore from "@/store/gameStore";
import { useEffect, useRef } from "react";
import { useGamepad, useKeyboard, useGameLoop, useShake } from "@/hooks/game";
import {
  renderMap,
  renderEntities,
  renderEffects,
  renderInGameUI,
  renderPostProcess,
} from "@/lib/game/renderSystems";

interface GameCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function GameCanvas({ containerRef }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualState = useRef<Record<string, { x: number; y: number }>>({});
  const torchFlicker = useRef(1.0);

  const ambientParticles = useRef<
    { x: number; y: number; size: number; speed: number; alpha: number }[]
  >([]);
  const bloodStains = useRef<
    { x: number; y: number; size: number; alpha: number; rotation: number }[]
  >([]);

  const storeShake = useGameStore((state: any) => state.screenShake);

  const triggerShake = useShake(
    containerRef as React.RefObject<HTMLDivElement>,
    storeShake
  );

  const keysPressed = useKeyboard(triggerShake);
  const handleGamepadShake = () => triggerShake(2); // Shake manette réduit
  const { pollGamepad } = useGamepad(handleGamepadShake);

  useGameLoop(triggerShake, keysPressed, pollGamepad);

  useEffect(() => {
    // Initialisation particules ambiantes
    for (let i = 0; i < 30; i++) {
      ambientParticles.current.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.2 + 0.05,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const TILE_SIZE = 48;

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    ctx.imageSmoothingEnabled = false;

    let frameId: number;
    let time = 0;

    const render = () => {
      // RESET MATRICE (Anti-Bug Caméra)
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      time++;
      const state = useGameStore.getState() as any;
      const {
        player,
        map,
        enemies,
        screenShake,
        levelTheme,
        floatingTexts,
        speechBubbles,
      } = state;

      if (!map || !map.length || !player) {
        frameId = requestAnimationFrame(render);
        return;
      }

      torchFlicker.current =
        0.96 + Math.sin(time * 0.05) * 0.02 + Math.random() * 0.02;

      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const allEntities = [
        ...enemies,
        { ...player, type: "player", id: "hero" },
      ];

      // --- CAMÉRA FLUIDE ---
      // On utilise la position VISUELLE (interpolée) du héros si disponible
      // Cela supprime l'effet de "snap" grille lors du déplacement
      let focusX = 0;
      let focusY = 0;

      const heroVis = visualState.current["hero"];
      if (heroVis) {
        focusX = heroVis.x + TILE_SIZE / 2;
        focusY = heroVis.y + TILE_SIZE / 2;
      } else {
        // Fallback sur la position logique si pas encore de visuel
        const pX = Number.isFinite(player.position.x) ? player.position.x : 0;
        const pY = Number.isFinite(player.position.y) ? player.position.y : 0;
        focusX = pX * TILE_SIZE + TILE_SIZE / 2;
        focusY = pY * TILE_SIZE + TILE_SIZE / 2;
      }

      // Centrage écran
      const camX = focusX - canvas.width / 2;
      const camY = focusY - canvas.height / 2;

      const finalCamX = Math.floor(camX);
      const finalCamY = Math.floor(camY);

      // Shake SUBTIL (Max 5px au lieu de 30)
      const safeShake = Math.min(Math.max(0, screenShake || 0), 5);
      const shakeX = safeShake > 0 ? (Math.random() - 0.5) * safeShake : 0;
      const shakeY = safeShake > 0 ? (Math.random() - 0.5) * safeShake : 0;

      // --- RENDU ---
      ctx.save();
      ctx.translate(
        -finalCamX + Math.floor(shakeX),
        -finalCamY + Math.floor(shakeY)
      );

      try {
        renderMap(
          ctx,
          map,
          { x: finalCamX, y: finalCamY },
          levelTheme,
          torchFlicker.current,
          canvas
        );

        renderEffects(
          ctx,
          state,
          bloodStains,
          ambientParticles,
          { x: finalCamX, y: finalCamY },
          canvas,
          time
        );

        renderEntities(
          ctx,
          allEntities,
          visualState,
          map,
          time,
          keysPressed.current,
          levelTheme
        );

        renderInGameUI(
          ctx,
          allEntities,
          visualState,
          map,
          floatingTexts,
          speechBubbles
        );

        renderPostProcess(ctx, { x: finalCamX, y: finalCamY }, canvas);
      } catch (e) {
        // Silent catch pour éviter crash loop
      }

      ctx.restore();
      frameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full z-10" />;
}
