import { P, r, p, DrawContext } from "../utils";

export function drawPillar(ctx: DrawContext) {
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
}

export function drawCrystal(ctx: DrawContext, type: string) {
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
}

export function drawFireball(ctx: DrawContext) {
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

export function drawBarrel(ctx: DrawContext) {
  r(ctx, 6, 12, 20, 16, "#78350f");
  r(ctx, 6, 14, 20, 2, "#000");
  r(ctx, 6, 24, 20, 2, "#000");
  r(ctx, 8, 12, 16, 16, "rgba(0,0,0,0.1)");
  r(ctx, 14, 18, 4, 4, "#ef4444");
  p(ctx, 15, 19, "#fff");
}

// --- NOUVEAUX DESSINS DÉTAILLÉS ---

export function drawCrack(ctx: DrawContext) {
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(8, 8);
  ctx.lineTo(14, 14);
  ctx.lineTo(12, 20);
  ctx.lineTo(20, 26);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#404040";
  ctx.beginPath();
  ctx.moveTo(14, 14);
  ctx.lineTo(22, 12);
  ctx.stroke();
}

export function drawVent(ctx: DrawContext) {
  r(ctx, 2, 2, 28, 28, "#262626");
  r(ctx, 0, 0, 32, 2, "#525252");
  r(ctx, 0, 0, 2, 32, "#525252");
  r(ctx, 30, 0, 2, 32, "#525252");
  r(ctx, 0, 30, 32, 2, "#525252");

  for (let i = 0; i < 6; i++) {
    r(ctx, 4, 6 + i * 4, 24, 2, "#737373");
    r(ctx, 4, 8 + i * 4, 24, 1, "#000");
  }
}

export function drawPipe(ctx: DrawContext) {
  r(ctx, 2, 16, 28, 10, "rgba(0,0,0,0.3)");
  r(ctx, 0, 10, 32, 8, "#404040");
  r(ctx, 0, 12, 32, 4, "#525252");
  r(ctx, 0, 13, 32, 1, "#a3a3a3");
  r(ctx, 6, 8, 4, 12, "#262626");
  r(ctx, 22, 8, 4, 12, "#262626");
}

export function drawBones(ctx: DrawContext) {
  r(ctx, 14, 16, 6, 5, "#e5e5e5");
  p(ctx, 15, 18, "#000");
  p(ctx, 18, 18, "#000");

  ctx.strokeStyle = "#e5e5e5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 22);
  ctx.lineTo(22, 22);
  ctx.stroke();

  p(ctx, 8, 24, "#e5e5e5");
  p(ctx, 24, 20, "#e5e5e5");
}
