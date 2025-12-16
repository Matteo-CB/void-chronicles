import { P, r, p, DrawContext } from "../utils";
import { LocalPalette as C } from "../constants";

export function drawSlime(ctx: DrawContext) {
  r(ctx, 6, 26, 20, 4, P.shadow);
  r(ctx, 8, 20, 16, 10, "#22c55e");
  r(ctx, 10, 18, 12, 2, "#22c55e");
  r(ctx, 10, 22, 12, 6, "#4ade80");
  r(ctx, 12, 24, 8, 2, "#86efac");
  r(ctx, 10, 19, 2, 2, "#fff");
  r(ctx, 9, 21, 1, 3, "#fff");
  p(ctx, 21, 21, "#fff");
  p(ctx, 14, 26, "#fff");
  p(ctx, 15, 25, "#fff");
  p(ctx, 18, 27, P.gold);
}

export function drawGoblin(ctx: DrawContext) {
  r(ctx, 10, 26, 12, 2, P.shadow);
  r(ctx, 12, 14, 8, 8, "#65a30d");
  r(ctx, 8, 15, 4, 3, "#65a30d");
  p(ctx, 9, 16, "#3f6212");
  r(ctx, 20, 15, 4, 3, "#65a30d");
  p(ctx, 22, 16, "#3f6212");
  r(ctx, 12, 22, 8, 6, C.leather);
  r(ctx, 12, 22, 4, 3, C.leatherDark);
  r(ctx, 13, 23, 1, 1, "#000");
  p(ctx, 14, 16, "#facc15");
  p(ctx, 17, 16, "#facc15");
  r(ctx, 14, 20, 4, 1, "#000");
  p(ctx, 14, 21, "#fff");
  r(ctx, 21, 20, 2, 6, "#78716c");
  p(ctx, 22, 22, "#444");
}
