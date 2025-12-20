import { StoreApi } from "zustand";
import { GameStore } from "../../types";

type SetState = StoreApi<GameStore>["setState"];
type GetState = StoreApi<GameStore>["getState"];

// --- ACTION D'ATTAQUE (PHYSIQUE / ARME) ---
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
    addEffects,
    spawnParticles,
  } = get();
  const now = Date.now();

  // 1. CONFIGURATION ARME
  const weapon = player.equipment.weapon || {
    id: "default_weapon",
    weaponType: "sword",
    name: "Poings",
    type: "weapon",
    spriteKey: "NONE",
    stats: { attack: 2 },
  };
  const weaponType = (weapon as any).weaponType || "sword";

  // CORRECTIF RANGED : Détection plus robuste
  const isRanged =
    ["bow", "pistol", "staff", "wand", "scepter"].includes(weaponType) ||
    weapon.name.toLowerCase().includes("arc") ||
    weapon.name.toLowerCase().includes("bâton") ||
    weapon.name.toLowerCase().includes("wand");

  // Cooldowns
  let cdMult = 1.0;
  if (weaponType === "dagger") cdMult = 0.5;
  else if (weaponType === "spear") cdMult = 0.8;
  else if (weaponType === "axe") cdMult = 1.2;
  else if (weaponType === "hammer") cdMult = 1.5;
  else if (weaponType === "pistol") cdMult = 0.3;

  const baseCooldown = (type === "heavy" ? 1000 : 400) * cdMult;
  if (player.lastAttackTime && now - player.lastAttackTime < baseCooldown)
    return;

  // Direction
  let dx = 0;
  let dy = 0;
  if (player.direction === "up") dy = -1;
  else if (player.direction === "down") dy = 1;
  else if (player.direction === "left") dx = -1;
  else if (player.direction === "right") dx = 1;
  else dy = 1;

  // 2. CIBLAGE
  let tx =
    Math.round(Number.isFinite(player.position.x) ? player.position.x : 0) + dx;
  let ty =
    Math.round(Number.isFinite(player.position.y) ? player.position.y : 0) + dy;

  if (type === "heavy") {
    let rangeX = player.position.x;
    let rangeY = player.position.y;
    const ATTACK_RANGE = 2;

    for (let i = 1; i <= ATTACK_RANGE; i++) {
      const nextX = Math.round(player.position.x + dx * i);
      const nextY = Math.round(player.position.y + dy * i);

      if (
        nextY < 0 ||
        nextY >= map.length ||
        nextX < 0 ||
        nextX >= map[0].length
      )
        break;
      if (map[nextY]?.[nextX]?.type === "wall") break;

      rangeX = nextX;
      rangeY = nextY;
    }
    tx = rangeX + dx;
    ty = rangeY + dy;

    if (spawnParticles) {
      spawnParticles(
        player.position.x,
        player.position.y,
        "#ffffff",
        5,
        "normal"
      );
    }
  }

  // 3. ANIMATION & SHAKE
  triggerAttackAnim(
    player.position.x,
    player.position.y,
    player.direction,
    isRanged ? "shoot" : type
  );

  const currentShake = Number.isFinite(screenShake) ? screenShake : 0;
  let shakeAmount = type === "heavy" ? 3 : 1;
  if (weaponType === "hammer" || weaponType === "axe") shakeAmount += 2;

  set({ screenShake: Math.min((currentShake || 0) + shakeAmount, 10) });

  // 4. DÉGÂTS (x2)
  let baseDmg = Math.max(1, player.stats.attack);
  baseDmg *= 2.0;

  if (type === "heavy") baseDmg *= 1.8;

  let dmg = Math.floor(baseDmg);
  const isCrit = Math.random() < (player.stats.critChance || 0.1);
  if (isCrit) dmg = Math.floor(dmg * 1.5);

  if (isRanged) {
    // --- DISTANCE ---
    const spawnProj = (angleOffset: number, extra: any = {}) => {
      const angle = Math.atan2(dy, dx) + angleOffset;
      const tX = player.position.x + Math.cos(angle) * 10;
      const tY = player.position.y + Math.sin(angle) * 10;

      let projType = "arrow";
      let projColor = "#fbbf24";
      let speed = 0.4;
      let radius = 0.2;

      if (
        weaponType === "staff" ||
        weaponType === "wand" ||
        weaponType === "scepter"
      ) {
        projType = "fireball";
        const element = (weapon as any).element || "fire";
        if (element === "ice") projColor = "#3b82f6";
        else if (element === "void") projColor = "#a855f7";
        else projColor = "#f97316";
        speed = 0.25;
        radius = 0.4;
      } else if (weaponType === "pistol") {
        projType = "bullet";
        projColor = "#94a3b8";
        speed = 0.8;
        radius = 0.15;
      }

      const onHit = (weapon as any).onHitEffect;

      if (Number.isFinite(tX) && Number.isFinite(tY)) {
        addProjectile({
          id: `p_${now}_${Math.random()}`,
          startX: player.position.x,
          startY: player.position.y,
          targetX: tX,
          targetY: tY,
          damage: dmg,
          color: projColor,
          speed: speed,
          projectileType: projType as any,
          isEnemy: false,
          critChance: isCrit ? 1 : 0,
          radius: radius,
          knockback: type === "heavy" ? 1.0 : 0.2,
          ...extra,
          onHitEffect: onHit,
        });
      }
    };

    if (
      weapon.name.toLowerCase().includes("multi") ||
      (weapon as any).multiShot
    ) {
      spawnProj(-0.2);
      spawnProj(0.2);
      if (type === "heavy") spawnProj(0);
    } else {
      spawnProj(0, { piercing: type === "heavy" ? 99 : 0 });
    }
  } else {
    // --- MÊLÉE ---
    let range = 1.5;
    let width = 1.0;

    if (weaponType === "dagger") {
      range = 1.2;
      width = 0.8;
    } else if (weaponType === "spear") {
      range = 2.5;
      width = 0.6;
    } else if (weaponType === "axe" || weaponType === "hammer") {
      range = 1.8;
      width = 2.0;
    } else if (weaponType === "sword") {
      range = 1.8;
      width = 1.2;
    }

    if (type === "heavy") {
      range *= 1.3;
      width *= 1.3;
    }

    const hitEnemies = enemies.filter((e) => {
      // CORRECTION : Protection des objets interactifs (coffres, pnjs, etc.)
      if (
        e.isDead ||
        e.type === "rubble" ||
        e.type === "chest" ||
        e.type === "container" ||
        e.type === "npc" ||
        e.type === "sign"
      )
        return false;

      const relX = e.position.x - player.position.x;
      const relY = e.position.y - player.position.y;
      const distForward = relX * dx + relY * dy;
      const distSide = Math.abs(-relX * dy + relY * dx);
      return distForward > 0 && distForward <= range && distSide <= width / 2;
    });

    if (hitEnemies.length > 0) {
      set((s) => {
        const newTexts = [...s.floatingTexts];
        let maxShake = Number.isFinite(s.screenShake) ? s.screenShake : 0;

        const newEnemies = s.enemies.map((e) => {
          const hitTarget = hitEnemies.find((h) => h.id === e.id);
          if (hitTarget) {
            const defense = e.stats.defense || 0;
            const finalDmg = Math.max(1, dmg - defense);

            newTexts.push({
              id: Math.random(),
              x: e.position.x,
              y: e.position.y - 0.8,
              text: isCrit ? `CRIT ${finalDmg}!` : `${finalDmg}`,
              color: isCrit ? "#fbbf24" : "#ffffff",
              life: 1.0,
              isCrit: isCrit,
            });

            let kbForce = type === "heavy" ? 1.5 : 0.5;
            if (weaponType === "hammer") kbForce *= 2.0;
            if (weaponType === "dagger") kbForce *= 0.5;

            const kx = Number.isFinite(dx * kbForce) ? dx * kbForce : 0;
            const ky = Number.isFinite(dy * kbForce) ? dy * kbForce : 0;

            const onHit = (weapon as any).onHitEffect;
            let statusEffects = e.statusEffects || [];

            return {
              ...e,
              knockbackX: kx,
              knockbackY: ky,
              stats: { ...e.stats, hp: Math.max(0, e.stats.hp - finalDmg) },
              isDead: e.stats.hp - finalDmg <= 0,
              lastHitTime: now,
              statusEffects: statusEffects,
            };
          }
          return e;
        });

        return {
          enemies: newEnemies,
          floatingTexts: newTexts,
          screenShake: Math.min(
            Math.max(maxShake, type === "heavy" ? 4 : 2),
            10
          ),
          hitStop: type === "heavy" ? 100 : 50,
        } as any;
      });

      if (addEffects && hitEnemies.length > 0) {
        addEffects(
          hitEnemies[0].position.x,
          hitEnemies[0].position.y,
          "#ffffff",
          3
        );
      }
    }
  }

  set({ player: { ...player, lastAttackTime: now } });
};

// --- ACTION DE SORT ---
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
    screenShake: 1,
  }));

  triggerAttackAnim(
    player.position.x,
    player.position.y,
    player.direction,
    "cast"
  );

  const angle =
    player.direction === "up"
      ? -Math.PI / 2
      : player.direction === "down"
      ? Math.PI / 2
      : player.direction === "left"
      ? Math.PI
      : 0;

  if (spell.id === "fireball" || spell.effect === "damage") {
    const tX = player.position.x + Math.cos(angle) * 12;
    const tY = player.position.y + Math.sin(angle) * 12;

    if (Number.isFinite(tX) && Number.isFinite(tY)) {
      addProjectile({
        id: `spell_${Math.random()}`,
        startX: player.position.x,
        startY: player.position.y,
        targetX: tX,
        targetY: tY,
        damage: (50 + (player.stats.spellPower || 0) * 3) * 1.5,
        color: spell.id === "ice_shard" ? "#3b82f6" : "#f97316",
        progress: 0,
        speed: 0.25,
        isEnemy: false,
        projectileType: "fireball",
        explodeOnHit: true,
        radius: 3.5,
        knockback: 0.5,
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
        } as any,
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
          gravity: 0,
        })),
      ] as any,
    }));
  }
};
