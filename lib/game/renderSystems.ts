import { getSprite } from "@/lib/spriteEngine";
import { Tile, SpeechBubble } from "@/types/game";

const TILE_SIZE = 48;
const FONT = '"Press Start 2P", monospace';

export const renderMap = (
  ctx: CanvasRenderingContext2D,
  map: any[][],
  camera: { x: number; y: number },
  levelTheme: any,
  torchFlicker: number,
  canvas: HTMLCanvasElement
) => {
  const startCol = Math.floor(camera.x / TILE_SIZE) - 1;
  const endCol = startCol + Math.ceil(canvas.width / TILE_SIZE) + 2;
  const startRow = Math.floor(camera.y / TILE_SIZE) - 1;
  const endRow = startRow + Math.ceil(canvas.height / TILE_SIZE) + 2;

  const safeStartCol = Math.max(0, startCol);
  const safeEndCol = Math.min(map[0].length - 1, endCol);
  const safeStartRow = Math.max(0, startRow);
  const safeEndRow = Math.min(map.length - 1, endRow);

  for (let y = safeStartRow; y <= safeEndRow; y++) {
    for (let x = safeStartCol; x <= safeEndCol; x++) {
      const tile = map[y][x] as Tile;
      const visibility = (tile as any).visibility;

      if (!visibility || visibility === "hidden") {
        ctx.fillStyle = "#020202";
        ctx.fillRect(
          x * TILE_SIZE,
          y * TILE_SIZE,
          TILE_SIZE + 1,
          TILE_SIZE + 1
        );
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
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(
            x * TILE_SIZE,
            y * TILE_SIZE + TILE_SIZE - 10,
            TILE_SIZE,
            10
          );
        }

        let light = 0;
        if (visibility === "visible") {
          const baseLight =
            tile.lightLevel !== undefined ? tile.lightLevel : 1.0;
          light = baseLight * torchFlicker;
          light = Math.min(1.2, light * 1.3);
        } else if (visibility === "fog" || visibility === "explored") {
          light = 0.2;
        }

        const darkness = Math.max(0, 1.0 - light);
        if (darkness > 0.01) {
          ctx.fillStyle = `rgba(5, 5, 12, ${darkness})`;
          ctx.fillRect(
            x * TILE_SIZE,
            y * TILE_SIZE,
            TILE_SIZE + 1,
            TILE_SIZE + 1
          );
        }
      } else {
        ctx.fillStyle = tile.type === "wall" ? "#333" : "#1a1a1a";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
};

export const renderEntities = (
  ctx: CanvasRenderingContext2D,
  allEntities: any[],
  visualState: React.MutableRefObject<Record<string, { x: number; y: number }>>,
  map: any[][],
  time: number,
  keysPressed: any,
  levelTheme: any
) => {
  // INTERPOLATION PLUS DOUCE (0.15 au lieu de 0.3)
  // Cela crée l'effet de glissement fluide
  const LERP_FACTOR = 0.15;

  allEntities.forEach((e: any) => {
    if (e.isHidden) return;
    const tx = e.position.x * TILE_SIZE;
    const ty = e.position.y * TILE_SIZE;

    if (!Number.isFinite(tx) || !Number.isFinite(ty)) return;

    if (!visualState.current[e.id])
      visualState.current[e.id] = { x: tx, y: ty };
    else {
      // Formule de lissage exponentiel
      visualState.current[e.id].x +=
        (tx - visualState.current[e.id].x) * LERP_FACTOR;
      visualState.current[e.id].y +=
        (ty - visualState.current[e.id].y) * LERP_FACTOR;
    }
  });

  allEntities.sort(
    (a, b) =>
      (visualState.current[a.id]?.y || 0) - (visualState.current[b.id]?.y || 0)
  );

  allEntities.forEach((e: any) => {
    if (e.isHidden) return;
    const tX = Math.round(e.position.x);
    const tY = Math.round(e.position.y);

    if (tY >= 0 && tY < map.length && tX >= 0 && tX < map[0].length) {
      if ((map[tY][tX] as any).visibility !== "visible" && e.id !== "hero")
        return;
    }

    const vis = visualState.current[e.id];
    if (!vis) return;

    if (!e.isDead) {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(
        vis.x + TILE_SIZE / 2,
        vis.y + TILE_SIZE - 4,
        TILE_SIZE / 2.5,
        TILE_SIZE / 6,
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
      ["chest", "barrel", "rubble", "stairs"].includes(e.type) || e.isDead;
    const bob = isStatic ? 0 : Math.sin(time / 10) * 3;

    const k = keysPressed || {};
    const isMoving =
      e.id === "hero" &&
      (k["ArrowUp"] || k["ArrowDown"] || k["ArrowLeft"] || k["ArrowRight"]);
    const scaleY = isMoving ? 1 + Math.sin(time * 0.8) * 0.08 : 1;
    const scaleX = isMoving ? 1 - Math.sin(time * 0.8) * 0.05 : 1;

    if (sprite) {
      ctx.save();

      if (e.id !== "hero") {
        const tile = map[tY]?.[tX];
        const light = tile && tile.lightLevel ? tile.lightLevel : 1;
        if (light < 0.8)
          ctx.filter = `brightness(${Math.max(40, light * 100)}%)`;
      }

      if (e.isDead && e.type !== "rubble") {
        ctx.globalAlpha = 0.6;
        ctx.filter = "grayscale(100%) brightness(40%)";
        ctx.drawImage(sprite, vis.x, vis.y + 12, TILE_SIZE, TILE_SIZE);
      } else {
        if (e.rarityColor && e.type === "npc") {
          ctx.shadowColor = e.rarityColor;
          ctx.shadowBlur = 15;
        }

        ctx.translate(vis.x + TILE_SIZE / 2, vis.y + TILE_SIZE);
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(
          sprite,
          -TILE_SIZE / 2,
          -TILE_SIZE + bob,
          TILE_SIZE,
          TILE_SIZE
        );
      }
      ctx.restore();
    }
  });
};

export const renderEffects = (
  ctx: CanvasRenderingContext2D,
  state: any,
  bloodStains: React.MutableRefObject<any[]>,
  ambientParticles: React.MutableRefObject<any[]>,
  camera: { x: number; y: number },
  canvas: HTMLCanvasElement,
  time: number
) => {
  const { particles, projectiles, attackAnims } = state;

  particles.forEach((p: any) => {
    if (p.type === "blood" && p.life < 0.2 && Math.random() > 0.85) {
      bloodStains.current.push({
        x: p.x * TILE_SIZE,
        y: p.y * TILE_SIZE,
        size: p.size * TILE_SIZE * 2.5,
        alpha: 0.7 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI * 2,
      });
    }
  });
  if (bloodStains.current.length > 80) bloodStains.current.shift();

  bloodStains.current.forEach((stain: any) => {
    if (
      stain.x > camera.x - 50 &&
      stain.x < camera.x + canvas.width + 50 &&
      stain.y > camera.y - 50 &&
      stain.y < camera.y + canvas.height + 50
    ) {
      ctx.save();
      ctx.translate(stain.x, stain.y);
      ctx.rotate(stain.rotation);
      ctx.fillStyle = `rgba(100, 10, 10, ${stain.alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, stain.size, stain.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  if (projectiles && projectiles.length > 0) {
    ctx.globalCompositeOperation = "screen";
    projectiles.forEach((p: any) => {
      const rawPx =
        (p.startX + (p.targetX - p.startX) * p.progress) * TILE_SIZE +
        TILE_SIZE / 2;
      const rawPy =
        (p.startY + (p.targetY - p.startY) * p.progress) * TILE_SIZE +
        TILE_SIZE / 2;
      const rawAngle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX);

      if (
        !Number.isFinite(rawPx) ||
        !Number.isFinite(rawPy) ||
        !Number.isFinite(rawAngle)
      )
        return;

      const px = rawPx;
      const py = rawPy;
      const angle = rawAngle;
      const tailLen = 30;

      ctx.save();
      const gradient = ctx.createLinearGradient(
        px - Math.cos(angle) * tailLen,
        py - Math.sin(angle) * tailLen,
        px,
        py
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, p.color);

      ctx.lineWidth = 4;
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(
        px - Math.cos(angle) * tailLen,
        py - Math.sin(angle) * tailLen
      );
      ctx.lineTo(px, py);
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(px, py, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.globalCompositeOperation = "source-over";
  }

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

      const progress = anim.progress;
      const size = TILE_SIZE * 1.5;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
      ctx.lineWidth = 2;
      ctx.arc(0, 0, size * progress, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, size * 0.8, -Math.PI / 3, Math.PI / 3);
      ctx.arc(-size * 0.2, 0, size * 0.6, Math.PI / 3, -Math.PI / 3, true);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, -size, 0, size);
      grad.addColorStop(0, "rgba(255, 255, 255, 0)");
      grad.addColorStop(0.5, `rgba(255, 255, 200, ${1 - progress})`);
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.globalCompositeOperation = "lighter";
  particles.forEach((p: any) => {
    ctx.save();
    ctx.fillStyle = p.color;
    const size = p.size || 2;
    const alpha = p.type === "spark" ? Math.random() : p.life;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.beginPath();
    if (p.type === "spark") {
      ctx.rect(p.x * TILE_SIZE, p.y * TILE_SIZE, size, size);
    } else {
      ctx.arc(p.x * TILE_SIZE, p.y * TILE_SIZE, size / 2, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  });
  ctx.globalCompositeOperation = "source-over";

  ctx.globalCompositeOperation = "screen";
  ambientParticles.current.forEach((p: any) => {
    p.y += p.speed;
    p.x += Math.sin(time * 0.01 + p.y) * 0.2;
    if (p.y > camera.y + canvas.height + 50) {
      p.y = camera.y - 50;
      p.x = camera.x + Math.random() * canvas.width;
    }
    ctx.save();
    ctx.fillStyle = `rgba(150, 180, 255, ${p.alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.globalCompositeOperation = "source-over";
};

export const renderInGameUI = (
  ctx: CanvasRenderingContext2D,
  allEntities: any[],
  visualState: React.MutableRefObject<Record<string, { x: number; y: number }>>,
  map: any[][],
  floatingTexts: any[],
  speechBubbles: SpeechBubble[]
) => {
  allEntities.forEach((e: any) => {
    if (e.isHidden || e.isDead || !visualState.current[e.id]) return;
    const tX = Math.round(e.position.x);
    const tY = Math.round(e.position.y);
    if (tY >= 0 && tY < map.length && tX >= 0 && tX < map[0].length) {
      if ((map[tY][tX] as any).visibility !== "visible" && e.id !== "hero")
        return;
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
      const barW = 32;
      const bx = vis.x + (TILE_SIZE - barW) / 2;
      const by = vis.y - 6;

      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(bx - 1, by - 1, barW + 2, 5);
      ctx.fillStyle =
        hpPct > 0.5 ? "#22c55e" : hpPct > 0.25 ? "#facc15" : "#ef4444";
      ctx.fillRect(bx, by, barW * hpPct, 3);
    }
  });

  if (floatingTexts) {
    floatingTexts.forEach((t: any) => {
      const yOffset = Math.pow(Math.max(0, 1 - t.life), 0.5) * 50;
      ctx.font = t.isCrit ? `bold 24px ${FONT}` : `bold 14px ${FONT}`;
      ctx.textAlign = "center";
      const tx = t.x * TILE_SIZE + TILE_SIZE / 2;
      const ty = t.y * TILE_SIZE - yOffset;

      ctx.lineWidth = 4;
      ctx.strokeStyle = "black";
      ctx.strokeText(t.text, tx, ty);

      ctx.fillStyle = t.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, t.life * 2));
      ctx.fillText(t.text, tx, ty);
      ctx.globalAlpha = 1;
    });
  }

  if (speechBubbles) {
    speechBubbles.forEach((bubble: SpeechBubble) => {
      const target = visualState.current[bubble.targetId];
      if (target) {
        const bx = target.x + TILE_SIZE / 2;
        const by = target.y - 30;
        ctx.font = `10px ${FONT}`;
        const tm = ctx.measureText(bubble.text);
        const w = tm.width + 20;

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(bx, by + 5);
        ctx.lineTo(bx - 5, by);
        ctx.lineTo(bx + 5, by);
        ctx.fill();

        if (ctx.roundRect) ctx.roundRect(bx - w / 2, by - 25, w, 25, 5);
        else ctx.rect(bx - w / 2, by - 25, w, 25);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.fillText(bubble.text, bx, by - 8);
      }
    });
  }
};

export const renderPostProcess = (
  ctx: CanvasRenderingContext2D,
  camera: { x: number; y: number },
  canvas: HTMLCanvasElement
) => {
  const gradient = ctx.createRadialGradient(
    camera.x + canvas.width / 2,
    camera.y + canvas.height / 2,
    canvas.height / 1.8,
    camera.x + canvas.width / 2,
    camera.y + canvas.height / 2,
    canvas.height
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = gradient;
  ctx.fillRect(
    Math.floor(camera.x),
    Math.floor(camera.y),
    canvas.width,
    canvas.height
  );
};
