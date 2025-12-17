"use client";

import { useState, useEffect } from "react";
import useGameStore from "@/store/gameStore";
import InventoryUI from "./InventoryUI";
import SpellBookUI from "./SpellBookUI";
import { Backpack, BookOpen, ArrowLeftRight } from "lucide-react";

export default function ManagementMenu() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const inputMethod = useGameStore((s) => s.inputMethod);

  // Initialise l'onglet selon l'état qui a déclenché l'ouverture
  const [activeTab, setActiveTab] = useState<"inventory" | "spells">(() => {
    return gameState === "spellbook" ? "spells" : "inventory";
  });

  // Synchronise l'état global si on change d'onglet localement
  useEffect(() => {
    if (
      activeTab === "inventory" &&
      gameState !== "inventory" &&
      gameState !== "management_menu"
    ) {
      setGameState("inventory");
    } else if (
      activeTab === "spells" &&
      gameState !== "spellbook" &&
      gameState !== "management_menu"
    ) {
      setGameState("spellbook");
    }
  }, [activeTab, gameState, setGameState]);

  // Gestion Clavier/Manette pour changer d'onglet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigation Tab
      if (e.key === "Tab") {
        e.preventDefault();
        setActiveTab((prev) => (prev === "inventory" ? "spells" : "inventory"));
      }
      // Flèches gauche/droite
      if (e.key === "ArrowLeft") setActiveTab("inventory");
      if (e.key === "ArrowRight") setActiveTab("spells");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Polling Manette (LB/RB)
  useEffect(() => {
    let frame: number;
    let lastSwitch = 0;
    const checkGamepad = () => {
      const gp = navigator.getGamepads()[0];
      if (gp) {
        const now = Date.now();
        if (now - lastSwitch > 200) {
          if (gp.buttons[4]?.pressed) {
            // LB
            setActiveTab("inventory");
            lastSwitch = now;
          }
          if (gp.buttons[5]?.pressed) {
            // RB
            setActiveTab("spells");
            lastSwitch = now;
          }
        }
      }
      frame = requestAnimationFrame(checkGamepad);
    };
    frame = requestAnimationFrame(checkGamepad);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="absolute inset-0 z-[50] flex flex-col bg-black/90 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* BARRE D'ONGLETS */}
      <div className="flex-none h-20 flex items-center justify-center gap-4 md:gap-8 border-b border-zinc-800 bg-[#050508] shadow-2xl z-10">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`relative group flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
            activeTab === "inventory"
              ? "bg-zinc-900 border-yellow-600 text-yellow-500 scale-105"
              : "bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
          }`}
        >
          <Backpack size={20} />
          <span className="font-pixel text-[10px] md:text-xs tracking-widest uppercase">
            Sacoche
          </span>
          {inputMethod === "gamepad" && activeTab !== "inventory" && (
            <div className="absolute -top-2 -left-2 bg-zinc-700 text-white text-[9px] px-1.5 py-0.5 rounded border border-zinc-500">
              LB
            </div>
          )}
        </button>

        <div className="text-zinc-700">
          <ArrowLeftRight size={16} />
        </div>

        <button
          onClick={() => setActiveTab("spells")}
          className={`relative group flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
            activeTab === "spells"
              ? "bg-zinc-900 border-purple-500 text-purple-400 scale-105"
              : "bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
          }`}
        >
          <BookOpen size={20} />
          <span className="font-pixel text-[10px] md:text-xs tracking-widest uppercase">
            Grimoire
          </span>
          {inputMethod === "gamepad" && activeTab !== "spells" && (
            <div className="absolute -top-2 -right-2 bg-zinc-700 text-white text-[9px] px-1.5 py-0.5 rounded border border-zinc-500">
              RB
            </div>
          )}
        </button>
      </div>

      {/* CONTENU (INVENTAIRE OU GRIMOIRE) */}
      <div className="flex-1 relative overflow-hidden bg-[url('/grid-pattern.png')] bg-repeat opacity-100">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            activeTab === "inventory"
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-10 pointer-events-none"
          }`}
        >
          <InventoryUI />
        </div>
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            activeTab === "spells"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-10 pointer-events-none"
          }`}
        >
          <SpellBookUI />
        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="absolute bottom-6 w-full text-center pointer-events-none">
        <div className="inline-flex items-center gap-6 bg-black/80 backdrop-blur px-6 py-2 rounded-full border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] uppercase">Fermer</span>
            <kbd className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] border border-zinc-700 font-bold">
              {inputMethod === "gamepad" ? "B / SELECT" : "TAB / ECHAP"}
            </kbd>
          </div>
          <div className="w-[1px] h-4 bg-zinc-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] uppercase">
              Naviguer
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
