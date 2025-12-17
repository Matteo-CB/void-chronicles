import useGameStore from "@/store/gameStore";
import { X, ShoppingBag, Coins, ShieldCheck, Gem, Star } from "lucide-react";
import ShopItem from "./ShopItem";
import { useEffect, useRef } from "react";

export default function ShopUI() {
  const {
    enemies,
    currentMerchantId,
    closeShop,
    player,
    buyItem,
    menuSelectionIndex,
    inputMethod,
  } = useGameStore((state: any) => state);

  const listRef = useRef<HTMLDivElement>(null);
  const merchant = enemies.find((e: any) => e.id === currentMerchantId);

  if (!merchant || !merchant.shopInventory) return null;

  useEffect(() => {
    if (listRef.current && menuSelectionIndex >= 0) {
      const selectedEl = listRef.current.children[
        menuSelectionIndex
      ] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [menuSelectionIndex]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 font-pixel">
      <div className="relative w-[95vw] max-w-[1100px] h-[80vh] bg-[#0c0a09] border border-yellow-900/60 shadow-[0_0_80px_rgba(234,179,8,0.15)] rounded-xl flex flex-col overflow-hidden">
        {/* Decorative ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-yellow-700 to-transparent opacity-50"></div>

        {/* HEADER */}
        <div className="relative z-10 px-8 py-6 bg-gradient-to-b from-[#1c1917] to-[#0c0a09] border-b border-yellow-900/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-black border-2 border-yellow-900/50 flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 to-transparent group-hover:opacity-100 transition-opacity opacity-50"></div>
              <ShoppingBag className="text-yellow-600 w-8 h-8 drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700 font-bold tracking-widest uppercase drop-shadow-sm">
                {merchant.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-yellow-800/80 font-mono mt-1.5 uppercase tracking-wider">
                <Gem size={10} />
                <span>Marchand Itinérant</span>
                <span className="mx-2 text-yellow-900/40">•</span>
                <span className="text-yellow-700">Ouvert</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-yellow-900/60 uppercase font-bold tracking-widest mb-1">
                Votre Or
              </span>
              <div className="flex items-center gap-3 text-yellow-400 bg-black/40 px-4 py-2 rounded-lg border border-yellow-900/30 shadow-inner">
                <span className="font-mono text-xl md:text-2xl font-bold tracking-tighter drop-shadow-md">
                  {player.gold}
                </span>
                <Coins size={18} className="text-yellow-500" />
              </div>
            </div>

            <button
              onClick={closeShop}
              className="group p-3 hover:bg-red-950/30 rounded-full transition-all border border-transparent hover:border-red-900/50"
            >
              <X
                size={24}
                className="text-zinc-600 group-hover:text-red-400 transition-colors"
              />
            </button>
          </div>
        </div>

        {/* LISTE */}
        <div className="flex-1 relative bg-[url('/noise.png')] bg-repeat opacity-90">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

          <div
            ref={listRef}
            className="absolute inset-0 p-8 overflow-y-auto gold-scroll grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start"
          >
            {merchant.shopInventory.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center h-full text-zinc-700 gap-4">
                <ShoppingBag size={64} className="opacity-20" />
                <p className="text-sm font-mono uppercase tracking-widest opacity-50">
                  Rupture de stock
                </p>
              </div>
            ) : (
              merchant.shopInventory.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="transform transition-all duration-200"
                >
                  <ShopItem
                    item={item}
                    canAfford={player.gold >= (item.value || 0)}
                    isSelected={idx === menuSelectionIndex}
                    onBuy={() => buyItem(item)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="relative z-10 bg-[#0c0a09] border-t border-yellow-900/30 p-4 flex justify-between items-center text-[10px] text-zinc-600 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex gap-6 uppercase tracking-wider font-bold">
            <div className="flex items-center gap-2">
              <span className="bg-yellow-900/20 text-yellow-600 border border-yellow-900/40 px-1.5 py-0.5 rounded">
                {inputMethod === "gamepad" ? "A" : "ENTRÉE"}
              </span>
              <span>Acheter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded">
                {inputMethod === "gamepad" ? "B" : "ECHAP"}
              </span>
              <span>Quitter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded">
                {inputMethod === "gamepad" ? "DIR" : "FLÈCHES"}
              </span>
              <span>Naviguer</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-yellow-900/40">
            <Star size={10} />
            <span className="uppercase tracking-[0.2em] text-[8px]">
              La Guilde des Marchands
            </span>
            <Star size={10} />
          </div>
        </div>
      </div>
    </div>
  );
}
