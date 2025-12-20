import { RefObject, useCallback, useEffect, useRef } from "react";

/**
 * Hook pour gérer les secousses d'écran (Screen Shake)
 * @param containerRef Référence de l'élément HTML à faire trembler
 * @param externalShake Valeur de shake provenant du store (optionnel)
 */
export const useShake = (
  containerRef: RefObject<HTMLDivElement | null>,
  externalShake: number = 0
) => {
  const shakeAmount = useRef(0);

  // Met à jour la valeur de shake locale si celle du store change
  useEffect(() => {
    if (externalShake > 0) {
      shakeAmount.current = Math.max(shakeAmount.current, externalShake);
    }
  }, [externalShake]);

  // Boucle d'animation dédiée au shake
  useEffect(() => {
    let frameId: number;

    const animate = () => {
      // CORRECTION : Vérification de sécurité pour éviter le crash "undefined"
      if (containerRef && containerRef.current) {
        if (shakeAmount.current > 0) {
          // CORRECTION : Plafonnement de la valeur physique du shake DOM (Max 20px)
          const safeAmount = Math.min(shakeAmount.current, 20);

          const dx = (Math.random() - 0.5) * safeAmount * 2;
          const dy = (Math.random() - 0.5) * safeAmount * 2;
          containerRef.current.style.transform = `translate(${dx}px, ${dy}px)`;

          // Amortissement (Decay)
          shakeAmount.current *= 0.9;
          if (shakeAmount.current < 0.5) shakeAmount.current = 0;
        } else {
          // Reset propre uniquement si nécessaire pour éviter de surcharger le DOM
          if (containerRef.current.style.transform !== "none") {
            containerRef.current.style.transform = "none";
          }
        }
      }
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [containerRef]);

  // Fonction pour déclencher un shake manuellement (ex: Dash)
  const triggerShake = useCallback((amount: number) => {
    shakeAmount.current = Math.max(shakeAmount.current, amount);
  }, []);

  return triggerShake;
};
