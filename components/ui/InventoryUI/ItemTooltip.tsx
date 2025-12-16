import { Item } from "@/types/game";

interface ItemTooltipProps {
  item: Item;
  x: number;
  y: number;
}

export default function ItemTooltip({ item, x, y }: ItemTooltipProps) {
  // SÉCURITÉ : Si pas de stats, objet vide pour éviter le crash
  const stats = item.stats || {};

  return (
    <div
      className="fixed z-50 p-4 bg-zinc-950 border border-zinc-700 rounded shadow-xl pointer-events-none w-64 flex flex-col gap-2"
      style={{ left: x + 16, top: y + 16 }}
    >
      <div className="flex justify-between items-start">
        <span className={`font-bold text-lg ${item.color || "text-zinc-200"}`}>
          {item.name}
        </span>
        <span className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
          {item.type.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-sm text-zinc-400">
        {Object.entries(stats).map(([key, val]) => {
          if (!val) return null;
          // Traduction basique des stats
          const label =
            {
              attack: "Attaque",
              defense: "Défense",
              hp: "PV",
              mana: "Mana",
              speed: "Vitesse",
              critChance: "Critique",
              maxHp: "PV Max",
              maxMana: "Mana Max",
            }[key] || key;

          return (
            <div key={key} className="flex justify-between">
              <span className="capitalize">{label}</span>
              <span className="text-zinc-200 font-mono">+{val}</span>
            </div>
          );
        })}
      </div>

      {item.value && (
        <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center text-xs">
          <span className="text-yellow-500">Valeur</span>
          <span className="font-mono text-yellow-400">{item.value} Or</span>
        </div>
      )}
    </div>
  );
}
