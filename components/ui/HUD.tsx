import useGameStore from "@/store/gameStore";
import { RotateCcw, Gamepad2, Keyboard, Scroll } from "lucide-react";
import { useEffect, useRef } from "react";

export default function HUD() {
  const {
    player,
    dungeonLevel,
    inventory,
    toggleResetConfirmation,
    inputMethod,
    log, // On récupère les logs
  } = useGameStore();

  const getBarWidth = (current: number, max: number) =>
    `${Math.max(0, Math.min(100, (current / max) * 100))}%`;

  const spells = player.equippedSpells || ["", "", ""];

  return (
    <div className="absolute top-0 left-0 w-full h-full p-4 pointer-events-none flex flex-col justify-between font-pixel z-10">
      {/* --- HAUT : BARRES DE VIE & MANA --- */}
      <div className="flex justify-between items-start w-full">
        {/* STATS JOUEUR */}
        <div className="flex flex-col gap-2 w-72 pointer-events-auto">
          <div className="bg-zinc-950/90 border-2 border-zinc-500 p-3 rounded-lg shadow-2xl text-white backdrop-blur-sm relative overflow-hidden">
            {/* Effet de brillance */}
            <div className="absolute -top-10 -left-10 w-20 h-40 bg-white/5 rotate-45 pointer-events-none blur-xl"></div>

            <h2 className="text-amber-400 text-sm mb-2 flex justify-between items-end">
              <span>{player.name}</span>
              <span className="text-zinc-500 text-[10px]">
                Nv.{player.level}
              </span>
            </h2>

            {/* Barre HP */}
            <div className="relative h-5 bg-zinc-900 rounded border border-zinc-700 mb-2 overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-red-800 to-red-600 transition-all duration-300"
                style={{
                  width: getBarWidth(player.stats.hp, player.stats.maxHp),
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md z-10">
                {player.stats.hp} / {player.stats.maxHp}
              </span>
            </div>

            {/* Barre MP */}
            <div className="relative h-3 bg-zinc-900 rounded border border-zinc-700 overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-blue-800 to-blue-500 transition-all duration-300"
                style={{
                  width: getBarWidth(player.stats.mana, player.stats.maxMana),
                }}
              />
            </div>

            {/* Stats détaillées */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-zinc-400 border-t border-zinc-800 pt-2">
              <div className="flex flex-col items-center">
                <span className="text-zinc-600">ATK</span>
                <span className="text-white font-bold">
                  {player.stats.attack}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-zinc-600">DEF</span>
                <span className="text-white font-bold">
                  {player.stats.defense}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-yellow-500">OR</span>
                <span className="text-yellow-200 font-bold">{player.gold}</span>
              </div>
            </div>
          </div>

          {/* Arme équipée */}
          <div className="bg-black/60 border border-zinc-700 p-2 rounded text-[10px] text-white flex justify-between items-center backdrop-blur-sm">
            <span className="text-zinc-500">Arme</span>
            <span className="text-amber-200 font-bold truncate max-w-[150px]">
              {player.equipment?.weapon?.name || "Mains nues"}
            </span>
          </div>
        </div>

        {/* CONTROLES & NIVEAU */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex gap-2 items-center">
            <div className="text-white/30 bg-black/40 px-2 py-1 rounded text-[10px] flex items-center gap-1 border border-white/10">
              {inputMethod === "gamepad" ? (
                <Gamepad2 size={12} />
              ) : (
                <Keyboard size={12} />
              )}
              <span>{inputMethod === "gamepad" ? "Manette" : "Clavier"}</span>
            </div>
            <button
              onClick={toggleResetConfirmation}
              className="bg-red-950/80 border border-red-800 p-2 text-red-400 hover:bg-red-900 hover:text-white transition-colors rounded relative group"
              title="Réinitialiser"
            >
              <RotateCcw size={16} />
              {inputMethod === "gamepad" && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] bg-white text-black px-1 rounded font-bold whitespace-nowrap">
                  START
                </span>
              )}
            </button>
            <div className="bg-amber-950/80 border-2 border-amber-600/50 p-2 px-4 text-amber-500 font-bold rounded shadow-lg backdrop-blur-sm">
              ÉTAGE {dungeonLevel}
            </div>
          </div>

          {/* Inventaire Rapide */}
          <div className="flex gap-1 mt-2 p-1 bg-black/40 rounded border border-white/10 backdrop-blur-sm">
            <div className="text-[8px] text-zinc-500 w-12 flex items-center justify-center border-r border-white/10 mr-1">
              {inputMethod === "gamepad" ? "Y" : "I"}
            </div>
            {inventory.slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded flex items-center justify-center overflow-hidden relative group"
                title={item.name}
              >
                {item.visualColor && (
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{
                      backgroundColor: item.visualColor,
                      boxShadow: `0 0 5px ${item.visualColor}`,
                    }}
                  ></div>
                )}
                <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[8px] px-1 rounded-tl">
                  {i + 1}
                </span>
              </div>
            ))}
            {/* Slots vides pour compléter à 5 */}
            {Array.from({ length: Math.max(0, 5 - inventory.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-8 h-8 bg-zinc-900/50 border border-zinc-800 rounded"
                ></div>
              )
            )}
          </div>
        </div>
      </div>

      {/* --- BAS : LOGS & SORTS --- */}
      <div className="flex justify-between items-end w-full mt-auto">
        {/* LOGS DE COMBAT */}
        <div className="w-96 h-48 pointer-events-none flex flex-col justify-end mask-image-gradient">
          <div className="bg-black/60 p-4 rounded-tr-xl border-t border-r border-zinc-800/50 backdrop-blur-md overflow-hidden flex flex-col gap-1 shadow-2xl">
            <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-1">
              <Scroll size={12} className="text-zinc-500" />
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Journal de bord
              </span>
            </div>
            <div className="flex flex-col-reverse gap-1.5 overflow-hidden h-full">
              {log.map((entry, i) => (
                <p
                  key={i}
                  className={`text-[10px] leading-relaxed animate-in slide-in-from-left-2 fade-in duration-300 ${
                    i === 0 ? "text-white font-bold text-xs" : "text-zinc-400"
                  }`}
                >
                  <span className="text-zinc-600 mr-2">›</span>
                  {entry}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* BARRE D'ACTION (Sorts) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex gap-3 p-3 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm">
          {Array.from({ length: 3 }).map((_, i) => {
            const spellId = spells[i];
            const spell = (player.spells || []).find((s) => s.id === spellId);
            const keyHint =
              inputMethod === "gamepad"
                ? i === 0
                  ? "LB"
                  : i === 1
                  ? "RB"
                  : "RT"
                : (i + 1).toString();

            return (
              <div
                key={i}
                className="flex flex-col items-center group relative"
              >
                <div
                  className={`w-14 h-14 border-2 rounded-lg ${
                    spell
                      ? "border-zinc-400 bg-zinc-900"
                      : "border-zinc-800 bg-black/50"
                  } flex items-center justify-center relative transition-transform group-hover:-translate-y-1 shadow-lg`}
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
                      <span className="text-2xl drop-shadow-md filter contrast-125">
                        {i === 0 ? "🔥" : i === 1 ? "⚡" : "✨"}
                      </span>
                      {/* Cooldown Overlay */}
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
                  {/* Touche */}
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

          <div className="w-px bg-white/10 mx-1"></div>

          <button
            onClick={() => useGameStore.setState({ gameState: "spellbook" })}
            className="w-14 h-14 bg-purple-950/80 border-2 border-purple-500/50 text-purple-200 text-[10px] flex flex-col items-center justify-center rounded-lg hover:bg-purple-900 hover:border-purple-400 hover:text-white transition-all relative group"
          >
            <span className="text-xl mb-1">📘</span>
            <span className="text-[8px] font-bold">LIVRE</span>
            <span className="absolute -top-3 -right-2 bg-zinc-200 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-zinc-400">
              {inputMethod === "gamepad" ? "X" : "K"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
