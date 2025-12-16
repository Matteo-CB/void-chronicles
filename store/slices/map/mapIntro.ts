import { StoreApi } from "zustand";
import { GameStore } from "../../types";
import { Entity, Particle } from "@/types/game"; // CORRECTION : Import de Particle

type SetState = StoreApi<GameStore>["setState"];
type GetState = StoreApi<GameStore>["getState"];

export async function triggerIntroSequence(set: SetState, get: GetState) {
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { addSpeechBubble, removeSpeechBubble } = get();

  await wait(1000);
  addSpeechBubble({
    id: "intro1",
    targetId: "hero",
    text: "Où suis-je... ?",
    color: "#fff",
    duration: 3000,
    createdAt: Date.now(),
  });

  await wait(3500);
  addSpeechBubble({
    id: "intro2",
    targetId: "hero",
    text: "Ce silence est... lourd.",
    color: "#fff",
    duration: 3000,
    createdAt: Date.now(),
  });

  await wait(3500);
  set({ screenShake: 10 });
  addSpeechBubble({
    id: "intro3",
    targetId: "hero",
    text: "BIENVENUE DANS LE NÉANT",
    color: "#ef4444",
    duration: 4000, // Dure 4s
    createdAt: Date.now(),
  });

  await wait(4500); // On attend 4.5s (plus que la durée du texte)
  removeSpeechBubble("intro3"); // Nettoyage forcé pour éviter l'overlap

  // Faire apparaitre l'escalier
  const { player, map, enemies } = get();
  let sx = player.position.x;
  let sy = player.position.y + 3;
  if (
    sy >= map.length ||
    map[Math.round(sy)]?.[Math.round(sx)]?.type === "wall"
  )
    sy = player.position.y - 3;
  if (sy < 0 || map[Math.round(sy)]?.[Math.round(sx)]?.type === "wall") {
    sx = player.position.x + 3;
    sy = player.position.y;
  }

  const stairs: Entity = {
    id: "stairs_intro",
    type: "stairs",
    name: "Sortie Révélée",
    position: { x: sx, y: sy },
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

  set({ enemies: [...enemies, stairs] });

  // CORRECTION : Typage explicite du tableau de particules
  const particles: Particle[] = [];
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: sx + (Math.random() - 0.5),
      y: sy + (Math.random() - 0.5),
      color: "#fbbf24",
      life: 1.0,
      size: Math.random() * 4,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    });
  }
  set((s) => ({
    particles: [...s.particles, ...particles],
    screenShake: 5,
  }));

  await wait(1000);
  addSpeechBubble({
    id: "intro4",
    targetId: "hero",
    text: "Une sortie ?",
    color: "#fbbf24",
    duration: 3000,
    createdAt: Date.now(),
  });
}
