"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import useGameStore from "@/store/gameStore";
import { CLASSES } from "@/lib/data/classes"; // Import des classes
import {
  Gamepad2,
  Keyboard,
  Trash2,
  Play,
  Plus,
  HardDrive,
  Skull,
  Sword,
  Shield,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";

type SaveMeta = {
  date: string;
  level: number;
  floor: number;
  gold: number;
  classId?: string; // Ajout pour afficher la classe dans le slot
};

export default function TitleScreen() {
  const initGame = useGameStore((s) => s.initGame);
  const startGameWithClass = useGameStore((s) => s.startGameWithClass); // Action pour lancer avec classe

  const [slots, setSlots] = useState<Record<number, SaveMeta>>({});
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [animate, setAnimate] = useState(false);

  // NOUVEAU STATE : Gestion de la vue (Slots ou Classes)
  const [view, setView] = useState<"slots" | "classes">("slots");
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);

  // Refs pour la gestion des inputs (évite les re-renders inutiles)
  const lastInputTime = useRef<number>(0);
  const buttonPressed = useRef<Record<string, boolean>>({});

  // Chargement des sauvegardes
  useEffect(() => {
    const meta = localStorage.getItem("zero_cycle_meta");
    if (meta) {
      setSlots(JSON.parse(meta));
    }
    setTimeout(() => setAnimate(true), 100);
  }, []);

  // --- ACTIONS ---

  const handleSlotSelect = useCallback(
    (slotId: number) => {
      const hasSave = !!slots[slotId];
      if (hasSave) {
        // Si sauvegarde existe, on charge direct
        initGame(true, slotId);
      } else {
        // Si slot vide, on va vers la sélection de classe
        // On mémorise le slot choisi dans le store (via initGame ou state local si besoin,
        // ici on suppose que startGameWithClass gère le slot actif ou on le passera)
        // Pour simplifier, on stocke le slot dans le store via une action temporaire ou on le passe
        // Mais comme startGameWithClass ne prend que classId, on doit d'abord initialiser le slot

        // Etape 1 : On définit le slot courant (sans charger)
        useGameStore.setState({ currentSlot: slotId });
        setView("classes");
      }
    },
    [slots, initGame]
  );

  const confirmClassSelection = useCallback(() => {
    const classId = CLASSES[selectedClassIdx].id;
    if (startGameWithClass) {
      startGameWithClass(classId);
    } else {
      // Fallback
      initGame(false);
    }
  }, [selectedClassIdx, startGameWithClass, initGame]);

  const deleteSave = useCallback(
    (slotId: number) => {
      if (!slots[slotId]) return;
      if (confirm("Effacer ce personnage définitivement ?")) {
        localStorage.removeItem(`zero_cycle_save_slot_${slotId}`);
        const newSlots = { ...slots };
        delete newSlots[slotId];
        setSlots(newSlots);
        localStorage.setItem("zero_cycle_meta", JSON.stringify(newSlots));
      }
    },
    [slots]
  );

  // --- GESTION DES INPUTS (Clavier & Manette) ---

  const handleNavigation = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (view === "slots") {
        setSelectedSlot((prev) => {
          if (direction === "up") return prev > 1 ? prev - 1 : 3;
          if (direction === "down") return prev < 3 ? prev + 1 : 1;
          return prev;
        });
      } else {
        // Navigation Classes (Gauche / Droite)
        setSelectedClassIdx((prev) => {
          if (direction === "left") return Math.max(0, prev - 1);
          if (direction === "right")
            return Math.min(CLASSES.length - 1, prev + 1);
          return prev;
        });
      }
    },
    [view]
  );

  // Boucle d'Input (Manette)
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
        const axisY = gp.axes[1];
        const axisX = gp.axes[0];
        const dpadUp = gp.buttons[12]?.pressed;
        const dpadDown = gp.buttons[13]?.pressed;
        const dpadLeft = gp.buttons[14]?.pressed;
        const dpadRight = gp.buttons[15]?.pressed;

        if (now - lastInputTime.current > COOLDOWN) {
          if (view === "slots") {
            if (axisY < -0.5 || dpadUp) {
              handleNavigation("up");
              lastInputTime.current = now;
            } else if (axisY > 0.5 || dpadDown) {
              handleNavigation("down");
              lastInputTime.current = now;
            }
          } else {
            if (axisX < -0.5 || dpadLeft) {
              handleNavigation("left");
              lastInputTime.current = now;
            } else if (axisX > 0.5 || dpadRight) {
              handleNavigation("right");
              lastInputTime.current = now;
            }
          }
        }

        // Boutons (A/Cross = Valider, X/Square = Supprimer, B/Circle = Retour)
        if (gp.buttons[0]?.pressed) {
          // A
          if (!buttonPressed.current["A"]) {
            if (view === "slots") handleSlotSelect(selectedSlot);
            else confirmClassSelection();
            buttonPressed.current["A"] = true;
          }
        } else {
          buttonPressed.current["A"] = false;
        }

        if (gp.buttons[1]?.pressed) {
          // B
          if (!buttonPressed.current["B"]) {
            if (view === "classes") setView("slots");
            buttonPressed.current["B"] = true;
          }
        } else {
          buttonPressed.current["B"] = false;
        }

        if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) {
          // X / Y
          if (!buttonPressed.current["X"]) {
            if (view === "slots") deleteSave(selectedSlot);
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
      if (e.repeat) return;

      if (view === "slots") {
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
            handleSlotSelect(selectedSlot);
            break;
          case "Delete":
          case "Backspace":
            deleteSave(selectedSlot);
            break;
        }
      } else {
        switch (e.key) {
          case "ArrowLeft":
          case "q":
          case "Q":
          case "a":
          case "A":
            handleNavigation("left");
            break;
          case "ArrowRight":
          case "d":
          case "D":
            handleNavigation("right");
            break;
          case "Enter":
          case " ":
            confirmClassSelection();
            break;
          case "Escape":
            setView("slots");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    animationFrameId = requestAnimationFrame(checkInputs);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    selectedSlot,
    view,
    selectedClassIdx,
    handleNavigation,
    handleSlotSelect,
    confirmClassSelection,
    deleteSave,
  ]);

  const getIcon = (id: string) => {
    switch (id) {
      case "knight":
        return <Shield size={32} />;
      case "rogue":
        return <Sword size={32} />;
      case "mage":
        return <Zap size={32} />;
      case "ranger":
        return <Target size={32} />;
      default:
        return <Sword size={32} />;
    }
  };

  // --- RENDER : SÉLECTION DE CLASSE ---
  if (view === "classes") {
    return (
      <div className="absolute inset-0 z-50 bg-[#050508] flex flex-col items-center justify-center font-pixel text-white select-none">
        {/* FOND ANIMÉ (Même que slots) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(30,27,75,0.4)_0%,transparent_60%)] animate-spin-slow"></div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
        </div>

        <h2 className="text-3xl text-zinc-300 mb-8 uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-500 z-10">
          Choisissez votre Destinée
        </h2>

        <div className="flex gap-6 z-10 overflow-x-auto p-4 max-w-full items-center justify-center">
          {CLASSES.map((cls, idx) => (
            <div
              key={cls.id}
              onClick={() => setSelectedClassIdx(idx)}
              className={`
                            w-64 p-6 border-2 flex flex-col items-center gap-4 transition-all duration-300 cursor-pointer relative overflow-hidden group
                            ${
                              selectedClassIdx === idx
                                ? "bg-zinc-900 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)] z-10"
                                : "bg-black/50 border-zinc-800 opacity-60 hover:opacity-100 scale-95"
                            }
                        `}
              style={{
                borderColor: selectedClassIdx === idx ? cls.color : "#27272a",
              }}
            >
              {/* Fond coloré subtil */}
              {selectedClassIdx === idx && (
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-500"
                  style={{ backgroundColor: cls.color }}
                />
              )}

              <div
                style={{ color: cls.color }}
                className="drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300"
              >
                {getIcon(cls.id)}
              </div>

              <h3
                className="text-xl font-bold uppercase tracking-wider"
                style={{ color: cls.color }}
              >
                {cls.name}
              </h3>

              <p className="text-xs text-center text-zinc-400 leading-relaxed min-h-[60px] font-sans">
                {cls.description}
              </p>

              {/* Stats Preview */}
              <div className="w-full space-y-2 mt-4 text-[10px] font-mono text-zinc-500 border-t border-zinc-800 pt-4">
                {cls.baseStats.strength && (
                  <div className="flex justify-between">
                    <span>FORCE</span>{" "}
                    <span className="text-white">{cls.baseStats.strength}</span>
                  </div>
                )}
                {cls.baseStats.agility && (
                  <div className="flex justify-between">
                    <span>AGILITÉ</span>{" "}
                    <span className="text-white">{cls.baseStats.agility}</span>
                  </div>
                )}
                {cls.baseStats.wisdom && (
                  <div className="flex justify-between">
                    <span>SAGESSE</span>{" "}
                    <span className="text-white">{cls.baseStats.wisdom}</span>
                  </div>
                )}
                {cls.baseStats.maxHp && (
                  <div className="flex justify-between">
                    <span>PV MAX</span>{" "}
                    <span className="text-white">{cls.baseStats.maxHp}</span>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmClassSelection();
                }}
                className={`mt-4 px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors ${
                  selectedClassIdx === idx
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                Sélectionner
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER INSTRUCTIONS */}
        <div className="absolute bottom-8 flex gap-8 text-zinc-500 text-[10px] uppercase tracking-wide opacity-80 z-10">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <kbd className="bg-zinc-800 px-1 rounded border border-zinc-700">
                ←
              </kbd>
              <kbd className="bg-zinc-800 px-1 rounded border border-zinc-700">
                →
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
          <div className="flex items-center gap-2">
            <kbd className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              ECHAP
            </kbd>
            <span>Retour</span>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER : SÉLECTION DE SLOT (VUE PAR DÉFAUT) ---
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
                      onClick={() => handleSlotSelect(slotId)}
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
                    onClick={() => handleSlotSelect(slotId)}
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
