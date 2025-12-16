import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useGameStore from "@/store/gameStore";
import storyData from "@/lib/data/storyData.json";
import { DialogueLine } from "@/types/story";

const STORY = storyData as any;

export default function StoryOverlay() {
  const currentCutsceneId = useGameStore((state) => state.currentCutsceneId);
  const advanceCutscene = useGameStore((state) => state.advanceCutscene);

  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Utiliser une ref pour stocker l'intervalle et le nettoyer proprement
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cutscene = STORY.cutscenes[currentCutsceneId || ""];
  const currentLine: DialogueLine | undefined = cutscene?.dialogues[lineIndex];

  // --- SÉCURITÉ ANTI-BLOCAGE ---
  // Si une cutscene est demandée mais n'existe pas dans les données, on la ferme immédiatement.
  useEffect(() => {
    if (currentCutsceneId && !cutscene) {
      console.warn(
        `Cutscene "${currentCutsceneId}" introuvable. Passage automatique.`
      );
      advanceCutscene();
    }
  }, [currentCutsceneId, cutscene, advanceCutscene]);

  // Fonction pour avancer (stable avec useCallback)
  const handleAdvance = useCallback(() => {
    // Si pas de ligne ou pas de cutscene, on sort de la cutscene pour débloquer le jeu
    if (!cutscene || !currentLine) {
      advanceCutscene();
      return;
    }

    if (isTyping) {
      // 1. SKIP : On affiche tout tout de suite
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      // 2. NEXT : On passe à la ligne suivante
      if (lineIndex < cutscene.dialogues.length - 1) {
        setLineIndex((prev) => prev + 1);
        // Reset du texte pour la nouvelle ligne se fait dans le useEffect
      } else {
        advanceCutscene();
      }
    }
  }, [isTyping, currentLine, lineIndex, cutscene, advanceCutscene]);

  // --- CONTROLES (Clavier / Manette) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault(); // Evite le scroll avec Espace
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAdvance]);

  useEffect(() => {
    let animationFrameId: number;
    let wasPressed = false;
    const pollGamepad = () => {
      const gamepad = navigator.getGamepads()[0];
      if (gamepad) {
        const isPressed = gamepad.buttons[0].pressed; // Bouton A/Croix
        if (isPressed && !wasPressed) {
          handleAdvance();
        }
        wasPressed = isPressed;
      }
      animationFrameId = requestAnimationFrame(pollGamepad);
    };
    pollGamepad();
    return () => cancelAnimationFrame(animationFrameId);
  }, [handleAdvance]);

  // --- EFFET TYPEWRITER ---
  useEffect(() => {
    if (!currentLine) return;

    // Reset complet à chaque nouvelle ligne
    setDisplayedText("");
    setIsTyping(true);

    let charIndex = 0;
    const fullText = currentLine.text;

    // Nettoyer l'intervalle précédent s'il existe
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));
      if (charIndex >= fullText.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        setIsTyping(false);
      }
    }, 25); // Vitesse du texte

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [lineIndex, currentLine]); // Déclenchement à chaque changement d'index

  // Si on n'a pas les données requises, on ne rend rien
  // (La sécurité useEffect plus haut s'occupera de débloquer le jeu)
  if (!currentCutsceneId || !cutscene || !currentLine) return null;

  const speaker = STORY.characters[currentLine.speakerId];

  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-end pb-12">
      {/* Background */}
      <div
        key={cutscene.backgroundId}
        className={`absolute inset-0 opacity-40 bg-cover bg-center transition-all duration-1000 ${cutscene.backgroundId}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* Personnages */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLine.speakerId + lineIndex} // Astuce: key unique force le re-render
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div
              className="w-64 h-64 md:w-96 md:h-96 border-4 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm"
              style={{ borderColor: speaker?.color || "#fff" }}
            >
              <span
                className="text-6xl font-black uppercase tracking-tighter opacity-80"
                style={{
                  color: speaker?.color || "#fff",
                  textShadow: `0 0 20px ${speaker?.color}`,
                }}
              >
                {speaker?.spriteKey?.charAt(0) || "?"}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Boite de Dialogue */}
      <motion.div
        key={lineIndex} // Force l'animation à chaque ligne
        className="relative z-10 w-full max-w-4xl mx-4 cursor-pointer group"
        onClick={handleAdvance}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-end mb-0 ml-8">
          <div
            className="px-8 py-2 text-xl font-bold text-black transform -skew-x-12 uppercase tracking-widest border-t-2 border-l-2 border-r-2 border-white/20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: speaker?.color || "#fff", color: "#000" }}
          >
            <span className="inline-block transform skew-x-12">
              {speaker?.name || "???"}
            </span>
          </div>
        </div>

        <div className="bg-zinc-950/95 border-2 border-zinc-700 p-8 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-2xl backdrop-blur-xl min-h-[180px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-10 pointer-events-none" />

          <p className="text-2xl text-zinc-100 font-medium leading-relaxed font-sans tracking-wide drop-shadow-md relative z-10">
            {displayedText}
            {isTyping && (
              <span className="animate-pulse inline-block w-3 h-6 bg-white ml-1 align-middle" />
            )}
          </p>

          <div className="self-end mt-4 flex items-center gap-4">
            <div className="flex gap-2 text-xs uppercase tracking-widest text-zinc-600 opacity-50">
              <span className="border border-zinc-700 px-2 py-1 rounded">
                Entrée ↵
              </span>
              <span className="border border-zinc-700 px-2 py-1 rounded">
                A / ✕
              </span>
              <span className="border border-zinc-700 px-2 py-1 rounded">
                Clic
              </span>
            </div>
            {!isTyping && (
              <span className="text-xs uppercase tracking-[0.3em] text-zinc-500 animate-pulse">
                Suivant ▶
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
