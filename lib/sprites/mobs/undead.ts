import { P, r, p, DrawContext } from "../utils";
import { LocalPalette as C } from "../constants";

export function drawSkeleton(ctx: DrawContext) {
  r(ctx, 10, 26, 12, 2, P.shadow);
  r(ctx, 14, 16, 4, 10, C.bone);
  r(ctx, 15, 16, 2, 10, "#d4d4d4");
  r(ctx, 12, 17, 8, 1, C.bone);
  r(ctx, 12, 19, 8, 1, C.bone);
  r(ctx, 12, 21, 8, 1, C.bone);
  r(ctx, 12, 6, 8, 8, C.bone);
  r(ctx, 13, 9, 2, 2, "#171717");
  r(ctx, 17, 9, 2, 2, "#171717");
  r(ctx, 15, 12, 2, 1, "#171717");
  r(ctx, 12, 24, 8, 3, C.bone);
  r(ctx, 12, 27, 2, 5, C.bone);
  r(ctx, 18, 27, 2, 5, C.bone);
}

export function drawDarkKnight(ctx: DrawContext) {
  r(ctx, 8, 6, 16, 24, "#18181b");
  r(ctx, 10, 8, 12, 12, "#27272a");
  p(ctx, 13, 9, "#ef4444");
  p(ctx, 18, 9, "#ef4444");
  r(ctx, 24, 4, 4, 24, "#52525b");
  r(ctx, 26, 4, 1, 24, "#ef4444");
}
