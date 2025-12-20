interface FlashLayerProps {
  opacity: number;
}

export default function FlashLayer({ opacity }: FlashLayerProps) {
  // PROTECTION : Si opacity est NaN, indéfini ou <= 0, on ne rend rien.
  if (!opacity || isNaN(opacity) || opacity <= 0) return null;

  return (
    <div
      className="absolute inset-0 bg-red-500 pointer-events-none mix-blend-overlay transition-opacity duration-75"
      style={{ opacity }}
    ></div>
  );
}
