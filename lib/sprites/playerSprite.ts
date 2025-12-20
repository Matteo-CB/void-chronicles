import { P, Dark, r, p, DrawContext } from "./utils";

export function drawPlayer(ctx: DrawContext) {
  r(ctx, 6, 30, 20, 2, P.shadow);

  r(ctx, 10, 2, 12, 10, Dark.cloakDark);
  r(ctx, 11, 3, 10, 8, Dark.cloak);
  r(ctx, 12, 4, 8, 5, Dark.cloakLight);
  p(ctx, 11, 2, Dark.cloakLight);
  p(ctx, 20, 2, Dark.cloakLight);
  r(ctx, 10, 10, 12, 2, Dark.cloakDark);

  r(ctx, 13, 6, 6, 5, P.void);
  p(ctx, 14, 8, Dark.glow);
  p(ctx, 17, 8, Dark.glow);
  p(ctx, 13, 8, Dark.glowSoft);
  p(ctx, 18, 8, Dark.glowSoft);
  p(ctx, 15, 9, Dark.glowSoft);
  p(ctx, 16, 9, Dark.glowSoft);

  r(ctx, 8, 12, 16, 17, Dark.cloakDark);
  r(ctx, 9, 13, 14, 15, Dark.cloak);
  r(ctx, 15, 12, 2, 16, P.void);
  r(ctx, 9, 13, 1, 14, Dark.cloakLight);
  r(ctx, 22, 13, 1, 14, Dark.cloakLight);

  r(ctx, 12, 14, 1, 8, Dark.cloakDark);
  r(ctx, 19, 14, 1, 8, Dark.cloakDark);
  p(ctx, 10, 27, Dark.cloakDark);
  p(ctx, 14, 28, Dark.cloakDark);
  p(ctx, 17, 28, Dark.cloakDark);
  p(ctx, 21, 27, Dark.cloakDark);

  r(ctx, 10, 21, 12, 3, Dark.leatherDark);
  r(ctx, 11, 22, 10, 1, Dark.leather);
  r(ctx, 15, 21, 2, 3, P.gold);
  p(ctx, 15, 22, Dark.glow);
  p(ctx, 16, 21, P.goldLight);

  r(ctx, 5, 14, 4, 9, Dark.cloakDark);
  r(ctx, 23, 14, 4, 9, Dark.cloakDark);
  r(ctx, 6, 15, 2, 7, Dark.cloak);
  r(ctx, 24, 15, 2, 7, Dark.cloak);
  r(ctx, 5, 22, 4, 3, Dark.leatherDark);
  r(ctx, 23, 22, 4, 3, Dark.leatherDark);
  p(ctx, 6, 23, Dark.leather);
  p(ctx, 25, 23, Dark.leather);

  r(ctx, 11, 24, 4, 6, Dark.leatherDark);
  r(ctx, 17, 24, 4, 6, Dark.leatherDark);
  r(ctx, 10, 29, 5, 2, Dark.metalDark);
  r(ctx, 17, 29, 5, 2, Dark.metalDark);
  r(ctx, 10, 29, 2, 1, Dark.metalLight);
  r(ctx, 17, 29, 2, 1, Dark.metalLight);
}

export function drawPlayerPortrait(ctx: DrawContext) {
  r(ctx, 15, 95, 90, 5, P.shadow);

  r(ctx, 25, 2, 70, 42, Dark.cloakDark);
  r(ctx, 30, 6, 60, 34, Dark.cloak);
  r(ctx, 40, 10, 40, 24, Dark.cloakLight);

  r(ctx, 45, 18, 30, 22, P.void);
  r(ctx, 50, 28, 6, 4, Dark.glow);
  r(ctx, 64, 28, 6, 4, Dark.glow);
  r(ctx, 45, 26, 30, 8, Dark.glowSoft);
  r(ctx, 48, 24, 4, 2, Dark.glowSoft);
  r(ctx, 68, 24, 4, 2, Dark.glowSoft);

  r(ctx, 22, 38, 76, 62, Dark.cloakDark);
  r(ctx, 28, 42, 64, 54, Dark.cloak);

  for (let i = 0; i < 64; i += 6) {
    r(ctx, 28 + i, 42, 2, 54, Dark.cloakDark);
    r(ctx, 29 + i, 42, 1, 54, P.shadow);
  }

  r(ctx, 56, 38, 8, 62, P.void);
  r(ctx, 58, 38, 1, 62, Dark.glowSoft);
  r(ctx, 61, 38, 1, 62, Dark.cloakLight);

  r(ctx, 38, 72, 44, 10, Dark.leatherDark);
  r(ctx, 40, 74, 40, 6, Dark.leather);
  r(ctx, 54, 70, 12, 14, P.goldShadow);
  r(ctx, 55, 71, 10, 12, P.gold);
  r(ctx, 58, 74, 4, 6, P.void);
  r(ctx, 58, 74, 4, 4, Dark.glow);
  p(ctx, 56, 72, P.goldLight);

  r(ctx, 5, 42, 22, 50, Dark.cloakDark);
  r(ctx, 93, 42, 22, 50, Dark.cloakDark);
  r(ctx, 8, 45, 16, 42, Dark.cloak);
  r(ctx, 96, 45, 16, 42, Dark.cloak);
  r(ctx, 5, 42, 2, 45, Dark.cloakLight);
  r(ctx, 113, 42, 2, 45, Dark.cloakLight);

  r(ctx, 5, 88, 22, 12, Dark.leatherDark);
  r(ctx, 93, 88, 22, 12, Dark.leatherDark);
  r(ctx, 5, 88, 22, 2, Dark.metal);
  r(ctx, 93, 88, 22, 2, Dark.metal);

  r(ctx, 22, 38, 2, 62, Dark.cloakLight);
  r(ctx, 96, 38, 2, 62, Dark.cloakLight);

  for (let x = 30; x < 90; x += 4) {
    p(ctx, x, 98, Dark.cloakDark);
    p(ctx, x + 2, 99, P.shadow);
  }
}
