import { DrawContext } from "../utils";
import { drawGolem, drawLavaGolem } from "./golems";
import { drawDragon, drawLich } from "./dragons";
import { drawTitan, drawMerchantBoss } from "./titans";

export function drawBoss(ctx: DrawContext, type: string) {
  if (type === "GOLEM") drawGolem(ctx);
  else if (type === "LAVA_GOLEM") drawLavaGolem(ctx);
  else if (type === "DRAGON") drawDragon(ctx);
  else if (type === "LICH") drawLich(ctx);
  else if (type === "TITAN") drawTitan(ctx);
  else if (type === "MERCHANT") drawMerchantBoss(ctx);
}
