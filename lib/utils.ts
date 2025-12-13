export function getPlayerRank(level: number): string {
  if (level >= 100) return "Dieu de la Guerre";
  if (level >= 80) return "Légende Vivante";
  if (level >= 60) return "Conquérant";
  if (level >= 40) return "Maître d'Armes";
  if (level >= 20) return "Chevalier";
  if (level >= 10) return "Mercenaire";
  return "Recrue";
}

export function getEntityRarityColor(level: number, isBoss: boolean): string {
  if (isBoss) return "#ef4444";
  if (level > 80) return "#fbbf24";
  if (level > 50) return "#a855f7";
  if (level > 20) return "#3b82f6";
  return "#ffffff";
}

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
