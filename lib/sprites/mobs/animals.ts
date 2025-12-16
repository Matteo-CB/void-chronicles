import { P, r, p, DrawContext } from "../utils";

export function drawRat(ctx: DrawContext) {
  r(ctx, 8, 26, 16, 2, P.shadow);
  r(ctx, 8, 22, 16, 8, "#4a3832");
  p(ctx, 9, 23, "#5d4037");
  p(ctx, 11, 24, "#5d4037");
  p(ctx, 15, 23, "#5d4037");
  r(ctx, 20, 22, 8, 6, "#4a3832");
  r(ctx, 24, 26, 4, 2, "#f472b6");
  p(ctx, 25, 23, "#ef4444");
  p(ctx, 26, 23, "#fff");
  r(ctx, 19, 20, 3, 3, "#4a3832");
  p(ctx, 20, 21, "#f472b6");
  r(ctx, 2, 24, 2, 2, "#ec4899");
  r(ctx, 4, 25, 2, 2, "#db2777");
  r(ctx, 6, 24, 2, 2, "#ec4899");
  r(ctx, 10, 30, 3, 1, "#000");
  r(ctx, 18, 30, 3, 1, "#000");
}

export function drawBat(ctx: DrawContext) {
  r(ctx, 12, 28, 8, 2, P.shadow);
  r(ctx, 2, 10, 12, 10, "#3b0764");
  r(ctx, 20, 10, 12, 10, "#3b0764");
  r(ctx, 2, 10, 12, 1, "#581c87");
  r(ctx, 2, 10, 1, 8, "#581c87");
  r(ctx, 20, 10, 12, 1, "#581c87");
  r(ctx, 31, 10, 1, 8, "#581c87");
  r(ctx, 13, 14, 6, 8, "#1e1b4b");
  p(ctx, 14, 15, "#312e81");
  p(ctx, 17, 16, "#312e81");
  r(ctx, 12, 12, 8, 6, "#1e1b4b");
  r(ctx, 11, 10, 2, 3, "#1e1b4b");
  r(ctx, 19, 10, 2, 3, "#1e1b4b");
  p(ctx, 14, 14, "#facc15");
  p(ctx, 17, 14, "#facc15");
  p(ctx, 14, 18, "#fff");
  p(ctx, 17, 18, "#fff");
}
