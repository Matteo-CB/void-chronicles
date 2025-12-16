import useGameStore from "@/store/gameStore";
import { X, ShoppingBag, Coins, ShieldCheck, Gem } from "lucide-react";
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
    inputMethod, // Abonnement au changement de méthode d'entrée
  } = useGameStore((state: any) => state);

  const listRef = useRef<HTMLDivElement>(null);
  const merchant = enemies.find((e: any) => e.id === currentMerchantId);

  if (!merchant || !merchant.shopInventory) return null;

  // Scroll automatique pour suivre la sélection clavier/manette
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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-[90vw] max-w-[1200px] aspect-video bg-zinc-950 border-2 border-yellow-900/40 shadow-[0_0_100px_rgba(234,179,8,0.1)] rounded-lg flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="relative z-10 px-8 py-5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-transparent border-b border-zinc-800/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-md bg-black border border-yellow-700/50 flex items-center justify-center shadow-lg">
              <ShoppingBag className="text-yellow-500 w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-yellow-600 font-bold tracking-wider uppercase">
                {merchant.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-yellow-500/60 font-mono mt-1">
                <Gem size={10} />
                <span>MARCHAND ITINÉRANT</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-950/20 px-3 py-1 rounded border border-yellow-900/30">
              <span className="font-mono text-xl font-bold">{player.gold}</span>
              <Coins size={16} />
            </div>
            <button
              onClick={closeShop}
              className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* LISTE */}
        <div className="flex-1 relative overflow-hidden bg-black/40">
          <div
            ref={listRef}
            className="absolute inset-0 p-8 overflow-y-auto custom-scroll gold-scroll grid grid-cols-2 lg:grid-cols-3 gap-4 content-start"
          >
            {merchant.shopInventory.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center h-full text-zinc-600 gap-4 opacity-50">
                <ShoppingBag size={48} />
                <p className="text-sm font-mono uppercase tracking-widest">
                  Rupture de stock
                </p>
              </div>
            ) : (
              merchant.shopInventory.map((item: any, idx: number) => (
                <ShopItem
                  key={item.id || idx}
                  item={item}
                  canAfford={player.gold >= (item.value || 0)}
                  isSelected={idx === menuSelectionIndex}
                  onBuy={() => buyItem(item)}
                />
              ))
            )}
          </div>
        </div>

        {/* FOOTER - Légende Dynamique */}
        <div className="relative z-10 bg-black/90 border-t border-zinc-800/50 p-3 flex justify-between items-center text-[10px] text-zinc-500 shrink-0">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded border border-zinc-800 transition-all">
              <span className="text-yellow-500 font-bold font-mono">
                {inputMethod === "gamepad" ? "[A]" : "[ENTRÉE]"}
              </span>
              <span>ACHETER</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded border border-zinc-800 transition-all">
              <span className="text-zinc-400 font-bold font-mono">
                {inputMethod === "gamepad" ? "[B]" : "[ECHAP]"}
              </span>
              <span>QUITTER</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded border border-zinc-800 transition-all">
              <span className="text-zinc-400 font-bold font-mono">
                {inputMethod === "gamepad" ? "[DIR]" : "[FLÈCHES]"}
              </span>
              <span>NAVIGUER</span>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-40">
            <ShieldCheck size={12} />
            <span className="uppercase tracking-wide">Objets certifiés</span>
          </div>
        </div>
      </div>
    </div>
  );
}
