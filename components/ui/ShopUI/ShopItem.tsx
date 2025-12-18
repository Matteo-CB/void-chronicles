import { Coins, Shield, Sparkles, Zap, Scroll, Skull } from "lucide-react";
import { Item } from "@/types/game";

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
  const getIcon = () => {
    switch (item.type) {
      case "weapon":
        return <Skull size={20} className="text-red-400" />;
      case "armor":
        return <Shield size={20} className="text-blue-400" />;
      case "potion":
        return <Sparkles size={20} className="text-pink-400" />;
      case "scroll":
        return <Scroll size={20} className="text-purple-400" />;
      default:
        return <Zap size={20} className="text-yellow-400" />;
    }
  };

  return (
    <div
      onClick={onBuy}
      className={`
        relative group flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
        ${
          isSelected
            ? "bg-yellow-950/20 border-yellow-500/80 shadow-[0_0_30px_rgba(234,179,8,0.2)] -translate-y-1"
            : "bg-black/40 border-zinc-800 hover:border-zinc-600"
        }
        ${!canAfford ? "opacity-50 grayscale-[0.8]" : "opacity-100"}
      `}
    >
      {/* Selection Glow Effect */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent pointer-events-none animate-pulse" />
      )}

      {/* Header: Icon + Name */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex gap-3 items-center">
          <div
            className={`p-2 rounded-lg bg-black border shadow-inner ${
              isSelected ? "border-yellow-700/50" : "border-zinc-800"
            }`}
          >
            {getIcon()}
          </div>
          <div>
            <h4
              className={`font-bold text-sm leading-tight ${
                isSelected ? "text-yellow-200" : "text-zinc-300"
              }`}
            >
              {item.name}
            </h4>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              {item.type}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {item.stats && (
        <div className="space-y-1 my-1 relative z-10">
          {Object.entries(item.stats).map(([key, value]) => (
            <div key={key} className="flex justify-between text-[10px]">
              <span className="text-zinc-500 uppercase">{key}</span>
              <span className="text-zinc-300 font-mono">+{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="text-[10px] text-zinc-500 leading-snug line-clamp-2 h-8 relative z-10">
        {item.description}
      </p>

      {/* Footer: Price */}
      <div className="mt-auto pt-3 border-t border-dashed border-zinc-800 flex justify-between items-center relative z-10">
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

        {isSelected && canAfford && (
          <span className="text-[9px] bg-yellow-600 text-black font-bold px-1.5 py-0.5 rounded animate-bounce">
            ACHETER
          </span>
        )}
      </div>
    </div>
  );
}
