import { DrawContext } from "../utils";
import { drawRat, drawBat } from "./animals";
import { drawSlime, drawGoblin } from "./monsters";
import { drawSkeleton, drawDarkKnight } from "./undead";
import { drawSorcerer, drawNecromancer, drawSpellbook } from "./casters";
import { drawArcher, drawMerchantMob } from "./humanoids";

export function drawMob(ctx: DrawContext, type: string) {
  if (type === "RAT") drawRat(ctx);
  else if (type === "SLIME") drawSlime(ctx);
  else if (type === "BAT") drawBat(ctx);
  else if (type === "GOBLIN") drawGoblin(ctx);
  else if (type === "SKELETON") drawSkeleton(ctx);
  else if (type === "SORCERER") drawSorcerer(ctx);
  else if (type === "ARCHER") drawArcher(ctx);
  else if (type === "DARK_KNIGHT") drawDarkKnight(ctx);
  else if (type === "NECROMANCER") drawNecromancer(ctx);
  else if (type === "MERCHANT") drawMerchantMob(ctx);
  else if (type === "SPELLBOOK") drawSpellbook(ctx);
  else {
    // Fallback
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(8, 8, 16, 16);
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.fillText("?", 12, 20);
  }
}
