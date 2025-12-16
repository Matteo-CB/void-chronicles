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
  const { player, map, triggerAttackAnim, addProjectile, enemies } = get();
  const now = Date.now();
  const weapon = player.equipment.weapon || {
    id: "default_weapon",
    weaponType: "sword",
    name: "Épée rouillée",
    type: "weapon",
    spriteKey: "SWORD",
    stats: { attack: 5 },
  };

  const weaponType = (weapon as any).weaponType || "sword";

  let speedMod = 1.0;
  if (weaponType === "dagger") speedMod = 0.6;
  if (weaponType === "axe") speedMod = 1.4;

  const baseCooldown = type === "heavy" ? 900 : 450;
  if (
    player.lastAttackTime &&
    now - player.lastAttackTime < baseCooldown * speedMod
  )
    return;

  let tx = player.position.x;
  let ty = player.position.y;
  const dir = player.direction;
  if (dir === "up") ty--;
  if (dir === "down") ty++;
  if (dir === "left") tx--;
  if (dir === "right") tx++;

  triggerAttackAnim(player.position.x, player.position.y, dir, type);

  const isRanged = ["bow", "pistol", "staff", "wand"].includes(weaponType);

  let baseDmg = player.stats.attack;
  if (type === "heavy") baseDmg *= 1.5;
  let dmg = Math.floor(baseDmg);

  const isCrit = Math.random() < (player.stats.critChance || 0.1);
  if (isCrit) dmg = Math.floor(dmg * 1.5);

  if (isRanged) {
    let targetX = tx;
    let targetY = ty;
    for (let i = 0; i < 12; i++) {
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
      const finalTx = player.position.x + Math.cos(angle) * 12;
      const finalTy = player.position.y + Math.sin(angle) * 12;

      addProjectile({
        id: `p_${now}_${Math.random()}`,
        startX: player.position.x + offsetX,
        startY: player.position.y + offsetY,
        targetX: finalTx,
        targetY: finalTy,
        damage: dmg,
        color: weaponType === "staff" ? "#3b82f6" : "#fbbf24",
        progress: 0,
        speed: 0.3,
        trail: [],
        projectileType: weaponType === "staff" ? "spell" : "arrow",
        isEnemy: false,
        critChance: isCrit ? 1 : 0,
        knockback: type === "heavy" ? 0.3 : 0.1,
        ...extra,
      });
    };

    if (weapon.name.toLowerCase().includes("multi")) {
      spawnProj(0, 0, -0.2, {});
      spawnProj(0, 0, 0, {});
      spawnProj(0, 0, 0.2, {});
    } else if (weapon.name.toLowerCase().includes("shotgun")) {
      for (let i = 0; i < 5; i++) {
        spawnProj(0, 0, (Math.random() - 0.5) * 0.8, {
          speed: 0.2 + Math.random() * 0.1,
          trailLength: 3,
        });
      }
    } else {
      spawnProj(0, 0, 0, {
        piercing: type === "heavy" ? 2 : 0,
        bounce: weapon.name.includes("Ricochet") ? 2 : 0,
      });
    }
  } else {
    // Melee
    const range = weaponType === "spear" ? 2.5 : 1.5;
    const hitEnemies = enemies.filter(
      (e) =>
        !e.isDead &&
        e.type !== "rubble" &&
        !["gold", "potion", "item", "chest"].includes(e.type) &&
        Math.abs(e.position.x - tx) < range &&
        Math.abs(e.position.y - ty) < range
    );

    if (hitEnemies.length > 0) {
      set({ screenShake: 5 });

      hitEnemies.forEach((e) => {
        const targetIndex = enemies.findIndex((en) => en.id === e.id);
        if (targetIndex === -1) return;

        const target = enemies[targetIndex];
        const newHp = target.stats.hp - dmg;

        set((s) => ({
          floatingTexts: [
            ...s.floatingTexts,
            {
              id: Math.random(),
              x: target.position.x,
              y: target.position.y,
              text: `-${dmg}`,
              color: isCrit ? "#fbbf24" : "#ef4444",
              life: 1.0,
              isCrit: isCrit,
            },
          ],
        }));

        if (newHp <= 0) {
          const remainingHostiles = enemies.filter(
            (en) => en.id !== target.id && en.isHostile && !en.isDead
          ).length;
          if (remainingHostiles === 0) {
            let stairX = Math.round(player.position.x + 2);
            let stairY = Math.round(player.position.y);
            if (map[stairY]?.[stairX]?.type === "wall") {
              stairX = Math.round(player.position.x);
              stairY = Math.round(player.position.y + 2);
            }

            setTimeout(() => {
              set({ screenShake: 10 });
              setTimeout(() => {
                const stairEntity = {
                  id: "stairs_victory_atk",
                  type: "stairs",
                  name: "Sortie Révélée",
                  position: { x: stairX, y: stairY },
                  spriteKey: "STAIRS",
                  stats: {
                    hp: 1,
                    maxHp: 1,
                    mana: 0,
                    maxMana: 0,
                    attack: 0,
                    defense: 0,
                    speed: 0,
                    xpValue: 0,
                    critChance: 0,
                    critDamage: 0,
                    dodgeChance: 0,
                    lifesteal: 0,
                    armorPen: 0,
                    cooldownReduction: 0,
                    spellPower: 0,
                    strength: 0,
                    endurance: 0,
                    agility: 0,
                    wisdom: 0,
                    willpower: 0,
                    luck: 0,
                    accuracy: 0,
                    arcane: 0,
                  },
                  isHostile: false,
                  visualScale: 1,
                };

                set((s) => ({
                  enemies: [
                    ...s.enemies.filter((en) => en.id !== target.id),
                    stairEntity,
                  ],
                  screenShake: 20,
                }));

                const explosionParts: Particle[] = [];
                for (let i = 0; i < 80; i++) {
                  explosionParts.push({
                    x: stairX + (Math.random() - 0.5),
                    y: stairY + (Math.random() - 0.5),
                    color: "#fbbf24",
                    life: 1.5 + Math.random(),
                    size: Math.random() * 4 + 2,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                  });
                }

                set((s) => ({
                  particles: [...s.particles, ...explosionParts],
                  floatingTexts: [
                    ...s.floatingTexts,
                    {
                      x: stairX,
                      y: stairY - 1,
                      text: "PASSAGE RÉVÉLÉ",
                      color: "#fbbf24",
                      life: 3.0,
                      isCrit: true,
                      id: Math.random(),
                    },
                  ],
                }));
              }, 1500);
            }, 800);
          }
        }
      });

      const updatedEnemies = enemies.map((e) => {
        if (hitEnemies.find((h) => h.id === e.id)) {
          const dead = e.stats.hp - dmg <= 0;
          return {
            ...e,
            stats: { ...e.stats, hp: e.stats.hp - dmg },
            isDead: dead,
          };
        }
        return e;
      });
      set({ enemies: updatedEnemies });
    }
  }
  set({ player: { ...player, lastAttackTime: now } });
};

