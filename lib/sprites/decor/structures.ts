import { P, r, p, DrawContext } from "../utils";
import { LevelTheme } from "@/types/game";

export function drawStairs(ctx: DrawContext) {
  r(ctx, 0, 0, 32, 32, "#000");
  for (let i = 0; i < 6; i++) {
    r(ctx, 4 + i * 2, 4 + i * 4, 24 - i * 4, 4, "#52525b");
    r(ctx, 4 + i * 2, 4 + i * 4, 24 - i * 4, 1, "#71717a");
  }
}

export function drawWall(ctx: DrawContext, theme?: LevelTheme) {
  const wallC = theme ? theme.wallColor : "#52525b";
  const wallSideC = theme ? theme.wallSideColor : "#3f3f46";

  r(ctx, 0, 0, 32, 32, wallC);
  r(ctx, 0, 8, 32, 2, "#00000040");
  r(ctx, 0, 20, 32, 2, "#00000040");
  r(ctx, 10, 0, 2, 8, "#00000040");
  r(ctx, 22, 8, 2, 12, "#00000040");
  r(ctx, 6, 20, 2, 12, "#00000040");
  p(ctx, 2, 28, "#4ade80");
  p(ctx, 3, 29, "#4ade80");
  p(ctx, 28, 29, "#4ade80");
  r(ctx, 0, 30, 32, 2, wallSideC);
}

export function drawFloor(ctx: DrawContext, theme?: LevelTheme) {
  const floorC = theme ? theme.floorColor : "#27272a";

  r(ctx, 0, 0, 32, 32, floorC);
  r(ctx, 1, 1, 30, 30, "#ffffff05");
  r(ctx, 2, 2, 28, 28, floorC);
  for (let i = 0; i < 10; i++) {
    const rx = Math.random() * 32;
    const ry = Math.random() * 32;
    p(ctx, rx, ry, "#ffffff10");
  }
  p(ctx, 10, 10, "#00000040");
  p(ctx, 11, 11, "#00000040");
  p(ctx, 12, 10, "#00000040");
}
