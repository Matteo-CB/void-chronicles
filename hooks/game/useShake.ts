import { useCallback, useRef } from "react";

export const useShake = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shakeIntensity = useRef<number>(0);

  const triggerShake = useCallback((amount: number) => {
    shakeIntensity.current = Math.min(shakeIntensity.current + amount, 15);
  }, []);

  const updateShake = useCallback(() => {
    if (shakeIntensity.current > 0) {
      shakeIntensity.current = shakeIntensity.current * 0.9;
      if (shakeIntensity.current < 0.5) shakeIntensity.current = 0;
    }
    if (containerRef.current) {
      if (shakeIntensity.current > 0) {
        const x = (Math.random() - 0.5) * shakeIntensity.current;
        const y = (Math.random() - 0.5) * shakeIntensity.current;
        containerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      } else {
        containerRef.current.style.transform = "none";
      }
    }
  }, []);

  return { containerRef, triggerShake, updateShake };
};