// --- AJOUT DE LA FONCTION MANQUANTE ---
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

  if (spell.id === "fireball") {
    addProjectile({
      id: `spell_${Math.random()}`,
      startX: player.position.x,
      startY: player.position.y,
      targetX: player.position.x + Math.cos(angle) * 10,
      targetY: player.position.y + Math.sin(angle) * 10,
      damage: 40 + (player.stats.spellPower || 0) * 2,
      color: "#f97316",
      progress: 0,
      speed: 0.2,
      isEnemy: false,
      projectileType: "fireball",
      explodeOnHit: true,
      radius: 3,
      knockback: 0.1,
      trail: [],
    });
  } else if (spell.id === "ice_shard") {
    addProjectile({
      id: `spell_${Math.random()}`,
      startX: player.position.x,
      startY: player.position.y,
      targetX: player.position.x + Math.cos(angle) * 12,
      targetY: player.position.y + Math.sin(angle) * 12,
      damage: 20,
      color: "#0ea5e9",
      progress: 0,
      speed: 0.35,
      isEnemy: false,
      projectileType: "arrow",
      piercing: 3,
      statusEffect: "freeze",
      knockback: 0.05,
      trail: [],
    });
  } else if (spell.effect === "heal") {
    const heal = 40 + player.stats.wisdom * 2;
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
          y: player.position.y,
          text: `+${heal}`,
          color: "#22c55e",
          life: 1.0,
          isCrit: false,
        },
      ],
    }));
  }
};
