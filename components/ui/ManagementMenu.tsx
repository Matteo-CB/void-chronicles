"use client";

import useGameStore from "@/store/gameStore";
import InventoryUI from "./InventoryUI";
import SpellBookUI from "./SpellBookUI";
import QuestLogUI from "./QuestLogUI";
import MasteryUI from "./MasteryUI";
import { Backpack, BookOpen, Scroll, GitBranch } from "lucide-react";

export default function ManagementMenu() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const inputMethod = useGameStore((s) => s.inputMethod);

  // Détermination de l'onglet actif basé sur le gameState global
  // Cela permet à la navigation clavier (gérée ailleurs) de se refléter ici
  const activeTab =
    gameState === "spellbook"
      ? "spells"
      : gameState === "quests"
      ? "quests"
      : gameState === "masteries"
      ? "masteries"
      : "inventory";

  // Fonction explicite pour le clic
  const handleTabChange = (
    tab: "inventory" | "spellbook" | "quests" | "masteries"
  ) => {
    setGameState(tab);
  };

  return (
    <div className="absolute inset-0 z-[50] flex flex-col bg-black/95 animate-in fade-in slide-in-from-bottom-2 duration-200 font-sans">
      {/* --- HEADER NAVIGATION --- */}
      <div className="flex-none h-20 md:h-24 flex items-end justify-center gap-1 md:gap-4 border-b border-zinc-800 bg-gradient-to-b from-[#08080a] to-[#111113] shadow-2xl z-20 px-4 pt-4">
        <NavButton
          active={activeTab === "inventory"}
          onClick={() => handleTabChange("inventory")}
          icon={Backpack}
          label="Sacoche"
          colorClass="text-yellow-500 border-yellow-600/50"
        />

        <NavButton
          active={activeTab === "spells"}
          onClick={() => handleTabChange("spellbook")}
          icon={BookOpen}
          label="Grimoire"
          colorClass="text-purple-400 border-purple-500/50"
        />

        <NavButton
          active={activeTab === "quests"}
          onClick={() => handleTabChange("quests")}
          icon={Scroll}
          label="Quêtes"
          colorClass="text-green-500 border-green-600/50"
        />

        <NavButton
          active={activeTab === "masteries"}
          onClick={() => handleTabChange("masteries")}
          icon={GitBranch}
          label="Talents"
          colorClass="text-red-400 border-red-500/50"
        />
      </div>

      {/* --- CONTENU PRINCIPAL --- */}
      <div className="flex-1 relative w-full h-full overflow-hidden bg-[#0a0a0c]">
        {/* Fond texturé subtil */}
        <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.png')] pointer-events-none" />

        <TabContent isActive={activeTab === "inventory"}>
          <InventoryUI />
        </TabContent>

        <TabContent isActive={activeTab === "spells"}>
          <SpellBookUI />
        </TabContent>

        <TabContent isActive={activeTab === "quests"}>
          <QuestLogUI />
        </TabContent>

        <TabContent isActive={activeTab === "masteries"}>
          <MasteryUI />
        </TabContent>
      </div>

      {/* --- FOOTER --- */}
      <div className="flex-none h-10 bg-black/80 border-t border-zinc-800 flex items-center justify-between px-6 text-[10px] md:text-xs text-zinc-500 font-mono">
        <span className="opacity-50">VOID CHRONICLES SYSTEM</span>
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${
                inputMethod === "gamepad"
                  ? "bg-blue-500 text-blue-500"
                  : "bg-zinc-600 text-zinc-600"
              }`}
            />
            {inputMethod === "gamepad"
              ? "MANETTE CONNECTÉE"
              : "CLAVIER / SOURIS"}
          </span>
          <span className="text-zinc-400">
            <strong className="text-zinc-200">ESC</strong> RETOUR
          </span>
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les boutons de navigation (DRY)
function NavButton({ active, onClick, icon: Icon, label, colorClass }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        relative group flex flex-col items-center gap-1 md:gap-2 px-4 md:px-8 py-2 md:py-3 
        rounded-t-lg border-t-2 border-x-2 border-b-0 transition-all duration-200 ease-out
        ${
          active
            ? `bg-[#1a1a1e] ${colorClass} translate-y-[1px] z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]`
            : "bg-transparent border-transparent text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/40 translate-y-2 hover:translate-y-1"
        }
      `}
    >
      <Icon
        size={active ? 22 : 18}
        className={`transition-all duration-300 ${
          active
            ? "scale-110 drop-shadow-md"
            : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
        }`}
      />
      <span
        className={`font-pixel text-[9px] md:text-[10px] tracking-[0.15em] uppercase transition-colors ${
          active ? "font-bold" : "font-medium"
        }`}
      >
        {label}
      </span>

      {/* Ligne de connexion pour l'effet "onglet" */}
      {active && (
        <div className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#1a1a1e] w-full" />
      )}
    </button>
  );
}

// Sous-composant pour le contenu avec transition
function TabContent({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-0 p-4 md:p-8 transition-all duration-300 transform ${
        isActive
          ? "opacity-100 scale-100 z-10 translate-y-0"
          : "opacity-0 scale-95 z-0 pointer-events-none translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}
