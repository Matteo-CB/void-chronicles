import useGameStore from "@/store/gameStore";
import StatRow from "./StatRow";
import { ArrowUpCircle } from "lucide-react";

export default function LevelUpUI() {
  const { player, upgradeAttribute, closeUi, menuSelectionIndex, inputMethod } =
    useGameStore((state: any) => state);

  if (player.attributePoints <= 0) return null;

  const stats = [
    { key: "strength", label: "Force", desc: "Augmente les dégâts physiques" },
    { key: "endurance", label: "Endurance", desc: "Augmente les PV max" },
    { key: "wisdom", label: "Sagesse", desc: "Augmente le Mana et les Soins" },
    {
      key: "agility",
      label: "Agilité",
      desc: "Augmente la vitesse et l'esquive",
    },
    {
      key: "luck",
      label: "Chance",
      desc: "Augmente les critiques et le butin",
    },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-[500px] bg-zinc-950 border-2 border-yellow-600/50 shadow-[0_0_50px_rgba(202,138,4,0.2)] rounded-lg p-8 flex flex-col gap-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-full bg-yellow-900/20 border border-yellow-600/50 mb-2">
            <ArrowUpCircle className="text-yellow-500 w-12 h-12" />
          </div>
          <h2 className="text-3xl font-serif text-yellow-500 tracking-wider">
            NIVEAU SUPÉRIEUR !
          </h2>
          <p className="text-zinc-400">
            Vous avez{" "}
            <span className="text-white font-bold">
              {player.attributePoints}
            </span>{" "}
            points à dépenser.
          </p>
        </div>

        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
          {stats.map((s, idx) => (
            <StatRow
              key={s.key}
              label={s.label}
              description={s.desc}
              value={player.stats[s.key] || 0}
              canUpgrade={player.attributePoints > 0}
              onUpgrade={() => upgradeAttribute(s.key)}
              isSelected={idx === menuSelectionIndex}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col items-center gap-3 pt-4 border-t border-zinc-800">
          <button
            onClick={closeUi}
            className="w-full py-3 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-yellow-600/50 text-zinc-400 hover:text-yellow-500 transition-all uppercase tracking-widest text-xs font-bold"
          >
            Confirmer & Fermer
          </button>

          <div className="flex gap-4 text-[10px] text-zinc-500 uppercase">
            <span>
              <span className="font-bold text-zinc-300">
                {inputMethod === "gamepad" ? "[DIR]" : "[FLÈCHES]"}
              </span>{" "}
              CHOISIR
            </span>
            <span>
              <span className="font-bold text-zinc-300">
                {inputMethod === "gamepad" ? "[A]" : "[ENTRÉE]"}
              </span>{" "}
              AMÉLIORER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
