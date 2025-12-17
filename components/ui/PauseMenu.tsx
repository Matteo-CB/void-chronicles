"use client";

import { useState, useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";
import {
  Save,
  LogOut,
  HelpCircle,
  Play,
  Gamepad2,
  Keyboard,
  X,
  CheckCircle2,
} from "lucide-react";

export default function PauseMenu() {
  const [selectedOption, setSelectedOption] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const setGameState = useGameStore((s) => s.setGameState);
  const player = useGameStore((s) => s.player);
  const dlvl = useGameStore((s) => s.dungeonLevel);

  // Refs pour la gestion Manette (évite les re-renders inutiles)
  const lastInputTime = useRef<number>(0);
  const buttonPressed = useRef<boolean>(false);

  const currentSlot = 1;

  // Options du menu
  const options = [
    {
      label: "Reprendre",
      icon: Play,
      action: () => setGameState("playing"),
    },
    {
      label: "Sauvegarder",
      icon: Save,
      action: () => handleSave(),
    },
    {
      label: "Commandes",
      icon: HelpCircle,
      action: () => setShowHelp(true),
    },
    {
      label: "Quitter",
      icon: LogOut,
      // Reset complet du jeu
      action: () => window.location.reload(),
    },
  ];

  // --- GESTION MANETTE (POLLING) ---
  useEffect(() => {
    let animationFrameId: number;

    const checkGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0]; // On prend la première manette active

      if (gp) {
        const now = Date.now();
        const COOLDOWN = 150; // Ms entre deux déplacements

        // Si l'écran d'aide est affiché
        if (showHelp) {
          // B (Button 1) ou Start (Button 9) ou Select (Button 8) pour fermer l'aide
          if (
            gp.buttons[1]?.pressed ||
            gp.buttons[9]?.pressed ||
            gp.buttons[8]?.pressed
          ) {
            if (!buttonPressed.current) {
              setShowHelp(false);
              buttonPressed.current = true;
            }
          } else {
            buttonPressed.current = false;
          }
        } else {
          // --- NAVIGATION MENU ---

          // 1. Navigation Haut/Bas (Stick & D-Pad)
          if (now - lastInputTime.current > COOLDOWN) {
            const axisY = gp.axes[1];
            const dpadUp = gp.buttons[12]?.pressed;
            const dpadDown = gp.buttons[13]?.pressed;

            if (axisY < -0.5 || dpadUp) {
              // HAUT
              setSelectedOption((prev) =>
                prev > 0 ? prev - 1 : options.length - 1
              );
              lastInputTime.current = now;
            } else if (axisY > 0.5 || dpadDown) {
              // BAS
              setSelectedOption((prev) =>
                prev < options.length - 1 ? prev + 1 : 0
              );
              lastInputTime.current = now;
            }
          }

          // 2. Validation (A / Cross - Button 0)
          if (gp.buttons[0]?.pressed) {
            if (!buttonPressed.current) {
              options[selectedOption].action();
              buttonPressed.current = true;
            }
          } else {
            buttonPressed.current = false;
          }
        }
      }

      animationFrameId = requestAnimationFrame(checkGamepad);
    };

    // Lance la boucle de vérification
    animationFrameId = requestAnimationFrame(checkGamepad);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedOption, showHelp, options]);

  // --- GESTION CLAVIER ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHelp) {
        if (["Escape", "Backspace", "Enter", " "].includes(e.key))
          setShowHelp(false);
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "z":
        case "Z":
          setSelectedOption((prev) =>
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case "ArrowDown":
        case "s":
        case "S":
          setSelectedOption((prev) =>
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case "Enter":
        case " ":
          options[selectedOption].action();
          break;
        case "Escape":
          setGameState("playing");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOption, showHelp, options, setGameState]);

  const handleSave = () => {
    try {
      const state = useGameStore.getState();

      const saveData = {
        player: state.player,
        inventory: state.inventory,
        dungeonLevel: state.dungeonLevel,
        gold: state.player.gold,
      };

      localStorage.setItem(
        `void_chronicles_save_slot_${currentSlot}`,
        JSON.stringify(saveData)
      );

      const metaKey = "void_chronicles_meta";
      const oldMeta = JSON.parse(localStorage.getItem(metaKey) || "{}");
      const newMeta = {
        ...oldMeta,
        [currentSlot]: {
          date: new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          level: player.level,
          floor: dlvl,
          gold: player.gold,
        },
      };
      localStorage.setItem(metaKey, JSON.stringify(newMeta));

      setSaveStatus("Progression Sauvegardée");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e) {
      setSaveStatus("Erreur de sauvegarde !");
      console.error(e);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 font-pixel text-white">
      {/* TITRE FOND */}
      <div className="absolute top-10 w-full text-center pointer-events-none">
        <h2 className="text-6xl text-zinc-800 font-black tracking-[0.5em] opacity-30 uppercase">
          Pause
        </h2>
      </div>

      {!showHelp ? (
        // --- MENU PRINCIPAL ---
        <div className="relative z-10 w-full max-w-sm flex flex-col gap-3">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={opt.action}
              onMouseEnter={() => setSelectedOption(idx)}
              className={`group flex items-center justify-between p-4 border-l-4 transition-all duration-200 ${
                selectedOption === idx
                  ? "border-red-500 bg-zinc-900 translate-x-2 shadow-[10px_0_20px_rgba(0,0,0,0.5)]"
                  : "border-zinc-800 bg-black/40 hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center gap-4">
                <opt.icon
                  className={`transition-colors ${
                    selectedOption === idx ? "text-red-500" : "text-zinc-600"
                  }`}
                  size={20}
                />
                <span
                  className={`text-sm tracking-widest uppercase font-bold ${
                    selectedOption === idx ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {opt.label}
                </span>
              </div>
              {selectedOption === idx && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}

          {saveStatus && (
            <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-2 text-green-400 text-xs animate-in slide-in-from-top-2 fade-in">
              <CheckCircle2 size={14} /> {saveStatus}
            </div>
          )}
        </div>
      ) : (
        // --- ÉCRAN D'AIDE (MIS A JOUR AVEC LES 2 ATTAQUES) ---
        <div className="relative z-10 w-full max-w-4xl p-8 bg-zinc-950/90 border border-zinc-800 rounded-xl shadow-2xl animate-in zoom-in-95">
          <button
            onClick={() => setShowHelp(false)}
            className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-8 border-b border-zinc-800 pb-4">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              CONTRÔLES DU JEU
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* CLAVIER */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 text-zinc-100 border-b border-zinc-800 pb-2">
                <Keyboard className="text-zinc-500" />
                <span className="text-sm font-bold tracking-wider">
                  CLAVIER / SOURIS
                </span>
              </div>

              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex justify-between items-center">
                  <span>Mouvement</span>
                  <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    ZQSD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Attaque Rapide</span>
                  <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    CLIC GAUCHE / K
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Attaque Lourde</span>
                  <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    CLIC DROIT / L
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Interagir</span>
                  <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    ESPACE / E
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Menu & Inventaire</span>
                  <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    TAB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pause</span>
                  <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    ECHAP
                  </span>
                </div>
              </div>
            </div>

            {/* MANETTE */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 text-zinc-100 border-b border-zinc-800 pb-2">
                <Gamepad2 className="text-zinc-500" />
                <span className="text-sm font-bold tracking-wider">
                  MANETTE
                </span>
              </div>

              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex justify-between items-center">
                  <span>Mouvement</span>
                  <span className="font-mono text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/50">
                    STICK GAUCHE
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Attaque Rapide</span>
                  <span className="font-mono text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/50">
                    X / CARRÉ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Attaque Lourde</span>
                  <span className="font-mono text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/50">
                    Y / R2
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Interagir / Valider</span>
                  <span className="font-mono text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/50">
                    A / CROIX
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Menu & Inventaire</span>
                  <span className="font-mono text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/50">
                    SELECT / BACK
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pause</span>
                  <span className="font-mono text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/50">
                    START
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 text-center">
            <span className="text-[10px] text-zinc-500 animate-pulse">
              Appuyez sur B / ECHAP pour revenir
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
