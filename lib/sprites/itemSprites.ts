import { P, r, p, DrawContext } from "./utils";

export function drawItem(ctx: DrawContext, type: string, variant: string) {
  if (type === "WEAPON_SWORD") {
    r(ctx, 13, 4, 6, 20, P.steelLight);
    r(ctx, 15, 4, 2, 20, "#fff");
    r(ctx, 13, 4, 1, 20, P.steel);
    r(ctx, 8, 24, 16, 2, P.gold);
    r(ctx, 9, 25, 14, 1, P.goldShadow);
    p(ctx, 16, 24, "#ef4444");
    p(ctx, 16, 25, "#7f1d1d");
    r(ctx, 14, 26, 4, 4, P.leatherDark);
    r(ctx, 13, 30, 6, 2, P.gold);
  } else if (type === "WEAPON_BOW") {
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
  } else if (type === "WEAPON_STAFF") {
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
  } else if (type === "WEAPON_PISTOL") {
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
  } else if (type === "CHEST") {
    const wood = P.wood;
    const band = P.gold;
    r(ctx, 2, 12, 28, 16, wood);
    r(ctx, 2, 16, 28, 1, P.woodDark);
    r(ctx, 2, 21, 28, 1, P.woodDark);
    r(ctx, 2, 26, 28, 1, P.woodDark);
    r(ctx, 2, 12, 4, 16, band);
    r(ctx, 26, 12, 4, 16, band);
    p(ctx, 3, 13, "#fff");
    p(ctx, 27, 13, "#fff");
    r(ctx, 2, 8, 28, 4, P.woodLight);
    r(ctx, 13, 16, 6, 8, P.steelDark);
    r(ctx, 14, 18, 4, 4, "#000");
    if (variant === "open") {
      r(ctx, 2, 6, 28, 6, P.woodDark);
      r(ctx, 4, 12, 24, 4, P.gold);
      p(ctx, 6, 13, "#fff");
      p(ctx, 20, 13, "#fff");
    }
  } else if (type === "POTION") {
    r(ctx, 12, 16, 8, 12, "rgba(255,255,255,0.3)");
    r(ctx, 14, 12, 4, 4, "rgba(255,255,255,0.3)");
    r(ctx, 13, 20, 6, 7, P.blood);
    r(ctx, 13, 20, 6, 1, "#ef4444");
    p(ctx, 14, 22, "#fca5a5");
    p(ctx, 17, 25, "#fca5a5");
    r(ctx, 14, 22, 4, 3, P.bone);
    r(ctx, 14, 10, 4, 2, P.woodLight);
  } else if (type === "GOLD") {
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
}
