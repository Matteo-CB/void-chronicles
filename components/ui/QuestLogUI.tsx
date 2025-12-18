import useGameStore from "@/store/gameStore";
import { useEffect, useRef } from "react";
import { Scroll, CheckCircle2, Circle, Trophy } from "lucide-react";

export default function QuestLogUI() {
  const { player, menuSelectionIndex } = useGameStore((state: any) => state);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current && menuSelectionIndex >= 0) {
      const el = listRef.current.children[menuSelectionIndex] as HTMLElement;
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [menuSelectionIndex]);

  const activeQuests = player.quests || [];
  const selectedQuest = activeQuests[menuSelectionIndex];

  return (
    <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-md animate-in fade-in duration-300 font-pixel">
      <div className="w-[95vw] max-w-[900px] h-[600px] flex bg-[#0f0714] border border-yellow-900/60 shadow-[0_0_100px_rgba(161,98,7,0.15)] rounded-lg overflow-hidden relative">
        {/* LISTE DES QUÊTES (GAUCHE) */}
        <div className="w-1/3 border-r border-yellow-900/30 flex flex-col bg-black/20">
          <div className="p-6 border-b border-yellow-900/30 bg-yellow-950/10 flex items-center justify-between">
            <h2 className="text-lg text-yellow-500 font-bold uppercase tracking-widest">
              Journal
            </h2>
            <Scroll className="text-yellow-700" size={24} />
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto custom-scroll p-2 space-y-1"
          >
            {activeQuests.length === 0 ? (
              <div className="text-center text-zinc-600 text-xs mt-10 italic">
                Aucune quête active.
              </div>
            ) : (
              activeQuests.map((quest: any, idx: number) => {
                const isSelected = idx === menuSelectionIndex;
                return (
                  <div
                    key={quest.id}
                    className={`
                        p-3 rounded border transition-all duration-200 cursor-pointer
                        ${
                          isSelected
                            ? "bg-yellow-900/20 border-yellow-600/50 text-yellow-100"
                            : "bg-transparent border-transparent text-zinc-500 hover:bg-white/5"
                        }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {quest.status === "completed" ||
                      quest.status === "ready_to_turn_in" ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <Circle
                          size={14}
                          className={
                            isSelected ? "text-yellow-500" : "text-zinc-700"
                          }
                        />
                      )}
                      <span className="text-xs font-bold truncate">
                        {quest.title}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* DÉTAILS DE LA QUÊTE (DROITE) */}
        <div className="flex-1 bg-[url('/noise.png')] bg-repeat relative p-8 flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 to-black opacity-90 pointer-events-none" />

          {selectedQuest ? (
            <div className="relative z-10 flex flex-col h-full">
              <h1 className="text-2xl font-serif text-yellow-500 mb-2">
                {selectedQuest.title}
              </h1>
              <div className="w-full h-[1px] bg-gradient-to-r from-yellow-900/50 to-transparent mb-6"></div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-8 italic">
                "{selectedQuest.description}"
              </p>

              {/* OBJECTIFS */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                  Objectifs
                </h3>
                {selectedQuest.objectives.map((obj: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-3 rounded"
                  >
                    <span
                      className={`text-xs ${
                        obj.isCompleted
                          ? "text-zinc-500 line-through"
                          : "text-zinc-300"
                      }`}
                    >
                      {obj.description}
                    </span>
                    <span
                      className={`text-xs font-mono ${
                        obj.isCompleted ? "text-green-500" : "text-yellow-600"
                      }`}
                    >
                      {obj.current} / {obj.required}
                    </span>
                  </div>
                ))}
              </div>

              {/* RÉCOMPENSES */}
              <div className="mt-auto">
                <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                  <Trophy size={14} /> Récompenses
                </h3>
                <div className="flex gap-4">
                  {selectedQuest.rewards.xp && (
                    <div className="px-3 py-1 bg-purple-900/20 border border-purple-800/50 rounded text-purple-300 text-xs font-bold">
                      {selectedQuest.rewards.xp} XP
                    </div>
                  )}
                  {selectedQuest.rewards.gold && (
                    <div className="px-3 py-1 bg-yellow-900/20 border border-yellow-800/50 rounded text-yellow-300 text-xs font-bold">
                      {selectedQuest.rewards.gold} Or
                    </div>
                  )}
                  {selectedQuest.rewards.items &&
                    selectedQuest.rewards.items.length > 0 && (
                      <div className="px-3 py-1 bg-blue-900/20 border border-blue-800/50 rounded text-blue-300 text-xs font-bold">
                        {selectedQuest.rewards.items.length} Objet(s)
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-zinc-700">
              <Scroll size={48} className="opacity-20 mb-4" />
              <p className="text-sm">
                Sélectionnez une quête pour voir les détails.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
