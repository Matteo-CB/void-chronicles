import { P, r, p, DrawContext } from "./utils";
import { LevelTheme } from "@/types/game";

export function drawDecor(ctx: DrawContext, type: string, theme?: LevelTheme) {
  const wallC = theme ? theme.wallColor : "#52525b";
  const floorC = theme ? theme.floorColor : "#27272a";
  const wallSideC = theme ? theme.wallSideColor : "#3f3f46";

  if (type === "STAIRS") {
    r(ctx, 0, 0, 32, 32, "#000");
    for (let i = 0; i < 6; i++) {
      r(ctx, 4 + i * 2, 4 + i * 4, 24 - i * 4, 4, "#52525b");
      r(ctx, 4 + i * 2, 4 + i * 4, 24 - i * 4, 1, "#71717a");
    }
  } else if (type === "WALL") {
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
  } else if (type === "FLOOR") {
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
  } else if (type === "ROCK" || type === "RUBBLE") {
    r(ctx, 6, 14, 20, 14, "#57534e");
    r(ctx, 10, 10, 12, 4, "#57534e");
    r(ctx, 10, 10, 4, 4, "#78716c");
    r(ctx, 14, 14, 4, 4, "#78716c");
    r(ctx, 20, 20, 4, 6, "#44403c");
    r(ctx, 8, 24, 6, 2, "#44403c");
  } else if (type === "PILLAR") {
    r(ctx, 8, 4, 16, 24, "#57534e");
    r(ctx, 6, 2, 20, 4, "#44403c");
    r(ctx, 7, 3, 18, 1, "#78716c");
    r(ctx, 6, 26, 20, 4, "#44403c");
    r(ctx, 8, 6, 4, 20, "#44403c");
    r(ctx, 20, 6, 4, 20, "#44403c");
    r(ctx, 12, 6, 8, 20, "#78716c");
    p(ctx, 14, 12, "#222");
    p(ctx, 15, 13, "#222");
    p(ctx, 15, 14, "#222");
  } else if (type === "MUSHROOM") {
    r(ctx, 14, 20, 4, 8, "#f5f5f4");
    r(ctx, 14, 20, 1, 8, "#d6d3d1");
    r(ctx, 10, 14, 12, 8, "#9333ea");
    r(ctx, 8, 16, 16, 4, "#7e22ce");
    r(ctx, 12, 15, 2, 2, "#e9d5ff");
    r(ctx, 18, 17, 2, 2, "#e9d5ff");
    r(ctx, 15, 14, 1, 1, "#e9d5ff");
    p(ctx, 12, 10, "#d8b4fe");
    p(ctx, 18, 12, "#d8b4fe");
  } else if (type === "HERB") {
    r(ctx, 14, 20, 2, 8, "#22c55e");
    r(ctx, 16, 18, 2, 10, "#22c55e");
    r(ctx, 12, 22, 2, 6, "#22c55e");
    r(ctx, 15, 16, 4, 4, "#e879f9");
    p(ctx, 16, 17, "#fdf4ff");
  } else if (
    type === "CRYSTAL_RED" ||
    type === "CRYSTAL_PURPLE" ||
    type === "CRYSTAL_BLUE"
  ) {
    const c =
      type === "CRYSTAL_RED"
        ? P.blood
        : type === "CRYSTAL_PURPLE"
        ? P.magic
        : P.ice;
    const light =
      type === "CRYSTAL_RED"
        ? "#fca5a5"
        : type === "CRYSTAL_PURPLE"
        ? P.magicLight
        : P.iceLight;
    r(ctx, 12, 14, 8, 14, c);
    r(ctx, 8, 20, 4, 8, c);
    r(ctx, 20, 18, 4, 10, c);
    r(ctx, 14, 8, 4, 6, c);
    r(ctx, 14, 10, 2, 14, light);
    r(ctx, 13, 12, 1, 4, "#fff");
    r(ctx, 6, 28, 20, 2, c + "40");
  } else if (type === "FIREBALL") {
    r(ctx, 14, 14, 4, 4, "#fff");
    r(ctx, 12, 12, 8, 8, "#fef08a");
    r(ctx, 10, 10, 12, 12, "#f97316");
    p(ctx, 8, 14, "#dc2626");
    p(ctx, 24, 16, "#dc2626");
    p(ctx, 16, 8, "#dc2626");
    p(ctx, 16, 24, "#dc2626");
    p(ctx, 6, 6, "#fbbf24");
    p(ctx, 26, 26, "#fbbf24");
  }
}
