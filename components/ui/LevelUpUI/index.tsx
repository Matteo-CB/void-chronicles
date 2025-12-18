import useGameStore from "@/store/gameStore";
import { useEffect, useRef } from "react";
import {
  ArrowUpCircle,
  Crown,
  Shield,
  Sword,
  Brain,
  Feather,
  Clover,
} from "lucide-react";
import StatRow from "./StatRow";

export default function LevelUpUI() {
  const {
    player,
    incrementAttribute,
    menuSelectionIndex,
    inputMethod,
    unlockMastery,
    closeUi,
  } = useGameStore((state: any) => state);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll pour garder la sélection visible
  useEffect(() => {
    if (containerRef.current && menuSelectionIndex >= 0) {
      // Logique simplifiée pour scroller vers l'élément si besoin
      const rowHeight = 80; // Hauteur approx d'une ligne
      containerRef.current.scrollTop =
        menuSelectionIndex * rowHeight - containerRef.current.clientHeight / 2;
    }
  }, [menuSelectionIndex]);

  const stats = [
    {
      key: "strength",
      label: "Force",
      icon: Sword,
      desc: "Augmente les dégâts physiques",
    },
    {
      key: "endurance",
      label: "Endurance",
      icon: Shield,
      desc: "Augmente les PV max",
    },
    {
      key: "wisdom",
      label: "Sagesse",
      icon: Brain,
      desc: "Augmente le Mana et les dégâts magiques",
    },
    {
      key: "agility",
      label: "Agilité",
      icon: Feather,
      desc: "Augmente la vitesse et l'esquive",
    },
    {
      key: "luck",
      label: "Chance",
      icon: Clover,
      desc: "Augmente le taux de critique et le butin",
    },
  ];

  // Calcul des points dépensés (Hypothèse: stats de base = 10)
  const spentPoints =
    player.stats.strength -
    10 +
    (player.stats.endurance - 10) +
    (player.stats.wisdom - 10) +
    (player.stats.agility - 10) +
    (player.stats.luck - 10);

  const availablePoints = Math.max(0, player.level - 1 - spentPoints);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 font-pixel">
      <div className="w-[90vw] max-w-[800px] bg-[#0c0a09] border-2 border-yellow-600/50 rounded-xl p-8 shadow-[0_0_100px_rgba(202,138,4,0.2)] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
          <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
            <ArrowUpCircle className="text-yellow-500 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl text-yellow-500 font-bold uppercase tracking-widest">
              Niveau Supérieur !
            </h2>
            <p className="text-zinc-500 text-xs mt-1">
              Vous avez atteint le niveau{" "}
              <span className="text-white font-mono text-lg">
                {player.level}
              </span>
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <span className="text-xs text-zinc-500 uppercase">
              Points Disponibles
            </span>
            <span className="text-3xl text-yellow-400 font-black drop-shadow-md animate-pulse">
              {availablePoints}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          className="space-y-3 mb-8 max-h-[400px] overflow-y-auto custom-scroll pr-2"
          ref={containerRef}
        >
          {stats.map((stat, idx) => (
            <div
              key={stat.key}
              className={`transition-all duration-200 ${
                menuSelectionIndex === idx ? "translate-x-2" : ""
              }`}
            >
              <StatRow
                icon={stat.icon}
                label={stat.label}
                value={player.stats[stat.key]}
                description={stat.desc}
                onIncrement={() =>
                  availablePoints > 0 && incrementAttribute(stat.key)
                }
                canIncrement={availablePoints > 0}
                isSelected={menuSelectionIndex === idx}
              />
            </div>
          ))}
        </div>

        {/* Footer Prompts */}
        <div className="flex justify-between items-center pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  inputMethod === "gamepad"
                    ? "bg-green-600 border-green-400 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300"
                }`}
              >
                {inputMethod === "gamepad" ? "A" : "ENTRÉE"}
              </span>
              <span>Améliorer</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  inputMethod === "gamepad"
                    ? "bg-zinc-800 border-zinc-600"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300"
                }`}
              >
                {inputMethod === "gamepad" ? "DIR" : "FLÈCHES"}
              </span>
              <span>Choisir</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 rounded border ${
                inputMethod === "gamepad"
                  ? "bg-red-900/50 border-red-800"
                  : "bg-zinc-800 border-zinc-700"
              }`}
            >
              {inputMethod === "gamepad" ? "B" : "ECHAP"}
            </span>
            <span>Fermer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
