"use client";

import { useEffect, useRef } from "react";
import { getSprite } from "@/lib/spriteEngine";

interface SpriteIconProps {
  type?: string; // Pour compatibilité standard
  spriteKey?: string; // Pour compatibilité item
  variant?: string;
  size?: number;
  className?: string;
}

export default function SpriteIcon({
  type,
  spriteKey,
  variant = "idle",
  size = 40,
  className = "",
}: SpriteIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // On détermine la clé à utiliser (type ou spriteKey)
  // Fallback sur "ROCK" si rien n'est fourni pour éviter le crash
  const actualKey = spriteKey || type || "ROCK";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sprite de base
    const sprite = getSprite(actualKey, variant);

    // Nettoyage
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Désactivation du lissage pour le pixel art
    ctx.imageSmoothingEnabled = false;

    if (sprite) {
      // Dessin étiré pour remplir le canvas
      ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
    }
  }, [actualKey, variant]);

  return (
    <canvas
      ref={canvasRef}
      width={32}
      height={32}
      className={`rendering-pixelated ${className}`}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    />
  );
}
