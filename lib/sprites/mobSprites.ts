import { P, r, p, DrawContext } from "./utils";

export function drawMob(ctx: DrawContext, type: string) {
  if (type === "RAT") {
    r(ctx, 8, 26, 16, 2, P.shadow);
    r(ctx, 8, 22, 16, 8, "#4a3832");
    p(ctx, 9, 23, "#5d4037");
    p(ctx, 11, 24, "#5d4037");
    p(ctx, 15, 23, "#5d4037");
    r(ctx, 20, 22, 8, 6, "#4a3832");
    r(ctx, 24, 26, 4, 2, "#f472b6");
    p(ctx, 25, 23, "#ef4444");
    p(ctx, 26, 23, "#fff");
    r(ctx, 19, 20, 3, 3, "#4a3832");
    p(ctx, 20, 21, "#f472b6");
    r(ctx, 2, 24, 2, 2, "#ec4899");
    r(ctx, 4, 25, 2, 2, "#db2777");
    r(ctx, 6, 24, 2, 2, "#ec4899");
    r(ctx, 10, 30, 3, 1, "#3e2723");
    r(ctx, 18, 30, 3, 1, "#3e2723");
  } else if (type === "SLIME") {
    r(ctx, 6, 26, 20, 4, P.shadow);
    r(ctx, 8, 20, 16, 10, "#22c55e");
    r(ctx, 10, 18, 12, 2, "#22c55e");
    r(ctx, 10, 22, 12, 6, "#4ade80");
    r(ctx, 12, 24, 8, 2, "#86efac");
    r(ctx, 10, 19, 2, 2, "#fff");
    r(ctx, 9, 21, 1, 3, "#fff");
    p(ctx, 21, 21, "#fff");
    p(ctx, 14, 26, "#fff");
    p(ctx, 15, 25, "#fff");
    p(ctx, 18, 27, P.gold);
  } else if (type === "BAT") {
    r(ctx, 12, 28, 8, 2, P.shadow);
    r(ctx, 2, 10, 12, 10, "#3b0764");
    r(ctx, 20, 10, 12, 10, "#3b0764");
    r(ctx, 2, 10, 12, 1, "#581c87");
    r(ctx, 2, 10, 1, 8, "#581c87");
    r(ctx, 20, 10, 12, 1, "#581c87");
    r(ctx, 31, 10, 1, 8, "#581c87");
    r(ctx, 13, 14, 6, 8, "#1e1b4b");
    p(ctx, 14, 15, "#312e81");
    p(ctx, 17, 16, "#312e81");
    r(ctx, 12, 12, 8, 6, "#1e1b4b");
    r(ctx, 11, 10, 2, 3, "#1e1b4b");
    r(ctx, 19, 10, 2, 3, "#1e1b4b");
    p(ctx, 14, 14, "#facc15");
    p(ctx, 17, 14, "#facc15");
    p(ctx, 14, 18, "#fff");
    p(ctx, 17, 18, "#fff");
  } else if (type === "WOLF" || type === "ALPHA_WOLF") {
    const fur = type === "ALPHA_WOLF" ? "#d4d4d8" : "#52525b";
    const darkFur = type === "ALPHA_WOLF" ? "#a1a1aa" : "#3f3f46";
    const eye = type === "ALPHA_WOLF" ? "#ef4444" : "#facc15";
    r(ctx, 6, 26, 20, 2, P.shadow);
    r(ctx, 8, 16, 14, 10, fur);
    r(ctx, 10, 16, 8, 4, darkFur);
    r(ctx, 22, 14, 8, 8, fur);
    r(ctx, 28, 18, 3, 3, "#18181b");
    r(ctx, 22, 12, 2, 2, fur);
    r(ctx, 26, 12, 2, 2, fur);
    p(ctx, 25, 16, eye);
    r(ctx, 8, 26, 3, 4, darkFur);
    r(ctx, 18, 26, 3, 4, darkFur);
    r(ctx, 2, 18, 6, 4, darkFur);
  } else if (type === "GOBLIN") {
    r(ctx, 10, 26, 12, 2, P.shadow);
    r(ctx, 12, 14, 8, 8, "#65a30d");
    r(ctx, 8, 15, 4, 3, "#65a30d");
    p(ctx, 9, 16, "#3f6212");
    r(ctx, 20, 15, 4, 3, "#65a30d");
    p(ctx, 22, 16, "#3f6212");
    r(ctx, 12, 22, 8, 6, P.leather);
    r(ctx, 12, 22, 4, 3, P.leatherDark);
    r(ctx, 13, 23, 1, 1, "#000");
    p(ctx, 14, 16, "#facc15");
    p(ctx, 17, 16, "#facc15");
    r(ctx, 14, 20, 4, 1, "#000");
    p(ctx, 14, 21, "#fff");
    r(ctx, 21, 20, 2, 6, "#78716c");
    p(ctx, 22, 22, "#444");
  } else if (type === "BANDIT" || type === "SNIPER" || type === "BANDIT_KING") {
    const hood = type === "BANDIT_KING" ? "#991b1b" : "#171717";
    r(ctx, 10, 26, 12, 2, P.shadow);
    r(ctx, 11, 14, 10, 10, P.leather);
    r(ctx, 13, 16, 6, 6, "#78350f");
    r(ctx, 12, 6, 8, 8, "#fdba74");
    r(ctx, 12, 6, 8, 3, hood);
    r(ctx, 12, 11, 8, 3, hood);
    if (type === "SNIPER") {
      r(ctx, 13, 9, 6, 2, "#ef4444");
      p(ctx, 14, 9, "#fca5a5");
    } else {
      p(ctx, 14, 9, "#000");
      p(ctx, 17, 9, "#000");
    }
    if (type === "BANDIT_KING") {
      r(ctx, 11, 2, 10, 4, P.gold);
      p(ctx, 13, 3, "#f00");
      p(ctx, 18, 3, "#00f");
    }
  } else if (type === "SKELETON" || type === "ARCHER") {
    r(ctx, 10, 26, 12, 2, P.shadow);
    r(ctx, 14, 16, 4, 10, P.bone);
    r(ctx, 15, 16, 2, 10, "#d4d4d4");
    r(ctx, 12, 17, 8, 1, P.bone);
    r(ctx, 12, 19, 8, 1, P.bone);
    r(ctx, 12, 21, 8, 1, P.bone);
    r(ctx, 12, 6, 8, 8, P.bone);
    r(ctx, 13, 9, 2, 2, "#171717");
    r(ctx, 17, 9, 2, 2, "#171717");
    p(ctx, 14, 9, "#7f1d1d");
    p(ctx, 18, 9, "#7f1d1d");
    r(ctx, 15, 12, 2, 1, "#171717");
    r(ctx, 12, 24, 8, 3, P.bone);
    r(ctx, 12, 27, 2, 5, P.bone);
    r(ctx, 18, 27, 2, 5, P.bone);
    if (type === "ARCHER") {
      r(ctx, 6, 10, 4, 10, P.leather);
      r(ctx, 7, 8, 1, 4, "#fff");
      r(ctx, 9, 7, 1, 5, "#fff");
      r(ctx, 6, 12, 4, 1, P.gold);
    }
  } else if (type === "ORC") {
    r(ctx, 6, 26, 20, 2, P.shadow);
    r(ctx, 6, 12, 20, 14, "#365314");
    r(ctx, 8, 14, 16, 6, "#4d7c0f");
    r(ctx, 8, 20, 16, 8, "#18181b");
    r(ctx, 10, 20, 2, 2, "#52525b");
    r(ctx, 20, 20, 2, 2, "#52525b");
    r(ctx, 4, 11, 6, 6, "#27272a");
    p(ctx, 6, 10, "#fff");
    r(ctx, 22, 11, 6, 6, "#27272a");
    p(ctx, 24, 10, "#fff");
    r(ctx, 12, 5, 8, 8, "#3f6212");
    r(ctx, 13, 9, 2, 1, "#ef4444");
    r(ctx, 17, 9, 2, 1, "#ef4444");
    r(ctx, 13, 12, 1, 3, P.bone);
    r(ctx, 18, 12, 1, 3, P.bone);
    r(ctx, 12, 4, 8, 2, "#18181b");
  } else if (
    type === "MAGE" ||
    type === "SORCERER" ||
    type === "ANCIENT_WIZARD"
  ) {
    const robe =
      type === "ANCIENT_WIZARD"
        ? "#f5f5f5"
        : type === "SORCERER"
        ? "#4c1d95"
        : "#1e3a8a";
    const robeDark =
      type === "ANCIENT_WIZARD"
        ? "#d4d4d4"
        : type === "SORCERER"
        ? "#3b0764"
        : "#172554";
    const trim = type === "ANCIENT_WIZARD" ? P.gold : "#000";

    r(ctx, 10, 26, 12, 2, P.shadow);
    r(ctx, 10, 12, 12, 18, robe);
    r(ctx, 14, 12, 4, 18, trim);
    r(ctx, 10, 26, 12, 2, robeDark);
    r(ctx, 8, 12, 4, 6, robe);
    r(ctx, 20, 12, 4, 6, robe);
    r(ctx, 12, 6, 8, 6, "#fdba74");
    r(ctx, 10, 4, 12, 4, robeDark);
    r(ctx, 11, 0, 10, 4, robe);
    r(ctx, 6, 20, 4, 4, P.magic);
    r(ctx, 22, 20, 4, 4, P.magic);
    p(ctx, 7, 21, "#fff");
    p(ctx, 23, 21, "#fff");

    if (type === "ANCIENT_WIZARD") {
      r(ctx, 12, 12, 8, 8, "#e5e5e5");
    }
  } else if (type === "KNIGHT" || type === "DARK_KNIGHT") {
    const armor = type === "DARK_KNIGHT" ? "#18181b" : "#a1a1aa";
    const armorLight = type === "DARK_KNIGHT" ? "#3f3f46" : "#d4d4d8";
    const detail = type === "DARK_KNIGHT" ? "#7f1d1d" : "#e5e5e5";

    r(ctx, 8, 26, 16, 2, P.shadow);
    r(ctx, 10, 12, 12, 14, armor);
    r(ctx, 12, 14, 8, 10, detail);
    r(ctx, 6, 12, 4, 6, armorLight);
    r(ctx, 22, 12, 4, 6, armorLight);
    r(ctx, 12, 4, 8, 8, armorLight);
    r(ctx, 14, 6, 4, 2, "#000");
    r(ctx, 15, 0, 2, 4, type === "DARK_KNIGHT" ? "#ef4444" : "#3b82f6");
    r(ctx, 10, 26, 4, 6, armor);
    r(ctx, 18, 26, 4, 6, armor);
  } else if (type === "GHOST") {
    r(ctx, 10, 26, 12, 2, P.shadow);
    r(ctx, 10, 8, 12, 18, "rgba(147, 197, 253, 0.6)");
    r(ctx, 8, 12, 2, 10, "rgba(147, 197, 253, 0.6)");
    r(ctx, 22, 12, 2, 10, "rgba(147, 197, 253, 0.6)");
    r(ctx, 10, 28, 2, 2, "#00000000");
    r(ctx, 14, 28, 2, 3, "#00000000");
    r(ctx, 18, 28, 2, 2, "#00000000");
    r(ctx, 13, 4, 6, 7, P.bone);
    p(ctx, 14, 6, "#bae6fd");
    p(ctx, 17, 6, "#bae6fd");
    r(ctx, 6, 16, 4, 4, "#bae6fd");
    r(ctx, 22, 16, 4, 4, "#bae6fd");
  } else if (type === "SPIDER") {
    r(ctx, 8, 24, 16, 2, P.shadow);
    r(ctx, 12, 18, 8, 8, "#18181b");
    r(ctx, 14, 20, 4, 4, "#27272a");
    r(ctx, 12, 14, 8, 4, "#18181b");
    p(ctx, 13, 15, "#ef4444");
    p(ctx, 18, 15, "#ef4444");
    p(ctx, 14, 14, "#ef4444");
    p(ctx, 17, 14, "#ef4444");
    r(ctx, 6, 16, 6, 1, "#18181b");
    r(ctx, 20, 16, 6, 1, "#18181b");
    r(ctx, 4, 20, 8, 1, "#18181b");
    r(ctx, 20, 20, 8, 1, "#18181b");
    r(ctx, 6, 24, 6, 1, "#18181b");
    r(ctx, 20, 24, 6, 1, "#18181b");
    r(ctx, 8, 28, 4, 1, "#18181b");
    r(ctx, 20, 28, 4, 1, "#18181b");
  } else if (type === "EYE") {
    r(ctx, 10, 26, 12, 2, P.shadow);
    r(ctx, 8, 8, 16, 16, "#f4f4f5");
    r(ctx, 8, 8, 16, 16, "rgba(0,0,0,0.1)");
    r(ctx, 12, 12, 8, 8, "#7c3aed");
    r(ctx, 13, 13, 2, 2, "#a78bfa");
    r(ctx, 14, 14, 4, 4, "#000");
    r(ctx, 14, 24, 4, 6, "#f87171");
    p(ctx, 9, 10, "#f87171");
    p(ctx, 21, 10, "#f87171");
    p(ctx, 10, 21, "#f87171");
    p(ctx, 21, 21, "#f87171");
  } else if (type === "TROLL") {
    r(ctx, 6, 26, 20, 4, P.shadow);
    r(ctx, 8, 12, 16, 14, "#365314");
    r(ctx, 10, 14, 12, 10, "#4d7c0f");
    r(ctx, 2, 14, 6, 12, "#365314");
    r(ctx, 24, 14, 6, 12, "#365314");
    r(ctx, 8, 26, 6, 4, "#365314");
    r(ctx, 18, 26, 6, 4, "#365314");
    r(ctx, 12, 6, 8, 6, "#365314");
    r(ctx, 11, 8, 2, 2, "#000");
    p(ctx, 13, 8, "#ef4444");
    p(ctx, 18, 8, "#ef4444");
    r(ctx, 14, 10, 4, 2, "#000");
    r(ctx, 13, 11, 1, 2, "#fff");
    r(ctx, 26, 6, 6, 16, P.woodDark);
    r(ctx, 27, 8, 2, 2, P.steel);
    r(ctx, 29, 14, 2, 2, P.steel);
  } else if (type === "FIRE_WISP") {
    r(ctx, 12, 12, 8, 8, "#fff");
    r(ctx, 10, 10, 12, 12, "rgba(251, 146, 60, 0.6)");
    r(ctx, 8, 8, 16, 16, "rgba(251, 146, 60, 0.3)");
    p(ctx, 14, 14, "#000");
    p(ctx, 17, 14, "#000");
  } else if (type === "SALAMANDER") {
    r(ctx, 8, 24, 16, 2, P.shadow);
    r(ctx, 6, 20, 20, 6, "#dc2626");
    r(ctx, 10, 18, 12, 2, "#facc15");
    r(ctx, 24, 18, 6, 6, "#dc2626");
    p(ctx, 28, 19, "#000");
    r(ctx, 2, 22, 6, 2, "#dc2626");
    r(ctx, 8, 26, 2, 2, "#7f1d1d");
    r(ctx, 22, 26, 2, 2, "#7f1d1d");
  } else if (type === "MERCHANT") {
    r(ctx, 8, 26, 16, 2, P.shadow);
    r(ctx, 10, 14, 12, 12, "#15803d");
    r(ctx, 14, 14, 4, 12, "#166534");
    r(ctx, 12, 8, 8, 6, "#d4a373");
    r(ctx, 10, 4, 12, 4, P.gold);
    r(ctx, 14, 2, 4, 2, P.gold);
    p(ctx, 16, 3, "#f00");
    r(ctx, 13, 12, 6, 4, "#000");
    r(ctx, 4, 14, 6, 10, P.wood);
    r(ctx, 5, 16, 4, 2, P.gold);
  }
}
