import useGameStore from "@/store/gameStore";

export default function GameOverScreen() {
  const { initGame, inputMethod } = useGameStore((state: any) => state);

  const restartText =
    inputMethod === "gamepad" ? "Recommencer [A]" : "Recommencer [ENTRÉE]";

  return (
    <div className="absolute inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center animate-in fade-in duration-1000 backdrop-blur-sm">
      <h1 className="text-8xl text-red-700 tracking-[0.5em] mb-4 font-bold drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">
        MORT
      </h1>
      <p className="text-zinc-500 mb-12 text-sm uppercase tracking-widest">
        Votre âme retourne au néant...
      </p>
      <button
        className="px-12 py-4 bg-zinc-900 border-2 border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:border-red-600 hover:text-red-500 transition-all uppercase tracking-widest text-lg font-bold shadow-lg"
        onClick={() => typeof initGame === "function" && initGame(false)}
      >
        {restartText}
      </button>
    </div>
  );
}
