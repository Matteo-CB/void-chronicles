"use client";

import useGameStore from "@/store/gameStore";
import {
  Gamepad2,
  Keyboard,
  Heart,
  Shield,
  Coins,
  Sword,
  Zap,
  Flag,
  AlertTriangle,
  Skull,
  Activity,
} from "lucide-react";
import SpriteIcon from "./SpriteIcon";
import { useState, useEffect } from "react";

export default function HUD() {
  const {
    player,
    dungeonLevel,
    inventory,
    inputMethod,
    logs,
    enemies,
    levelTheme,
  } = useGameStore((state: any) => state);

  const [isConfirmingAbandon, setIsConfirmingAbandon] = useState(false);
  const [lastHp, setLastHp] = useState(player.stats.hp);
  const [shakeHp, setShakeHp] = useState(false);
  const [delayedHp, setDelayedHp] = useState(player.stats.hp);

  // Recherche du Boss actif pour la BOSS BAR
  const boss = enemies.find((e: any) => e.aiBehavior === "boss" && !e.isDead);

  useEffect(() => {
    if (player.stats.hp < lastHp) {
      setShakeHp(true);
      setTimeout(() => setShakeHp(false), 300);
    }
    const timer = setTimeout(() => setDelayedHp(player.stats.hp), 500);
    setLastHp(player.stats.hp);
    return () => clearTimeout(timer);
  }, [player.stats.hp]);

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
  const recentLogs = (logs || []).slice(-7);

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

  // MISE A JOUR DES CONTROLS POUR CORRESPONDRE AU MOTEUR (K/L et Select)
  const CONTROLS =
    inputMethod === "gamepad"
      ? [
          { label: "Atk", key: "X/Y" },
          { label: "Action", key: "A" },
          { label: "Sac", key: "Select" }, // Corrigé : Select ouvre l'inventaire
        ]
      : [
          { label: "Atk", key: "K/L" }, // Corrigé : K (Light) / L (Heavy)
          { label: "Action", key: "E" },
          { label: "Sac", key: "Tab" }, // Tab ou I est standard
        ];

  return (
    <div className="absolute top-0 left-0 w-full h-full p-4 pointer-events-none flex flex-col justify-between font-pixel z-30 overflow-hidden">
      {/* VIGNETTE & OVERLAY EFFECTS */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.6)_100%)] z-0"></div>
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0"></div>

      {/* --- BOSS BAR (CENTRÉ EN HAUT) --- */}
      {boss && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex justify-between items-end px-1 mb-1">
            <span className="text-red-500 font-bold text-lg tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              {boss.name}
            </span>
            <span className="text-red-300 text-xs font-mono">
              {Math.ceil(boss.stats.hp)} / {boss.stats.maxHp}
            </span>
          </div>
          <div className="h-4 bg-zinc-950 border-2 border-red-900 rounded-sm relative overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            {/* Fond clignotant si HP bas */}
            <div
              className={`absolute inset-0 bg-red-900/20 ${
                boss.stats.hp < boss.stats.maxHp * 0.3 ? "animate-pulse" : ""
              }`}
            ></div>
            <div
              className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-500 transition-all duration-300 ease-out"
              style={{ width: `${(boss.stats.hp / boss.stats.maxHp) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* TOP HUD */}
      <div className="flex justify-between items-start w-full relative z-10">
        {/* PLAYER STATUS */}
        <div className="flex gap-4 pointer-events-auto items-start group">
          <div className="relative">
            <div className="absolute inset-0 bg-black blur-md rounded-full opacity-50"></div>
            <div
              className={`w-20 h-20 bg-zinc-950 border-2 ${
                player.stats.hp < player.stats.maxHp * 0.3
                  ? "border-red-600 animate-pulse"
                  : "border-zinc-700"
              } rounded-lg flex items-center justify-center relative overflow-hidden shadow-2xl transition-colors duration-300`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-90"></div>
              <SpriteIcon
                type="PLAYER"
                size={60}
                className="relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent opacity-60 z-10"></div>
            </div>
            <div className="absolute -top-2 -left-2 bg-zinc-900 border border-zinc-600 text-[9px] px-1.5 py-0.5 rounded text-zinc-400 font-bold shadow-lg">
              LVL {player.level}
            </div>
          </div>

          <div
            className={`flex flex-col gap-2 w-60 transition-transform duration-100 ${
              shakeHp ? "translate-x-1" : ""
            }`}
          >
            <div className="flex justify-between items-end">
              <h2 className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 drop-shadow-md">
                {player.name}
                {player.stats.hp < player.stats.maxHp * 0.3 && (
                  <Activity size={12} className="text-red-500 animate-pulse" />
                )}
              </h2>
              <div className="flex gap-2 text-[9px]">
                <span className="flex items-center gap-1 text-zinc-400">
                  <Sword size={10} /> {player.stats.attack}
                </span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Shield size={10} /> {player.stats.defense}
                </span>
              </div>
            </div>

            {/* HEALTH BAR */}
            <div className="relative h-4 bg-zinc-950/80 border border-zinc-800 rounded-sm overflow-hidden">
              <div
                className="absolute h-full bg-white transition-all duration-500 ease-out"
                style={{ width: getBarWidth(delayedHp, player.stats.maxHp) }}
              />
              <div
                className="absolute h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-200 ease-out shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                style={{
                  width: getBarWidth(player.stats.hp, player.stats.maxHp),
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] tracking-widest z-10">
                {Math.ceil(player.stats.hp)} / {player.stats.maxHp}
              </div>
            </div>

            {/* MANA BAR */}
            <div className="relative h-2 bg-zinc-950/80 border border-zinc-800 rounded-sm mt-0.5 overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-blue-900 via-blue-500 to-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{
                  width: getBarWidth(player.stats.mana, player.stats.maxMana),
                }}
              />
            </div>

            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold mt-1 drop-shadow-md">
              <Coins size={12} className="fill-amber-400/20" />
              <span>
                {player.gold}{" "}
                <span className="text-[8px] text-amber-600 ml-1">OR</span>
              </span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT INFO */}
        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900/90 border border-zinc-700 px-3 py-1.5 rounded-sm shadow-lg flex items-center gap-3">
              <div className="flex flex-col items-end">
                {/* NOM DU BIOME (Plus dynamique) */}
                <span className="text-[8px] text-zinc-500 uppercase tracking-widest">
                  {levelTheme?.name || "Zone Inconnue"}
                </span>
                <span className="text-xs text-white font-bold tracking-wider flex items-center gap-2">
                  <Skull size={12} className="text-zinc-500" /> ÉTAGE{" "}
                  {dungeonLevel}
                </span>
              </div>
            </div>

            <button
              onClick={handleAbandonClick}
              className={`w-8 h-8 flex items-center justify-center border rounded-sm transition-all shadow-lg ${
                isConfirmingAbandon
                  ? "bg-red-900/80 border-red-500 text-red-200 animate-pulse"
                  : "bg-zinc-900/80 border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500"
              }`}
            >
              {isConfirmingAbandon ? (
                <AlertTriangle size={14} />
              ) : (
                <Flag size={14} />
              )}
            </button>
          </div>

          {/* QUICK INVENTORY */}
          <div className="flex gap-1.5 p-1.5 bg-zinc-950/80 border border-zinc-800 rounded backdrop-blur-sm">
            {inventory.slice(0, 5).map((item: any, i: number) => (
              <div
                key={i}
                className="w-8 h-8 bg-zinc-900/50 border border-zinc-800 rounded-sm flex items-center justify-center relative group hover:border-zinc-600 transition-colors"
              >
                {item && (
                  <SpriteIcon
                    type={getItemSpriteKey(item)}
                    size={18}
                    className="drop-shadow-sm"
                  />
                )}
                <div className="absolute -bottom-1 -right-1 bg-zinc-950 border border-zinc-800 w-3 h-3 flex items-center justify-center text-[6px] text-zinc-400">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM HUD */}
      <div className="flex justify-between items-end w-full relative z-10">
        {/* LOGS - STYLE TERMINAL */}
        <div className="w-[360px] pointer-events-none">
          <div className="bg-gradient-to-t from-black via-zinc-950/80 to-transparent p-4 rounded-tr-2xl border-l-2 border-b-2 border-zinc-800/50 mask-image-linear-to-b backdrop-blur-md">
            <div className="flex flex-col justify-end gap-1 min-h-[120px]">
              {recentLogs.map((entry: string, i: number) => (
                <div
                  key={i}
                  className={`text-[9px] transition-all duration-300 flex items-start gap-2 ${
                    i === recentLogs.length - 1
                      ? "text-white scale-100 translate-x-2"
                      : "text-zinc-500 scale-95 opacity-70"
                  }`}
                >
                  <span
                    className={`mt-1.5 w-1 h-1 rounded-full ${
                      i === recentLogs.length - 1
                        ? "bg-green-500 shadow-[0_0_5px_#22c55e]"
                        : "bg-zinc-700"
                    }`}
                  ></span>
                  <span className="leading-snug drop-shadow-sm">{entry}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SPELLS & CONTROLS */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* SPELLS BAR */}
          <div className="flex gap-3 p-2 bg-zinc-950/80 border border-zinc-800 rounded-xl backdrop-blur-xl shadow-2xl">
            {spells.map((spellId: string | null, i: number) => {
              const spell = player.spells?.find((s: any) => s.id === spellId);
              return (
                <div key={i} className="relative group">
                  <div
                    className={`w-12 h-12 bg-zinc-900 border-2 ${
                      spell
                        ? "border-zinc-600 group-hover:border-zinc-400"
                        : "border-zinc-800"
                    } rounded-lg flex items-center justify-center overflow-hidden relative transition-all duration-200`}
                  >
                    {spell ? (
                      <>
                        <div
                          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                          style={{ backgroundColor: spell.color }}
                        ></div>
                        <div className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transform group-hover:scale-110 transition-transform">
                          <Zap
                            size={20}
                            style={{ color: spell.color, fill: spell.color }}
                          />
                        </div>
                        {spell.currentCooldown > 0 && (
                          <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center z-20">
                            <span className="text-white font-bold text-xs animate-pulse">
                              {Math.ceil(spell.currentCooldown)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-zinc-500 text-[8px] font-bold px-1.5 rounded-sm border border-zinc-700 shadow-md">
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

          {/* CONTROLS HINT */}
          <div className="flex gap-2 opacity-50 hover:opacity-100 transition-opacity bg-black/40 p-1.5 rounded border border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-zinc-200 text-black text-[9px] font-bold flex items-center justify-center rounded shadow-sm">
                {inputMethod === "gamepad" ? (
                  <Gamepad2 size={12} />
                ) : (
                  <Keyboard size={12} />
                )}
              </div>
            </div>
            <div className="w-[1px] bg-white/20 mx-1"></div>
            {CONTROLS.map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-[7px] text-zinc-400 uppercase tracking-tight">
                  {c.label}
                </span>
                <span className="text-[9px] text-zinc-200 font-bold bg-zinc-800 px-1 rounded border border-zinc-700">
                  {c.key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
