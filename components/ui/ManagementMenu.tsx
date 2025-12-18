"use client";

import useGameStore from "@/store/gameStore";
import InventoryUI from "./InventoryUI";
import SpellBookUI from "./SpellBookUI";
import QuestLogUI from "./QuestLogUI";
import { Backpack, BookOpen, Scroll, ArrowLeftRight } from "lucide-react";

export default function ManagementMenu() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const inputMethod = useGameStore((s) => s.inputMethod);

  // Dérivation de l'onglet actif depuis le state global
  const activeTab =
    gameState === "spellbook"
      ? "spells"
      : gameState === "quests"
      ? "quests"
      : "inventory";

  return (
    <div className="absolute inset-0 z-[50] flex flex-col bg-black/90 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* BARRE D'ONGLETS */}
      <div className="flex-none h-20 flex items-center justify-center gap-4 md:gap-8 border-b border-zinc-800 bg-[#050508] shadow-2xl z-10">
        {/* INVENTAIRE */}
        <button
          onClick={() => setGameState("inventory")}
          className={`relative group flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
            activeTab === "inventory"
              ? "bg-zinc-900 border-yellow-600 text-yellow-500 scale-105"
              : "bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
          }`}
        >
          <Backpack size={20} />
          <span className="font-pixel text-[10px] md:text-xs tracking-widest uppercase hidden md:inline">
            Sacoche
          </span>
          <div className="absolute -top-2 -left-2 bg-zinc-700 text-white text-[9px] px-1.5 py-0.5 rounded border border-zinc-500 font-bold">
            {inputMethod === "gamepad" ? "LB" : "I"}
          </div>
        </button>

        <div className="text-zinc-700">
          <ArrowLeftRight size={16} />
        </div>

        {/* GRIMOIRE */}
        <button
          onClick={() => setGameState("spellbook")}
          className={`relative group flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
            activeTab === "spells"
              ? "bg-zinc-900 border-purple-500 text-purple-400 scale-105"
              : "bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
          }`}
        >
          <BookOpen size={20} />
          <span className="font-pixel text-[10px] md:text-xs tracking-widest uppercase hidden md:inline">
            Grimoire
          </span>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-zinc-700 text-white text-[9px] px-1.5 py-0.5 rounded border border-zinc-500 font-bold">
            {inputMethod === "gamepad" ? "LB/RB" : "TAB"}
          </div>
        </button>

        <div className="text-zinc-700">
          <ArrowLeftRight size={16} />
        </div>

        {/* QUÊTES */}
        <button
          onClick={() => setGameState("quests")}
          className={`relative group flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
            activeTab === "quests"
              ? "bg-zinc-900 border-green-600 text-green-500 scale-105"
              : "bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
          }`}
        >
          <Scroll size={20} />
          <span className="font-pixel text-[10px] md:text-xs tracking-widest uppercase hidden md:inline">
            Quêtes
          </span>
          <div className="absolute -top-2 -right-2 bg-zinc-700 text-white text-[9px] px-1.5 py-0.5 rounded border border-zinc-500 font-bold">
            {inputMethod === "gamepad" ? "RB" : "TAB"}
          </div>
        </button>
      </div>

      {/* CONTENU */}
      <div className="flex-1 relative overflow-hidden bg-[url('/grid-pattern.png')] bg-repeat opacity-100">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            activeTab === "inventory"
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <InventoryUI />
        </div>
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            activeTab === "spells"
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <SpellBookUI />
        </div>
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            activeTab === "quests"
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <QuestLogUI />
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 w-full text-center pointer-events-none z-20">
        <div className="inline-flex items-center gap-6 bg-black/80 backdrop-blur px-6 py-2 rounded-full border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] uppercase">Fermer</span>
            <kbd className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] border border-zinc-700 font-bold">
              {inputMethod === "gamepad" ? "B" : "I / ECHAP"}
            </kbd>
          </div>
          <div className="w-[1px] h-4 bg-zinc-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] uppercase">
              Changer Onglet
            </span>
            <kbd className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] border border-zinc-700 font-bold">
              {inputMethod === "gamepad" ? "LB / RB" : "TAB"}
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
