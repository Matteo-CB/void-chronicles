import { getSprite } from "@/lib/spriteEngine";
import useGameStore from "@/store/gameStore";
import { useEffect, useRef } from "react";

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
    // On charge une police pixel art si possible, sinon monospace
    const FONT = '"Press Start 2P", monospace';

    canvas.width = VIEW_WIDTH * TILE_SIZE;
    canvas.height = VIEW_HEIGHT * TILE_SIZE;
    ctx.imageSmoothingEnabled = false;

    let frameId: number;

    const render = () => {
      const state = useGameStore.getState();
      state.updateVisuals();
      const {
        player,
        map,
        enemies,
        particles,
        floatingTexts,
        screenShake,
        levelTheme,
      } = state;

      // 1. Fond (Background)
      ctx.fillStyle = levelTheme?.wallSideColor || "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!map || !map.length) {
        frameId = requestAnimationFrame(render);
        return;
      }

      const all = [...enemies, { ...player, type: "player", id: "hero" }];

      // 2. Interpolation des positions (Fluidité)
      all.forEach((e: any) => {
        if (e.isHidden) return;
        const tx = e.position.x * TILE_SIZE;
        const ty = e.position.y * TILE_SIZE;

        if (!visualState.current[e.id]) {
          visualState.current[e.id] = { x: tx, y: ty };
        } else {
          // Lerp plus rapide pour le joueur pour la réactivité, plus lent pour les ennemis pour l'effet
          const speed = e.type === "player" ? 0.3 : 0.15;
          visualState.current[e.id].x +=
            (tx - visualState.current[e.id].x) * speed;
          visualState.current[e.id].y +=
            (ty - visualState.current[e.id].y) * speed;
        }
      });

      // 3. Caméra (Suit le joueur avec un effet ressort)
      const heroVis = visualState.current["hero"];
      if (heroVis) {
        camera.current.x +=
          (heroVis.x - canvas.width / 2 + TILE_SIZE / 2 - camera.current.x) *
          0.1;
        camera.current.y +=
          (heroVis.y - canvas.height / 2 + TILE_SIZE / 2 - camera.current.y) *
          0.1;
      }

      // Screen Shake
      let sx = 0,
        sy = 0;
      if (screenShake > 0) {
        sx = (Math.random() - 0.5) * screenShake;
        sy = (Math.random() - 0.5) * screenShake;
      }

      ctx.save();
      ctx.translate(
        -Math.floor(camera.current.x + sx),
        -Math.floor(camera.current.y + sy)
      );

      // Optimisation : Ne dessiner que les tuiles visibles
      const startCol = Math.floor(camera.current.x / TILE_SIZE);
      const endCol = startCol + VIEW_WIDTH + 1;
      const startRow = Math.floor(camera.current.y / TILE_SIZE);
      const endRow = startRow + VIEW_HEIGHT + 1;

      // 4. Dessin de la Map
      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
            const tile = map[y][x];
            const sprite = getSprite(
              tile.type === "wall" ? "WALL" : "FLOOR",
              "idle",
              levelTheme
            );
            if (sprite) {
              // Légère variation de couleur pour le sol selon la profondeur
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
      }

      // Tri pour la perspective (Y-sort)
      all.sort(
        (a, b) =>
          (visualState.current[a.id]?.y || 0) -
          (visualState.current[b.id]?.y || 0)
      );

      // 5. Dessin des Entités
      all.forEach((e: any) => {
        if (e.isHidden) return;
        const vis = visualState.current[e.id];
        if (!vis) return;

        const isLiving = ["player", "enemy", "merchant"].includes(e.type);
        const scale = e.visualScale || 1;
        const drawSize = TILE_SIZE * scale;
        const offset = (drawSize - TILE_SIZE) / 2;
        const drawX = vis.x - offset;
        const drawY = vis.y - offset;

        // Bobbing effect (flottement) pour les vivants
        const bob = isLiving ? Math.sin(Date.now() / 250) * 2 : 0;

        // Ombre portée
        if (isLiving || e.type === "chest") {
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath();
          ctx.ellipse(
            vis.x + TILE_SIZE / 2,
            vis.y + TILE_SIZE - 2,
            (TILE_SIZE / 3) * scale,
            (TILE_SIZE / 6) * scale,
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

        if (sprite) {
          // Effet pour les BOSS
          if (e.isBoss) {
            ctx.shadowColor = e.rarityColor || "#f00";
            ctx.shadowBlur = 20;
          }

          ctx.drawImage(sprite, drawX, drawY + bob, drawSize, drawSize);
          ctx.shadowBlur = 0; // Reset shadow
        }

        // --- DESSIN DE L'ARME (Utilise maintenant getSprite) ---
        if (e.equipment?.weapon) {
          const wt = e.equipment.weapon.weaponType.toUpperCase();
          const weaponSprite = getSprite(`WEAPON_${wt}`);

          if (weaponSprite) {
            ctx.save();
            ctx.translate(
              drawX + drawSize / 2 + 10,
              drawY + drawSize / 2 + bob
            );
            // Animation de flottement/rotation légère
            ctx.rotate(Math.sin(Date.now() / 500) * 0.2);
            ctx.drawImage(weaponSprite, -12, -12, 24, 24);
            ctx.restore();
          }
        }

        // --- BARRES DE VIE & NOMS ---
        if (e.type === "enemy" || e.type === "player") {
          const hpPct = e.stats.hp / e.stats.maxHp;
          const uiY = drawY - 12; // Position au dessus de la tête

          // Barre de vie (Fond)
          ctx.fillStyle = "#111";
          ctx.fillRect(vis.x + TILE_SIZE / 2 - 16, uiY, 32, 5);

          // Barre de vie (Remplissage)
          ctx.fillStyle = e.type === "player" ? "#22c55e" : "#ef4444";
          ctx.fillRect(vis.x + TILE_SIZE / 2 - 15, uiY + 1, 30 * hpPct, 3);

          // Nom de l'ennemi (CORRECTION ICI POUR LA COULEUR)
          if (e.type === "enemy") {
            ctx.font = `bold 8px ${FONT}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";

            // Contour noir pour la lisibilité
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3;
            ctx.strokeText(e.name, vis.x + TILE_SIZE / 2, uiY - 2);

            // Couleur selon la rareté
            ctx.fillStyle = e.rarityColor || "#ffffff";
            ctx.fillText(e.name, vis.x + TILE_SIZE / 2, uiY - 2);
          }
        }
      });

      // 6. Particules
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      // 7. Textes Flottants (Dégâts, XP, etc.)
      floatingTexts.forEach((t) => {
        ctx.font = `bold 10px ${FONT}`;
        ctx.fillStyle = t.color;
        ctx.textAlign = "center";

        ctx.shadowColor = "#000";
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillText(t.text, t.x, t.y);
      });

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
