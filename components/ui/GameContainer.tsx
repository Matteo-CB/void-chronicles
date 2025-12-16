"use client";

import { useEffect } from "react";
import useGameStore from "@/store/gameStore";
import GameView from "./GameView";
import HUD from "./HUD";
import LoadingScreen from "./LoadingScreen";
import StoryOverlay from "./StoryOverlay";
import GameOverScreen from "./GameOverScreen";
import SpellBookUI from "./SpellBookUI";

// Imports des dossiers
import InventoryUI from "./InventoryUI";
import ShopUI from "./ShopUI";
import LevelUpUI from "./LevelUpUI";

import { useShake } from "@/hooks/game/useShake";
import { useKeyboard } from "@/hooks/game/useKeyboard";
import { useGamepad } from "@/hooks/game/useGamepad";
import { useGameLoop } from "@/hooks/game/useGameLoop";

export default function GameContainer() {
  const gameState = useGameStore((state) => state.gameState);
  const initGame = useGameStore((state) => state.initGame);
  const isLoading = useGameStore((state) => state.isLoading);

  // On récupère les IDs pour gérer l'affichage
  const currentDialogue = useGameStore((state) => state.currentDialogue);
  const currentCutsceneId = useGameStore((state) => state.currentCutsceneId);

  // 1. Initialisation du jeu
  useEffect(() => {
    initGame(true);
  }, [initGame]);

  // 2. Hooks de logique
  const { containerRef, triggerShake, updateShake } = useShake();
  const keysPressed = useKeyboard(triggerShake);
  const { pollGamepad } = useGamepad(triggerShake);

  // 3. Boucle de jeu
  useGameLoop(updateShake, keysPressed, pollGamepad);

  if (isLoading) return <LoadingScreen />;

  // CORRECTION ICI : On utilise une 'key' pour forcer le reset du composant quand la scène change
  const overlayKey = currentCutsceneId || (currentDialogue ? "dialogue" : null);

  return (
    <main className="relative w-full h-full bg-black overflow-hidden select-none cursor-default font-pixel">
      <div
        ref={containerRef}
        className="relative w-full h-full will-change-transform"
      >
        <GameView />

        {/* HUD affiché sauf en Game Over */}
        {gameState !== "gameover" && <HUD />}

        {/* Overlay pour l'histoire et les dialogues */}
        {/* La clé 'overlayKey' force React à remonter le composant quand l'ID change -> Reset propre */}
        {(currentDialogue || currentCutsceneId) && (
          <StoryOverlay key={overlayKey} />
        )}

        {/* --- MODALES --- */}
        {gameState === "inventory" && <InventoryUI />}
        {gameState === "shop" && <ShopUI />}
        {gameState === "spellbook" && <SpellBookUI />}
        {gameState === "levelup" && <LevelUpUI />}
        {gameState === "gameover" && <GameOverScreen />}
      </div>
    </main>
  );
}
