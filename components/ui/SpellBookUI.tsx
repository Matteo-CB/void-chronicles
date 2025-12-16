import useGameStore from "@/store/gameStore";
import { useEffect, useRef } from "react";
import { Zap } from "lucide-react";

export default function SpellBookUI() {
  const { player, menuSelectionIndex, inputMethod } = useGameStore(
    (state: any) => state
  );
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[menuSelectionIndex] as HTMLElement;
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [menuSelectionIndex]);

  const confirmKey = inputMethod === "gamepad" ? "[A]" : "[ENTRÉE]";

  return (
    <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-xl">
      <div className="w-[1000px] h-[600px] flex border border-purple-900/50 shadow-[0_0_100px_rgba(88,28,135,0.2)] bg-zinc-950">
        {/* Liste des Sorts */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
          <div className="p-6 border-b border-zinc-800 bg-purple-950/10">
            <h2 className="text-xl text-purple-400 font-bold uppercase tracking-widest">
              Grimoire
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Savoirs interdits accumulés
            </p>
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2"
          >
            {player.spells.map((spell: any, idx: number) => {
              const isSelected = idx === menuSelectionIndex;
              const isEquipped = player.equippedSpells.includes(spell.id);

              return (
                <div
                  key={spell.id}
                  className={`p-4 border transition-all relative ${
                    isSelected
                      ? "bg-zinc-900 border-purple-500 shadow-lg scale-[1.02] z-10"
                      : "bg-black border-zinc-800 opacity-80"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className="font-bold text-sm"
                      style={{ color: spell.color }}
                    >
                      {spell.name}
                    </span>
                    <span className="text-[10px] text-blue-400 bg-blue-950/30 px-2 py-0.5 rounded border border-blue-900">
                      {spell.cost} MP
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mb-2">
                    {spell.description}
                  </p>

                  {isSelected && (
                    <div className="text-[10px] text-zinc-500 mt-2 flex items-center gap-2">
                      <span className="animate-pulse text-purple-400 font-bold">
                        ► SÉLECTIONNÉ
                      </span>
                      {isEquipped && (
                        <span className="text-green-500">(Déjà Équipé)</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {player.spells.length === 0 && (
              <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
                Vous ne connaissez aucun sort pour l'instant.
              </div>
            )}
          </div>
        </div>

        {/* Slots Équipés */}
        <div className="w-1/2 bg-black/40 flex flex-col p-8 items-center justify-center gap-8">
          <h3 className="text-sm text-zinc-400 uppercase tracking-[0.3em]">
            Sorts Mémorisés
          </h3>
          <div className="flex flex-col gap-6 w-full max-w-xs">
            {[0, 1, 2].map((slot) => {
              const spellId = player.equippedSpells[slot];
              const spell = player.spells.find((s: any) => s.id === spellId);

              return (
                <div key={slot} className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center border-2 border-zinc-700 bg-zinc-900 text-zinc-500 font-bold text-lg">
                    {inputMethod === "gamepad"
                      ? slot === 0
                        ? "LB"
                        : slot === 1
                        ? "RB"
                        : "RT"
                      : slot + 1}
                  </div>
                  <div
                    className={`flex-1 p-3 border ${
                      spell
                        ? "border-zinc-700 bg-zinc-900"
                        : "border-zinc-800 bg-black dashed"
                    }`}
                  >
                    {spell ? (
                      <div className="flex items-center gap-3">
                        <Zap size={16} style={{ color: spell.color }} />
                        <span className="text-sm font-bold text-zinc-200">
                          {spell.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-700 uppercase">
                        Emplacement Vide
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto p-4 bg-zinc-900 border border-zinc-800 text-center w-full">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sélectionnez un sort dans la liste et appuyez sur{" "}
              <span className="text-white font-bold">{confirmKey}</span> pour
              l'équiper dans le premier emplacement libre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
