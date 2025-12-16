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
  const themeKey = theme ? theme.name : "default";
  const cacheKey = `${type}_${variant}_${themeKey}`;

  if (!spriteCache[cacheKey]) {
    return createCachedSprite(cacheKey, (ctx) => {
      if (type === "PLAYER") {
        drawPlayer(ctx);
      } else if (
        [
          "WEAPON_SWORD",
          "WEAPON_BOW",
          "WEAPON_STAFF",
          "WEAPON_PISTOL",
          "CHEST",
          "POTION",
          "GOLD",
          "RELIC", // Remplacement de l'Amulette
          "ARMOR",
        ].includes(type)
      ) {
        drawItem(ctx, type, variant);
      } else if (
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
          "CRACK", // AJOUTÉ : Correction bug affichage fissure
          "VENT", // AJOUTÉ : Correction bug affichage ventilation
          "PIPE", // AJOUTÉ : Correction bug affichage tuyaux
          "BONES", // AJOUTÉ : Correction bug affichage ossements
        ].includes(type) ||
        type.startsWith("CRYSTAL")
      ) {
        drawDecor(ctx, type, theme);
      } else if (
        ["GOLEM", "LAVA_GOLEM", "TITAN", "DRAGON", "LICH", "MERCHANT"].includes(
          type
        )
      ) {
        drawBoss(ctx, type);
      } else {
        drawMob(ctx, type);
      }
    });
  }
  return spriteCache[cacheKey];
}

export function generateBackgroundSVG() {
  return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3"/><feColorMatrix type="saturate" values="0"/></filter><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1c1917" stop-opacity="0.3"/><stop offset="100%" stop-color="#000"/></radialGradient></defs><rect width="100%" height="100%" fill="#0a0a0a"/><rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="transparent" opacity="0.1" filter="url(#n)"/></svg>`;
}
