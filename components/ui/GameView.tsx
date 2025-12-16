import { getSprite } from "@/lib/spriteEngine";
import useGameStore from "@/store/gameStore";
import { useEffect, useRef } from "react";
import { SpeechBubble } from "@/types/game";

export default function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualState = useRef<Record<string, { x: number; y: number }>>({});
  const camera = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const TILE_SIZE = 48;
    const VIEW_WIDTH = 26;
    const VIEW_HEIGHT = 15;
    const LERP = 0.2;
    const FONT = '"Press Start 2P", monospace';

    canvas.width = VIEW_WIDTH * TILE_SIZE;
    canvas.height = VIEW_HEIGHT * TILE_SIZE;
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
        levelTheme,
        projectiles,
        attackAnims,
        speechBubbles,
      } = state;

      ctx.fillStyle = levelTheme?.wallSideColor || "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!map || !map.length) {
        frameId = requestAnimationFrame(render);
        return;
      }

      const allEntities = [
        ...enemies,
        { ...player, type: "player", id: "hero" },
      ];

      allEntities.forEach((e: any) => {
        if (e.isHidden) return;
        const tx = e.position.x * TILE_SIZE;
        const ty = e.position.y * TILE_SIZE;

        if (!visualState.current[e.id])
          visualState.current[e.id] = { x: tx, y: ty };
        else {
          visualState.current[e.id].x +=
            (tx - visualState.current[e.id].x) * 0.3;
          visualState.current[e.id].y +=
            (ty - visualState.current[e.id].y) * 0.3;
        }
      });

      const heroVis = visualState.current["hero"];
      if (heroVis) {
        const targetCamX = heroVis.x - canvas.width / 2 + TILE_SIZE / 2;
        const targetCamY = heroVis.y - canvas.height / 2 + TILE_SIZE / 2;
        camera.current.x += (targetCamX - camera.current.x) * LERP;
        camera.current.y += (targetCamY - camera.current.y) * LERP;
      }

      const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
      const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;

      ctx.save();
      ctx.translate(
        -Math.floor(camera.current.x + shakeX),
        -Math.floor(camera.current.y + shakeY)
      );

      const startCol = Math.floor(camera.current.x / TILE_SIZE);
      const endCol = startCol + VIEW_WIDTH + 2;
      const startRow = Math.floor(camera.current.y / TILE_SIZE);
      const endRow = startRow + VIEW_HEIGHT + 2;

      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
            const tile = map[y][x];
            const sprite = getSprite(
              tile.type === "wall" ? "WALL" : "FLOOR",
              "idle",
              levelTheme
            );
            if (sprite)
              ctx.drawImage(
                sprite,
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
              );
          }
        }
      }

      allEntities.sort(
        (a, b) =>
          (visualState.current[a.id]?.y || 0) -
          (visualState.current[b.id]?.y || 0)
      );

      allEntities.forEach((e: any) => {
        if (e.isHidden) return;
        const vis = visualState.current[e.id];
        if (!vis) return;

        if (!e.isDead) {
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath();
          ctx.ellipse(
            vis.x + TILE_SIZE / 2,
            vis.y + TILE_SIZE - 4,
            TILE_SIZE / 2.5,
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
        const bob = isStatic ? 0 : Math.sin(time / 10) * 2;

        if (sprite) {
          if (e.isDead && e.type !== "rubble") {
            ctx.globalAlpha = 0.5;
            ctx.drawImage(sprite, vis.x, vis.y + 10, TILE_SIZE, TILE_SIZE);
            ctx.globalAlpha = 1;
          } else {
            ctx.drawImage(sprite, vis.x, vis.y + bob, TILE_SIZE, TILE_SIZE);
          }
        }

        if (e.type === "enemy" && e.isHostile && !e.isBoss && !e.isDead) {
          ctx.font = `8px ${FONT}`;
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.shadowColor = "#000";
          ctx.shadowBlur = 3;
          ctx.strokeText(e.name, vis.x + TILE_SIZE / 2, vis.y - 12);
          ctx.fillText(e.name, vis.x + TILE_SIZE / 2, vis.y - 12);
          ctx.shadowBlur = 0;

          const hpPct = e.stats.hp / e.stats.maxHp;
          const barW = 32;
          const bx = vis.x + (TILE_SIZE - barW) / 2;
          const by = vis.y - 8;

          ctx.fillStyle = "#000";
          ctx.fillRect(bx - 1, by - 1, barW + 2, 6);
          ctx.fillStyle = "#555";
          ctx.fillRect(bx, by, barW, 4);
          ctx.fillStyle =
            hpPct > 0.5 ? "#22c55e" : hpPct > 0.25 ? "#facc15" : "#ef4444";
          ctx.fillRect(bx, by, barW * hpPct, 4);

          if (e.statusEffects && e.statusEffects.length > 0) {
            e.statusEffects.forEach((s: string, i: number) => {
              ctx.fillStyle =
                s === "freeze" ? "#0ea5e9" : s === "burn" ? "#f97316" : "#fff";
              ctx.beginPath();
              ctx.arc(bx + i * 8, by - 6, 3, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        }

        if (e.type === "merchant") {
          ctx.font = `10px ${FONT}`;
          ctx.fillStyle = "#fbbf24";
          ctx.textAlign = "center";
          ctx.shadowColor = "#000";
          ctx.shadowBlur = 3;
          ctx.strokeText(e.name, vis.x + TILE_SIZE / 2, vis.y - 15);
          ctx.fillText(e.name, vis.x + TILE_SIZE / 2, vis.y - 15);
          ctx.shadowBlur = 0;
        }
      });

      if (speechBubbles) {
        speechBubbles.forEach((bubble: SpeechBubble) => {
          const target = visualState.current[bubble.targetId];
          if (target) {
            const bx = target.x + TILE_SIZE / 2;
            const by = target.y - 20;

            ctx.font = `10px ${FONT}`;
            const textMetrics = ctx.measureText(bubble.text);
            const padding = 10;
            const w = textMetrics.width + padding * 2;
            const h = 24;

            ctx.fillStyle = "#fff";
            if (bubble.color !== "#fff") ctx.fillStyle = "#111";

            ctx.beginPath();
            ctx.roundRect(bx - w / 2, by - h, w, h, 8);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx - 5, by - h + 2);
            ctx.lineTo(bx + 5, by - h + 2);
            ctx.fill();

            ctx.strokeStyle = bubble.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(bx - w / 2, by - h, w, h, 8);
            ctx.stroke();

            ctx.fillStyle = bubble.color === "#fff" ? "#000" : bubble.color;
            ctx.textAlign = "center";
            ctx.fillText(bubble.text, bx, by - 8);
          }
        });
      }

      if (attackAnims) {
        attackAnims.forEach((anim: any) => {
          const cx = anim.x * TILE_SIZE + TILE_SIZE / 2;
          const cy = anim.y * TILE_SIZE + TILE_SIZE / 2;

          ctx.save();
          ctx.translate(cx, cy);

          if (anim.type === "cast_enemy" || anim.type === "cast") {
            ctx.strokeStyle = anim.type === "cast" ? "#3b82f6" : "#ef4444";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, anim.progress * 40, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            const angle =
              anim.dir === "up"
                ? -Math.PI / 2
                : anim.dir === "down"
                ? Math.PI / 2
                : anim.dir === "left"
                ? Math.PI
                : 0;
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.arc(0, 0, 30, -0.5, 0.5);
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 30 * (1 - anim.progress);
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      if (projectiles) {
        ctx.globalCompositeOperation = "lighter";
        projectiles.forEach((p: any) => {
          const px =
            (p.startX + (p.targetX - p.startX) * p.progress) * TILE_SIZE +
            TILE_SIZE / 2;
          const py =
            (p.startY + (p.targetY - p.startY) * p.progress) * TILE_SIZE +
            TILE_SIZE / 2;

          if (p.trail && p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(
              p.trail[0].x * TILE_SIZE + TILE_SIZE / 2,
              p.trail[0].y * TILE_SIZE + TILE_SIZE / 2
            );
            for (let i = 1; i < p.trail.length; i++) {
              ctx.lineTo(
                p.trail[i].x * TILE_SIZE + TILE_SIZE / 2,
                p.trail[i].y * TILE_SIZE + TILE_SIZE / 2
              );
            }
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.damage > 20 ? 4 : 2;
            ctx.globalAlpha = 0.6;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }

          ctx.save();
          ctx.translate(px, py);
          const angle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX);
          ctx.rotate(angle);

          if (p.projectileType === "arrow") {
            ctx.fillStyle = "#fff";
            ctx.fillRect(-8, -1, 16, 2);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(8, -3);
            ctx.lineTo(12, 0);
            ctx.lineTo(8, 3);
            ctx.fill();
          } else {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
        ctx.globalCompositeOperation = "source-over";
      }

      particles.forEach((p: any) => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        const size = p.size || 3;
        ctx.fillRect(p.x * TILE_SIZE, p.y * TILE_SIZE, size, size);
      });
      ctx.globalAlpha = 1;

      if (floatingTexts) {
        floatingTexts.forEach((t: any) => {
          if (t.text === "EXPLOSION_VISUAL") {
            const radius = parseFloat(t.textColor || "2") * TILE_SIZE;
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(
              t.x * TILE_SIZE + TILE_SIZE / 2,
              t.y * TILE_SIZE + TILE_SIZE / 2,
              radius * (1 - t.life),
              0,
              Math.PI * 2
            );
            ctx.stroke();
          } else {
            const yOffset = (1 - t.life) * 30;
            ctx.font = t.isCrit ? `bold 20px ${FONT}` : `12px ${FONT}`;
            ctx.textAlign = "center";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3;
            const txt = t.text;
            const tx = t.x * TILE_SIZE + TILE_SIZE / 2;
            const ty = t.y * TILE_SIZE - yOffset;

            ctx.globalAlpha = t.life;
            ctx.strokeText(txt, tx, ty);
            ctx.fillStyle = t.color;
            ctx.fillText(txt, tx, ty);
            ctx.globalAlpha = 1;
          }
        });
      }

      ctx.restore();
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full rendering-pixelated"
    />
  );
}
