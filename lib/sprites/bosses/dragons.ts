import { P, r, p, DrawContext } from "../utils";
import { LocalPalette as C } from "../constants";

export function drawDragon(ctx: DrawContext) {
  r(ctx, 12, 6, 8, 10, "#b91c1c");
  r(ctx, 10, 16, 12, 12, "#991b1b");
  r(ctx, 2, 10, 10, 8, "#7f1d1d");
  r(ctx, 20, 10, 10, 8, "#7f1d1d");
  p(ctx, 13, 8, "#facc15");
  p(ctx, 17, 8, "#facc15");
  r(ctx, 14, 20, 4, 8, "#fcd34d");
}

export function drawLich(ctx: DrawContext) {
  r(ctx, 12, 6, 8, 10, C.bone);
  r(ctx, 10, 16, 12, 14, "#312e81");
  p(ctx, 13, 9, "#22d3ee");
  p(ctx, 17, 9, "#22d3ee");
  r(ctx, 6, 14, 4, 12, C.bone);
  r(ctx, 22, 14, 4, 12, C.bone);
  r(ctx, 24, 8, 2, 20, "#9ca3af");
  p(ctx, 24, 6, "#22d3ee");
}
