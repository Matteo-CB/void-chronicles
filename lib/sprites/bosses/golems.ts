import { P, r, p, DrawContext } from "../utils";
import { LocalPalette as C } from "../constants";

export function drawGolem(ctx: DrawContext) {
  r(ctx, 8, 8, 16, 16, C.stone);
  r(ctx, 10, 10, 12, 10, C.stoneLight);
  p(ctx, 11, 12, "#ef4444");
  p(ctx, 19, 12, "#ef4444");
  r(ctx, 6, 12, 4, 12, C.stoneDark);
  r(ctx, 22, 12, 4, 12, C.stoneDark);
  r(ctx, 10, 24, 5, 6, C.stoneDark);
  r(ctx, 17, 24, 5, 6, C.stoneDark);
}

export function drawLavaGolem(ctx: DrawContext) {
  r(ctx, 8, 8, 16, 16, "#7f1d1d");
  r(ctx, 10, 10, 12, 10, "#ef4444");
  r(ctx, 12, 12, 8, 6, "#f97316");
  p(ctx, 11, 12, "#fcd34d");
  p(ctx, 19, 12, "#fcd34d");
  r(ctx, 6, 12, 4, 12, "#991b1b");
  r(ctx, 22, 12, 4, 12, "#991b1b");
}
