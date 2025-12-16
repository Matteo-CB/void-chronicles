import { DrawContext } from "../utils";
import { drawSword, drawBow, drawStaff, drawPistol } from "./weapons";
import { drawChest } from "./containers";
import { drawPotion, drawGold, drawRelic, drawArmor } from "./loot";

export function drawItem(ctx: DrawContext, type: string, variant: string) {
  if (type === "WEAPON_SWORD") drawSword(ctx);
  else if (type === "WEAPON_BOW") drawBow(ctx);
  else if (type === "WEAPON_STAFF") drawStaff(ctx);
  else if (type === "WEAPON_PISTOL") drawPistol(ctx);
  else if (type === "CHEST") drawChest(ctx, variant);
  else if (type === "POTION") drawPotion(ctx);
  else if (type === "GOLD") drawGold(ctx);
  else if (type === "RELIC") drawRelic(ctx);
  else if (type === "ARMOR") drawArmor(ctx);
}
