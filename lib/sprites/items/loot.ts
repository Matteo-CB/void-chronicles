import { P, r, p, DrawContext } from "../utils";

export function drawPotion(ctx: DrawContext) {
  r(ctx, 12, 16, 8, 12, "rgba(255,255,255,0.3)");
  r(ctx, 14, 12, 4, 4, "rgba(255,255,255,0.3)");
  r(ctx, 13, 20, 6, 7, P.blood);
  r(ctx, 13, 20, 6, 1, "#ef4444");
  p(ctx, 14, 22, "#fca5a5");
  p(ctx, 17, 25, "#fca5a5");
  r(ctx, 14, 22, 4, 3, P.bone);
  r(ctx, 14, 10, 4, 2, P.woodLight);
}

export function drawGold(ctx: DrawContext) {
  r(ctx, 8, 24, 4, 4, P.gold);
  p(ctx, 9, 25, P.goldLight);
  r(ctx, 14, 22, 6, 6, P.gold);
  p(ctx, 16, 23, "#fff");
  r(ctx, 20, 24, 4, 4, P.gold);
  r(ctx, 12, 26, 4, 4, P.goldShadow);
  r(ctx, 18, 26, 4, 4, P.goldShadow);
  p(ctx, 14, 18, "#fff");
  p(ctx, 14, 17, "#fff");
  p(ctx, 13, 18, "#fff");
  p(ctx, 15, 18, "#fff");
}

export function drawRelic(ctx: DrawContext) {
  r(ctx, 10, 10, 12, 12, P.gold);
  r(ctx, 12, 12, 8, 8, P.magic);
  p(ctx, 14, 14, "#fff");
  r(ctx, 14, 6, 4, 4, P.goldShadow);
  r(ctx, 15, 4, 2, 2, P.steelLight);
}

export function drawArmor(ctx: DrawContext) {
  r(ctx, 6, 6, 20, 20, P.steel);
  r(ctx, 8, 8, 16, 16, P.steelLight);
  r(ctx, 14, 10, 4, 12, P.gold);
  p(ctx, 15, 12, "#fff");
}
