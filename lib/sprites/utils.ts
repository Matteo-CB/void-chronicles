// Palette de couleurs globale
export const P = {
  void: "#09090b",
  shadow: "rgba(0,0,0,0.5)",
  highlight: "rgba(255,255,255,0.4)",
  shine: "rgba(255,255,255,0.8)",
  blood: "#7f1d1d",
  gold: "#fbbf24",
  goldShadow: "#b45309",
  goldLight: "#fde68a",
  silver: "#e4e4e7",
  steel: "#52525b",
  steelDark: "#27272a",
  steelLight: "#a1a1aa",
  wood: "#78350f",
  woodDark: "#451a03",
  woodLight: "#a16207",
  leather: "#92400e",
  leatherDark: "#713f12",
  bone: "#e5e5e5",
  boneShadow: "#a3a3a3",
  magic: "#a855f7",
  magicLight: "#d8b4fe",
  fire: "#f97316",
  fireCore: "#fff7ed",
  ice: "#06b6d4",
  iceLight: "#67e8f9",
  poison: "#84cc16",
  poisonDark: "#3f6212",
};

export type DrawContext = CanvasRenderingContext2D;

// Helper pour dessiner un rectangle
export const r = (
  ctx: DrawContext,
  x: number,
  y: number,
  w: number,
  h: number,
  c: string
) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
};

// Helper pour dessiner un pixel
export const p = (ctx: DrawContext, x: number, y: number, c: string) => {
  r(ctx, x, y, 1, 1, c);
};
