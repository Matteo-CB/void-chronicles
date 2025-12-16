import { P, r, p, DrawContext } from "../utils";

export function drawSorcerer(ctx: DrawContext) {
  r(ctx, 10, 12, 12, 18, "#6b21a8");
  r(ctx, 14, 12, 4, 18, "#a855f7");
  r(ctx, 12, 6, 8, 8, "#581c87");
  p(ctx, 14, 9, "#facc15");
  p(ctx, 17, 9, "#facc15");
  r(ctx, 24, 6, 2, 24, "#78350f");
  ctx.fillStyle = "#c084fc";
  ctx.beginPath();
  ctx.arc(25, 6, 4, 0, Math.PI * 2);
  ctx.fill();
}

export function drawNecromancer(ctx: DrawContext) {
  r(ctx, 10, 10, 12, 20, "#111827");
  r(ctx, 12, 10, 8, 20, "#1f2937");
  r(ctx, 12, 6, 8, 8, "#000");
  p(ctx, 13, 9, "#22c55e");
  p(ctx, 18, 9, "#22c55e");
  r(ctx, 24, 8, 2, 22, "#fff");
  p(ctx, 24, 6, "#22c55e");
}

export function drawSpellbook(ctx: DrawContext) {
  r(ctx, 8, 8, 16, 20, "#581c87");
  r(ctx, 10, 10, 12, 16, "#7e22ce");
  p(ctx, 16, 18, "#facc15");
}
