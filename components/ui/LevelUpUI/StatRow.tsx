import { Plus, LucideIcon } from "lucide-react";

interface StatRowProps {
  label: string;
  value: number;
  canIncrement: boolean; // Renommé pour correspondre à l'usage
  onIncrement: () => void; // Renommé pour correspondre à l'usage
  description?: string;
  isSelected?: boolean;
  icon: LucideIcon; // Ajout de la prop manquante
}

export default function StatRow({
  label,
  value,
  canIncrement,
  onIncrement,
  description,
  isSelected,
  icon: Icon, // On renomme pour l'utiliser comme composant JSX
}: StatRowProps) {
  return (
    <div
      className={`
            flex items-center justify-between p-3 rounded transition-colors group relative border
            ${
              isSelected
                ? "bg-zinc-800 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600"
            }
        `}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-l" />
      )}

      <div className="flex items-center gap-3">
        {/* Affichage de l'icône */}
        <div
          className={`p-2 rounded-md border ${
            isSelected
              ? "bg-yellow-900/20 border-yellow-700/50"
              : "bg-zinc-950 border-zinc-800"
          }`}
        >
          <Icon
            size={18}
            className={isSelected ? "text-yellow-500" : "text-zinc-500"}
          />
        </div>

        <div className="flex flex-col">
          <span
            className={`font-bold uppercase text-xs tracking-wider ${
              isSelected ? "text-yellow-200" : "text-zinc-300"
            }`}
          >
            {label}
          </span>
          <span className="text-zinc-500 text-[10px]">{description}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xl font-mono text-white">{value}</span>
        <button
          onClick={onIncrement}
          disabled={!canIncrement}
          className={`
            w-8 h-8 flex items-center justify-center rounded border transition-all
            ${
              canIncrement
                ? isSelected
                  ? "bg-green-600 text-white border-green-400"
                  : "border-green-600 bg-green-900/20 text-green-400"
                : "border-zinc-800 bg-zinc-950 text-zinc-700 cursor-not-allowed"
            }
          `}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
