import { motion } from "framer-motion";
import useGameStore from "@/store/gameStore";
import { X, Shield, Sword, Gem } from "lucide-react";

export default function InventoryUI() {
  const {
    player,
    inventory,
    toggleInventory,
    equipItem,
    useItem,
    selectedInventoryIndex,
    inputMethod,
  } = useGameStore();

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-[800px] h-[600px] bg-zinc-900 border-2 border-zinc-700 rounded-xl shadow-2xl flex overflow-hidden"
      >
        <div className="w-1/3 bg-zinc-950 p-6 flex flex-col border-r border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6 font-serif">
            {player.name}
          </h2>
          <div className="flex flex-col gap-4 mb-8">
            <EquipmentSlot
              item={player.equipment.weapon}
              icon={<Sword size={20} />}
              label="Arme"
            />
            <EquipmentSlot
              item={player.equipment.armor}
              icon={<Shield size={20} />}
              label="Armure"
            />
            <EquipmentSlot
              item={player.equipment.accessory}
              icon={<Gem size={20} />}
              label="Bijou"
            />
          </div>
          <div className="mt-auto text-xs text-zinc-500 space-y-1">
            <p className="flex justify-between items-center">
              <span>Naviguer :</span>
              {inputMethod === "gamepad" ? (
                <span className="px-2 py-0.5 bg-zinc-800 rounded text-white font-bold">
                  D-PAD
                </span>
              ) : (
                <strong className="text-zinc-300">Flèches</strong>
              )}
            </p>
            <p className="flex justify-between items-center">
              <span>Utiliser/Équiper :</span>
              {inputMethod === "gamepad" ? (
                <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </span>
              ) : (
                <strong className="text-zinc-300">Entrée</strong>
              )}
            </p>
            <p className="flex justify-between items-center">
              <span>Fermer :</span>
              {inputMethod === "gamepad" ? (
                <span className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  B
                </span>
              ) : (
                <strong className="text-zinc-300">Echap</strong>
              )}
            </p>
          </div>
        </div>
        <div className="flex-1 p-6 bg-zinc-900 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-zinc-300 font-bold">
              Inventaire ({inventory.length}/20)
            </h3>
            <button
              onClick={toggleInventory}
              className="text-zinc-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 overflow-y-auto content-start">
            {inventory.map((item, index) => {
              const isSelected = index === selectedInventoryIndex;
              return (
                <div
                  key={item.id}
                  onClick={() =>
                    item.type === "consumable" ? useItem(item) : equipItem(item)
                  }
                  className={`aspect-square bg-zinc-800 border rounded-lg p-2 cursor-pointer flex flex-col items-center justify-center transition-all relative ${
                    isSelected
                      ? "border-amber-500 bg-zinc-700 scale-105 shadow-[0_0_10px_rgba(245,158,11,0.5)] z-10"
                      : "border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {item.type === "weapon"
                      ? "⚔️"
                      : item.type === "armor"
                      ? "🛡️"
                      : item.type === "consumable"
                      ? "🍷"
                      : "💍"}
                  </div>
                  <span
                    className="text-[10px] truncate w-full text-center font-bold"
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </span>
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-amber-500 rounded-lg animate-pulse pointer-events-none"></div>
                  )}
                </div>
              );
            })}
            {inventory.length === 0 && (
              <div className="col-span-4 text-center text-zinc-600 py-10 italic">
                Inventaire vide...
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EquipmentSlot({ item, icon, label }: any) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded border border-zinc-800">
      <div className="w-12 h-12 flex items-center justify-center rounded bg-zinc-800 text-zinc-600">
        {item ? "📦" : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 uppercase font-bold">{label}</p>
        <p className="text-sm truncate" style={{ color: item?.color }}>
          {item ? item.name : "Vide"}
        </p>
      </div>
    </div>
  );
}
