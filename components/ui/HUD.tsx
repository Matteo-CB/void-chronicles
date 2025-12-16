import useGameStore from "@/store/gameStore";
import {
  Gamepad2,
  Keyboard,
  Scroll,
  Heart,
  Shield,
  Coins,
  Sword,
  Zap,
  Flag,
  AlertTriangle,
} from "lucide-react";
import SpriteIcon from "./SpriteIcon";
import { useState, useEffect } from "react";

export default function HUD() {
  const { player, dungeonLevel, inventory, inputMethod, log } = useGameStore(
    (state: any) => state
  );

  const [isConfirmingAbandon, setIsConfirmingAbandon] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConfirmingAbandon) {
      timer = setTimeout(() => {
        setIsConfirmingAbandon(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isConfirmingAbandon]);

  const handleAbandonClick = () => {
    if (!isConfirmingAbandon) {
      setIsConfirmingAbandon(true);
    } else {
      localStorage.removeItem("void_chronicles_save");
      localStorage.clear();
      window.location.reload();
    }
  };

  const getBarWidth = (current: number, max: number) =>
    `${Math.max(0, Math.min(100, (current / max) * 100))}%`;

  const spells = player.equippedSpells || [null, null, null];
  const recentLogs = (log || []).slice(-6);

  const getItemSpriteKey = (item: any) => {
    if (!item) return "ROCK";
    if (item.type === "weapon")
      return `WEAPON_${(item.weaponType || "SWORD").toUpperCase()}`;
    if (item.type === "potion" || item.type === "consumable") return "POTION";
    if (item.type === "gold") return "GOLD";
    if (item.type === "armor") return "ARMOR";
    if (item.type === "accessory") return "RELIC";
    if (item.type === "spellbook") return "SPELLBOOK";
    return "CHEST";
  };

  const CONTROLS =
    inputMethod === "gamepad"
      ? [
          { label: "Atk", key: "X/Y" },
          { label: "Action", key: "A" },
          { label: "Sac", key: "Start" },
        ]
      : [
          { label: "Atk", key: "J/K" },
          { label: "Action", key: "E" },
          { label: "Sac", key: "I" },
        ];

  return (
    <div className="absolute top-0 left-0 w-full h-full p-6 pointer-events-none flex flex-col justify-between font-pixel z-10">
      {/* --- TOP BAR --- */}
      <div className="flex justify-between items-start w-full">
        <div className="flex gap-4 pointer-events-auto">
          {/* Avatar */}
          <div className="w-20 h-20 bg-zinc-900 border-2 border-zinc-600 rounded-lg flex items-center justify-center overflow-hidden shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50"></div>
            <SpriteIcon type="PLAYER" size={64} className="relative z-10" />
            <div className="absolute bottom-0 right-0 bg-zinc-800 px-1 border-t border-l border-zinc-600 text-[8px] text-zinc-400">
              NV.{player.level}
            </div>
          </div>

          {/* Stats Bars */}
          <div className="flex flex-col gap-1 w-64 pt-1">
            <h2 className="text-zinc-100 text-xs font-bold tracking-wider drop-shadow-md uppercase">
              {player.name}
            </h2>
            {/* HP */}
            <div className="relative h-4 bg-zinc-950 border border-zinc-700 rounded-sm">
              <div
                className="absolute h-full bg-gradient-to-r from-red-900 to-red-600 transition-all duration-300"
                style={{
                  width: getBarWidth(player.stats.hp, player.stats.maxHp),
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 text-[8px] text-white font-bold drop-shadow-md z-10">
                <Heart size={8} className="fill-white" />
                {Math.ceil(player.stats.hp)}/{player.stats.maxHp}
              </div>
            </div>
            {/* Mana */}
            <div className="relative h-2 bg-zinc-950 border border-zinc-700 rounded-sm mt-0.5">
              <div
                className="absolute h-full bg-gradient-to-r from-blue-900 to-cyan-600 transition-all duration-300"
                style={{
                  width: getBarWidth(player.stats.mana, player.stats.maxMana),
                }}
              />
            </div>
            <div className="flex gap-4 mt-1 text-[10px] text-zinc-400">
              <div className="flex items-center gap-1">
                <Sword size={10} />{" "}
                <span className="text-zinc-200">{player.stats.attack}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield size={10} />{" "}
                <span className="text-zinc-200">{player.stats.defense}</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins size={10} className="text-amber-400" />{" "}
                <span className="text-amber-300">{player.gold}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- TOP RIGHT --- */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex gap-2 items-center">
            {/* Bouton Abandon */}
            <button
              onClick={handleAbandonClick}
              className={`
                px-3 py-2 rounded transition-all flex items-center gap-2 border shadow-lg
                ${
                  isConfirmingAbandon
                    ? "bg-red-600 border-red-400 text-white animate-pulse"
                    : "bg-red-950/80 border-red-800 text-red-200 hover:bg-red-900"
                }
              `}
              title="Réinitialiser"
            >
              {isConfirmingAbandon ? (
                <AlertTriangle size={14} className="stroke-2" />
              ) : (
                <Flag size={14} />
              )}
              <span className="text-[10px] uppercase font-bold hidden sm:inline">
                {isConfirmingAbandon ? "CONFIRMER ?" : "Abandonner"}
              </span>
            </button>

            {/* Indicateur Input Method */}
            <div className="bg-zinc-900/90 border border-zinc-700 px-3 py-2 rounded flex items-center gap-2 text-[10px] text-zinc-400">
              {inputMethod === "gamepad" ? (
                <Gamepad2 size={14} />
              ) : (
                <Keyboard size={14} />
              )}
            </div>

            <div className="bg-gradient-to-b from-amber-900/80 to-black border border-amber-700/50 px-4 py-2 rounded text-amber-500 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              ETAGE {dungeonLevel}
            </div>
          </div>

          {/* Inventaire Rapide */}
          <div className="flex gap-1 bg-zinc-950/80 p-1 rounded border border-zinc-800 backdrop-blur-sm">
            {inventory.slice(0, 5).map((item: any, i: number) => (
              <div
                key={i}
                className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center relative overflow-hidden group"
              >
                {item && <SpriteIcon type={getItemSpriteKey(item)} size={24} />}
                <span className="absolute bottom-0.5 right-1 text-[8px] text-zinc-500 font-mono">
                  {i + 1}
                </span>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 5 - inventory.length) }).map(
              (_, i) => (
                <div
                  key={`e-${i}`}
                  className="w-10 h-10 bg-zinc-950 border border-zinc-800/50"
                />
              )
            )}
          </div>

          {/* Touches dynamiques */}
          <div className="flex gap-2 bg-black/80 p-1.5 rounded border border-zinc-800 backdrop-blur-sm mt-1">
            {CONTROLS.map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-[8px] text-zinc-500 uppercase">
                  {c.label}
                </span>
                <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800 px-1 rounded border border-zinc-700">
                  {c.key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- BOTTOM --- */}
      <div className="flex justify-between items-end w-full">
        {/* Logs */}
        <div className="w-[400px] h-40 pointer-events-none flex flex-col justify-end">
          <div className="bg-black/80 p-3 rounded-tr-xl border-t border-r border-zinc-800 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-zinc-800">
              <Scroll size={12} className="text-zinc-500" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Journal
              </span>
            </div>
            <div className="flex flex-col justify-end gap-1 overflow-hidden h-24">
              {recentLogs.map((entry: string, i: number) => (
                <p
                  key={i}
                  className={`text-[10px] truncate ${
                    i === recentLogs.length - 1
                      ? "text-white font-bold"
                      : "text-zinc-500"
                  }`}
                >
                  <span className="opacity-50 mr-2">›</span>
                  {entry}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Sorts */}
        <div className="pointer-events-auto flex gap-4 p-4 bg-zinc-950/90 rounded-xl border border-zinc-800 shadow-2xl relative translate-y-2">
          {spells.map((spellId: string | null, i: number) => {
            const spell = player.spells?.find((s: any) => s.id === spellId);
            return (
              <div key={i} className="relative group">
                <div
                  className={`w-14 h-14 bg-zinc-900 border-2 ${
                    spell ? "border-zinc-500" : "border-zinc-800"
                  } rounded flex items-center justify-center shadow-inner overflow-hidden relative`}
                >
                  {spell ? (
                    <>
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundColor: spell.color || "#fff" }}
                      ></div>
                      <Zap size={24} style={{ color: spell.color || "#fff" }} />
                      {spell.currentCooldown > 0 && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white font-bold text-sm z-20">
                          {Math.ceil(spell.currentCooldown)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-2 h-2 bg-zinc-800 rounded-full"></div>
                  )}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-zinc-700 shadow-lg z-30">
                  {inputMethod === "gamepad"
                    ? i === 0
                      ? "LB"
                      : i === 1
                      ? "RB"
                      : "RT"
                    : i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
