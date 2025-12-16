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
        relative w-12 h-12 border-2 bg-zinc-900/80 flex items-center justify-center cursor-pointer transition-all
        ${
          isSelected
            ? "border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] bg-zinc-800"
            : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800"
        }
      `}
      onClick={onClick}
      onContextMenu={onRightClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {item ? (
        <SpriteIcon
          spriteKey={item.spriteKey || "POTION"}
          className="w-8 h-8 drop-shadow-md"
        />
      ) : (
        <div className="w-1 h-1 bg-zinc-800 rounded-full opacity-20" />
      )}
    </div>
  );
}
