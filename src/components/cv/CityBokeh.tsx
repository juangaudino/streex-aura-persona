import { motion } from "motion/react";
import { useMemo } from "react";

interface Dot {
  x: number;
  y: number;
  size: number;
  hue: string;
  opacity: number;
  duration: number;
  delay: number;
  dx: number;
  dy: number;
}

export function CityBokeh({ count = 36 }: { count?: number }) {
  const dots = useMemo<Dot[]>(() => {
    const hues = [
      "255, 190, 110", // amber
      "255, 230, 190", // warm white
      "255, 120, 180", // neon pink
      "140, 220, 255", // cool cyan
    ];
    // Deterministic pseudo-random distribution
    const out: Dot[] = [];
    for (let i = 0; i < count; i++) {
      const seed = (i * 9301 + 49297) % 233280;
      const r = seed / 233280;
      const r2 = ((i * 7331 + 12345) % 233280) / 233280;
      const r3 = ((i * 4177 + 6197) % 233280) / 233280;
      out.push({
        x: r * 100,
        y: r2 * 100,
        size: 12 + r3 * 60,
        hue: hues[i % hues.length],
        opacity: 0.05 + (r3 * 0.08),
        duration: 14 + r * 12,
        delay: r2 * 6,
        dx: (r - 0.5) * 40,
        dy: (r2 - 0.5) * 30,
      });
    }
    return out;
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: `rgb(${d.hue})`,
            opacity: d.opacity,
            filter: "blur(24px)",
          }}
          animate={{ x: [0, d.dx, 0], y: [0, d.dy, 0] }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
