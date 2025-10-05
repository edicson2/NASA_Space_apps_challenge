import React, { useEffect, useMemo, useRef, useState } from "react";

type Dot = {
  id: string;
  x: number; // percent 0..100
  y: number; // percent 0..100
  src: string; // icon path (svg/png)
};

type Props = {
  dots: Dot[];
  glowRadius?: number; // px radius for proximity detection
  onHover?: (dotId: string | null) => void;
};

export default function InteractiveDots({
  dots,
  glowRadius = 60,
  onHover,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // find closest dot within glowRadius (in px)
      let closest: { id: string; dist: number } | null = null;
      for (const d of dots) {
        const dx = (d.x / 100) * rect.width - mx;
        const dy = (d.y / 100) * rect.height - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= glowRadius && (closest === null || dist < closest.dist)) {
          closest = { id: d.id, dist };
        }
      }

      const newId = closest ? closest.id : null;
      if (newId !== hovered) {
        setHovered(newId);
        onHover?.(newId);
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [dots, glowRadius, hovered, onHover]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      {dots.map((d) => {
        const isHover = hovered === d.id;
        return (
          <img
            key={d.id}
            src={d.src}
            alt={d.id}
            draggable={false}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: "translate(-50%, -50%)",
              width: isHover ? 36 : 22,
              height: isHover ? 36 : 22,
              transition: "all 180ms ease",
              filter: isHover
                ? "drop-shadow(0 6px 14px rgba(11,61,145,0.8)) saturate(1.2)"
                : "grayscale(0.0) opacity(0.95)",
              cursor: "none",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </div>
  );
}
