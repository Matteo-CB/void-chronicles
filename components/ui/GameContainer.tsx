"use client";

import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";

// Components
import GameView from "./GameView";
import HUD from "./HUD";
import LoadingScreen from "./LoadingScreen";
import StoryOverlay from "./StoryOverlay";
import GameOverScreen from "./GameOverScreen";
import ShopUI from "./ShopUI";
// LevelUpUI supprimé car progression automatique maintenant
import TitleScreen from "./TitleScreen";
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

  // Initialisation de la ref ici pour la passer au hook
  const containerRef = useRef<HTMLDivElement>(null);

  // useShake prend la ref en argument et retourne la fonction de déclenchement
  const triggerShake = useShake(containerRef);

  const keysPressed = useKeyboard(() => triggerShake(5));
  const { pollGamepad } = useGamepad(() => triggerShake(5));

  const isPlaying = gameState !== "start";

  // On passe undefined pour updateShake car useShake gère sa propre boucle
  useGameLoop(undefined, keysPressed, pollGamepad);

  useEffect(() => {
    if (inputMethod === "gamepad") document.body.style.cursor = "none";
    else document.body.style.cursor = "default";
  }, [inputMethod]);

  // CORRECTION ICI : Ajout de "masteries" à la liste des états affichant le menu
  const showManagement =
    gameState === "inventory" ||
    gameState === "spellbook" ||
    gameState === "quests" ||
    gameState === "masteries" ||
    gameState === "management_menu";

  return (
    <main className="relative w-full h-full bg-[#050505] overflow-hidden select-none cursor-default font-pixel">
      {isLoading && <LoadingScreen />}

      {gameState === "start" && !isLoading && <TitleScreen />}

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

            {showManagement && <ManagementMenu />}

            {gameState === "pause_menu" && <PauseMenu />}

            {gameState === "shop" && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 transition-all duration-300 animate-in fade-in" />
            )}

            {gameState === "shop" && <ShopUI />}
            {gameState === "gameover" && <GameOverScreen />}
          </div>
        </>
      )}
    </main>
  );
}
