import { P, r, p, DrawContext } from "../utils";

export function drawSword(ctx: DrawContext) {
  r(ctx, 13, 4, 6, 20, P.steelLight);
  r(ctx, 15, 4, 2, 20, "#fff");
  r(ctx, 13, 4, 1, 20, P.steel);
  r(ctx, 8, 24, 16, 2, P.gold);
  r(ctx, 9, 25, 14, 1, P.goldShadow);
  p(ctx, 16, 24, "#ef4444");
  p(ctx, 16, 25, "#7f1d1d");
  r(ctx, 14, 26, 4, 4, P.leatherDark);
  r(ctx, 13, 30, 6, 2, P.gold);
}

export function drawBow(ctx: DrawContext) {
  p(ctx, 8, 4, P.wood);
  p(ctx, 9, 5, P.wood);
  p(ctx, 10, 6, P.wood);
  p(ctx, 8, 28, P.wood);
  p(ctx, 9, 27, P.wood);
  p(ctx, 10, 26, P.wood);
  r(ctx, 11, 7, 2, 18, P.wood);
  r(ctx, 12, 7, 1, 18, P.woodLight);
  r(ctx, 10, 14, 4, 4, P.leather);
  r(ctx, 8, 4, 1, 24, "#fff");
}

export function drawStaff(ctx: DrawContext) {
  r(ctx, 14, 6, 4, 24, P.woodDark);
  r(ctx, 15, 6, 2, 24, P.wood);
  r(ctx, 10, 2, 12, 2, P.gold);
  r(ctx, 10, 2, 2, 6, P.gold);
  r(ctx, 20, 2, 2, 6, P.gold);
  r(ctx, 13, 0, 6, 6, P.magic);
  p(ctx, 14, 1, "#fff");
  p(ctx, 15, 2, P.magicLight);
  p(ctx, 15, 12, P.magic);
  p(ctx, 15, 18, P.magic);
  p(ctx, 15, 24, P.magic);
}

export function drawPistol(ctx: DrawContext) {
  r(ctx, 10, 10, 16, 6, P.steel);
  r(ctx, 10, 11, 14, 2, P.steelLight);
  r(ctx, 26, 10, 2, 6, "#000");
  r(ctx, 6, 10, 6, 8, P.steelDark);
  p(ctx, 7, 11, P.gold);
  r(ctx, 6, 8, 2, 2, P.steel);
  r(ctx, 6, 18, 6, 8, P.woodDark);
  r(ctx, 7, 19, 2, 6, P.wood);
  r(ctx, 12, 16, 1, 4, P.steel);
  r(ctx, 15, 16, 1, 4, P.steel);
  r(ctx, 12, 20, 4, 1, P.steel);
  p(ctx, 13, 17, P.steelDark);
}
