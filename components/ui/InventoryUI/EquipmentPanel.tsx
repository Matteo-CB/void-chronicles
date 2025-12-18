import { Item, Equipment } from "@/types/game";
import SpriteIcon from "../SpriteIcon";

interface EquipmentPanelProps {
  equipment: Equipment;
  onUnequip: (slot: "weapon" | "armor" | "accessory") => void;
  onHover: (item: Item, e: React.MouseEvent) => void;
  onLeave: () => void;
  selectedIndex?: number; // Ajouté pour la navigation manette
}

export default function EquipmentPanel({
  equipment,
  onUnequip,
  onHover,
  onLeave,
  selectedIndex,
}: EquipmentPanelProps) {
  const renderSlot = (
    label: string,
    slotKey: "weapon" | "armor" | "accessory",
    indexRef: number // 100, 101, 102
  ) => {
    const item = equipment[slotKey];
    const isSelected = selectedIndex === indexRef;

    return (
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
          {label}
        </span>
        <div
          className={`
            relative h-16 w-full bg-black/40 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 group
            ${
              isSelected
                ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-zinc-900"
                : "border-zinc-800 hover:border-zinc-600"
            }
          `}
          onClick={() => item && onUnequip(slotKey)}
          onMouseEnter={(e) => item && onHover(item, e)}
          onMouseLeave={onLeave}
        >
          {item ? (
            <div className="relative z-10 p-2 group-hover:scale-105 transition-transform">
              <SpriteIcon
                spriteKey={item.spriteKey}
                className="w-10 h-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
              />
            </div>
          ) : (
            <div className="w-2 h-2 bg-zinc-800 rounded-full" />
          )}

          {/* Indicateur de sélection (Coins) */}
          {isSelected && (
            <>
              <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-white opacity-80" />
              <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-white opacity-80" />
              <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-white opacity-80" />
              <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-white opacity-80" />
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-[200px]">
      {renderSlot("Arme Principale", "weapon", 100)}
      {renderSlot("Protection", "armor", 101)}
      {renderSlot("Relique", "accessory", 102)}
    </div>
  );
}
