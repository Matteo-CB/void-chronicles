import GameContainer from "../components/ui/GameContainer";

export default function Page() {
  return (
    <main className="relative w-full h-full flex items-center justify-center bg-zinc-950 scanline">
      {/* Conteneur 16:9 Strict */}
      <div className="relative aspect-video w-full max-w-[177.78vh] max-h-screen bg-black shadow-2xl overflow-hidden border-y-2 border-zinc-900">
        <GameContainer />
      </div>
    </main>
  );
}
