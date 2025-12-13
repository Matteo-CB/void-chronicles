import { generateBackgroundSVG } from "../lib/spriteEngine"; // On peut générer le SVG côté serveur !
import GameContainer from "../components/ui/GameContainer";

export default function Page() {
  const bgSvg = generateBackgroundSVG();

  return (
    <main className="min-h-screen flex items-center justify-center relative bg-zinc-950 overflow-hidden">
      {/* Background SVG injecté depuis le serveur */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        dangerouslySetInnerHTML={{ __html: bgSvg }}
      />

      <div className="flex flex-col items-center gap-4 z-10">
        {/* Tout le jeu se passe ici */}
        <GameContainer />

        <div className="text-zinc-500 text-xs font-mono bg-black/80 p-2 rounded border border-zinc-800 backdrop-blur-sm">
          [Z/Q/S/D] Déplacer &bull; [ESPACE] Interaction
        </div>
      </div>
    </main>
  );
}
