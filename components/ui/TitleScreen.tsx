"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import useGameStore from "@/store/gameStore";
import {
  Gamepad2,
  Keyboard,
  Trash2,
  Play,
  Plus,
  HardDrive,
  Skull,
} from "lucide-react";

type SaveMeta = {
  date: string;
  level: number;
  floor: number;
  gold: number;
};

export default function TitleScreen() {
  const initGame = useGameStore((s) => s.initGame);
  const [slots, setSlots] = useState<Record<number, SaveMeta>>({});
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [animate, setAnimate] = useState(false);

  // Refs pour la gestion des inputs (évite les re-renders inutiles)
  const lastInputTime = useRef<number>(0);
  const buttonPressed = useRef<Record<string, boolean>>({});

  // Chargement des sauvegardes
  useEffect(() => {
    // CORRECTION : Clé de sauvegarde mise à jour
    const meta = localStorage.getItem("zero_cycle_meta");
    if (meta) {
      setSlots(JSON.parse(meta));
    }
    setTimeout(() => setAnimate(true), 100);
  }, []);

  // --- ACTIONS ---

  const startGame = useCallback(
    (slotId: number) => {
      const hasSave = !!slots[slotId];
      initGame(hasSave, slotId);
    },
    [slots, initGame]
  );

  const deleteSave = useCallback(
    (slotId: number) => {
      if (!slots[slotId]) return;
      if (confirm("Effacer ce personnage définitivement ?")) {
        // CORRECTION : Clé de sauvegarde slot
        localStorage.removeItem(`zero_cycle_save_slot_${slotId}`);
        const newSlots = { ...slots };
        delete newSlots[slotId];
        setSlots(newSlots);
        // CORRECTION : Clé de sauvegarde meta
        localStorage.setItem("zero_cycle_meta", JSON.stringify(newSlots));
      }
    },
    [slots]
  );

  // --- GESTION DES INPUTS (Clavier & Manette) ---

  const handleNavigation = useCallback((direction: "up" | "down") => {
    setSelectedSlot((prev) => {
      if (direction === "up") return prev > 1 ? prev - 1 : 3;
      if (direction === "down") return prev < 3 ? prev + 1 : 1;
      return prev;
    });
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const checkInputs = () => {
      const now = Date.now();
      const COOLDOWN = 150; //ms entre deux actions de navigation

      // 1. GAMEPAD POLLING
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0]; // On prend la première manette

      if (gp) {
        // Navigation Stick / D-Pad
        const axisY = gp.axes[1]; // Stick gauche vertical
        const dpadUp = gp.buttons[12]?.pressed;
        const dpadDown = gp.buttons[13]?.pressed;

        if (now - lastInputTime.current > COOLDOWN) {
          if (axisY < -0.5 || dpadUp) {
            handleNavigation("up");
            lastInputTime.current = now;
          } else if (axisY > 0.5 || dpadDown) {
            handleNavigation("down");
            lastInputTime.current = now;
          }
        }

        // Boutons (A/Cross = Valider, X/Square = Supprimer)
        // On utilise un verrou pour ne pas spammer l'action sur une frame
        if (gp.buttons[0]?.pressed) {
          if (!buttonPressed.current["A"]) {
            startGame(selectedSlot);
            buttonPressed.current["A"] = true;
          }
        } else {
          buttonPressed.current["A"] = false;
        }

        if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) {
          if (!buttonPressed.current["X"]) {
            deleteSave(selectedSlot);
            buttonPressed.current["X"] = true;
          }
        } else {
          buttonPressed.current["X"] = false;
        }
      }

      animationFrameId = requestAnimationFrame(checkInputs);
    };

    // 2. KEYBOARD LISTENERS
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore l'appui long natif pour les actions critiques

      switch (e.key) {
        case "ArrowUp":
        case "z":
        case "Z":
        case "w":
        case "W":
          handleNavigation("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          handleNavigation("down");
          break;
        case "Enter":
        case " ":
          startGame(selectedSlot);
          break;
        case "Delete":
        case "Backspace":
          deleteSave(selectedSlot);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    animationFrameId = requestAnimationFrame(checkInputs);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedSlot, handleNavigation, startGame, deleteSave]);

  return (
    <div className="absolute inset-0 z-50 bg-[#050508] flex flex-col items-center justify-center font-pixel text-white select-none">
      {/* FOND ANIMÉ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(30,27,75,0.4)_0%,transparent_60%)] animate-spin-slow"></div>
        <div className="stars-overlay absolute inset-0"></div>
      </div>

      {/* HEADER */}
      <div
        className={`flex flex-col items-center gap-2 mb-12 transition-all duration-1000 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
      >
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          ZERO
        </h1>
        <h2 className="text-xl md:text-2xl font-bold tracking-[0.8em] text-red-500 pl-4">
          CYCLE
        </h2>
      </div>

      {/* SLOT SELECTION */}
      <div
        className={`grid gap-4 w-full max-w-md px-4 transition-all duration-1000 delay-300 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {[1, 2, 3].map((slotId) => {
          const save = slots[slotId];
          const isSelected = selectedSlot === slotId;

          return (
            <div
              key={slotId}
              onClick={() => setSelectedSlot(slotId)}
              className={`relative group cursor-pointer border-2 rounded-md p-4 transition-all duration-200 ${
                isSelected
                  ? "bg-zinc-900/80 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-105 z-10"
                  : "bg-black/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/40"
              }`}
            >
              {isSelected && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-500 animate-pulse hidden md:block">
                  <Play size={16} fill="currentColor" />
                </div>
              )}

              {save ? (
                // SLOT AVEC SAUVEGARDE
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-xs font-bold tracking-widest ${
                        isSelected ? "text-red-400" : "text-zinc-500"
                      }`}
                    >
                      SLOT {slotId}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">
                        Niveau {save.level}
                      </span>
                      <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                        Étage {save.floor}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
                      <HardDrive size={10} /> {save.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          deleteSave(slotId);
                        }}
                        className="p-2 text-zinc-600 hover:text-red-500 transition-colors mr-2"
                        title="Supprimer (Suppr)"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => startGame(slotId)}
                      className={`p-3 rounded-full transition-all ${
                        isSelected
                          ? "bg-red-600 text-white hover:bg-red-500 shadow-lg"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  </div>
                </div>
              ) : (
                // SLOT VIDE
                <div className="flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-zinc-600 tracking-widest">
                      SLOT {slotId}
                    </span>
                    <span className="text-sm text-zinc-400 font-mono">
                      -- Vide --
                    </span>
                  </div>
                  <button
                    onClick={() => startGame(slotId)}
                    className={`p-2 rounded-full transition-all ${
                      isSelected
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-800/50 text-zinc-500"
                    }`}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER INSTRUCTIONS */}
      <div className="absolute bottom-8 flex gap-8 text-zinc-500 text-[10px] uppercase tracking-wide opacity-80">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <kbd className="bg-zinc-800 px-1 rounded border border-zinc-700">
              ↑
            </kbd>
            <kbd className="bg-zinc-800 px-1 rounded border border-zinc-700">
              ↓
            </kbd>
          </div>
          <span>Naviguer</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-white font-bold">
            ENTER
          </kbd>
          <span>Valider</span>
        </div>
        {slots[selectedSlot] && (
          <div className="flex items-center gap-2 text-red-900/50">
            <div className="flex gap-1">
              <kbd className="bg-zinc-900 px-1 rounded border border-zinc-800 text-red-700">
                SUPPR
              </kbd>
            </div>
            <span>Effacer</span>
          </div>
        )}
      </div>
    </div>
  );
}
