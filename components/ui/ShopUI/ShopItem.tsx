import { Item } from "@/types/game";
import SpriteIcon from "../SpriteIcon";
import { Coins, Sparkles, ArrowRight } from "lucide-react";

interface ShopItemProps {
  item: Item;
  canAfford: boolean;
  onBuy: () => void;
  isSelected?: boolean;
}

export default function ShopItem({
  item,
  canAfford,
  onBuy,
  isSelected,
}: ShopItemProps) {
  if (!item) return null;

  return (
    <div
      className={`
        relative flex gap-3 p-3 border rounded transition-all duration-150 group h-24 overflow-hidden
        ${
          canAfford
            ? "bg-zinc-900/40 hover:bg-zinc-900/80 cursor-pointer"
            : "bg-zinc-950/60 opacity-50 grayscale border-zinc-900/50 cursor-not-allowed"
        }
        ${
          isSelected
            ? "border-yellow-500/80 bg-zinc-900 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)] scale-[1.02] z-10 ring-1 ring-yellow-500/20"
            : "border-zinc-800 hover:border-zinc-600"
        }
      `}
      onClick={canAfford ? onBuy : undefined}
    >
      {/* Background Glow au survol/sélection */}
      {isSelected && (
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-yellow-500/10 to-transparent pointer-events-none"></div>
      )}

      {/* Icône */}
      <div
        className={`
        relative w-16 h-full bg-black border flex items-center justify-center shrink-0 rounded shadow-inner overflow-hidden
        ${isSelected ? "border-yellow-800" : "border-zinc-800"}
      `}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-zinc-800/50 to-black opacity-50"></div>
        <SpriteIcon
          type={item.spriteKey || item.type || "ROCK"}
          className="w-10 h-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10"
        />
        {/* Rareté indicateur (petit point de couleur) */}
        <div
          className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full shadow-sm"
          style={{ backgroundColor: item.color || "#fff" }}
        ></div>
      </div>

      {/* Info Colonne */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        {/* Haut : Nom et Type */}
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4
              className={`font-bold text-xs leading-tight tracking-wide truncate ${
                isSelected ? "text-yellow-100" : "text-zinc-300"
              }`}
            >
              {item.name}
            </h4>
          </div>
          <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono mt-1 flex items-center gap-1">
            {item.type} <span className="text-zinc-700">•</span> N.
            {item.level || 1}
          </p>
        </div>

        {/* Bas : Stats et Prix */}
        <div className="flex items-end justify-between mt-1">
          {/* Mini Stats */}
          <div className="flex flex-col gap-0.5">
            {item.stats &&
              Object.entries(item.stats)
                .slice(0, 1)
                .map(([key, val]) => (
                  <span key={key} className="text-[9px] text-zinc-400">
                    {key.slice(0, 3).toUpperCase()}{" "}
                    <span className="text-zinc-200">+{val}</span>
                  </span>
                ))}
          </div>

          {/* Prix Bouton */}
          <button
            className={`
                    flex items-center gap-2 px-2 py-1 rounded border transition-all
                    ${
                      canAfford
                        ? isSelected
                          ? "bg-yellow-600 border-yellow-500 text-white shadow-lg"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 group-hover:border-zinc-600 group-hover:text-zinc-200"
                        : "bg-transparent border-transparent text-red-800"
                    }
                `}
          >
            <div
              className={`flex items-center gap-1 font-mono text-xs font-bold ${
                canAfford ? "" : "text-red-700 decoration-line-through"
              }`}
            >
              {item.value || 10}
              <Coins size={10} />
            </div>

            {canAfford && isSelected && (
              <ArrowRight size={10} className="animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
