import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white font-pixel">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="text-center"
      >
        <h1 className="text-6xl text-transparent bg-clip-text bg-gradient-to-b from-purple-400 via-purple-600 to-black tracking-[0.2em] mb-4 drop-shadow-[0_0_25px_rgba(147,51,234,0.5)]">
          VOID
        </h1>
        <h2 className="text-4xl text-zinc-600 tracking-[0.5em] uppercase">
          Chronicles
        </h2>
      </motion.div>

      <div className="mt-16 w-64 h-1 bg-zinc-900 overflow-hidden relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-purple-600 box-shadow-[0_0_10px_#9333ea]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      <p className="text-[10px] text-zinc-700 mt-4 uppercase tracking-widest animate-pulse">
        Initialisation du néant...
      </p>
    </div>
  );
}
