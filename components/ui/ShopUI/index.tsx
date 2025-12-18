"use client";

import useGameStore from "@/store/gameStore";
import { X, ShoppingBag } from "lucide-react";
import ShopItem from "./ShopItem";

export default function ShopUI() {
  const {
    currentMerchantId,
    enemies,
    closeShop,
    buyItem,
    player,
    menuSelectionIndex,
    inputMethod,
  } = useGameStore((state: any) => state);

  const merchant = enemies.find((e: any) => e.id === currentMerchantId);

  if (!merchant || !merchant.shopInventory) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-auto bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[85vh] bg-zinc-950 border-2 border-zinc-800 rounded-xl shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-[#0a0a0c]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-900/10 rounded-xl border border-yellow-700/30">
              <ShoppingBag className="text-yellow-500" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-widest text-white font-pixel">
                Marchand
              </h2>
              <p className="text-xs text-zinc-500 font-mono tracking-wide">
                "J'ai ce qu'il vous faut, voyageur..."
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right bg-black/40 px-4 py-2 rounded-lg border border-zinc-800">
              <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Votre Or
              </span>
              <span className="text-2xl font-bold text-yellow-400 font-mono flex items-center justify-end gap-2">
                {player.gold} <span className="text-xs text-yellow-600">G</span>
              </span>
            </div>
            <button
              onClick={closeShop}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors group"
            >
              <X
                className="text-zinc-500 group-hover:text-white transition-colors"
                size={24}
              />
            </button>
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[url('/noise.png')] opacity-100">
          {/* CORRECTION ICI : Grid fixée à 3 colonnes maximum pour coller à la logique du store */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {merchant.shopInventory.map((item: any, idx: number) => (
              <ShopItem
                key={item.id}
                item={item}
                canAfford={player.gold >= (item.value || 0)}
                isSelected={idx === menuSelectionIndex}
                onBuy={() => {
                  if (player.gold >= (item.value || 0)) buyItem(item);
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer Hints */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur flex justify-between items-center text-xs text-zinc-500 font-mono z-20">
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700 text-zinc-300 font-bold shadow-sm">
                {inputMethod === "gamepad" ? "A" : "ENTRÉE"}
              </kbd>{" "}
              Acheter
            </span>
            <span className="flex items-center gap-2">
              <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700 text-zinc-300 font-bold shadow-sm">
                {inputMethod === "gamepad" ? "B" : "ECHAP"}
              </kbd>{" "}
              Quitter
            </span>
            <span className="flex items-center gap-2">
              <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700 text-zinc-300 font-bold shadow-sm">
                {inputMethod === "gamepad" ? "↕↔" : "FLÈCHES"}
              </kbd>{" "}
              Naviguer
            </span>
          </div>
          <div className="text-[10px] text-zinc-700 uppercase tracking-widest">
            Offres limitées
          </div>
        </div>
      </div>
    </div>
  );
}
