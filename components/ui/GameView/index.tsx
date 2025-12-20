"use client";

import { useRef } from "react";
import useGameStore from "@/store/gameStore";
import GameCanvas from "./GameCanvas";
import BackgroundLayer from "./layers/BackgroundLayer";
import CRTLayer from "./layers/CRTLayer";
import FlashLayer from "./layers/FlashLayer";

export default function GameView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const damageFlash = useGameStore((state: any) => state.damageFlash);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden select-none ${
        damageFlash > 0 ? "animate-flash-red" : ""
      }`}
    >
      <BackgroundLayer />

      <GameCanvas containerRef={containerRef} />

      <CRTLayer />

      <FlashLayer opacity={damageFlash} />
    </div>
  );
}
