import { StoreApi } from "zustand";
import { GameStore } from "../../types";
import { Particle } from "@/types/game";

type SetState = StoreApi<GameStore>["setState"];
type GetState = StoreApi<GameStore>["getState"];

export const performAttackAction = (
  set: SetState,
  get: GetState,
  type: "light" | "heavy"
) => {
  const {
    player,
    map,
    triggerAttackAnim,
    addProjectile,
    enemies,
    screenShake,
  } = get();
  const now = Date.now();

  // Arme par défaut robuste
  const weapon = player.equipment.weapon || {
    id: "default_weapon",
    weaponType: "sword",
    name: "Lame rouillée",
    type: "weapon",
    spriteKey: "SWORD",
    stats: { attack: 5 },
  };

  const weaponType = (weapon as any).weaponType || "sword";

  // Vitesse d'attaque selon l'arme
  let speedMod = 1.0;
  if (weaponType === "dagger") speedMod = 0.6;
  if (weaponType === "axe") speedMod = 1.4;

  const baseCooldown = type === "heavy" ? 900 : 400;
  if (
    player.lastAttackTime &&
    now - player.lastAttackTime < baseCooldown * speedMod
  )
    return;

  // Calcul position ciblée
  let tx = player.position.x;
  let ty = player.position.y;
  const dir = player.direction;
  if (dir === "up") ty--;
  if (dir === "down") ty++;
  if (dir === "left") tx--;
  if (dir === "right") tx++;

  triggerAttackAnim(player.position.x, player.position.y, dir, type);

  if (type === "heavy") set({ screenShake: Math.min(screenShake + 2, 5) });

  // Calculs Dégâts de base
  let baseDmg = player.stats.attack;
  if (type === "heavy") baseDmg *= 1.8;
  let dmg = Math.floor(baseDmg);

  const isCrit = Math.random() < (player.stats.critChance || 0.1);
  if (isCrit) dmg = Math.floor(dmg * 2.0);

  // --- LOGIQUE DISTANCE ---
  const isRanged = ["bow", "pistol", "staff", "wand"].includes(weaponType);

  if (isRanged) {
    let targetX = tx;
    let targetY = ty;
    // Visée à travers les murs (max 15 cases)
    for (let i = 0; i < 15; i++) {
      if (map[Math.round(targetY)]?.[Math.round(targetX)]?.type === "wall")
        break;
      if (dir === "up") targetY--;
      if (dir === "down") targetY++;
      if (dir === "left") targetX--;
      if (dir === "right") targetX++;
    }

    const spawnProj = (
      offsetX: number,
      offsetY: number,
      angleOffset: number,
      extra: any
    ) => {
      const angle =
        Math.atan2(targetY - player.position.y, targetX - player.position.x) +
        angleOffset;
      const finalTx = player.position.x + Math.cos(angle) * 15;
      const finalTy = player.position.y + Math.sin(angle) * 15;

      addProjectile({
        id: `p_${now}_${Math.random()}`,
        startX: player.position.x + offsetX,
        startY: player.position.y + offsetY,
        targetX: finalTx,
        targetY: finalTy,
        damage: dmg,
        color: weaponType === "staff" ? "#3b82f6" : "#fbbf24",
        progress: 0,
        speed: 0.4,
        trail: [],
        projectileType: weaponType === "staff" ? "spell" : "arrow",
        isEnemy: false,
        critChance: isCrit ? 1 : 0,
        knockback: type === "heavy" ? 0.5 : 0.2,
        ...extra,
      });
    };

    if (weapon.name.toLowerCase().includes("multi")) {
      spawnProj(0, 0, -0.15, {});
      spawnProj(0, 0, 0.15, {});
    } else {
      spawnProj(0, 0, 0, { piercing: type === "heavy" ? 99 : 0 });
    }
  }
  // --- LOGIQUE MÊLÉE ---
  else {
    const range = weaponType === "spear" ? 2.5 : 1.8;
    const hitBox = type === "heavy" ? range + 0.5 : range;

    const hitEnemies = enemies.filter(
      (e) =>
        !e.isDead &&
        e.type !== "rubble" &&
        !["gold", "potion", "item", "chest"].includes(e.type) &&
        Math.abs(e.position.x - tx) < hitBox &&
        Math.abs(e.position.y - ty) < hitBox
    );

    if (hitEnemies.length > 0) {
      // MISE À JOUR ATOMIQUE DU STATE
      set((s) => {
        const newTexts = [...s.floatingTexts];
        let maxShake = s.screenShake;
        let maxStop = s.hitStop;

        const newEnemies = s.enemies.map((e) => {
          // Est-ce que cet ennemi est touché ?
          const hitTarget = hitEnemies.find((h) => h.id === e.id);
          if (hitTarget) {
            // 1. Calcul Dégâts Nets (Dégâts - Défense)
            const defense = e.stats.defense || 0;
            const armorPen = player.stats.armorPen || 0;
            const effectiveDefense = Math.max(0, defense - armorPen);
            const finalDmg = Math.max(0, dmg - effectiveDefense);

            // 2. Feedback Visuel
            if (finalDmg > 0) {
              // Touche réussie
              newTexts.push({
                id: Math.random(),
                x: e.position.x,
                y: e.position.y - 0.5,
                text: isCrit ? `CRIT ${finalDmg}!` : `${finalDmg}`,
                color: isCrit ? "#fbbf24" : "#ef4444",
                life: 1.0,
                isCrit: isCrit,
              });
              maxShake = Math.max(maxShake, isCrit ? 10 : 4);
              maxStop = Math.max(maxStop, isCrit ? 150 : 60);
            } else {
              // BLOQUÉ (Pas de chiffre, juste un texte gris discret)
              newTexts.push({
                id: Math.random(),
                x: e.position.x,
                y: e.position.y - 0.5,
                text: "BLOQUÉ",
                color: "#9ca3af",
                life: 0.8,
                isCrit: false,
              });
              maxStop = Math.max(maxStop, 20); // Tout petit freeze pour l'impact
            }

            // 3. Physique (Recul)
            const angle = Math.atan2(
              e.position.y - player.position.y,
              e.position.x - player.position.x
            );
            const kbForce = type === "heavy" ? 1.5 : 0.5;

            // 4. Retourne l'ennemi mis à jour
            return {
              ...e,
              knockbackX: Math.cos(angle) * kbForce,
              knockbackY: Math.sin(angle) * kbForce,
              stats: { ...e.stats, hp: Math.max(0, e.stats.hp - finalDmg) },
              isDead: e.stats.hp - finalDmg <= 0,
            };
          }
          return e;
        });

        return {
          enemies: newEnemies,
          floatingTexts: newTexts,
          screenShake: maxShake,
          hitStop: maxStop,
        };
      });
    }
  }
  set({ player: { ...player, lastAttackTime: now } });
};

