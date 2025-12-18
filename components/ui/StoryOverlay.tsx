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

  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // CORRECTION : Reset total quand la cutscene change pour éviter les index invalides
  useEffect(() => {
    setLineIndex(0);
    setDisplayedText("");
    setIsTyping(false);
  }, [currentCutsceneId]);

  const cutscene = currentCutsceneId
    ? STORY.cutscenes[currentCutsceneId]
    : null;

  // Sécurité : On s'assure que lineIndex ne dépasse jamais la longueur du tableau
  // même pendant le cycle de render où le state n'est pas encore reset
  const safeLineIndex =
    cutscene && lineIndex < cutscene.dialogues.length ? lineIndex : 0;

  const currentLine: DialogueLine | undefined =
    cutscene?.dialogues?.[safeLineIndex];

  // Auto-skip : Si on est monté mais sans données valides, on rend la main au jeu
  useEffect(() => {
    if (!cutscene || !currentLine) {
      const timer = setTimeout(() => {
        advanceCutscene();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [cutscene, currentLine, advanceCutscene]);

  const handleAdvance = useCallback(() => {
    if (!cutscene || !currentLine) {
      advanceCutscene();
      return;
    }

    if (isTyping) {
      // Si le texte est en train d'être tapé, on l'affiche en entier instantanément
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      // Sinon on passe à la ligne suivante
      if (lineIndex < cutscene.dialogues.length - 1) {
        setLineIndex((prev) => prev + 1);
      } else {
        advanceCutscene();
      }
    }
  }, [isTyping, currentLine, lineIndex, cutscene, advanceCutscene]);

  // Gestion Clavier
  useEffect(() => {
    if (!cutscene) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAdvance, cutscene]);

  // Gestion Manette (Améliorée avec Debounce)
  useEffect(() => {
    if (!cutscene) return;

    let animationFrameId: number;
    let wasPressed = false;
    let lastPressTime = 0; // Anti-rebond

    const pollGamepad = () => {
      const gamepad = navigator.getGamepads()[0];
      if (gamepad) {
        const isPressed = gamepad.buttons[0].pressed; // Bouton A
        const now = Date.now();

        if (isPressed && !wasPressed && now - lastPressTime > 200) {
          handleAdvance();
          lastPressTime = now;
        }
        wasPressed = isPressed;
      }
      animationFrameId = requestAnimationFrame(pollGamepad);
    };
    pollGamepad();
    return () => cancelAnimationFrame(animationFrameId);
  }, [handleAdvance, cutscene]);

  // Effet Machine à Écrire
  useEffect(() => {
    if (!currentLine) return;

    setDisplayedText("");
    setIsTyping(true);
    let charIndex = 0;
    const fullText = currentLine.text;

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));
      if (charIndex >= fullText.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        setIsTyping(false);
      }
    }, 25); // Vitesse de frappe

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [safeLineIndex, currentLine]); // Utilisation de safeLineIndex pour la dépendance

  if (!currentCutsceneId || !cutscene || !currentLine) return null;

  const speaker = STORY.characters[currentLine.speakerId];

  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-end pb-12 font-pixel">
      {/* Arrière-plan dynamique */}
      <div
        key={cutscene.backgroundId}
        className={`absolute inset-0 opacity-40 bg-cover bg-center transition-all duration-1000 ${cutscene.backgroundId}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* Portrait du personnage */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLine.speakerId + safeLineIndex}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div
              className="w-64 h-64 md:w-96 md:h-96 border-4 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm relative overflow-hidden"
              style={{ borderColor: speaker?.color || "#fff" }}
            >
              {/* Effet de lueur interne */}
              <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: speaker?.color || "#fff" }}
              />

              {/* Placeholder Sprite ou Texte */}
              <span
                className="text-9xl font-black uppercase tracking-tighter opacity-80 drop-shadow-2xl"
                style={{
                  color: speaker?.color || "#fff",
                  textShadow: `0 0 40px ${speaker?.color}`,
                }}
              >
                {speaker?.spriteKey?.charAt(0) || "?"}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Boîte de Dialogue */}
      <motion.div
        key={safeLineIndex}
        className="relative z-10 w-full max-w-4xl mx-4 cursor-pointer group"
        onClick={handleAdvance}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Nom du personnage (Style étiquette) */}
        <div className="flex items-end mb-0 ml-8">
          <div
            className="px-8 py-2 text-xl font-bold text-black transform -skew-x-12 uppercase tracking-widest border-t-2 border-l-2 border-r-2 border-white/20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] relative z-20"
            style={{ backgroundColor: speaker?.color || "#fff", color: "#000" }}
          >
            <span className="inline-block transform skew-x-12">
              {speaker?.name || "???"}
            </span>
          </div>
        </div>

        {/* Corps du texte */}
        <div className="bg-zinc-950/95 border-2 border-zinc-700 p-8 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-2xl backdrop-blur-xl min-h-[180px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-10 pointer-events-none" />

          <p className="text-2xl text-zinc-100 font-medium leading-relaxed font-sans tracking-wide drop-shadow-md relative z-10">
            {displayedText}
            {isTyping && (
              <span className="animate-pulse inline-block w-3 h-6 bg-white ml-1 align-middle" />
            )}
          </p>

          {/* Indicateurs de contrôle */}
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
              <span className="text-xs uppercase tracking-[0.3em] text-zinc-500 animate-pulse flex items-center gap-1">
                Suivant <span className="text-lg">▶</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
