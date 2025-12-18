import { Item } from "@/types/game";
import SpriteIcon from "../SpriteIcon";

interface InventorySlotProps {
  item?: Item;
  index: number;
  isSelected?: boolean;
  onClick: () => void;
  onHover: (e: React.MouseEvent) => void;
  onLeave: () => void;
  onRightClick: (e: React.MouseEvent) => void;
}

export default function InventorySlot({
  item,
  isSelected,
  onClick,
  onHover,
  onLeave,
  onRightClick,
}: InventorySlotProps) {
  return (
    <div
      className={`
        relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer transition-all duration-150 group rounded-md
        ${
          isSelected
            ? "bg-zinc-800 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] z-20"
            : "bg-black/60 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800"
        }
        ${!item ? "shadow-inner" : ""}
      `}
      onClick={onClick}
      onContextMenu={onRightClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Background pattern for empty slots */}
      {!item && (
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-500 to-transparent pointer-events-none" />
      )}

      {/* Rarity Glow (Simulated) */}
      {item && isSelected && (
        <div className="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none" />
      )}

      {item ? (
        <div className="relative z-10 p-1 group-hover:scale-105 transition-transform duration-200">
          <SpriteIcon
            spriteKey={item.spriteKey || "POTION"}
            className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] filter contrast-125"
          />
          {/* Stack count indicator if needed in future */}
          {(item as any).quantity > 1 && (
            <span className="absolute -bottom-1 -right-1 text-[8px] font-bold text-white bg-black/80 px-1 rounded border border-zinc-700">
              {(item as any).quantity}
            </span>
          )}
        </div>
      ) : (
        <div className="w-1.5 h-1.5 bg-zinc-800/50 rounded-full shadow-inner" />
      )}

      {/* Selection Corners (Style Magnifique) */}
      {isSelected && (
        <>
          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-white opacity-80" />
          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-white opacity-80" />
          <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-white opacity-80" />
          <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-white opacity-80" />
        </>
      )}
    </div>
  );
}
