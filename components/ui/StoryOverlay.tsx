import { motion } from "framer-motion";
import useGameStore from "@/store/gameStore";

export default function StoryOverlay() {
  const { currentDialogue, advanceDialogue } = useGameStore();
  if (!currentDialogue) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={advanceDialogue}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl p-8 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl text-center cursor-pointer"
      >
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-serif">
          Chronique
        </h2>
        <motion.p
          key={currentDialogue}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-xl text-zinc-300 leading-relaxed font-light tracking-wide"
        >
          {currentDialogue}
        </motion.p>
        <p className="mt-8 text-xs text-zinc-500 animate-pulse">
          Cliquer pour continuer...
        </p>
      </motion.div>
    </div>
  );
}
