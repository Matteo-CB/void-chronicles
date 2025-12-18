import { LevelTheme } from "@/types/game";
import { drawPlayer } from "./sprites/playerSprite";
import { drawMob } from "./sprites/mobs";
import { drawBoss } from "./sprites/bosses";
import { drawItem } from "./sprites/items";
import { drawDecor } from "./sprites/decor";

const spriteCache: Record<string, HTMLCanvasElement> = {};

function createCachedSprite(
  key: string,
  drawFn: (ctx: CanvasRenderingContext2D) => void
): HTMLCanvasElement {
  if (typeof document === "undefined") return null as any;
  if (spriteCache[key]) return spriteCache[key];
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);
  }
  spriteCache[key] = canvas;
  return canvas;
}

export function getSprite(
  type: string,
  variant: string = "idle",
  theme?: LevelTheme
): HTMLCanvasElement {
  // Sécurité : si type est undefined, fallback sur ROCK
  if (!type) type = "ROCK";

  const themeKey = theme ? theme.name : "default";
  const cacheKey = `${type}_${variant}_${themeKey}`;

  if (!spriteCache[cacheKey]) {
    return createCachedSprite(cacheKey, (ctx) => {
      // --- JOUEUR ---
      if (type === "PLAYER") {
        drawPlayer(ctx);
      }
      // --- ITEMS & LOOT (Correction ici : Logique plus permissive) ---
      else if (
        type.startsWith("WEAPON_") ||
        type.startsWith("ARMOR") ||
        type.startsWith("RELIC") || // Pour les accessoires
        type === "CHEST" ||
        type === "CHEST_OPEN" || // Ajout pour coffre ouvert
        type === "POTION" ||
        type === "GOLD" ||
        type === "SPELLBOOK" ||
        type === "SCROLL"
      ) {
        drawItem(ctx, type, variant);
      }
      // --- DECOR ---
      else if (
        [
          "WALL",
          "FLOOR",
          "ROCK",
          "RUBBLE",
          "PILLAR",
          "MUSHROOM",
          "HERB",
          "STAIRS",
          "FIREBALL",
          "BARREL",
          "CRATE", // Ajouté (utilisé dans generator)
          "BOOKSHELF", // Ajouté (utilisé dans generator)
          "CRACK",
          "VENT",
          "PIPE",
          "BONES",
        ].includes(type) ||
        type.startsWith("CRYSTAL")
      ) {
        drawDecor(ctx, type, theme);
      }
      // --- BOSS ---
      else if (
        ["GOLEM", "LAVA_GOLEM", "TITAN", "DRAGON", "LICH", "MERCHANT"].includes(
          type
        )
      ) {
        drawBoss(ctx, type);
      }
      // --- MOBS (Fallback par défaut) ---
      else {
        drawMob(ctx, type);
      }
    });
  }
  return spriteCache[cacheKey];
}

export function generateBackgroundSVG() {
  return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
      </filter>
      <radialGradient id="vignette" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.6"/>
      </radialGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="#050505"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <rect width="100%" height="100%" filter="url(#noise)"/>
    <rect width="100%" height="100%" fill="url(#vignette)"/>
  </svg>`;
}
