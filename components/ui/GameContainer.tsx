"use client";

import { useEffect } from "react";
import useGameStore from "@/store/gameStore";

// Components
import GameView from "./GameView";
import HUD from "./HUD";
import LoadingScreen from "./LoadingScreen";
import StoryOverlay from "./StoryOverlay";
import GameOverScreen from "./GameOverScreen";
import ShopUI from "./ShopUI";
import LevelUpUI from "./LevelUpUI";
import TitleScreen from "./TitleScreen";

// Nouveaux Menus Unifiés
import PauseMenu from "./PauseMenu";
import ManagementMenu from "./ManagementMenu";

// Hooks
import { useShake } from "@/hooks/game/useShake";
import { useKeyboard } from "@/hooks/game/useKeyboard";
import { useGamepad } from "@/hooks/game/useGamepad";
import { useGameLoop } from "@/hooks/game/useGameLoop";

export default function GameContainer() {
  const gameState = useGameStore((state) => state.gameState);
  const isLoading = useGameStore((state) => state.isLoading);
  const inputMethod = useGameStore((state) => state.inputMethod);
  const currentDialogue = useGameStore((state) => state.currentDialogue);
  const currentCutsceneId = useGameStore((state) => state.currentCutsceneId);
  const map = useGameStore((state) => state.map);

  const { containerRef, triggerShake, updateShake } = useShake();

  const keysPressed = useKeyboard(() => triggerShake(5));
  const { pollGamepad } = useGamepad(() => triggerShake(5));

  const isPlaying = gameState !== "start";

  useGameLoop(updateShake, keysPressed, pollGamepad);

  useEffect(() => {
    if (inputMethod === "gamepad") document.body.style.cursor = "none";
    else document.body.style.cursor = "default";
  }, [inputMethod]);

  // CORRECTION ICI : Ajout de "quests" pour ne pas fermer le menu quand on l'ouvre
  const showManagement =
    gameState === "inventory" ||
    gameState === "spellbook" ||
    gameState === "quests" || // <--- AJOUT CRUCIAL
    gameState === "management_menu";

  return (
    <main className="relative w-full h-full bg-[#050505] overflow-hidden select-none cursor-default font-pixel">
      {/* 1. ÉCRAN DE CHARGEMENT */}
      {isLoading && <LoadingScreen />}

      {/* 2. ÉCRAN TITRE */}
      {gameState === "start" && !isLoading && <TitleScreen />}

      {/* 3. JEU */}
      {isPlaying && map && map.length > 0 && (
        <>
          <div className="pointer-events-none fixed inset-0 z-[100] scanline opacity-30"></div>
          <div className="pointer-events-none fixed inset-0 z-[90] bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>

          <div
            ref={containerRef}
            className="relative w-full h-full will-change-transform"
          >
            <GameView />

            {gameState !== "gameover" && gameState !== "pause_menu" && <HUD />}

            {(currentDialogue || currentCutsceneId) && (
              <StoryOverlay key={currentCutsceneId || "dialogue"} />
            )}

            {/* Menu de Gestion Unifié */}
            {showManagement && <ManagementMenu />}

            {gameState === "pause_menu" && <PauseMenu />}

            {(gameState === "shop" || gameState === "levelup") && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 transition-all duration-300 animate-in fade-in" />
            )}

            {gameState === "shop" && <ShopUI />}
            {gameState === "levelup" && <LevelUpUI />}
            {gameState === "gameover" && <GameOverScreen />}
          </div>
        </>
      )}
    </main>
  );
}
