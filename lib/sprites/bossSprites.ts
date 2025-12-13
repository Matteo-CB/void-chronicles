import { P, r, p, DrawContext } from "./utils";

export function drawBoss(ctx: DrawContext, type: string) {
  // --- TITAN / GOLEM / LAVA_GOLEM ---
  if (type === "GOLEM" || type === "LAVA_GOLEM" || type === "TITAN") {
    const isLava = type === "LAVA_GOLEM";
    const isTitan = type === "TITAN";

    // Palette spécifique
    const base = isTitan ? "#1e293b" : isLava ? "#450a0a" : "#57534e"; // Pierre/Metal sombre
    const mid = isTitan ? "#334155" : isLava ? "#7f1d1d" : "#78716c"; // Pierre moyenne
    const light = isTitan ? "#64748b" : isLava ? "#b91c1c" : "#a8a29e"; // Reflet
    const core = isTitan ? "#f59e0b" : isLava ? "#f97316" : "#06b6d4"; // Energie
    const coreLight = isTitan ? "#fcd34d" : isLava ? "#fdba74" : "#67e8f9";

    // Ombre massive au sol
    r(ctx, 4, 26, 24, 4, P.shadow);

    // JAMBES (Piliers massifs)
    // Jambe Gauche
    r(ctx, 6, 20, 7, 10, base);
    r(ctx, 6, 20, 2, 10, mid); // Ombre latérale
    r(ctx, 8, 28, 5, 2, light); // Pied
    // Jambe Droite
    r(ctx, 19, 20, 7, 10, base);
    r(ctx, 19, 20, 2, 10, mid);
    r(ctx, 21, 28, 5, 2, light);

    // BASSIN (Bloc central)
    r(ctx, 10, 18, 12, 6, base);
    r(ctx, 12, 19, 8, 2, mid); // Ceinture

    // TORSE (Architecture complexe)
    // Structure principale
    r(ctx, 6, 6, 20, 14, base);

    // Pectoraux / Plaques
    r(ctx, 7, 7, 8, 6, mid); // Plaque G
    r(ctx, 17, 7, 8, 6, mid); // Plaque D
    r(ctx, 7, 7, 8, 1, light); // Highlight haut G
    r(ctx, 17, 7, 8, 1, light); // Highlight haut D

    // CŒUR ÉNERGÉTIQUE (Pulsation)
    r(ctx, 13, 11, 6, 6, base); // Logement
    r(ctx, 14, 12, 4, 4, core); // Cœur
    p(ctx, 15, 13, "#fff"); // Point blanc chaud
    p(ctx, 16, 12, coreLight);
    // Rayons d'énergie (Dithering)
    p(ctx, 13, 12, core);
    p(ctx, 18, 13, core);
    p(ctx, 14, 16, core);

    // TÊTE (Monolithe ancien)
    r(ctx, 12, 2, 8, 6, base);
    r(ctx, 12, 2, 8, 1, light); // Sommet éclairé
    // Yeux
    r(ctx, 13, 4, 2, 2, core);
    r(ctx, 17, 4, 2, 2, core);
    p(ctx, 13, 4, "#fff");
    p(ctx, 17, 4, "#fff"); // Eclat regard

    // ÉPAULIÈRES (Montagnes)
    // G
    r(ctx, 2, 6, 6, 10, base);
    r(ctx, 3, 7, 4, 6, mid);
    p(ctx, 4, 8, light);
    // D
    r(ctx, 24, 6, 6, 10, base);
    r(ctx, 25, 7, 4, 6, mid);
    p(ctx, 26, 8, light);

    // BRAS (Détachés ou articulés)
    // Bras G
    r(ctx, 0, 12, 6, 14, base);
    r(ctx, 1, 14, 4, 10, mid);
    r(ctx, 0, 22, 6, 4, light); // Poing
    // Bras D
    r(ctx, 26, 12, 6, 14, base);
    r(ctx, 27, 14, 4, 10, mid);
    r(ctx, 26, 22, 6, 4, light); // Poing

    // DÉTAILS SPÉCIFIQUES
    if (isTitan) {
      // Runes Magiques sur le corps
      p(ctx, 8, 22, P.gold);
      p(ctx, 23, 22, P.gold); // Runes jambes
      p(ctx, 4, 8, P.gold);
      p(ctx, 28, 8, P.gold); // Runes épaules
      // Ornements dorés
      r(ctx, 14, 0, 4, 6, P.goldShadow); // Cimier
      r(ctx, 15, 1, 2, 4, P.gold);
    } else if (isLava) {
      // Coulées de lave
      p(ctx, 8, 9, "#ef4444");
      p(ctx, 23, 9, "#ef4444");
      r(ctx, 10, 24, 2, 4, "#ef4444"); // Lave jambe
    } else {
      // Mousse et Végétation (Golem classique)
      p(ctx, 3, 6, "#22c55e");
      p(ctx, 4, 7, "#166534");
      r(ctx, 12, 1, 4, 1, "#22c55e"); // Mousse tête
      p(ctx, 27, 13, "#22c55e");
    }
  }

  // --- DRAGON (Créature Mythique Détaillée) ---
  else if (type === "DRAGON") {
    // Palette
    const scaleBase = "#7f1d1d"; // Rouge sombre
    const scaleLight = "#991b1b"; // Rouge vif
    const scaleShadow = "#450a0a"; // Rouge noir
    const belly = "#fdba74"; // Orange pâle
    const bellyShadow = "#c2410c";
    const bone = "#171717"; // Cornes noires
    const membrane = "#500724"; // Ailes

    // Ombre immense
    r(ctx, 2, 24, 28, 6, P.shadow);

    // AILES (Déployées et majestueuses)
    // Structure osseuse Aile G
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.lineTo(0, 4);
    ctx.lineTo(12, 0);
    ctx.strokeStyle = scaleShadow;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Membrane Aile G
    ctx.fillStyle = membrane;
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.lineTo(0, 4);
    ctx.lineTo(12, 0);
    ctx.lineTo(8, 14);
    ctx.fill();

    // Structure osseuse Aile D
    ctx.beginPath();
    ctx.moveTo(24, 14);
    ctx.lineTo(32, 4);
    ctx.lineTo(20, 0);
    ctx.stroke();
    // Membrane Aile D
    ctx.beginPath();
    ctx.moveTo(24, 14);
    ctx.lineTo(32, 4);
    ctx.lineTo(20, 0);
    ctx.lineTo(24, 14);
    ctx.fill();

    // CORPS (Serpentin et musclé)
    r(ctx, 10, 14, 12, 14, scaleBase);

    // VENTRE (Strié)
    for (let i = 0; i < 6; i++) {
      r(ctx, 12, 16 + i * 2, 8, 1, belly);
      r(ctx, 12, 17 + i * 2, 8, 1, bellyShadow);
    }

    // PATTES ARRIÈRES (Griffues)
    r(ctx, 8, 24, 4, 6, scaleBase);
    r(ctx, 8, 29, 1, 2, "#000");
    r(ctx, 10, 29, 1, 2, "#000"); // Griffes G
    r(ctx, 20, 24, 4, 6, scaleBase);
    r(ctx, 20, 29, 1, 2, "#000");
    r(ctx, 22, 29, 1, 2, "#000"); // Griffes D

    // COU (Long et puissant)
    r(ctx, 18, 10, 6, 8, scaleBase);
    r(ctx, 19, 11, 4, 6, scaleLight); // Volume du cou

    // TÊTE (Détaillée)
    r(ctx, 20, 4, 10, 8, scaleBase); // Base tête
    r(ctx, 22, 2, 2, 4, bone); // Corne nasale
    r(ctx, 19, 2, 2, 6, bone); // Grande corne arrière

    // Visage
    r(ctx, 26, 6, 2, 2, P.gold); // Oeil
    p(ctx, 27, 6, "#000"); // Pupille fente
    r(ctx, 28, 8, 1, 1, "#000"); // Naryne
    r(ctx, 24, 10, 6, 1, "#fff"); // Dents qui dépassent

    // QUEUE (Épineuse)
    r(ctx, 6, 20, 4, 2, scaleBase);
    r(ctx, 2, 22, 4, 2, scaleBase);
    r(ctx, 0, 20, 2, 6, scaleBase); // Bout queue
    p(ctx, 0, 19, bone); // Pique bout

    // EFFET DE SOUFFLE (Particules)
    p(ctx, 30, 9, "#f97316");
    p(ctx, 31, 8, "#fbbf24");
    p(ctx, 29, 11, "#ef4444");
  }

  // --- LICH (Sorcier Suprême Mort-Vivant) ---
  else if (type === "LICH") {
    // Palette
    const robeDark = "#1e1b4b"; // Bleu nuit profond
    const robeMid = "#312e81";
    const robeLight = "#4338ca";
    const gold = "#fbbf24";
    const bone = "#e5e5e5";
    const magic = "#10b981"; // Vert nécrotique
    const magicCore = "#d1fae5";

    // Ombre flottante
    r(ctx, 8, 28, 16, 2, P.shadow);

    // ROBE (Drapé complexe)
    // Fond
    r(ctx, 8, 8, 16, 20, robeDark);

    // Plis verticaux (Volume)
    r(ctx, 10, 10, 2, 18, robeMid);
    r(ctx, 14, 10, 4, 18, robeDark); // Creux central
    r(ctx, 20, 10, 2, 18, robeMid);

    // Manches larges
    r(ctx, 4, 12, 6, 10, robeMid); // Manche G
    r(ctx, 22, 12, 6, 10, robeMid); // Manche D
    r(ctx, 6, 20, 4, 2, robeDark); // Intérieur manche vide
    r(ctx, 22, 20, 4, 2, robeDark);

    // Col / Épaules ornementées
    r(ctx, 8, 8, 16, 4, gold); // Col doré haut
    r(ctx, 9, 9, 14, 2, "#b45309"); // Détail or
    p(ctx, 16, 10, "#ef4444"); // Gemme centrale cou

    // TÊTE (Crâne détaillé)
    r(ctx, 13, 2, 6, 7, bone);
    r(ctx, 14, 4, 1, 2, "#000"); // Oeil G
    r(ctx, 17, 4, 1, 2, "#000"); // Oeil D
    p(ctx, 14, 4, magic); // Lueur oeil G
    p(ctx, 17, 4, magic); // Lueur oeil D
    r(ctx, 15, 6, 2, 1, "#000"); // Nez

    // COURONNE FLOTTANTE
    r(ctx, 12, -2, 8, 2, gold);
    p(ctx, 12, -3, gold);
    p(ctx, 19, -3, gold);
    p(ctx, 15, -4, gold);
    p(ctx, 15, -2, "#ef4444"); // Rubis couronne

    // MAINS SQUELETTIQUES & MAGIE
    // Main G
    r(ctx, 2, 18, 3, 3, bone);
    // Main D
    r(ctx, 27, 18, 3, 3, bone);

    // Orbes de pouvoir (Effet complexe)
    // Orbe G
    r(ctx, 0, 14, 6, 6, magic);
    r(ctx, 1, 15, 4, 4, magicCore);
    p(ctx, 2, 16, "#fff");
    // Orbe D
    r(ctx, 26, 14, 6, 6, magic);
    r(ctx, 27, 15, 4, 4, magicCore);
    p(ctx, 28, 16, "#fff");

    // CHAÎNES SPIRITUELLES (Autour du corps)
    p(ctx, 9, 20, "#94a3b8");
    p(ctx, 11, 22, "#94a3b8");
    p(ctx, 21, 18, "#94a3b8");
  }
}
