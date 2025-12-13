import { P, r, p, DrawContext } from "./utils";

export function drawPlayer(ctx: DrawContext) {
  // Ombre portée
  r(ctx, 6, 29, 20, 2, P.shadow);

  // Cape (Rouge Impérial avec ombres et lumières)
  r(ctx, 8, 12, 16, 18, "#450a0a"); // Fond sombre
  r(ctx, 10, 12, 4, 18, "#7f1d1d"); // Pli gauche
  r(ctx, 18, 12, 4, 18, "#7f1d1d"); // Pli droit
  r(ctx, 14, 12, 4, 16, "#991b1b"); // Pli central lumière
  r(ctx, 8, 28, 16, 2, "#450a0a"); // Bas usé

  // Jambes (Grèves articulées)
  r(ctx, 10, 22, 5, 8, P.steelDark); // G
  r(ctx, 17, 22, 5, 8, P.steelDark); // D
  r(ctx, 11, 23, 3, 6, P.steel); // Plaque
  r(ctx, 18, 23, 3, 6, P.steel);
  p(ctx, 12, 24, P.steelLight);
  p(ctx, 19, 24, P.steelLight); // Reflet genou
  r(ctx, 10, 30, 5, 2, "#18181b"); // Solerets noirs

  // Tassettes (Protection hanches)
  r(ctx, 9, 20, 14, 3, P.steel);
  r(ctx, 9, 20, 14, 1, P.steelLight); // Bord haut

  // Plastron (Détails orfèvrerie)
  r(ctx, 8, 10, 16, 11, P.steelDark); // Base
  r(ctx, 10, 11, 12, 8, P.steel); // Plaque ventrale
  r(ctx, 11, 12, 10, 4, P.steelLight); // Bombé poitrine

  // Croix dorée sur le torse
  r(ctx, 14, 11, 4, 8, P.goldShadow);
  r(ctx, 15, 11, 2, 8, P.gold);
  r(ctx, 12, 13, 8, 2, P.gold);
  p(ctx, 15, 13, P.goldLight); // Éclat central

  // Epaulières (Massives à étages)
  r(ctx, 4, 9, 7, 7, P.steelDark);
  r(ctx, 21, 9, 7, 7, P.steelDark);
  r(ctx, 5, 10, 5, 5, P.steel);
  r(ctx, 22, 10, 5, 5, P.steel);
  r(ctx, 6, 10, 3, 2, P.steelLight); // Reflet haut
  r(ctx, 23, 10, 3, 2, P.steelLight);
  p(ctx, 5, 14, P.gold);
  p(ctx, 26, 14, P.gold); // Rivets dorés

  // Bras (Gantelets)
  r(ctx, 5, 16, 5, 8, P.steelDark);
  r(ctx, 22, 16, 5, 8, P.steelDark);
  r(ctx, 6, 17, 3, 4, P.steel);
  r(ctx, 23, 17, 3, 4, P.steel);
  r(ctx, 5, 22, 5, 3, "#27272a"); // Gants cuir

  // Casque (Salade à visière mobile)
  r(ctx, 10, 2, 12, 9, P.steelDark); // Fond
  r(ctx, 11, 2, 10, 8, P.steel); // Casque
  r(ctx, 12, 2, 8, 2, P.steelLight); // Haut brillant
  r(ctx, 11, 6, 10, 4, "#000"); // Fente visière fond
  r(ctx, 16, 6, 1, 4, "#333"); // Séparation yeux
  r(ctx, 12, 9, 8, 2, P.steel); // Mentonnière
  p(ctx, 13, 10, P.steelLight); // Reflet menton

  // Cimier (Plumes détaillées)
  r(ctx, 14, 0, 4, 3, "#991b1b");
  p(ctx, 15, 1, "#ef4444");
  p(ctx, 16, 1, "#ef4444");
  p(ctx, 13, 1, "#7f1d1d");
  p(ctx, 18, 1, "#7f1d1d");
}
