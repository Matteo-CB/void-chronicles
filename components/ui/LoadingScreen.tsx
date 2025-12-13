import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-red-600 font-serif tracking-[0.2em] mb-8 drop-shadow-2xl"
      >
        VOID CHRONICLES
      </motion.div>
      <div className="w-96 h-2 bg-zinc-900 rounded-full overflow-hidden relative border border-zinc-800">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-red-500 to-amber-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </div>
      <p className="text-zinc-500 text-xs mt-4 font-mono animate-pulse tracking-widest">
        GÉNÉRATION DU NÉANT EN COURS...
      </p>
    </div>
  );
}
