"use client";

import useGameStore from "@/store/gameStore";
import { RefreshCw, Skull } from "lucide-react";
import { useEffect, useState } from "react";

export default function GameOverScreen() {
  const { player, dungeonLevel, inputMethod } = useGameStore((state) => state);
  const [canRestart, setCanRestart] = useState(false);

  useEffect(() => {
    // Petit délai pour éviter le miss-click immédiat
    const timer = setTimeout(() => setCanRestart(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- CORRECTION : Écouteur Clavier pour le Restart ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canRestart) return;
      // Supporte Entrée, Espace, mais aussi A et E (actions classiques)
      if (["Enter", " ", "a", "A", "e", "E"].includes(e.key)) {
        window.location.reload();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canRestart]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 animate-in fade-in duration-1000 font-pixel">
      <div className="flex flex-col items-center gap-8 text-center p-8 border-4 border-red-900/50 bg-red-950/10 rounded-xl shadow-[0_0_100px_rgba(220,38,38,0.2)]">
        <div className="relative">
          <Skull
            size={80}
            className="text-red-600 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
          />
          <div className="absolute inset-0 blur-md bg-red-500/20 rounded-full animate-ping"></div>
        </div>

        <div>
          <h2 className="text-6xl font-black text-red-600 uppercase tracking-widest mb-2 drop-shadow-md glitch-text">
            MORT
          </h2>
          <p className="text-zinc-500 font-mono text-sm tracking-wide">
            Votre âme rejoint le néant...
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full bg-black/40 p-4 rounded border border-red-900/30">
          <div className="flex justify-between text-red-200/80 font-mono text-xs">
            <span>NIVEAU ATTEINT</span>
            <span className="font-bold text-white">{player.level}</span>
          </div>
          <div className="flex justify-between text-red-200/80 font-mono text-xs">
            <span>ÉTAGE DU DONJON</span>
            <span className="font-bold text-white">{dungeonLevel}</span>
          </div>
          <div className="flex justify-between text-red-200/80 font-mono text-xs">
            <span>OR COLLECTÉ</span>
            <span className="font-bold text-yellow-500">{player.gold}</span>
          </div>
        </div>

        <button
          onClick={() => canRestart && window.location.reload()}
          className={`
            group flex items-center gap-3 px-8 py-3 rounded text-white font-bold uppercase tracking-wider transition-all duration-300
            ${
              canRestart
                ? "bg-red-700 hover:bg-red-600 hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-pointer"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed grayscale opacity-50"
            }
          `}
        >
          <RefreshCw
            size={20}
            className={
              canRestart
                ? "group-hover:rotate-180 transition-transform duration-500"
                : ""
            }
          />
          <span>Recommencer</span>
        </button>

        <div className="text-[10px] text-zinc-600 uppercase tracking-widest animate-pulse">
          {canRestart
            ? inputMethod === "gamepad"
              ? "Appuyez sur A pour revivre"
              : "Appuyez sur ESPACE ou A pour revivre"
            : "..."}
        </div>
      </div>
    </div>
  );
}
