import useGameStore from "@/store/gameStore";

export default function SpellBar() {
  const { player, castSpell, inputMethod } = useGameStore();

  // Mapping Dynamique
  const CONTROLS =
    inputMethod === "gamepad" ? ["X", "LB", "RB"] : ["1", "2", "3"];

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 flex items-center justify-center gap-6 h-24 relative z-30">
      {/* Jauge Mana */}
      <div className="flex flex-col w-48 gap-1">
        <div className="flex justify-between text-xs text-blue-400 font-bold uppercase">
          <span>Mana</span>
          <span>
            {player.stats.mana} / {player.stats.maxMana}
          </span>
        </div>
        <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden border border-zinc-700">
          <div
            className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
            style={{
              width: `${Math.max(
                0,
                Math.min(100, (player.stats.mana / player.stats.maxMana) * 100)
              )}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="w-px h-10 bg-zinc-800 mx-2"></div>

      {/* Sorts */}
      <div className="flex gap-4">
        {player.spells &&
          player.spells.map((spell, idx) => (
            <div
              key={spell.id}
              className="relative group cursor-pointer"
              onClick={() => castSpell(idx)}
            >
              <div
                className={`w-14 h-14 bg-zinc-950 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                  spell.currentCooldown > 0
                    ? "border-zinc-800 opacity-50"
                    : "border-zinc-600 hover:border-white hover:shadow-lg"
                }`}
                style={{
                  borderColor:
                    spell.currentCooldown === 0 ? spell.color : undefined,
                }}
              >
                {/* Touche Dynamique */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-300 text-[10px] font-black px-1.5 rounded border border-zinc-600 shadow-md">
                  {CONTROLS[idx]}
                </span>

                <span className="text-2xl drop-shadow-md mt-1">
                  {spell.id === "fireball"
                    ? "🔥"
                    : spell.id === "heal"
                    ? "💖"
                    : "⚡"}
                </span>

                {/* Cooldown */}
                {spell.currentCooldown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white font-bold rounded-lg text-lg backdrop-blur-[1px]">
                    {spell.currentCooldown}
                  </div>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-40 bg-black border border-zinc-700 p-2 rounded text-xs text-center z-50 pointer-events-none shadow-xl">
                <p className="font-bold mb-1" style={{ color: spell.color }}>
                  {spell.name}
                </p>
                <p className="text-zinc-400">{spell.description}</p>
                <p className="text-blue-400 mt-1">{spell.cost} Mana</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
