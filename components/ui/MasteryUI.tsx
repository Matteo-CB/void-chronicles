import { useMemo } from "react";
import useGameStore from "@/store/gameStore";
import { MASTERY_TREE } from "@/lib/data/masteries";
import {
  Shield,
  Sword,
  Zap,
  Lock,
  Unlock,
  Skull,
  Heart,
  Footprints,
  Coins,
  Eye,
  Castle,
} from "lucide-react";

export default function MasteryUI() {
  const { player, menuSelectionIndex, unlockMastery, setMenuSelectionIndex } =
    useGameStore((s: any) => s);

  // --- SÉCURITÉ ANTI-CRASH ---
  // On s'assure que l'index de sélection ne dépasse jamais la taille du tableau
  const safeSelectionIndex = useMemo(() => {
    if (!MASTERY_TREE || MASTERY_TREE.length === 0) return 0;
    // Si l'index est hors limites, on force 0 pour l'affichage local
    if (menuSelectionIndex < 0 || menuSelectionIndex >= MASTERY_TREE.length)
      return 0;
    return menuSelectionIndex;
  }, [menuSelectionIndex]);

  const selectedNode = MASTERY_TREE[safeSelectionIndex] || MASTERY_TREE[0];

  // Helper pour vérifier l'état d'une maîtrise
  const hasMastery = (id: string | undefined) => {
    if (!id || !player.masteries) return false;
    const masteries = Array.isArray(player.masteries) ? player.masteries : [];
    return masteries.some((m: any) => {
      const mId = typeof m === "string" ? m : m.id;
      return mId === id;
    });
  };

  // Logique d'état
  const isSelectedUnlocked = hasMastery(selectedNode?.id);
  const parentUnlocked =
    !selectedNode?.parentId || hasMastery(selectedNode.parentId);

  // Définition de isAvailable dans la portée principale
  const isAvailable = parentUnlocked;

  const canUnlock =
    selectedNode &&
    player.masteryPoints >= selectedNode.cost &&
    parentUnlocked &&
    !isSelectedUnlocked;

  // Icones dynamiques
  const getIcon = (iconName: string, size = 24) => {
    switch (iconName) {
      case "sword":
        return <Sword size={size} />;
      case "shield":
        return <Shield size={size} />;
      case "zap":
        return <Zap size={size} />;
      case "skull":
        return <Skull size={size} />;
      case "heart":
        return <Heart size={size} />;
      case "boot":
        return <Footprints size={size} />;
      case "coin":
        return <Coins size={size} />;
      case "eye":
        return <Eye size={size} />;
      case "castle":
        return <Castle size={size} />;
      case "swords":
        return (
          <div className="flex">
            <Sword size={size} className="-mr-2" />
            <Sword size={size} />
          </div>
        );
      default:
        return <Sword size={size} />;
    }
  };

  if (!selectedNode) return <div className="text-white">Chargement...</div>;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-pixel animate-in fade-in duration-300">
      <div className="w-full max-w-6xl h-[75vh] flex gap-6">
        {/* === GAUCHE : ARBRE VISUEL === */}
        <div className="flex-1 bg-[#0f0714]/80 backdrop-blur-sm border border-purple-900/30 rounded-xl relative overflow-hidden p-8 shadow-2xl group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0714] to-[#0f0714] opacity-50"></div>

          <h2 className="relative z-10 text-2xl text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-600 font-bold mb-10 uppercase tracking-[0.3em] drop-shadow-sm">
            Constellation des Âmes
          </h2>

          <div className="relative w-full h-full flex justify-center pt-4 scale-90 origin-top">
            {/* LIGNES (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
              {MASTERY_TREE.map((node) => {
                if (!node.parentId) return null;
                const parent = MASTERY_TREE.find((p) => p.id === node.parentId);
                if (!parent) return null;

                // Vérification stricte des coordonnées pour TypeScript
                if (
                  parent.x === undefined ||
                  parent.y === undefined ||
                  node.x === undefined ||
                  node.y === undefined
                ) {
                  return null;
                }

                const startX = 50 + (parent.x - 2) * 20;
                const startY = 15 + parent.y * 20;
                const endX = 50 + (node.x - 2) * 20;
                const endY = 15 + node.y * 20;

                const isPathActive = hasMastery(parent.id);

                return (
                  <line
                    key={`link-${node.id}`}
                    x1={`${startX}%`}
                    y1={`${startY}%`}
                    x2={`${endX}%`}
                    y2={`${endY}%`}
                    stroke={isPathActive ? "#9333ea" : "#27272a"}
                    strokeWidth={isPathActive ? "3" : "1"}
                    className="transition-all duration-500"
                    strokeDasharray={isPathActive ? "none" : "4"}
                  />
                );
              })}
            </svg>

            {/* NOEUDS INTERACTIFS */}
            <div className="relative z-10 w-full h-full">
              {MASTERY_TREE.map((node, idx) => {
                if (node.x === undefined || node.y === undefined) return null;

                const isUnlocked = hasMastery(node.id);
                const isSelected = idx === safeSelectionIndex;
                const isNodeAvailable =
                  !node.parentId || hasMastery(node.parentId);

                const leftPos = 50 + (node.x - 2) * 20;
                const topPos = 15 + node.y * 20;

                return (
                  <div
                    key={node.id}
                    onMouseEnter={() => setMenuSelectionIndex(idx)}
                    onClick={() => unlockMastery(node.id)}
                    className={`
                      absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 cursor-pointer
                      ${
                        isSelected
                          ? "scale-125 shadow-[0_0_30px_rgba(168,85,247,0.5)] z-20 border-white"
                          : "scale-100 z-10 hover:scale-110"
                      }
                      ${
                        isUnlocked
                          ? "bg-purple-950 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                          : isNodeAvailable
                          ? "bg-zinc-900 border-zinc-600 text-zinc-400 hover:border-purple-400/50"
                          : "bg-black/80 border-zinc-900 text-zinc-800 grayscale"
                      }
                    `}
                    style={{ left: `${leftPos}%`, top: `${topPos}%` }}
                  >
                    {getIcon(node.icon, isSelected ? 28 : 22)}

                    {isNodeAvailable && !isUnlocked && (
                      <div className="absolute inset-0 rounded-full animate-pulse bg-purple-500/10 pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* === DROITE : DÉTAILS === */}
        <div className="w-96 flex flex-col gap-4">
          <div className="bg-[#111] border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">
              Points d'Âme
            </span>
            <div className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              {player.masteryPoints}
            </div>
          </div>

          <div className="flex-1 bg-[#0a0a0c] border border-zinc-800 rounded-xl p-6 flex flex-col relative">
            <div
              className={`
              absolute top-0 left-0 w-1 h-full rounded-l-xl transition-colors duration-300
              ${
                selectedNode.category === "offense"
                  ? "bg-red-500"
                  : selectedNode.category === "defense"
                  ? "bg-blue-500"
                  : "bg-green-500"
              }
            `}
            />

            <h3 className="text-2xl text-white font-bold mb-1 tracking-wide">
              {selectedNode.name}
            </h3>

            <div className="flex items-center gap-3 mb-6">
              {/* CORRECTION : On passe la catégorie, même si elle est undefined */}
              <Badge category={selectedNode.category} />
              <div className="h-4 w-[1px] bg-zinc-800" />
              {isSelectedUnlocked ? (
                <span className="text-xs text-green-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                  <Unlock size={12} /> Acquis
                </span>
              ) : (
                <span className="text-xs text-zinc-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                  <Lock size={12} /> {isAvailable ? "Disponible" : "Verrouillé"}
                </span>
              )}
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50 mb-6">
              <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                {selectedNode.description}
              </p>
            </div>

            {selectedNode.stats && (
              <div className="mb-8 space-y-2">
                {Object.entries(selectedNode.stats).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center text-xs text-zinc-400 border-b border-zinc-900 pb-1"
                  >
                    <span className="uppercase opacity-70">{key}</span>
                    <span className="text-white font-mono">+ {val}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto">
              <button
                disabled={!canUnlock}
                onClick={() => unlockMastery(selectedNode.id)}
                className={`
                  w-full py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-xs transition-all duration-200 relative overflow-hidden group
                  ${
                    canUnlock
                      ? "bg-purple-700 hover:bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transform hover:-translate-y-1"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                  }
                `}
              >
                {isSelectedUnlocked ? (
                  "Maîtrisé"
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Apprendre{" "}
                    <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">
                      {selectedNode.cost} pts
                    </span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CORRECTION : Le prop category est maintenant optionnel
function Badge({ category }: { category?: string }) {
  const colors = {
    offense: "text-red-400 bg-red-950/30 border-red-900/50",
    defense: "text-blue-400 bg-blue-950/30 border-blue-900/50",
    utility: "text-green-400 bg-green-950/30 border-green-900/50",
  };
  const labels = {
    offense: "Offensif",
    defense: "Défensif",
    utility: "Utilitaire",
  };

  // Gestion de la valeur par défaut si category est undefined
  const safeCategory = category || "utility";
  const c = safeCategory as keyof typeof colors;

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${
        colors[c] || colors.utility
      }`}
    >
      {labels[c] || safeCategory}
    </span>
  );
}
