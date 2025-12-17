"use client";

import { getSprite } from "@/lib/spriteEngine";
import useGameStore from "@/store/gameStore";
import { useEffect, useRef } from "react";
import { SpeechBubble, Tile } from "@/types/game";

export default function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualState = useRef<Record<string, { x: number; y: number }>>({});
  // On initialise la caméra avec null pour savoir qu'elle n'est pas calée
  const camera = useRef<{ x: number; y: number } | null>(null);
  const torchFlicker = useRef(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const TILE_SIZE = 48;
    const VIEW_WIDTH = 28;
    const VIEW_HEIGHT = 18;

    const LERP = 0.15;
    const FONT = '"Press Start 2P", monospace';

    const resizeCanvas = () => {
      canvas.width = VIEW_WIDTH * TILE_SIZE;
      canvas.height = VIEW_HEIGHT * TILE_SIZE;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    ctx.imageSmoothingEnabled = false;

    let frameId: number;
    let time = 0;

    const render = () => {
      time++;
      const state = useGameStore.getState() as any;
      const {
        player,
        map,
        enemies,
        particles,
        floatingTexts,
        screenShake,
        levelTheme, // Peut être undefined au premier chargement
        projectiles,
        attackAnims,
        speechBubbles,
        damageFlash,
      } = state;

      // SÉCURITÉ : Si pas de map, on ne dessine rien (ou un écran de chargement)
      if (!map || !map.length || !player) {
        frameId = requestAnimationFrame(render);
        return;
      }

      // COULEURS DE SECOURS (Si levelTheme bug)
      const bgColor = "#030308";

      torchFlicker.current =
        0.96 + Math.sin(time * 0.05) * 0.02 + Math.random() * 0.02;

      // 1. FOND
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const allEntities = [
        ...enemies,
        { ...player, type: "player", id: "hero" },
      ];

      // Interpolation positions (Fluidité)
      allEntities.forEach((e: any) => {
        if (e.isHidden) return;
        const tx = e.position.x * TILE_SIZE;
        const ty = e.position.y * TILE_SIZE;

        if (!visualState.current[e.id])
          visualState.current[e.id] = { x: tx, y: ty };
        else {
          visualState.current[e.id].x +=
            (tx - visualState.current[e.id].x) * 0.25;
          visualState.current[e.id].y +=
            (ty - visualState.current[e.id].y) * 0.25;
        }
      });

      // --- CAMÉRA ---
      const heroVis = visualState.current["hero"];
      if (heroVis) {
        const targetCamX = heroVis.x - canvas.width / 2 + TILE_SIZE / 2;
        const targetCamY = heroVis.y - canvas.height / 2 + TILE_SIZE / 2;

        if (!camera.current) {
          // TELEPORTATION INITIALE : On évite le "travel" depuis 0,0
          camera.current = { x: targetCamX, y: targetCamY };
        } else {
          // Mouvement fluide ensuite
          camera.current.x += (targetCamX - camera.current.x) * LERP;
          camera.current.y += (targetCamY - camera.current.y) * LERP;
        }
      } else {
        // Fallback si hero pas encore init
        if (!camera.current) camera.current = { x: 0, y: 0 };
      }

      const shakeX =
        screenShake > 0 ? (Math.random() - 0.5) * screenShake * 3 : 0;
      const shakeY =
        screenShake > 0 ? (Math.random() - 0.5) * screenShake * 3 : 0;

      ctx.save();
      ctx.translate(
        -Math.floor(camera.current.x + shakeX),
        -Math.floor(camera.current.y + shakeY)
      );

      const startCol = Math.floor(camera.current.x / TILE_SIZE) - 1;
      const endCol = startCol + VIEW_WIDTH + 2;
      const startRow = Math.floor(camera.current.y / TILE_SIZE) - 1;
      const endRow = startRow + VIEW_HEIGHT + 2;

      // A. MAP & OMBRES
      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
            const tile = map[y][x] as Tile;

            if (tile.visibility === "hidden") {
              ctx.fillStyle = "#000";
              ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              continue;
            }

            const sprite = getSprite(
              tile.type === "wall" ? "WALL" : "FLOOR",
              "idle",
              levelTheme
            );

            if (sprite) {
              ctx.drawImage(
                sprite,
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
              );

              if (tile.type === "wall") {
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.fillRect(
                  x * TILE_SIZE,
                  y * TILE_SIZE + TILE_SIZE - 8,
                  TILE_SIZE,
                  8
                );
              }

              // OMBRE ET BROUILLARD
              let light =
                tile.lightLevel !== undefined
                  ? tile.lightLevel
                  : tile.visibility === "visible"
                  ? 1
                  : 0;

              if (tile.visibility === "visible") {
                light *= torchFlicker.current;
                light = Math.min(1, light * 1.1);
              } else {
                // Fog of war
                light = 0.2;
              }

              const darkness = 1.0 - light;
              if (darkness > 0.05) {
                // SÉCURITÉ SUR LA COULEUR DE L'OMBRE
                ctx.fillStyle = `rgba(10, 10, 20, ${darkness * 0.98})`;
                ctx.fillRect(
                  x * TILE_SIZE,
                  y * TILE_SIZE,
                  TILE_SIZE + 1,
                  TILE_SIZE + 1
                );
              }
            } else {
              // Fallback si sprite manquant (carré de couleur) pour debug
              ctx.fillStyle = tile.type === "wall" ? "#444" : "#222";
              ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      }

      // B. ENTITÉS
      allEntities.sort(
        (a, b) =>
          (visualState.current[a.id]?.y || 0) -
          (visualState.current[b.id]?.y || 0)
      );

      allEntities.forEach((e: any) => {
        if (e.isHidden) return;
        const tX = Math.round(e.position.x);
        const tY = Math.round(e.position.y);

        // Culling entités
        if (tY >= 0 && tY < map.length && tX >= 0 && tX < map[0].length) {
          if (map[tY][tX].visibility !== "visible" && e.id !== "hero") return;
        }

        const vis = visualState.current[e.id];
        if (!vis) return;

        if (!e.isDead) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.beginPath();
          ctx.ellipse(
            vis.x + TILE_SIZE / 2,
            vis.y + TILE_SIZE - 2,
            TILE_SIZE / 2.2,
            TILE_SIZE / 5,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        const sprite = getSprite(
          e.type === "player" ? "PLAYER" : e.spriteKey || "RAT",
          e.isOpen ? "open" : "idle",
          levelTheme
        );
        const isStatic =
          [
            "chest",
            "barrel",
            "gold",
            "potion",
            "item",
            "rubble",
            "stairs",
            "merchant",
          ].includes(e.type) || e.isDead;
        const bob = isStatic ? 0 : Math.sin(time / 12) * 2;

        if (sprite) {
          ctx.save();
          const tile = map[tY]?.[tX];
          if (tile && tile.lightLevel && e.id !== "hero") {
            const brightness = 0.5 + tile.lightLevel * 0.5;
            ctx.filter = `brightness(${brightness * 100}%)`;
          }

          if (e.isDead && e.type !== "rubble") {
            ctx.globalAlpha = 0.7;
            ctx.filter = "grayscale(80%) brightness(50%)";
            ctx.drawImage(sprite, vis.x, vis.y + 10, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.drawImage(sprite, vis.x, vis.y + bob, TILE_SIZE, TILE_SIZE);
          }
          ctx.restore();
        }
      });

      // C. PROJECTILES
      if (projectiles && projectiles.length > 0) {
        ctx.globalCompositeOperation = "lighter";
        projectiles.forEach((p: any) => {
          const px =
            (p.startX + (p.targetX - p.startX) * p.progress) * TILE_SIZE +
            TILE_SIZE / 2;
          const py =
            (p.startY + (p.targetY - p.startY) * p.progress) * TILE_SIZE +
            TILE_SIZE / 2;

          ctx.save();
          ctx.translate(px, py);

          const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.fill();

          const angle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX);
          ctx.rotate(angle);

          ctx.fillStyle = "#fff";
          if (p.trail) {
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(-15, 0);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 3;
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        ctx.globalCompositeOperation = "source-over";
      }

      // D. FX ATTAQUES
      if (attackAnims) {
        ctx.globalCompositeOperation = "lighter";
        attackAnims.forEach((anim: any) => {
          const cx = anim.x * TILE_SIZE + TILE_SIZE / 2;
          const cy = anim.y * TILE_SIZE + TILE_SIZE / 2;
          ctx.save();
          ctx.translate(cx, cy);
          const angle =
            anim.dir === "up"
              ? -Math.PI / 2
              : anim.dir === "down"
              ? Math.PI / 2
              : anim.dir === "left"
              ? Math.PI
              : 0;
          ctx.rotate(angle);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 25 * (1 - anim.progress);
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 10;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(0, 0, 32, -0.6, 0.6);
          ctx.stroke();
          ctx.restore();
        });
        ctx.globalCompositeOperation = "source-over";
      }

      // E. PARTICULES
      ctx.globalCompositeOperation = "lighter";
      particles.forEach((p: any) => {
        ctx.fillStyle = p.color;
        const size = p.size || 2;
        const alpha = p.type === "spark" ? Math.random() : p.life;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x * TILE_SIZE, p.y * TILE_SIZE, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      ctx.globalCompositeOperation = "source-over";

      // F. UI IN-GAME
      allEntities.forEach((e: any) => {
        if (e.isHidden || e.isDead || !visualState.current[e.id]) return;
        const tX = Math.round(e.position.x);
        const tY = Math.round(e.position.y);
        if (tY >= 0 && tY < map.length && tX >= 0 && tX < map[0].length) {
          if (map[tY][tX].visibility !== "visible" && e.id !== "hero") return;
        }

        const vis = visualState.current[e.id];
        if (e.type === "enemy" && e.isHostile && !e.isBoss) {
          ctx.font = `bold 10px ${FONT}`;
          ctx.textAlign = "center";

          ctx.lineWidth = 3;
          ctx.strokeStyle = "black";
          ctx.strokeText(e.name, vis.x + TILE_SIZE / 2, vis.y - 14);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(e.name, vis.x + TILE_SIZE / 2, vis.y - 14);

          const hpPct = Math.max(0, e.stats.hp / e.stats.maxHp);
          const barW = 36;
          const bx = vis.x + (TILE_SIZE - barW) / 2;
          const by = vis.y - 8;

          ctx.fillStyle = "rgba(0,0,0,0.9)";
          ctx.fillRect(bx - 1, by - 1, barW + 2, 6);
          ctx.fillStyle =
            hpPct > 0.5 ? "#22c55e" : hpPct > 0.25 ? "#facc15" : "#ef4444";
          ctx.fillRect(bx, by, barW * hpPct, 4);
        }
      });

      if (floatingTexts) {
        floatingTexts.forEach((t: any) => {
          const yOffset = (1 - t.life) * 40;
          ctx.font = t.isCrit ? `bold 20px ${FONT}` : `bold 12px ${FONT}`;
          ctx.textAlign = "center";
          const tx = t.x * TILE_SIZE + TILE_SIZE / 2;
          const ty = t.y * TILE_SIZE - yOffset;

          ctx.lineWidth = 4;
          ctx.strokeStyle = "black";
          ctx.strokeText(t.text, tx, ty);
          ctx.fillStyle = t.color;
          ctx.fillText(t.text, tx, ty);
        });
      }

      if (speechBubbles) {
        speechBubbles.forEach((bubble: SpeechBubble) => {
          const target = visualState.current[bubble.targetId];
          if (target) {
            const bx = target.x + TILE_SIZE / 2;
            const by = target.y - 25;
            ctx.font = `10px ${FONT}`;
            const tm = ctx.measureText(bubble.text);
            const w = tm.width + 20;
            ctx.fillStyle = "rgba(0,0,0,0.9)";
            ctx.beginPath();
            ctx.roundRect(bx - w / 2, by - 24, w, 24, 4);
            ctx.fill();
            ctx.strokeStyle = bubble.color;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = bubble.color;
            ctx.fillText(bubble.text, bx, by - 8);
          }
        });
      }

      ctx.restore();

      if (damageFlash && damageFlash > 0) {
        ctx.fillStyle = `rgba(220, 38, 38, ${damageFlash * 0.4})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      frameId = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full rendering-pixelated"
      style={{ background: "#030308" }}
    />
  );
}
