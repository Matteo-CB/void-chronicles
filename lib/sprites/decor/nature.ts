import { P, r, p, DrawContext } from "../utils";

export function drawRock(ctx: DrawContext) {
  r(ctx, 6, 14, 20, 14, "#57534e");
  r(ctx, 10, 10, 12, 4, "#57534e");
  r(ctx, 10, 10, 4, 4, "#78716c");
  r(ctx, 14, 14, 4, 4, "#78716c");
  r(ctx, 20, 20, 4, 6, "#44403c");
  r(ctx, 8, 24, 6, 2, "#44403c");
}

export function drawRubble(ctx: DrawContext) {
  r(ctx, 6, 20, 20, 8, "#44403c");
  r(ctx, 10, 16, 12, 6, "#57534e");
  r(ctx, 4, 24, 6, 4, "#292524");
  r(ctx, 22, 22, 6, 6, "#292524");
  p(ctx, 12, 18, "#78716c");
  p(ctx, 18, 22, "#78716c");
}

export function drawMushroom(ctx: DrawContext) {
  r(ctx, 14, 20, 4, 8, "#f5f5f4");
  r(ctx, 14, 20, 1, 8, "#d6d3d1");
  r(ctx, 10, 14, 12, 8, "#9333ea");
  r(ctx, 8, 16, 16, 4, "#7e22ce");
  r(ctx, 12, 15, 2, 2, "#e9d5ff");
  r(ctx, 18, 17, 2, 2, "#e9d5ff");
  r(ctx, 15, 14, 1, 1, "#e9d5ff");
  p(ctx, 12, 10, "#d8b4fe");
  p(ctx, 18, 12, "#d8b4fe");
}

export function drawHerb(ctx: DrawContext) {
  r(ctx, 14, 20, 2, 8, "#22c55e");
  r(ctx, 16, 18, 2, 10, "#22c55e");
  r(ctx, 12, 22, 2, 6, "#22c55e");
  r(ctx, 15, 16, 4, 4, "#e879f9");
  p(ctx, 16, 17, "#fdf4ff");
}
