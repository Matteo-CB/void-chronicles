import { useState } from "react";
import useGameStore from "@/store/gameStore";
import { Item } from "@/types/game";
import InventorySlot from "./InventorySlot";
import EquipmentPanel from "./EquipmentPanel";
import ItemTooltip from "./ItemTooltip";
import { X } from "lucide-react";

export default function InventoryUI() {
  const {
    player,
    inventory,
    toggleInventory,
    equipItem,
    unequipItem,
    useItem,
    menuSelectionIndex,
    inputMethod,
  } = useGameStore((state: any) => state);

  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleHover = (item: Item, e: React.MouseEvent) => {
    setHoveredItem(item);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleSlotClick = (item: Item) => {
    if (!item) return;
    if (item.type === "potion" || (item as any).type === "scroll") {
      useItem(item.id);
    } else {
      equipItem(item);
    }
  };

  const selectedItem = inventory[menuSelectionIndex];
  const activeItem =
    inputMethod === "mouse" ? hoveredItem : selectedItem || null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="relative flex w-[800px] h-[500px] bg-zinc-950 border border-zinc-700 shadow-2xl rounded-lg overflow-hidden">
        <div className="absolute top-0 right-0 p-4 z-10">
          <div className="flex items-center gap-3 text-[10px] text-zinc-500 uppercase">
            <span>
              {inputMethod === "gamepad" ? "[B] FERMER" : "[ECHAP] FERMER"}
            </span>
            <button
              onClick={toggleInventory}
              className="p-1 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <EquipmentPanel
          equipment={player.equipment}
          onUnequip={(slot) => unequipItem(slot)}
          onHover={handleHover}
          onLeave={() => setHoveredItem(null)}
        />

        <div className="flex-1 p-8 overflow-y-auto flex flex-col">
          <h2 className="text-2xl font-serif text-zinc-200 mb-6 border-b border-zinc-800 pb-2">
            Inventaire
          </h2>

          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 30 }).map((_, i) => {
              const item = inventory[i];
              const isSelected = i === menuSelectionIndex;
              return (
                <InventorySlot
                  key={i}
                  index={i}
                  item={item}
                  isSelected={isSelected}
                  onClick={() => item && handleSlotClick(item)}
                  onRightClick={(e) => {
                    e.preventDefault();
                    if (item) handleSlotClick(item);
                  }}
                  onHover={(e) => item && handleHover(item, e)}
                  onLeave={() => setHoveredItem(null)}
                />
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-zinc-800 text-center text-xs text-zinc-500 flex justify-center gap-6">
            <span className="flex items-center gap-1">
              <span className="font-bold text-zinc-300">
                {inputMethod === "gamepad" ? "[A]" : "[ENTRÉE]"}
              </span>{" "}
              UTILISER / ÉQUIPER
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-zinc-300">
                {inputMethod === "gamepad" ? "[DIR]" : "[FLÈCHES]"}
              </span>{" "}
              SÉLECTIONNER
            </span>
          </div>
        </div>

        {activeItem && inputMethod !== "mouse" && (
          <div className="absolute bottom-4 right-4 bg-zinc-900 border border-zinc-700 p-4 rounded w-64 shadow-xl pointer-events-none z-20">
            <h3 className="font-bold text-white">{activeItem.name}</h3>
            <p className="text-xs text-zinc-400 mb-2 uppercase">
              {activeItem.type}
            </p>
            {activeItem.stats &&
              Object.entries(activeItem.stats).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between text-xs text-zinc-300"
                >
                  <span>{k.slice(0, 3)}</span>
                  {/* Correction : On s'assure que v est affichable */}
                  <span>+{String(v)}</span>
                </div>
              ))}
          </div>
        )}

        {activeItem && inputMethod === "mouse" && (
          <ItemTooltip item={activeItem} x={mousePos.x} y={mousePos.y} />
        )}
      </div>
    </div>
  );
}
