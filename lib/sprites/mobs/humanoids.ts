import { P, r, p, DrawContext } from "../utils";

export function drawArcher(ctx: DrawContext) {
  r(ctx, 14, 6, 4, 4, "#e4e4e7");
  r(ctx, 12, 10, 8, 14, "#713f12");
  ctx.strokeStyle = "#a16207";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(22, 16, 8, Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();
  r(ctx, 22, 16, 8, 1, "#fff");
}

export function drawMerchantMob(ctx: DrawContext) {
  r(ctx, 4, 10, 24, 20, "#5D4037");
  r(ctx, 5, 8, 22, 4, "#795548");
  r(ctx, 6, 12, 20, 16, "#4E342E");
  r(ctx, 22, 6, 3, 8, "#A855F7");
  r(ctx, 20, 5, 4, 4, "#FCD34D");
  r(ctx, 6, 6, 5, 5, "#EF4444");
  r(ctx, 8, 4, 3, 6, "#22C55E");
  r(ctx, 10, 14, 12, 18, "#312E81");
  r(ctx, 12, 14, 8, 18, "#4338CA");
  r(ctx, 10, 14, 12, 4, "#F59E0B");
  r(ctx, 11, 8, 10, 8, "#1E1B4B");
  r(ctx, 13, 10, 6, 5, "#000");
  p(ctx, 14, 12, "#FCD34D");
  p(ctx, 17, 12, "#FCD34D");
  r(ctx, 8, 16, 3, 10, "#312E81");
  r(ctx, 21, 16, 3, 10, "#312E81");
  r(ctx, 8, 24, 3, 3, "#78350F");
  r(ctx, 21, 24, 3, 3, "#78350F");
  r(ctx, 26, 16, 4, 6, "#1f2937");
  r(ctx, 27, 17, 2, 4, "#FDE047");
}
