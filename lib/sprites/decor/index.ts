import { DrawContext } from "../utils";
import { LevelTheme } from "@/types/game";
import { drawStairs, drawWall, drawFloor } from "./structures";
import { drawRock, drawRubble, drawMushroom, drawHerb } from "./nature";
import {
  drawPillar,
  drawCrystal,
  drawFireball,
  drawBarrel,
  drawCrack,
  drawVent,
  drawPipe,
  drawBones,
} from "./objects";

export function drawDecor(ctx: DrawContext, type: string, theme?: LevelTheme) {
  if (type === "STAIRS") drawStairs(ctx);
  else if (type === "WALL") drawWall(ctx, theme);
  else if (type === "FLOOR") drawFloor(ctx, theme);
  else if (type === "ROCK") drawRock(ctx);
  else if (type === "RUBBLE") drawRubble(ctx);
  else if (type === "MUSHROOM") drawMushroom(ctx);
  else if (type === "HERB") drawHerb(ctx);
  else if (type === "PILLAR") drawPillar(ctx);
  else if (type.startsWith("CRYSTAL")) drawCrystal(ctx, type);
  else if (type === "FIREBALL") drawFireball(ctx);
  else if (type === "BARREL") drawBarrel(ctx);
  else if (type === "CRACK") drawCrack(ctx);
  else if (type === "VENT") drawVent(ctx);
  else if (type === "PIPE") drawPipe(ctx);
  else if (type === "BONES") drawBones(ctx);
}
