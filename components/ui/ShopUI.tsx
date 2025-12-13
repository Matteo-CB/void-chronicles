import { motion } from "framer-motion";
import useGameStore from "@/store/gameStore";
import { X, Coins } from "lucide-react";

export default function ShopUI() {
  const {
    enemies,
    currentMerchantId,
    closeShop,
    buyItem,
    player,
    selectedShopIndex,
    inputMethod,
  } = useGameStore();
  const merchant = enemies.find((e) => e.id === currentMerchantId);
  const items = merchant?.shopInventory || [];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-[600px] bg-zinc-900 border-2 border-amber-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-amber-500 font-serif">
              {merchant?.name || "Marchand"}
            </h2>
            <p className="text-xs text-zinc-500">
              "J'ai les meilleures marchandises..."
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full border border-amber-900/50">
              <Coins size={16} className="text-amber-400" />
              <span className="font-bold text-amber-100">{player.gold}</span>
            </div>
            <button onClick={closeShop}>
              <X className="text-zinc-400 hover:text-white" />
            </button>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto max-h-[400px] space-y-2">
          {items.length === 0 ? (
            <div className="text-center text-zinc-600 py-10 italic">
              Tout est vendu !
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedShopIndex;
              const canBuy = player.gold >= item.value;
              return (
                <div
                  key={item.id}
                  onClick={() => buyItem(item)}
                  className={`flex items-center justify-between p-3 rounded border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-zinc-800 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] z-10"
                      : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800"
                  } ${!canBuy && "opacity-50 grayscale"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {item.type === "weapon"
                        ? "⚔️"
                        : item.type === "armor"
                        ? "🛡️"
                        : item.type === "consumable"
                        ? "🍷"
                        : "💍"}
                    </div>
                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{ color: item.color }}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        canBuy ? "text-amber-400" : "text-red-500"
                      }`}
                    >
                      {item.value} Or
                    </span>
                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-amber-500 rounded animate-pulse pointer-events-none"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="bg-zinc-950 p-2 text-[10px] text-zinc-500 text-center border-t border-zinc-800 flex justify-center gap-6 items-center">
          <span className="flex items-center gap-1">
            {inputMethod === "gamepad" ? (
              <span className="bg-zinc-800 px-1 rounded text-white">D-PAD</span>
            ) : (
              "↑↓"
            )}{" "}
            Naviguer
          </span>
          <span className="flex items-center gap-1">
            {inputMethod === "gamepad" ? (
              <span className="w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                A
              </span>
            ) : (
              "Entrée"
            )}{" "}
            Acheter
          </span>
          <span className="flex items-center gap-1">
            {inputMethod === "gamepad" ? (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                B
              </span>
            ) : (
              "Echap"
            )}{" "}
            Fermer
          </span>
        </div>
      </motion.div>
    </div>
  );
}
