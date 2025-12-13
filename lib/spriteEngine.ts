import { LevelTheme } from "@/types/game";

const P = {
  void: "#000000",
  floorBase: "#2d2d30",
  floorDetail: "#3f3f46",
  wallTop: "#78716c",
  wallSide: "#44403c",
  heroSkin: "#ffedd5",
  heroArmor: "#38bdf8",
  heroGold: "#fbbf24",
  heroCape: "#ef4444",
  chest: "#b45309",
  chestGold: "#fcd34d",
  chestDark: "#451a03",
  potion: "#f43f5e",
  gold: "#fbbf24",
  stairs: "#a8a29e",
  shadow: "rgba(0,0,0,0.5)",
  rat: "#a1a1aa",
  ratEye: "#dc2626",
  slime: "#84cc16",
  slimeHigh: "#d9f99d",
  bat: "#4c1d95",
  batWing: "#2e1065",
  goblin: "#15803d",
  goblinArmor: "#78350f",
  spider: "#18181b",
  spiderEye: "#ef4444",
  bandit: "#9a3412",
  banditSkin: "#fdba74",
  wolf: "#52525b",
  orc: "#3f6212",
  orcArmor: "#525252",
  ghost: "rgba(147, 197, 253, 0.6)",
  wisp: "#f97316",
  wispCore: "#fff",
  sorcerer: "#4c1d95",
  sorcererTrim: "#fbbf24",
  golem: "#57534e",
  golemCore: "#0ea5e9",
  lavaGolem: "#7f1d1d",
  lavaCore: "#f59e0b",
  eye: "#7e22ce",
  eyeCenter: "#facc15",
  knight: "#171717",
  knightGlow: "#ef4444",
  troll: "#064e3b",
  trollSkin: "#4ade80",
  dragon: "#7f1d1d",
  dragonScale: "#ef4444",
  dragonFire: "#f59e0b",
  enemyBone: "#e5e5e5",
  enemyDark: "#525252",
  merchant: "#059669",
  merchantTurban: "#f59e0b",
  merchantSkin: "#854d0e",
  magicFire: "#f97316",
};

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
      const r = (x: number, y: number, w: number, h: number, c: string) => {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, w, h);
      };
      const floorC = theme ? theme.floorColor : P.floorBase;
      const wallC = theme ? theme.wallColor : P.wallTop;
      const wallSideC = theme ? theme.wallSideColor : P.wallSide;

      // --- DECOR ---
      if (type === "ROCK" || type === "RUBBLE") {
        r(4, 16, 24, 12, "#57534e");
        r(8, 12, 16, 4, "#78716c");
        r(6, 20, 4, 4, "#44403c");
        r(20, 18, 6, 6, "#44403c");
      } else if (type === "PILLAR") {
        r(10, 10, 12, 22, "#57534e");
        r(8, 8, 16, 4, "#78716c");
        r(8, 28, 16, 4, "#78716c");
      } else if (type === "HERB") {
        r(10, 20, 2, 8, "#4ade80");
        r(14, 16, 2, 12, "#4ade80");
        r(18, 22, 2, 6, "#4ade80");
      } else if (type === "MUSHROOM") {
        r(12, 20, 8, 8, "#d6d3d1");
        r(8, 14, 16, 8, "#a855f7");
        r(10, 15, 2, 2, "#fff");
        r(18, 16, 3, 3, "#fff");
      } else if (
        type === "CRYSTAL_RED" ||
        type === "CRYSTAL_PURPLE" ||
        type === "CRYSTAL_BLUE"
      ) {
        const c =
          type === "CRYSTAL_RED"
            ? "#ef4444"
            : type === "CRYSTAL_PURPLE"
            ? "#a855f7"
            : "#0ea5e9";
        r(14, 14, 4, 14, c);
        r(12, 18, 8, 6, c);
        r(15, 16, 2, 8, "#fff");
      }

      // --- PLAYER ---
      else if (type === "PLAYER") {
        r(6, 26, 20, 4, P.shadow);
        r(8, 12, 16, 16, P.heroCape);
        r(10, 22, 4, 8, "#1e293b");
        r(18, 22, 4, 8, "#1e293b");
        r(8, 14, 16, 10, "#0369a1");
        r(10, 16, 12, 6, P.heroArmor);
        r(10, 6, 12, 10, P.heroSkin);
        r(9, 4, 14, 4, P.heroGold);
        r(12, 10, 2, 2, "#000");
        r(18, 10, 2, 2, "#000");
        if (variant === "move") {
          r(24, 8, 4, 20, "#e2e8f0");
          r(22, 24, 8, 4, P.heroGold);
        }
      }

      // --- ENEMIES ---
      else if (type === "RAT") {
        r(10, 24, 14, 4, P.shadow);
        r(8, 20, 16, 8, P.rat);
        r(6, 22, 4, 4, "#f472b6");
        r(24, 20, 4, 2, "#f472b6");
        r(10, 21, 2, 2, P.ratEye);
      } else if (type === "BAT") {
        r(12, 28, 8, 2, P.shadow);
        r(14, 12, 4, 6, P.bat);
        r(4, 8, 10, 8, P.batWing);
        r(18, 8, 10, 8, P.batWing);
      } else if (type === "SLIME") {
        r(8, 26, 16, 4, P.shadow);
        r(8, 20, 16, 10, P.slime);
        r(10, 16, 12, 6, P.slime);
        r(12, 18, 2, 2, P.slimeHigh);
        r(20, 19, 2, 2, P.slimeHigh);
      } else if (type === "WOLF" || type === "ALPHA_WOLF") {
        const c = type === "ALPHA_WOLF" ? "#3f3f46" : P.wolf;
        const s = type === "ALPHA_WOLF" ? 2 : 0;
        r(6 - s, 16 - s, 18 + s * 2, 10 + s, c);
        r(24 + s, 18, 4, 4, c); // Queue
        r(4 - s, 18, 4, 6, c); // Jambe
        r(6 - s, 12 - s, 8 + s, 8 + s, c); // Tête
        r(8 - s, 14 - s, 2, 2, "#f00"); // Oeil
      } else if (type === "GOBLIN") {
        r(10, 26, 12, 3, P.shadow);
        r(12, 16, 8, 10, P.goblinArmor);
        r(10, 12, 12, 6, P.goblin);
        r(8, 10, 2, 4, P.goblin); // Oreille G
        r(22, 10, 2, 4, P.goblin); // Oreille D
      } else if (type === "BANDIT" || type === "SNIPER") {
        r(8, 26, 16, 3, P.shadow);
        r(10, 14, 12, 12, P.bandit);
        r(12, 6, 8, 8, P.banditSkin);
        r(12, 8, 8, 3, "#333"); // Masque
        if (type === "SNIPER") r(13, 7, 6, 2, "#f00"); // Lunettes
      } else if (type === "BANDIT_KING") {
        r(8, 26, 16, 3, P.shadow);
        r(10, 14, 12, 12, "#7f1d1d"); // Rouge sombre
        r(12, 6, 8, 8, P.banditSkin);
        r(10, 4, 12, 4, P.gold); // Couronne
      } else if (type === "SKELETON" || type === "ARCHER") {
        r(8, 26, 16, 3, P.shadow);
        r(14, 16, 4, 10, P.enemyBone);
        r(10, 18, 12, 2, P.enemyBone);
        r(10, 6, 12, 10, P.enemyBone);
        r(12, 9, 3, 3, "#7f1d1d");
        r(17, 9, 3, 3, "#7f1d1d");
      } else if (type === "ORC") {
        r(6, 26, 20, 4, P.shadow);
        r(8, 14, 16, 12, P.orcArmor);
        r(10, 6, 12, 10, P.orc);
        r(11, 8, 2, 2, "#fff"); // Dent
        r(19, 8, 2, 2, "#fff"); // Dent
      } else if (type === "GOLEM") {
        r(6, 24, 20, 6, P.shadow);
        r(8, 12, 16, 14, P.golem);
        r(6, 14, 4, 10, P.golem);
        r(22, 14, 4, 10, P.golem);
        r(14, 10, 4, 2, P.golemCore);
      } else if (type === "LAVA_GOLEM" || type === "TITAN") {
        const c = type === "TITAN" ? "#4a0404" : P.lavaGolem;
        const core = type === "TITAN" ? "#ff0000" : P.lavaCore;
        r(6, 24, 20, 6, P.shadow);
        r(8, 12, 16, 14, c);
        r(6, 14, 4, 10, c);
        r(22, 14, 4, 10, c);
        r(14, 10, 4, 2, core);
      } else if (
        type === "SORCERER" ||
        type === "MAGE" ||
        type === "ANCIENT_WIZARD"
      ) {
        const robe = type === "ANCIENT_WIZARD" ? "#fff" : P.sorcerer;
        r(8, 26, 16, 3, P.shadow);
        r(8, 12, 16, 16, robe);
        r(10, 6, 12, 10, robe);
        r(10, 6, 12, 2, P.sorcererTrim);
      } else if (type === "KNIGHT" || type === "DARK_KNIGHT") {
        const armor = type === "DARK_KNIGHT" ? "#0f0f0f" : P.knight;
        const eye = type === "DARK_KNIGHT" ? "#f00" : P.knightGlow;
        r(8, 26, 16, 3, P.shadow);
        r(10, 14, 12, 12, armor);
        r(10, 6, 12, 8, armor);
        r(11, 8, 2, 2, eye);
        r(19, 8, 2, 2, eye);
      } else if (type === "DRAGON") {
        r(2, 24, 28, 6, P.shadow);
        r(6, 16, 20, 10, P.dragon);
        r(2, 6, 8, 12, P.dragonScale);
        r(22, 6, 8, 12, P.dragonScale);
        r(12, 12, 8, 8, P.dragon); // Tete
        r(14, 14, 2, 2, "#ff0"); // Oeil
      } else if (type === "GHOST" || type === "LICH") {
        const c = type === "LICH" ? "#a855f7" : P.ghost;
        r(8, 26, 16, 3, P.shadow);
        r(8, 10, 16, 16, c);
        r(10, 8, 12, 10, c);
        r(12, 12, 3, 3, "#000"); // Oeil
        r(17, 12, 3, 3, "#000"); // Oeil
      } else if (type === "SPIDER") {
        r(6, 24, 20, 4, P.shadow);
        r(10, 14, 12, 8, P.spider);
        r(4, 16, 6, 2, P.spider);
        r(22, 16, 6, 2, P.spider);
        r(12, 16, 2, 2, P.spiderEye);
        r(18, 16, 2, 2, P.spiderEye);
      } else if (type === "EYE") {
        r(8, 26, 16, 3, P.shadow);
        r(8, 8, 16, 16, "#fff"); // Blanc
        r(12, 12, 8, 8, P.eye); // Iris
        r(14, 14, 4, 4, "#000"); // Pupille
      } else if (type === "TROLL") {
        r(4, 24, 24, 6, P.shadow);
        r(6, 12, 20, 14, P.troll);
        r(2, 14, 4, 10, P.troll); // Bras
        r(26, 14, 4, 10, P.troll); // Bras
        r(12, 8, 8, 6, P.troll); // Tete
      } else if (type === "FIRE_WISP") {
        r(10, 10, 12, 12, P.wisp);
        r(12, 12, 8, 8, "#fff");
      } else if (type === "SALAMANDER") {
        r(6, 22, 20, 6, "#dc2626");
        r(2, 20, 6, 4, "#dc2626"); // Tete
        r(24, 20, 8, 2, "#dc2626"); // Queue
      } else if (type === "MERCHANT") {
        r(6, 26, 20, 3, P.shadow);
        r(8, 14, 16, 14, P.merchant);
        r(10, 8, 12, 8, P.merchantSkin);
        r(8, 4, 16, 6, P.merchantTurban);
      }

      // --- WEAPONS (SPRITES DÉDIÉS) ---
      else if (type === "WEAPON_SWORD") {
        ctx.translate(16, 16);
        ctx.rotate(Math.PI / 4);
        ctx.translate(-16, -16);
        r(14, 4, 4, 20, "#e2e8f0"); // Lame
        r(10, 24, 12, 4, "#b91c1c"); // Garde
        r(14, 28, 4, 4, "#475569"); // Pommeau
      } else if (type === "WEAPON_BOW") {
        ctx.beginPath();
        ctx.arc(16, 16, 12, -Math.PI / 2, Math.PI / 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#854d0e";
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(16, 4);
        ctx.lineTo(16, 28);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      } else if (type === "WEAPON_STAFF") {
        r(14, 4, 4, 24, "#5b21b6");
        r(12, 2, 8, 6, "#d8b4fe"); // Orbe
      } else if (type === "WEAPON_PISTOL") {
        r(8, 12, 16, 6, "#475569"); // Canon
        r(8, 12, 6, 12, "#1e293b"); // Crosse
      }

      // --- ITEMS & WORLD ---
      else if (type === "CHEST") {
        const open = variant === "open";
        r(2, 12, 28, 18, P.chestDark);
        r(4, 14, 24, 14, P.chest);
        if (open) {
          r(4, 8, 24, 6, "#000");
          r(6, 10, 20, 4, P.gold);
        } else {
          r(2, 8, 28, 6, P.chest);
          r(12, 18, 8, 4, "#000");
        }
      } else if (type === "POTION") {
        r(10, 24, 12, 4, P.shadow);
        r(14, 6, 4, 6, "#fff");
        r(10, 12, 12, 16, P.potion);
        r(12, 16, 4, 4, "rgba(255,255,255,0.5)");
      } else if (type === "GOLD") {
        r(6, 18, 8, 8, P.gold);
        r(14, 22, 8, 8, P.gold);
        r(20, 16, 6, 6, P.gold);
      } else if (type === "STAIRS") {
        r(0, 0, 32, 32, "#000");
        for (let i = 0; i < 6; i++)
          r(4 + i * 2, 4 + i * 4, 24 - i * 4, 4, P.stairs);
      } else if (type === "WALL") {
        r(0, 0, 32, 32, wallC);
        r(0, 24, 32, 8, wallSideC);
        r(0, 12, 32, 2, "#111");
        r(10, 12, 2, 12, "#111");
        r(20, 0, 2, 12, "#111");
      } else if (type === "FLOOR") {
        r(0, 0, 32, 32, floorC);
        r(8, 8, 2, 2, P.floorDetail);
        r(24, 20, 2, 2, P.floorDetail);
      } else if (type === "FIREBALL") {
        r(10, 10, 12, 12, P.magicFire);
        r(12, 12, 8, 8, "#fff");
      } else {
        r(8, 8, 16, 16, "#ff00ff"); // Fallback
      }
    });
  }
  return spriteCache[cacheKey];
}

export function generateBackgroundSVG() {
  return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3"/><feColorMatrix type="saturate" values="0"/></filter><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1c1917" stop-opacity="0.3"/><stop offset="100%" stop-color="#000"/></radialGradient></defs><rect width="100%" height="100%" fill="#0a0a0a"/><rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="transparent" opacity="0.1" filter="url(#n)"/></svg>`;
}
