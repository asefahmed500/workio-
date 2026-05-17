interface CanvasBackgroundProps {
  position: { x: number; y: number };
  scale: number;
}

export function CanvasBackground({ position, scale }: CanvasBackgroundProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none transition-all duration-75"
      style={{
        backgroundImage: `radial-gradient(circle, currentColor 0.5px, transparent 0.5px)`,
        backgroundSize: `${20 * scale}px ${20 * scale}px`,
        backgroundPosition: `${position.x}px ${position.y}px`,
        opacity: 0.15
      }}
    />
  );
}

