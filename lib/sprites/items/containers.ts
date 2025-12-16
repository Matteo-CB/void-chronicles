import { P, r, p, DrawContext } from "../utils";

export function drawChest(ctx: DrawContext, variant: string) {
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
}
