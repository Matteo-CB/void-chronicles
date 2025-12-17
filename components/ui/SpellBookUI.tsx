import useGameStore from "@/store/gameStore";
import { useEffect, useRef } from "react";
import { Zap, BookOpen, Skull } from "lucide-react";

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

  const confirmKey = inputMethod === "gamepad" ? "A" : "ENTRÉE";

  return (
    <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-md animate-in fade-in duration-300 font-pixel">
      <div className="w-[95vw] max-w-[1000px] h-[650px] flex bg-[#0f0714] border border-purple-900/60 shadow-[0_0_120px_rgba(88,28,135,0.25)] rounded-lg overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-900 via-fuchsia-900 to-purple-900 opacity-50"></div>

        {/* --- LEFT PANEL: SPELL LIST --- */}
        <div className="w-1/2 border-r border-purple-900/30 flex flex-col bg-black/20">
          <div className="p-6 border-b border-purple-900/30 bg-purple-950/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl text-purple-400 font-bold uppercase tracking-[0.2em] drop-shadow-[0_2px_10px_rgba(168,85,247,0.5)]">
                Grimoire
              </h2>
              <p className="text-[10px] text-purple-300/50 mt-1 font-mono">
                Art Obscur - Niveau {player.level}
              </p>
            </div>
            <BookOpen className="text-purple-800 opacity-50" size={32} />
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3"
          >
            {player.spells.map((spell: any, idx: number) => {
              const isSelected = idx === menuSelectionIndex;
              const isEquipped = player.equippedSpells.includes(spell.id);

              return (
                <div
                  key={spell.id}
                  className={`
                    p-4 border-l-4 transition-all duration-200 relative group overflow-hidden
                    ${
                      isSelected
                        ? "bg-purple-900/20 border-l-purple-400 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]"
                        : "bg-black/40 border-l-zinc-800 hover:bg-white/5 opacity-70"
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <span
                      className={`font-bold text-sm tracking-wide ${
                        isSelected ? "text-white" : "text-zinc-400"
                      }`}
                      style={{
                        textShadow: isSelected
                          ? `0 0 10px ${spell.color}`
                          : "none",
                      }}
                    >
                      {spell.name}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-900/50 shadow-sm">
                      {spell.cost} MP
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-relaxed relative z-10">
                    {spell.description}
                  </p>

                  {/* Equipped Badge */}
                  {isEquipped && (
                    <div className="absolute top-2 right-12">
                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e] animate-pulse"></div>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute right-2 bottom-2 text-[9px] text-purple-400 font-bold animate-pulse flex items-center gap-1">
                      <span>ÉQUIPER</span>
                      <span className="bg-purple-600 text-white px-1 rounded text-[8px]">
                        {confirmKey}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {player.spells.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
                <Skull size={48} className="opacity-20" />
                <p className="text-xs italic opacity-50 text-center px-8">
                  Votre esprit est vide... Trouvez des parchemins anciens pour
                  apprendre de nouveaux sortilèges.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT PANEL: EQUIPPED --- */}
        <div className="w-1/2 bg-[#050308] flex flex-col relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(88,28,135,0.15),transparent_70%)] pointer-events-none" />

          <div className="flex-1 flex flex-col items-center justify-center gap-10 p-8">
            <h3 className="text-xs text-purple-500/60 uppercase tracking-[0.4em] border-b border-purple-900/30 pb-2">
              Mémoire Active
            </h3>

            <div className="flex flex-col gap-6 w-full max-w-sm relative z-10">
              {[0, 1, 2].map((slot) => {
                const spellId = player.equippedSpells[slot];
                const spell = player.spells.find((s: any) => s.id === spellId);

                return (
                  <div key={slot} className="flex items-center gap-4 group">
                    {/* Input Key */}
                    <div className="w-10 h-10 flex items-center justify-center border border-zinc-800 bg-zinc-900 rounded shadow-lg text-zinc-500 font-bold text-xs group-hover:border-purple-500/50 group-hover:text-purple-400 transition-colors">
                      {inputMethod === "gamepad"
                        ? slot === 0
                          ? "LB"
                          : slot === 1
                          ? "RB"
                          : "RT"
                        : slot + 1}
                    </div>

                    {/* Slot Box */}
                    <div
                      className={`
                        flex-1 h-16 border rounded flex items-center px-4 transition-all duration-300
                        ${
                          spell
                            ? "border-purple-800 bg-purple-950/20 shadow-[0_0_20px_rgba(88,28,135,0.1)]"
                            : "border-dashed border-zinc-800 bg-black/40 opacity-50"
                        }
                      `}
                    >
                      {spell ? (
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-2 bg-black rounded border border-purple-900/50 shadow-inner">
                            <Zap
                              size={18}
                              style={{ color: spell.color, fill: spell.color }}
                              className="drop-shadow-md"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span
                              className="text-sm font-bold text-zinc-100 tracking-wide"
                              style={{ color: spell.color }}
                            >
                              {spell.name}
                            </span>
                            <span className="text-[9px] text-zinc-500 uppercase">
                              Rang I
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-700 uppercase tracking-widest w-full text-center">
                          Emplacement Vide
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-purple-950/10 border-t border-purple-900/30 text-center w-full">
            <p className="text-[10px] text-purple-300/40 leading-relaxed font-mono">
              "L'esprit est une arme, forgez-le avec sagesse."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
