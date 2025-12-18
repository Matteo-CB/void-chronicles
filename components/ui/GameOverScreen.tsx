import useGameStore from "@/store/gameStore";
import { Skull, RefreshCw, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function GameOverScreen() {
  const { player, dungeonLevel, inputMethod } = useGameStore(
    (state: any) => state
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Petit délai pour l'animation d'apparition
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center font-pixel animate-in fade-in duration-1000">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 via-transparent to-transparent pointer-events-none" />

      <div
        className={`flex flex-col items-center gap-8 transition-all duration-1000 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="relative">
          <Skull
            size={80}
            className="text-zinc-800 animate-pulse absolute top-0 left-1/2 -translate-x-1/2 blur-lg scale-150"
          />
          <Skull
            size={80}
            className="text-red-600 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 tracking-widest uppercase drop-shadow-sm">
            MORT
          </h1>
          <p className="text-red-400/60 font-serif italic text-lg tracking-wide">
            Votre voyage s'arrête ici.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg backdrop-blur-sm text-center min-w-[300px] space-y-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-zinc-400">
            <span className="text-right uppercase tracking-wider text-[10px] text-zinc-600 font-bold">
              Niveau
            </span>
            <span className="text-left font-mono text-zinc-200">
              {player.level}
            </span>

            <span className="text-right uppercase tracking-wider text-[10px] text-zinc-600 font-bold">
              Profondeur
            </span>
            <span className="text-left font-mono text-zinc-200">
              Étage {dungeonLevel}
            </span>

            <span className="text-right uppercase tracking-wider text-[10px] text-zinc-600 font-bold">
              Or
            </span>
            <span className="text-left font-mono text-yellow-500">
              {player.gold}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={handleRestart}
            className="group relative px-8 py-3 bg-red-950/20 hover:bg-red-900/30 border border-red-900/50 rounded transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-3">
              {inputMethod === "gamepad" && (
                <span className="bg-zinc-800 text-white px-2 py-0.5 rounded border border-zinc-600 text-xs font-bold shadow-lg animate-pulse">
                  A
                </span>
              )}
              <RefreshCw
                className={`w-5 h-5 text-red-500 ${
                  inputMethod === "mouse" ? "group-hover:rotate-180" : ""
                } transition-transform duration-500`}
              />
              <span className="text-red-200 font-bold uppercase tracking-widest text-sm">
                Recommencer
              </span>
            </div>
          </button>

          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            Le vide n'oublie jamais
          </p>
        </div>
      </div>
    </div>
  );
}
