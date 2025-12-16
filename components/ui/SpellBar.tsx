import useGameStore from "@/store/gameStore";
import { Zap } from "lucide-react";

export default function SpellBar() {
  const { player, castSpell, inputMethod } = useGameStore(
    (state: any) => state
  );

  const CONTROLS =
    inputMethod === "gamepad" ? ["X", "LB", "RB"] : ["1", "2", "3"];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex gap-3 p-3 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm z-20">
      {Array.from({ length: 3 }).map((_, i) => {
        const spellId = player.equippedSpells[i];
        const spell = (player.spells || []).find((s: any) => s.id === spellId);
        const keyHint = CONTROLS[i];

        return (
          <div
            key={i}
            className="flex flex-col items-center group relative cursor-pointer"
            onClick={() => castSpell(i)}
          >
            <div
              className={`w-14 h-14 border-2 rounded-lg ${
                spell
                  ? "border-zinc-400 bg-zinc-900"
                  : "border-zinc-800 bg-black/50"
              } flex items-center justify-center relative transition-transform group-hover:-translate-y-1 shadow-lg overflow-hidden`}
              style={
                spell
                  ? {
                      borderColor: spell.color,
                      boxShadow: `0 0 10px ${spell.color}40`,
                    }
                  : {}
              }
            >
              {spell && (
                <>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundColor: spell.color }}
                  ></div>
                  <Zap
                    size={24}
                    style={{ color: spell.color }}
                    className="drop-shadow-md"
                  />

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800 rounded-b">
                    <div
                      className="h-full bg-white transition-all duration-100"
                      style={{
                        width: `${
                          (1 - spell.currentCooldown / spell.cooldown) * 100
                        }%`,
                      }}
                    />
                  </div>
                  {spell.currentCooldown > 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg text-white font-bold text-lg backdrop-blur-[1px]">
                      {spell.currentCooldown}
                    </div>
                  )}
                </>
              )}
              <span className="absolute -top-3 -right-2 bg-zinc-200 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-zinc-400">
                {keyHint}
              </span>
            </div>
            {spell && (
              <span className="text-[8px] bg-black/90 px-2 py-0.5 mt-1.5 text-blue-300 rounded-full border border-blue-900/50">
                {spell.cost} MP
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
