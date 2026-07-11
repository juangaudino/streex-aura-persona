import { motion } from "motion/react";

interface DoohTickerProps {
  items: string[];
  speed?: number; // seconds per full loop
}

export function DoohTicker({ items, speed = 40 }: DoohTickerProps) {
  const line = items.join("     ◆     ");
  // Duplicate the content so the marquee loops seamlessly
  return (
    <div
      className="relative overflow-hidden border-y"
      style={{
        borderColor: "rgba(255, 180, 80, 0.15)",
        background: "linear-gradient(to bottom, oklch(0.02 0.005 260), oklch(0.05 0.02 280), oklch(0.02 0.005 260))",
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,180,80,0.08), transparent 70%)",
        }}
      />
      <motion.div
        className="flex whitespace-nowrap py-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {[0, 1].map((k) => (
          <span
            key={k}
            className="shrink-0 pr-12 font-mono text-xs tracking-[0.35em] uppercase"
            style={{
              color: "rgb(255, 190, 110)",
              textShadow: "0 0 8px rgba(255, 180, 80, 0.6), 0 0 20px rgba(255, 180, 80, 0.25)",
            }}
          >
            {line}     ◆     {line}     ◆    {" "}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
