import { useState, useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";
import { Item } from "@/types/game";
import InventorySlot from "./InventorySlot";
import EquipmentPanel from "./EquipmentPanel";
import ItemTooltip from "./ItemTooltip";
import { X, Shield, Backpack } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // --- AUTO-SCROLL LOGIC ---
  useEffect(() => {
    if (inputMethod === "gamepad" && menuSelectionIndex < 100) {
      const el = document.getElementById(
        `inventory-slot-${menuSelectionIndex}`
      );
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [menuSelectionIndex, inputMethod]);

  const handleHover = (item: Item, e: React.MouseEvent) => {
    // On ignore le survol souris si on est en mode manette pour éviter les conflits
    if (inputMethod === "gamepad") return;

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

  // --- LOGIQUE DE SÉLECTION INTELLIGENTE ---
  let selectedItem: Item | null = null;
  let actionLabel = "Action"; // Label par défaut

  if (menuSelectionIndex < 100) {
    // Inventaire
    selectedItem = inventory[menuSelectionIndex];
    if (selectedItem) {
      actionLabel =
        selectedItem.type === "potion" ||
        (selectedItem as any).type === "scroll"
          ? "Utiliser"
          : "Équiper";
    }
  } else {
    // Équipement
    if (menuSelectionIndex === 100) selectedItem = player.equipment.weapon;
    else if (menuSelectionIndex === 101) selectedItem = player.equipment.armor;
    else if (menuSelectionIndex === 102)
      selectedItem = player.equipment.accessory;

    if (selectedItem) actionLabel = "Déséquiper";
  }

  const activeItem =
    inputMethod === "mouse" ? hoveredItem : selectedItem || null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative flex w-full max-w-[900px] h-[600px] bg-[#0a0a0a] border-2 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden flex-col md:flex-row font-pixel">
        {/* --- PANNEAU GAUCHE : ÉQUIPEMENT --- */}
        <div className="w-full md:w-[320px] bg-zinc-950/80 border-r-2 border-zinc-800 p-6 flex flex-col relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />

          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
            <div className="p-2 bg-zinc-900 border border-zinc-700 rounded">
              <Shield className="text-zinc-400 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-zinc-200 font-bold uppercase tracking-widest text-sm">
                Équipement
              </h2>
              <p className="text-[10px] text-zinc-500">
                Stats: {player.stats.attack} ATK / {player.stats.defense} DEF
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <EquipmentPanel
              equipment={player.equipment}
              selectedIndex={menuSelectionIndex}
              onUnequip={(slot) => unequipItem(slot)}
              onHover={handleHover}
              onLeave={() => setHoveredItem(null)}
            />
          </div>
        </div>

        {/* --- PANNEAU DROIT : INVENTAIRE --- */}
        <div className="flex-1 bg-black/60 p-6 md:p-8 flex flex-col relative">
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={toggleInventory}
              className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Backpack className="text-zinc-500" size={20} />
            <h2 className="text-xl text-zinc-300 font-bold uppercase tracking-wider">
              Sac à dos{" "}
              <span className="text-zinc-600 text-sm ml-2">
                ({inventory.filter(Boolean).length}/30)
              </span>
            </h2>
          </div>

          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto custom-scroll pr-2"
          >
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 content-start pb-4">
              {Array.from({ length: 30 }).map((_, i) => {
                const item = inventory[i];
                const isSelected = i === menuSelectionIndex;
                return (
                  <div key={i} id={`inventory-slot-${i}`}>
                    <InventorySlot
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- PIED DE PAGE : COMMANDES DYNAMIQUES --- */}
          <div className="mt-4 pt-4 border-t border-zinc-800 text-center text-[10px] text-zinc-500 flex justify-between uppercase tracking-wider font-bold">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 transition-colors duration-200">
                <span
                  className={`px-1.5 py-0.5 rounded border ${
                    selectedItem
                      ? "bg-zinc-200 text-black border-white"
                      : "bg-zinc-800 text-zinc-500 border-zinc-700"
                  }`}
                >
                  {inputMethod === "gamepad" ? "A" : "ENTRÉE"}
                </span>
                <span
                  className={selectedItem ? "text-zinc-200" : "text-zinc-600"}
                >
                  {actionLabel}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                  {inputMethod === "gamepad" ? "D-PAD" : "FLÈCHES"}
                </span>
                <span>Naviguer</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                {inputMethod === "gamepad" ? "B" : "ECHAP"}
              </span>
              <span>Fermer</span>
            </span>
          </div>
        </div>

        {/* --- PANNEAU D'INFO FLOTTANT --- */}
        {activeItem && inputMethod !== "mouse" && (
          <div className="absolute bottom-20 right-8 bg-zinc-950/95 border border-zinc-700 p-4 rounded-lg w-64 shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-none z-30 animate-in slide-in-from-right-5 fade-in duration-150">
            <h3 className="font-bold text-amber-500 text-sm mb-0.5">
              {activeItem.name}
            </h3>
            <p className="text-[10px] text-zinc-400 mb-3 uppercase tracking-widest border-b border-zinc-800 pb-1">
              {activeItem.type}
            </p>

            {activeItem.stats ? (
              <div className="space-y-1">
                {Object.entries(activeItem.stats).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[10px]">
                    <span className="text-zinc-500 uppercase">{k}</span>
                    <span className="text-zinc-200 font-mono">
                      +{String(v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-600 italic">Aucune stat.</p>
            )}

            <div className="mt-3 pt-2 border-t border-zinc-800 text-[9px] text-zinc-500 italic">
              {activeItem.description || "Un objet mystérieux."}
            </div>
          </div>
        )}

        {activeItem && inputMethod === "mouse" && (
          <ItemTooltip item={activeItem} x={mousePos.x} y={mousePos.y} />
        )}
      </div>
    </div>
  );
}
