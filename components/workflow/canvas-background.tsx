'use client';

export function CanvasBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(circle, currentColor 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        opacity: 0.1
      }}
    />
  );
}
