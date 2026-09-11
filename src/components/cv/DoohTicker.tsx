import { motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface DoohTickerProps {
  items: string[];
  speed?: number; // seconds per full loop (lower = faster)
}

export function DoohTicker({ items, speed = 40 }: DoohTickerProps) {
  const line = items.join("     ◆     ");

  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [reduced, setReduced] = useState(false);

  const x = useMotionValue(0);

  // Measure a single copy width (track contains 2 copies)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setTrackWidth(el.scrollWidth / 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [line]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Continuous loop — no pause, no interaction
  useAnimationFrame((_, delta) => {
    if (reduced || trackWidth === 0) return;
    const pxPerMs = trackWidth / (speed * 1000);
    let next = x.get() - pxPerMs * delta;
    if (next <= -trackWidth) next += trackWidth;
    x.set(next);
  });

  // Fade edges via mask
  const maskImage = "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)";

  // Subtle progress-based glow
  const glowOpacity = useTransform(x, (latestX) => {
    const progress = trackWidth ? Math.abs(latestX) / trackWidth : 0;
    return Math.min(0.18, 0.08 + progress * 0.06);
  });

  return (
    <div
      role="marquee"
      aria-label="Métricas destacadas"
      className="relative overflow-hidden border-y"
      style={{
        borderColor: "rgba(255, 180, 80, 0.15)",
        background:
          "linear-gradient(to bottom, oklch(0.02 0.005 260), oklch(0.05 0.02 280), oklch(0.02 0.005 260))",
        WebkitMaskImage: maskImage,
        maskImage,
      }}
    >
      {/* Scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.35) 3px, rgba(0,0,0,0) 4px)",
          mixBlendMode: "multiply",
        }}
      />
      {/* Glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: glowOpacity,
          background:
            "radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,180,80,1), transparent 70%)",
        }}
      />

      <motion.div
        ref={trackRef}
        style={{ x }}
        className="flex whitespace-nowrap py-3 will-change-transform"
      >
        {[0, 1].map((k) => (
          <motion.span
            key={k}
            className="shrink-0 pr-12 font-mono text-[0.8rem] sm:text-sm uppercase tracking-[0.32em]"
            style={{
              color: "rgb(255, 200, 130)",
              textShadow: "0 0 6px rgba(255, 180, 80, 0.45), 0 0 18px rgba(255, 180, 80, 0.2)",
            }}
          >
            {line} ◆ {line} ◆{" "}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
