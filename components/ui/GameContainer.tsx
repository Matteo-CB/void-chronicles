"use client";

import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";
import GameView from "./GameView";
import HUD from "./HUD";
import InventoryUI from "./InventoryUI";
import ShopUI from "./ShopUI";
import LoadingScreen from "./LoadingScreen";
import StoryOverlay from "./StoryOverlay";
import SpellBookUI from "./SpellBookUI";

export default function GameContainer() {
  const {
    gameState,
    initGame,
    isLoading,
    currentDialogue,
    advanceDialogue,
    movePlayer,
    interact,
    castSpell,
    showResetConfirmation,
    toggleResetConfirmation,
    navigateInventory,
    useSelectedInventoryItem,
    navigateShop,
    buySelectedShopItem,
    closeShop,
    toggleInventory,
    setInputMethod,
  } = useGameStore();

  const lastInputTime = useRef<number>(0);
  const moveRepeatTimer = useRef<number>(0);

  useEffect(() => {
    initGame(true);
  }, []);

  useEffect(() => {
    // --- GESTION CLAVIER ---
    const handleKeyDown = (e: KeyboardEvent) => {
      // Si une touche est pressée, on repasse en mode clavier
      setInputMethod("keyboard");

      if (isLoading) return;

      const key = e.key;

      if (showResetConfirmation) {
        if (key === "Escape") toggleResetConfirmation();
        if (key === "Enter") {
          toggleResetConfirmation();
          initGame(false);
        }
        return;
      }

      if (gameState === "dialogue") {
        if (key === "Enter" || key === " ") advanceDialogue();
        return;
      }

      if (gameState === "menu") return;

      if (gameState === "inventory") {
        if (key === "Escape" || key === "i" || key === "I") toggleInventory();
        if (key === "ArrowUp") navigateInventory("up");
        if (key === "ArrowDown") navigateInventory("down");
        if (key === "ArrowLeft") navigateInventory("left");
        if (key === "ArrowRight") navigateInventory("right");
        if (key === "Enter") useSelectedInventoryItem();
        return;
      }

      if (gameState === "shop") {
        if (key === "Escape") closeShop();
        if (key === "ArrowUp") navigateShop("up");
        if (key === "ArrowDown") navigateShop("down");
        if (key === "Enter") buySelectedShopItem();
        return;
      }

      if (gameState === "spellbook") {
        if (key === "Escape" || key === "k" || key === "K")
          useGameStore.setState({ gameState: "playing" });
        return;
      }

      if (gameState === "playing") {
        if (key === "ArrowUp" || key === "z" || key === "Z") movePlayer("up");
        if (key === "ArrowDown" || key === "s" || key === "S")
          movePlayer("down");
        if (key === "ArrowLeft" || key === "q" || key === "Q")
          movePlayer("left");
        if (key === "ArrowRight" || key === "d" || key === "D")
          movePlayer("right");
        if (key === " " || key === "Enter") interact();
        if (key === "i" || key === "I") toggleInventory();
        if (key === "k" || key === "K")
          useGameStore.setState({ gameState: "spellbook" });
        if (key === "1" || key === "&") castSpell(0);
        if (key === "2" || key === "é") castSpell(1);
        if (key === "3" || key === '"') castSpell(2);
        if (key === "Escape") toggleResetConfirmation();
      }
    };

    // --- GESTION SOURIS ---
    const handleMouseMove = (e: MouseEvent) => {
      // On vérifie qu'il y a un vrai mouvement pour éviter les faux positifs au chargement
      if (Math.abs(e.movementX) > 0 || Math.abs(e.movementY) > 0) {
        setInputMethod("keyboard");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    gameState,
    isLoading,
    movePlayer,
    interact,
    castSpell,
    advanceDialogue,
    showResetConfirmation,
    toggleResetConfirmation,
    navigateInventory,
    useSelectedInventoryItem,
    navigateShop,
    buySelectedShopItem,
    closeShop,
    toggleInventory,
    setInputMethod,
  ]);

  // --- GESTION MANETTE (Polling) ---
  useEffect(() => {
    let animationFrameId: number;

    const checkGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0]; // On prend la première manette

      if (gp) {
        const now = Date.now();
        const AXIS_THRESHOLD = 0.5;
        const REPEAT_DELAY = 150;
        const BUTTON_DEBOUNCE = 250;

        const buttonPressed = (b: GamepadButton) => b.pressed;

        // Détection d'activité pour passer en mode manette
        const anyInput =
          gp.buttons.some((b) => b.pressed) ||
          Math.abs(gp.axes[0]) > 0.2 ||
          Math.abs(gp.axes[1]) > 0.2;

        if (anyInput) setInputMethod("gamepad");

        if (now - lastInputTime.current > BUTTON_DEBOUNCE) {
          if (showResetConfirmation) {
            if (buttonPressed(gp.buttons[1])) {
              // B
              toggleResetConfirmation();
              lastInputTime.current = now;
            }
            if (buttonPressed(gp.buttons[0])) {
              // A
              toggleResetConfirmation();
              initGame(false);
              lastInputTime.current = now;
            }
          } else if (gameState === "dialogue") {
            if (buttonPressed(gp.buttons[0])) {
              // A
              advanceDialogue();
              lastInputTime.current = now;
            }
          } else if (gameState === "inventory") {
            if (buttonPressed(gp.buttons[1])) {
              // B
              toggleInventory();
              lastInputTime.current = now;
            }
            if (buttonPressed(gp.buttons[0])) {
              // A
              useSelectedInventoryItem();
              lastInputTime.current = now;
            }

            if (now - moveRepeatTimer.current > REPEAT_DELAY) {
              if (
                gp.axes[1] < -AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[12])
              ) {
                navigateInventory("up");
                moveRepeatTimer.current = now;
              }
              if (
                gp.axes[1] > AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[13])
              ) {
                navigateInventory("down");
                moveRepeatTimer.current = now;
              }
              if (
                gp.axes[0] < -AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[14])
              ) {
                navigateInventory("left");
                moveRepeatTimer.current = now;
              }
              if (
                gp.axes[0] > AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[15])
              ) {
                navigateInventory("right");
                moveRepeatTimer.current = now;
              }
            }
          } else if (gameState === "shop") {
            if (buttonPressed(gp.buttons[1])) {
              // B
              closeShop();
              lastInputTime.current = now;
            }
            if (buttonPressed(gp.buttons[0])) {
              // A
              buySelectedShopItem();
              lastInputTime.current = now;
            }

            if (now - moveRepeatTimer.current > REPEAT_DELAY) {
              if (
                gp.axes[1] < -AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[12])
              ) {
                navigateShop("up");
                moveRepeatTimer.current = now;
              }
              if (
                gp.axes[1] > AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[13])
              ) {
                navigateShop("down");
                moveRepeatTimer.current = now;
              }
            }
          } else if (gameState === "spellbook") {
            if (buttonPressed(gp.buttons[1])) {
              // B
              useGameStore.setState({ gameState: "playing" });
              lastInputTime.current = now;
            }
          } else if (gameState === "playing") {
            if (buttonPressed(gp.buttons[3])) {
              // Y -> Inventaire
              toggleInventory();
              lastInputTime.current = now;
            }
            if (buttonPressed(gp.buttons[2])) {
              // X -> Spellbook
              useGameStore.setState({ gameState: "spellbook" });
              lastInputTime.current = now;
            }
            if (buttonPressed(gp.buttons[9])) {
              // Start -> Reset
              toggleResetConfirmation();
              lastInputTime.current = now;
            }

            if (buttonPressed(gp.buttons[0])) {
              // A -> Interact
              interact();
              lastInputTime.current = now;
            }

            // Sorts (LB, RB, Triggers)
            if (buttonPressed(gp.buttons[4])) {
              // LB
              castSpell(0);
              lastInputTime.current = now;
            }
            if (buttonPressed(gp.buttons[5])) {
              // RB
              castSpell(1);
              lastInputTime.current = now;
            }
            if (buttonPressed(gp.buttons[6]) || buttonPressed(gp.buttons[7])) {
              // LT/RT
              castSpell(2);
              lastInputTime.current = now;
            }

            // Mouvements (Stick/D-Pad)
            if (now - moveRepeatTimer.current > 100) {
              if (
                gp.axes[1] < -AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[12])
              ) {
                movePlayer("up");
                moveRepeatTimer.current = now;
              } else if (
                gp.axes[1] > AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[13])
              ) {
                movePlayer("down");
                moveRepeatTimer.current = now;
              } else if (
                gp.axes[0] < -AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[14])
              ) {
                movePlayer("left");
                moveRepeatTimer.current = now;
              } else if (
                gp.axes[0] > AXIS_THRESHOLD ||
                buttonPressed(gp.buttons[15])
              ) {
                movePlayer("right");
                moveRepeatTimer.current = now;
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(checkGamepad);
    };

    animationFrameId = requestAnimationFrame(checkGamepad);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    gameState,
    showResetConfirmation,
    toggleResetConfirmation,
    initGame,
    advanceDialogue,
    toggleInventory,
    useSelectedInventoryItem,
    navigateInventory,
    closeShop,
    buySelectedShopItem,
    navigateShop,
    movePlayer,
    interact,
    castSpell,
    setInputMethod,
  ]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none cursor-default">
      <GameView />
      <HUD />

      {currentDialogue && <StoryOverlay />}
      {gameState === "inventory" && <InventoryUI />}
      {gameState === "shop" && <ShopUI />}
      {gameState === "spellbook" && <SpellBookUI />}

      {showResetConfirmation && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 font-pixel backdrop-blur-sm">
          <div className="bg-zinc-900 border-2 border-red-600 p-6 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <h2 className="text-2xl text-red-500 mb-2">ATTENTION</h2>
            <p className="text-zinc-300 text-xs mb-6 leading-relaxed">
              Voulez-vous vraiment recommencer ? <br />
              Toute progression sera perdue.
            </p>
            <div className="flex justify-center gap-4 flex-col md:flex-row">
              {useGameStore.getState().inputMethod === "gamepad" ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                      B
                    </span>{" "}
                    <span>Annuler</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-[10px]">
                      A
                    </span>{" "}
                    <span>Confirmer</span>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleResetConfirmation}
                    className="px-4 py-2 border border-zinc-600 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                  >
                    ANNULER (Echap)
                  </button>
                  <button
                    onClick={() => {
                      toggleResetConfirmation();
                      initGame(false);
                    }}
                    className="px-4 py-2 bg-red-900 border border-red-600 text-white hover:bg-red-800 text-xs"
                  >
                    CONFIRMER (Entrée)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-red-600 font-pixel z-50">
          <h1 className="text-4xl mb-4 animate-pulse">VOUS ÊTES MORT</h1>
          <button
            className="px-6 py-3 bg-red-900 border-2 border-red-500 text-white hover:bg-red-800"
            onClick={() => initGame(false)}
          >
            RESSUSCITER (Niveau 1)
          </button>
        </div>
      )}
    </div>
  );
}
