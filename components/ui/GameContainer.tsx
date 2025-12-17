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

  // CORRECTION : On encapsule triggerShake pour fournir l'argument 'amount' requis (ex: 5)
  // Cela satisfait la signature expected: () => void
  const keysPressed = useKeyboard(() => triggerShake(5));
  const { pollGamepad } = useGamepad(() => triggerShake(5));

  // Le jeu est considéré "actif" tant qu'on n'est pas sur l'écran titre
  const isPlaying = gameState !== "start";

  // Le jeu tourne en boucle (Game Loop) pour gérer la logique et le rendu
  useGameLoop(updateShake, keysPressed, pollGamepad);

  // Gestion dynamique du curseur selon la méthode d'entrée
  useEffect(() => {
    if (inputMethod === "gamepad") document.body.style.cursor = "none";
    else document.body.style.cursor = "default";
  }, [inputMethod]);

  // Détermine si on doit afficher le menu de gestion (Inventaire/Grimoire)
  const showManagement =
    gameState === "inventory" ||
    gameState === "spellbook" ||
    gameState === "management_menu";

  return (
    <main className="relative w-full h-full bg-[#050505] overflow-hidden select-none cursor-default font-pixel">
      {/* 1. ÉCRAN DE CHARGEMENT (Priorité Maximale) */}
      {isLoading && <LoadingScreen />}

      {/* 2. ÉCRAN TITRE (Menu Principal) */}
      {gameState === "start" && !isLoading && <TitleScreen />}

      {/* 3. JEU (Uniquement si pas Title Screen et Map chargée) */}
      {isPlaying && map && map.length > 0 && (
        <>
          {/* EFFETS POST-PROCESSING (CRT & VIGNETTE) */}
          <div className="pointer-events-none fixed inset-0 z-[100] scanline opacity-30"></div>
          <div className="pointer-events-none fixed inset-0 z-[90] bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>

          {/* CONTENEUR DE JEU (Applique le tremblement d'écran) */}
          <div
            ref={containerRef}
            className="relative w-full h-full will-change-transform"
          >
            <GameView />

            {/* INTERFACES (HUD) - Masqués si Menu Pause ou Game Over */}
            {gameState !== "gameover" && gameState !== "pause_menu" && <HUD />}

            {/* COUCHE NARRATIVE (Dialogues & Cutscenes) */}
            {(currentDialogue || currentCutsceneId) && (
              <StoryOverlay key={currentCutsceneId || "dialogue"} />
            )}

            {/* --- MENUS CONTEXTUELS & OVERLAYS --- */}

            {/* Menu de Gestion Unifié (Inventaire + Grimoire) */}
            {showManagement && <ManagementMenu />}

            {/* Menu Pause */}
            {gameState === "pause_menu" && <PauseMenu />}

            {/* Fonds assombris pour Shop et LevelUp */}
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
