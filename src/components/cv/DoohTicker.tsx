import { animate, motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface DoohTickerProps {
  items: string[];
  speed?: number; // seconds per full loop (lower = faster)
}

export function DoohTicker({ items, speed = 40 }: DoohTickerProps) {
  const line = items.join("     ◆     ");

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const pausePulse = useMotionValue(0);

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

  // Premium breathing pulse while paused
  useEffect(() => {
    if (!paused || reduced) {
      pausePulse.set(0);
      return;
    }
    const controls = animate(pausePulse, [0, 1, 0], {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut",
    });
    return controls.stop;
  }, [paused, reduced, pausePulse]);

  // Smooth pause/resume via animation frame
  useAnimationFrame((_, delta) => {
    if (paused || reduced || trackWidth === 0) return;
    const pxPerMs = trackWidth / (speed * 1000);
    let next = x.get() - pxPerMs * delta;
    if (next <= -trackWidth) next += trackWidth;
    x.set(next);
  });

  // Fade edges via mask
  const maskImage =
    "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)";

  // Progress-based subtle hue shift on the glow when hovered
  const glowOpacity = useTransform(x, [0, -trackWidth || -1], [0.08, 0.14]);

  return (
    <div
      ref={containerRef}
      role="marquee"
      aria-label="Métricas destacadas"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      className="group relative overflow-hidden border-y outline-none focus-visible:ring-1 focus-visible:ring-[rgba(255,190,110,0.5)]"
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

      {/* Pause indicator */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.3em] uppercase transition-opacity duration-300"
        style={{
          opacity: paused ? 0.7 : 0,
          color: "rgb(255, 190, 110)",
          textShadow: "0 0 8px rgba(255, 180, 80, 0.6)",
        }}
      >
        ▍▍ pause
      </div>

      <motion.div
        ref={trackRef}
        style={{ x }}
        className="flex whitespace-nowrap py-3 will-change-transform"
      >
        {[0, 1].map((k) => (
          <span
            key={k}
            className="shrink-0 pr-12 font-mono text-[0.8rem] sm:text-sm tracking-[0.32em] uppercase transition-[letter-spacing,color] duration-500 group-hover:tracking-[0.38em]"
            style={{
              color: "rgb(255, 200, 130)",
              textShadow:
                "0 0 6px rgba(255, 180, 80, 0.45), 0 0 18px rgba(255, 180, 80, 0.2)",
            }}
          >
            {line}     ◆     {line}     ◆    {" "}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
