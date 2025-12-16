import { Item } from "@/types/game";
import InventorySlot from "./InventorySlot";

// Structure attendue pour l'équipement
interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

interface EquipmentPanelProps {
  equipment: Equipment;
  onUnequip: (slot: string) => void;
  onHover: (item: Item, e: React.MouseEvent) => void;
  onLeave: () => void;
}

export default function EquipmentPanel({
  equipment,
  onUnequip,
  onHover,
  onLeave,
}: EquipmentPanelProps) {
  const slots = [
    { key: "weapon", label: "Arme" },
    { key: "armor", label: "Armure" },
    { key: "accessory", label: "Relique" },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900/50 border-r border-zinc-700 w-48">
      <h3 className="text-zinc-400 text-xs uppercase tracking-widest text-center mb-2">
        Équipement
      </h3>

      <div className="flex flex-col gap-4 items-center">
        {slots.map((slot) => {
          const item = equipment[slot.key as keyof Equipment];
          return (
            <div key={slot.key} className="flex flex-col items-center gap-1">
              <InventorySlot
                index={-1}
                item={item || undefined}
                onClick={() => item && onUnequip(slot.key)}
                onRightClick={(e) => {
                  e.preventDefault();
                  if (item) onUnequip(slot.key);
                }}
                onHover={(e) => item && onHover(item, e)}
                onLeave={onLeave}
              />
              <span className="text-[10px] text-zinc-600 uppercase">
                {slot.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
