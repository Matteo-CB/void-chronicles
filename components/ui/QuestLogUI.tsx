import useGameStore from "@/store/gameStore";
import { useEffect, useRef } from "react";
import { Scroll, CheckCircle2, Circle, Trophy } from "lucide-react";

export default function QuestLogUI() {
  const { player, menuSelectionIndex } = useGameStore((state: any) => state);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll pour garder la sélection visible
  useEffect(() => {
    if (listRef.current && menuSelectionIndex >= 0) {
      const el = listRef.current.children[menuSelectionIndex] as HTMLElement;
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [menuSelectionIndex]);

  const activeQuests = player.quests || [];
  const selectedQuest = activeQuests[menuSelectionIndex] || activeQuests[0]; // Fallback safe

  return (
    <div className="w-full h-full flex items-center justify-center font-pixel p-4 md:p-8">
      <div className="w-full max-w-5xl h-[80vh] flex bg-[#0f0714] border border-yellow-900/60 shadow-[0_0_50px_rgba(161,98,7,0.1)] rounded-lg overflow-hidden relative">
        {/* COLONNE GAUCHE : LISTE DES QUÊTES */}
        <div className="w-1/3 min-w-[250px] border-r border-yellow-900/30 flex flex-col bg-black/40 backdrop-blur-sm">
          <div className="p-4 md:p-6 border-b border-yellow-900/30 bg-yellow-950/10 flex items-center justify-between">
            <h2 className="text-sm md:text-lg text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <Scroll className="text-yellow-600" size={20} />
              Journal
            </h2>
            <span className="text-xs text-yellow-700 font-mono">
              {activeQuests.filter((q: any) => q.status === "completed").length}{" "}
              / {activeQuests.length}
            </span>
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2"
          >
            {activeQuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-600 gap-2">
                <Scroll size={32} className="opacity-20" />
                <span className="text-xs italic">Aucune quête active.</span>
              </div>
            ) : (
              activeQuests.map((quest: any, idx: number) => {
                const isSelected = idx === menuSelectionIndex;
                const isCompleted =
                  quest.status === "completed" ||
                  quest.status === "ready_to_turn_in";

                return (
                  <div
                    key={quest.id}
                    className={`
                        p-3 rounded border transition-all duration-200 cursor-pointer relative overflow-hidden group
                        ${
                          isSelected
                            ? "bg-yellow-900/20 border-yellow-600/50 text-yellow-100 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]"
                            : "bg-black/20 border-transparent text-zinc-500 hover:bg-white/5 hover:border-zinc-800"
                        }
                    `}
                    // Ajout d'un handler onClick pour la souris si nécessaire plus tard
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                    )}

                    <div className="flex items-start gap-3 pl-2">
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2
                            size={16}
                            className="text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                          />
                        ) : (
                          <Circle
                            size={16}
                            className={
                              isSelected ? "text-yellow-500" : "text-zinc-700"
                            }
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 w-full overflow-hidden">
                        <span
                          className={`text-xs md:text-sm font-bold truncate ${
                            isCompleted ? "line-through opacity-60" : ""
                          }`}
                        >
                          {quest.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-600">
                          {isCompleted ? "Terminée" : "En cours"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLONNE DROITE : DÉTAILS */}
        <div className="flex-1 bg-[url('/noise.png')] bg-repeat relative flex flex-col">
          {/* Fond dégradé subtil */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-[#1a1005] to-black opacity-90 pointer-events-none" />

          {selectedQuest ? (
            <div className="relative z-10 flex flex-col h-full p-6 md:p-10 overflow-y-auto custom-scroll">
              {/* EN-TÊTE */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl md:text-3xl font-serif text-yellow-500 drop-shadow-md">
                    {selectedQuest.title}
                  </h1>
                  {selectedQuest.status === "completed" && (
                    <span className="px-3 py-1 bg-green-900/30 border border-green-700/50 text-green-400 text-xs font-bold rounded uppercase tracking-widest">
                      Accomplie
                    </span>
                  )}
                </div>
                <div className="w-full h-[1px] bg-gradient-to-r from-yellow-700/50 via-yellow-900/20 to-transparent"></div>
              </div>

              {/* DESCRIPTION */}
              <div className="mb-8 bg-black/20 p-4 rounded border border-white/5 italic text-zinc-300 text-sm md:text-base leading-relaxed font-serif">
                "{selectedQuest.description}"
              </div>

              {/* OBJECTIFS */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                  <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
                  Objectifs
                </h3>

                <div className="grid gap-3">
                  {selectedQuest.objectives.map((obj: any, i: number) => (
                    <div
                      key={i}
                      className={`
                            relative flex items-center justify-between p-3 rounded border transition-colors
                            ${
                              obj.isCompleted
                                ? "bg-green-950/10 border-green-900/30"
                                : "bg-zinc-900/40 border-zinc-800"
                            }
                        `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            obj.isCompleted ? "bg-green-500" : "bg-yellow-600"
                          }`}
                        ></div>
                        <span
                          className={`text-xs md:text-sm ${
                            obj.isCompleted
                              ? "text-zinc-500 line-through"
                              : "text-zinc-200"
                          }`}
                        >
                          {obj.description}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/30 ${
                          obj.isCompleted ? "text-green-500" : "text-yellow-600"
                        }`}
                      >
                        {obj.current} / {obj.required}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RÉCOMPENSES (Footer) */}
              <div className="mt-auto pt-6 border-t border-white/5">
                <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-700" /> Récompenses
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedQuest.rewards?.xp && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-950/20 border border-purple-900/40 rounded text-purple-300 text-xs font-bold shadow-sm">
                      <span className="text-purple-500 text-[10px]">XP</span>
                      <span>+{selectedQuest.rewards.xp}</span>
                    </div>
                  )}
                  {selectedQuest.rewards?.gold && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-950/20 border border-yellow-900/40 rounded text-yellow-300 text-xs font-bold shadow-sm">
                      <span className="text-yellow-600 text-[10px]">OR</span>
                      <span>+{selectedQuest.rewards.gold}</span>
                    </div>
                  )}
                  {selectedQuest.rewards?.items &&
                    selectedQuest.rewards.items.map(
                      (item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-950/20 border border-blue-900/40 rounded text-blue-300 text-xs font-bold shadow-sm"
                        >
                          <span className="text-blue-500 text-[10px]">
                            OBJET
                          </span>
                          <span>{item.name}</span>
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-zinc-700 gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
                <Scroll size={32} className="opacity-30" />
              </div>
              <p className="text-sm font-serif italic text-zinc-600">
                Sélectionnez une quête pour consulter ses détails.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
