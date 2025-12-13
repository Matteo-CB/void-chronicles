import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { Entity } from "@/types/game";
import { generateLoot } from "@/lib/data/items";

export const createCombatSlice: StateCreator<GameStore, [], [], any> = (
  set,
  get
) => ({
  processEnemyTurn: () => {
    const { enemies, player, map, turn, addEffects, addLog, screenShake } =
      get();
    let currentHp = player.stats.hp;
    let shake = screenShake;

    const activeEnemies = enemies.map((enemy: Entity) => {
      if (!enemy.isHostile || enemy.stats.hp <= 0) return enemy;
      const newMana = Math.min(enemy.stats.maxMana, enemy.stats.mana + 5);
      const enemyWithMana = {
        ...enemy,
        stats: { ...enemy.stats, mana: newMana },
      };
      const dist =
        Math.abs(player.position.x - enemy.position.x) +
        Math.abs(player.position.y - enemy.position.y);
      const behavior = enemy.aiBehavior || "aggressive";

      // --- SORTS ENNEMIS ---
      if (
        (behavior === "caster" || enemy.isBoss) &&
        enemy.spells &&
        enemy.spells.length > 0
      ) {
        const spell =
          enemy.spells[Math.floor(Math.random() * enemy.spells.length)];
        if (enemyWithMana.stats.mana >= spell.cost && dist <= spell.range) {
          addEffects(
            player.position.x,
            player.position.y,
            spell.color,
            20,
            spell.name,
            spell.color
          );
          addLog(`${enemy.name} lance ${spell.name} !`);
          const dmg = Math.max(0, (spell.damage || 0) - player.stats.defense);
          if (spell.damage) {
            currentHp -= dmg;
            addEffects(
              player.position.x,
              player.position.y,
              "#ef4444",
              10,
              `-${dmg}`,
              "#fff"
            );
            shake = Math.max(shake, 15);
          }
          return {
            ...enemyWithMana,
            stats: {
              ...enemyWithMana.stats,
              mana: enemyWithMana.stats.mana - spell.cost,
            },
          };
        }
      }

      let weaponRange = 1;
      if (enemy.equipment?.weapon?.range)
        weaponRange = enemy.equipment.weapon.range;

      // --- COMPORTEMENT ARCHER (Fuite/Positionnement) ---
      if (behavior === "archer") {
        if (dist < 3) {
          const dx = enemy.position.x - player.position.x;
          const dy = enemy.position.y - player.position.y;
          let nx = enemy.position.x + (dx > 0 ? 1 : -1);
          let ny = enemy.position.y + (dy > 0 ? 1 : -1);
          if (map[ny]?.[nx]?.type !== "wall") {
            return { ...enemyWithMana, position: { x: nx, y: ny } };
          }
        }
      }

      // --- ATTAQUE AU CORPS A CORPS ---
      if (dist <= weaponRange) {
        let rawDmg = Math.max(1, enemy.stats.attack - player.stats.defense);
        addEffects(
          player.position.x,
          player.position.y,
          "#ef4444",
          5,
          `-${rawDmg}`,
          "#fff"
        );

        // Log d'attaque détaillé
        const attackName =
          enemy.name.includes("Rat") || enemy.name.includes("Loup")
            ? "mord"
            : "frappe";
        addLog(`${enemy.name} vous ${attackName} (${rawDmg} Dégâts)`);

        currentHp -= rawDmg;
        shake = Math.max(shake, 5);
        return enemyWithMana;
      }

      // --- DEPLACEMENT ---
      let dx = 0;
      let dy = 0;
      if (player.position.x > enemy.position.x) dx = 1;
      else if (player.position.x < enemy.position.x) dx = -1;
      if (player.position.y > enemy.position.y) dy = 1;
      else if (player.position.y < enemy.position.y) dy = -1;

      let nextX = enemy.position.x + dx;
      let nextY = enemy.position.y;
      const isBlocked =
        map[nextY][nextX].type === "wall" ||
        enemies.some((e) => e.position.x === nextX && e.position.y === nextY);
      if (isBlocked) {
        nextX = enemy.position.x;
        nextY = enemy.position.y + dy;
      }
      const finalCheck =
        map[nextY][nextX].type === "wall" ||
        enemies.some((e) => e.position.x === nextX && e.position.y === nextY) ||
        (nextX === player.position.x && nextY === player.position.y);
      if (!finalCheck)
        return { ...enemyWithMana, position: { x: nextX, y: nextY } };
      return enemyWithMana;
    });

    if (currentHp <= 0)
      set({ gameState: "gameover", currentDialogue: "VOUS AVEZ PÉRI." });

    set((state) => ({
      enemies: activeEnemies,
      turn: turn + 1,
      player: {
        ...state.player,
        stats: { ...state.player.stats, hp: currentHp },
      },
      screenShake: shake,
    }));
  },

  castSpell: (index: number) => {
    const {
      player,
      enemies,
      addEffects,
      processEnemyTurn,
      addLog,
      addItem,
      dungeonLevel,
    } = get();
    if (index < 0 || index >= player.spells.length) return;
    const spell = player.spells[index];
    if (spell.currentCooldown > 0) {
      addLog("Sort en recharge !");
      return;
    }
    if (player.stats.mana < spell.cost) {
      addLog("Mana insuffisant !");
      return;
    }
    const newMana = player.stats.mana - spell.cost;
    const newSpells = [...player.spells];
    newSpells[index] = { ...spell, currentCooldown: spell.cooldown };
    set({
      player: {
        ...player,
        stats: { ...player.stats, mana: newMana },
        spells: newSpells,
      },
    });

    let newEnemies = [...enemies];
    let xpGained = 0;

    if (spell.effect === "heal") {
      const heal = 50 + player.level * 5;
      const newHp = Math.min(player.stats.maxHp, player.stats.hp + heal);
      set((s) => ({
        player: { ...s.player, stats: { ...s.player.stats, hp: newHp } },
      }));
      addEffects(
        player.position.x,
        player.position.y,
        "#22c55e",
        30,
        `+${heal}`,
        "#22c55e"
      );
    } else if (spell.effect === "buff") {
      addEffects(
        player.position.x,
        player.position.y,
        spell.color,
        30,
        "BOOST",
        spell.color
      );
    } else {
      enemies.forEach((e, idx) => {
        if (!e.isHostile) return;
        const dist =
          Math.abs(player.position.x - e.position.x) +
          Math.abs(player.position.y - e.position.y);
        if (dist <= spell.range) {
          const dmg = (spell.damage || 10) + player.level * 2;
          const newHp = e.stats.hp - dmg;
          addEffects(
            e.position.x,
            e.position.y,
            spell.color,
            15,
            `-${dmg}`,
            "#fff"
          );
          if (newHp <= 0) {
            newEnemies[idx] = { ...e, stats: { ...e.stats, hp: 0 } };
            xpGained += e.stats.xpValue;
            addLog(`${e.name} anéanti.`);
            if (Math.random() > 0.8) addItem(generateLoot(dungeonLevel));
          } else {
            newEnemies[idx] = { ...e, stats: { ...e.stats, hp: newHp } };
          }
        }
      });

      // --- VERIFICATION VICTOIRE (Via Sort) ---
      const remainingHostiles = newEnemies.filter(
        (e) => e.isHostile && e.stats.hp > 0
      );

      if (remainingHostiles.length === 0) {
        const stairsIdx = newEnemies.findIndex((e) => e.type === "stairs");
        if (stairsIdx !== -1 && newEnemies[stairsIdx].isHidden) {
          newEnemies[stairsIdx] = {
            ...newEnemies[stairsIdx],
            isHidden: false,
          };
          set({ screenShake: 40 });
          addEffects(
            newEnemies[stairsIdx].position.x,
            newEnemies[stairsIdx].position.y,
            "#FCD34D",
            150,
            "DÉLIVRANCE !",
            "#FFF"
          );
          addLog("La zone est purifiée par votre magie !");
        }
      }
      // ----------------------------------------

      newEnemies = newEnemies.filter(
        (e) => e.stats.hp > 0 || e.type !== "enemy"
      );
      set({ enemies: newEnemies, screenShake: 15 });
    }

    if (xpGained > 0) {
      const p = get().player;
      let newXp = p.xp + xpGained;
      if (newXp >= p.xpToNext) {
        set((s) => ({
          player: {
            ...s.player,
            level: s.player.level + 1,
            xp: 0,
            xpToNext: Math.floor(s.player.xpToNext * 1.5),
            stats: {
              ...s.player.stats,
              maxHp: s.player.stats.maxHp + 20,
              maxMana: s.player.stats.maxMana + 10,
              hp: s.player.stats.maxHp + 20,
              mana: s.player.stats.maxMana + 10,
            },
          },
        }));
        addLog("NIVEAU SUPÉRIEUR !");
      } else {
        set((s) => ({ player: { ...s.player, xp: newXp } }));
      }
    }
    processEnemyTurn();
  },
});
