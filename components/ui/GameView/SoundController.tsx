"use client";

import { useEffect, useRef } from "react";
import useGameStore from "@/store/gameStore";
import { playSfx } from "@/lib/audio/synth";

export default function SoundController() {
  const attackAnims = useGameStore((state: any) => state.attackAnims);
  const prevAttackCount = useRef(0);

  const particles = useGameStore((state: any) => state.particles);
  const prevParticleCount = useRef(0);

  const player = useGameStore((state: any) => state.player);
  const prevLevel = useRef(1);
  const prevPos = useRef({ x: 0, y: 0 });

  // Son d'attaque
  useEffect(() => {
    if (attackAnims.length > prevAttackCount.current) {
      playSfx("hit");
    }
    prevAttackCount.current = attackAnims.length;
  }, [attackAnims]);

  // Son de magie / effets (via particules)
  useEffect(() => {
    // On détecte un pic de particules pour jouer un son magique/explosion
    // C'est une heuristique simple pour éviter de modifier tout le moteur de combat
    if (particles.length > prevParticleCount.current + 2) {
      // Si beaucoup de particules apparaissent d'un coup -> Magie
      playSfx("magic");
    }
    prevParticleCount.current = particles.length;
  }, [particles]);

  // Son de pas
  useEffect(() => {
    if (
      player &&
      (Math.round(player.position.x) !== Math.round(prevPos.current.x) ||
        Math.round(player.position.y) !== Math.round(prevPos.current.y))
    ) {
      // On joue un son de pas léger tous les mouvements
      // Petit délai aléatoire pour le réalisme
      if (Math.random() > 0.3) playSfx("step");
      prevPos.current = { ...player.position };
    }
  }, [player?.position]);

  // Level Up
  useEffect(() => {
    if (player && player.level > prevLevel.current) {
      playSfx("level_up");
      prevLevel.current = player.level;
    }
  }, [player?.level]);

  return null; // Composant invisible
}
