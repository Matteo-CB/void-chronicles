import { Coins } from "lucide-react";
import { Item } from "@/types/game";
import SpriteIcon from "../SpriteIcon";
import useGameStore from "@/store/gameStore";

interface ShopItemProps {
  item: Item;
  canAfford: boolean;
  isSelected: boolean;
  onBuy: () => void;
}

export default function ShopItem({
  item,
  canAfford,
  isSelected,
  onBuy,
}: ShopItemProps) {
  const inputMethod = useGameStore((s) => s.inputMethod);

  // Fonction pour nettoyer l'affichage des stats
  const getCleanStats = () => {
    if (!item.stats) return [];

    // Mapping des noms pour être plus court
    const shortNames: Record<string, string> = {
      attack: "ATK",
      defense: "DEF",
      hp: "PV",
      maxHp: "PV Max",
      mana: "PM",
      maxMana: "PM Max",
      speed: "VIT",
      critChance: "CRIT",
      strength: "FOR",
      agility: "AGI",
      wisdom: "SAG",
      endurance: "END",
    };

    return Object.entries(item.stats)
      .filter(([_, value]) => value > 0) // On ne montre que ce qui est positif
      .slice(0, 3) // Max 3 stats pour pas surcharger
      .map(([key, value]) => ({
        label: shortNames[key] || key.substring(0, 3).toUpperCase(),
        value:
          typeof value === "number" && value < 1
            ? `${Math.round(value * 100)}%`
            : `+${value}`,
      }));
  };

  const visibleStats = getCleanStats();

  return (
    <div
      onClick={onBuy}
      className={`
        relative group flex flex-col p-3 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
        h-[240px] w-full
        ${
          isSelected
            ? "bg-yellow-950/30 border-yellow-500/80 shadow-[0_0_20px_rgba(234,179,8,0.15)] scale-[1.02]"
            : "bg-black/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50"
        }
        ${!canAfford ? "opacity-60 grayscale-[0.5]" : "opacity-100"}
      `}
    >
      {/* Glow si sélectionné */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
      )}

      {/* En-tête : Image et Type */}
      <div className="flex flex-col items-center gap-2 mb-2 relative z-10 flex-shrink-0">
        <div
          className={`p-3 rounded-lg bg-zinc-950 border shadow-inner ${
            isSelected ? "border-yellow-700/50" : "border-zinc-800"
          }`}
        >
          <SpriteIcon
            spriteKey={item.spriteKey}
            size={42}
            className="drop-shadow-lg"
          />
        </div>
      </div>

      {/* Corps : Nom et Stats */}
      <div className="flex-1 flex flex-col items-center text-center gap-1 overflow-hidden relative z-10">
        <h4
          className={`font-bold text-sm leading-tight line-clamp-1 ${
            isSelected ? "text-yellow-200" : "text-zinc-200"
          }`}
        >
          {item.name}
        </h4>
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono mb-1">
          {item.type}
        </span>

        {/* Liste Stats Épurée */}
        <div className="w-full bg-black/30 rounded p-1.5 space-y-1">
          {visibleStats.length > 0 ? (
            visibleStats.map((stat, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-[10px] px-1"
              >
                <span className="text-zinc-500 font-bold">{stat.label}</span>
                <span className="text-zinc-300 font-mono">{stat.value}</span>
              </div>
            ))
          ) : (
            <div className="text-[10px] text-zinc-600 italic py-1">
              Aucune stat
            </div>
          )}
        </div>

        {/* Description courte (optionnelle si place) */}
        {item.description && (
          <p className="text-[9px] text-zinc-500 mt-1 line-clamp-2 px-1 leading-tight">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer : Prix et Action */}
      <div className="mt-auto pt-2 border-t border-dashed border-zinc-800 flex justify-between items-center relative z-10 flex-shrink-0">
        <div
          className={`flex items-center gap-1.5 font-mono font-bold text-sm ${
            canAfford
              ? isSelected
                ? "text-yellow-400"
                : "text-yellow-600"
              : "text-red-500"
          }`}
        >
          {item.value} <Coins size={12} />
        </div>

        {/* CORRECTION : On cache ce bouton si on est sur Manette car le Footer du menu gère déjà l'affichage */}
        {isSelected && canAfford && inputMethod !== "gamepad" && (
          <span className="text-[9px] bg-yellow-600 text-black font-bold px-2 py-1 rounded animate-pulse">
            ACHETER
          </span>
        )}
      </div>
    </div>
  );
}