export const castSpellAction = (
  set: SetState,
  get: GetState,
  index: number
) => {
  const { player, addProjectile, triggerAttackAnim } = get();
  const spellId = player.equippedSpells[index];
  if (!spellId) return;

  const spell = player.spells.find((s: any) => s.id === spellId);
  if (!spell || spell.currentCooldown > 0 || player.stats.mana < spell.cost)
    return;

  // Cooldown & Mana
  const newSpells = player.spells.map((s: any) =>
    s.id === spellId ? { ...s, currentCooldown: s.cooldown } : s
  );
  set((s) => ({
    player: {
      ...s.player,
      stats: {
        ...s.player.stats,
        mana: s.player.stats.mana - spell.cost,
      },
      spells: newSpells,
    },
    screenShake: 2,
  }));

  triggerAttackAnim(
    player.position.x,
    player.position.y,
    player.direction,
    "cast"
  );

  const dir = player.direction;
  const angle =
    dir === "up"
      ? -Math.PI / 2
      : dir === "down"
      ? Math.PI / 2
      : dir === "left"
      ? Math.PI
      : 0;

  // Logique Sorts
  if (spell.id === "fireball") {
    addProjectile({
      id: `spell_${Math.random()}`,
      startX: player.position.x,
      startY: player.position.y,
      targetX: player.position.x + Math.cos(angle) * 12,
      targetY: player.position.y + Math.sin(angle) * 12,
      damage: 50 + (player.stats.spellPower || 0) * 3,
      color: "#f97316",
      progress: 0,
      speed: 0.25,
      isEnemy: false,
      projectileType: "fireball",
      explodeOnHit: true,
      radius: 3.5,
      knockback: 0.5,
      trail: [],
    });
  } else if (spell.id === "ice_shard") {
    for (let i = -1; i <= 1; i++) {
      addProjectile({
        id: `spell_${Math.random()}`,
        startX: player.position.x,
        startY: player.position.y,
        targetX: player.position.x + Math.cos(angle + i * 0.2) * 10,
        targetY: player.position.y + Math.sin(angle + i * 0.2) * 10,
        damage: 25,
        color: "#0ea5e9",
        progress: 0,
        speed: 0.4,
        isEnemy: false,
        projectileType: "arrow",
        piercing: 2,
        statusEffect: "freeze",
        knockback: 0.1,
        trail: [],
      });
    }
  } else if (spell.effect === "heal") {
    const heal = 50 + player.stats.wisdom * 2;
    set((s) => ({
      player: {
        ...s.player,
        stats: {
          ...s.player.stats,
          hp: Math.min(s.player.stats.maxHp, s.player.stats.hp + heal),
        },
      },
      floatingTexts: [
        ...s.floatingTexts,
        {
          id: Math.random(),
          x: player.position.x,
          y: player.position.y - 1,
          text: `SOIN +${heal}`,
          color: "#22c55e",
          life: 1.5,
          isCrit: false,
        },
      ],
      particles: [
        ...s.particles,
        ...Array.from({ length: 20 }, () => ({
          x: player.position.x + (Math.random() - 0.5),
          y: player.position.y + (Math.random() - 0.5),
          vx: 0,
          vy: -0.05,
          life: 1,
          color: "#22c55e",
          size: 3,
        })),
      ],
    }));
  }
};
