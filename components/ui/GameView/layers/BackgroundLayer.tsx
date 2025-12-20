import { useMemo } from "react";
import { generateBackgroundSVG } from "@/lib/spriteEngine";

export default function BackgroundLayer() {
  const bgSvg = useMemo(() => generateBackgroundSVG(), []);
  return (
    <div
      className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
          bgSvg
        )}")`,
      }}
    ></div>
  );
}
