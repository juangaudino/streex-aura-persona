import { motion } from "motion/react";
import { useMemo } from "react";

export function HighwayBackdrop() {
  // Precompute car light trails with deterministic randomness
  const trails = useMemo(() => {
    const out: Array<{
      side: "left" | "right";
      lane: number;
      duration: number;
      delay: number;
      hue: string;
    }> = [];
    for (let i = 0; i < 9; i++) {
      const side = i % 2 === 0 ? "left" : "right";
      out.push({
        side,
        lane: (i % 3) * 0.05,
        duration: 6 + (i % 4) * 1.4,
        delay: i * 0.9,
        hue: side === "left" ? "255, 200, 120" : "255, 90, 90",
      });
    }
    return out;
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      {/* Sky gradient — deep night with a magenta haze on the horizon */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.05 0.02 270) 0%, oklch(0.08 0.06 300) 55%, oklch(0.12 0.10 340) 68%, oklch(0.06 0.04 280) 78%, oklch(0.02 0.01 260) 100%)",
        }}
      />

      {/* Distant city silhouette */}
      <svg
        className="absolute left-0 right-0"
        style={{ top: "62%", height: "8%", width: "100%" }}
        preserveAspectRatio="none"
        viewBox="0 0 1200 60"
      >
        <path
          d="M0,60 L0,40 L40,40 L40,25 L80,25 L80,35 L120,35 L120,15 L160,15 L160,30 L200,30 L200,20 L240,20 L240,40 L300,40 L300,10 L340,10 L340,28 L400,28 L400,35 L460,35 L460,18 L520,18 L520,32 L580,32 L580,22 L640,22 L640,40 L700,40 L700,15 L760,15 L760,30 L820,30 L820,25 L900,25 L900,38 L960,38 L960,20 L1020,20 L1020,32 L1080,32 L1080,26 L1140,26 L1140,40 L1200,40 L1200,60 Z"
          fill="oklch(0.04 0.01 260)"
          opacity="0.9"
        />
      </svg>

      {/* Tiny window lights on the skyline */}
      <div className="absolute left-0 right-0" style={{ top: "64%", height: "6%" }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full"
            style={{
              left: `${(i * 2.7) % 100}%`,
              top: `${((i * 13) % 60) + 10}%`,
              background: i % 3 === 0 ? "rgb(255, 200, 120)" : "rgb(255, 230, 180)",
              boxShadow: "0 0 4px rgba(255,200,120,0.8)",
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>

      {/* Road perspective */}
      <svg
        className="absolute inset-x-0 bottom-0"
        style={{ height: "45%", width: "100%" }}
        preserveAspectRatio="none"
        viewBox="0 0 1200 400"
      >
        <defs>
          <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.08 0.02 280)" />
            <stop offset="100%" stopColor="oklch(0.02 0.005 260)" />
          </linearGradient>
          <linearGradient id="lane" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,220,150,0)" />
            <stop offset="100%" stopColor="rgba(255,220,150,0.9)" />
          </linearGradient>
        </defs>
        {/* Asphalt */}
        <path d="M0,400 L550,0 L650,0 L1200,400 Z" fill="url(#road)" />
        {/* Center dashed line — animated via CSS below with viewBox coords */}
        <g stroke="url(#lane)" strokeWidth="4" strokeDasharray="18 32" strokeLinecap="round">
          <line x1="600" y1="0" x2="600" y2="400">
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-200"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </line>
        </g>
        {/* Side lane lines */}
        <line
          x1="560"
          y1="0"
          x2="200"
          y2="400"
          stroke="rgba(255,180,80,0.35)"
          strokeWidth="1"
        />
        <line
          x1="640"
          y1="0"
          x2="1000"
          y2="400"
          stroke="rgba(255,180,80,0.35)"
          strokeWidth="1"
        />
      </svg>

      {/* Car light trails */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] overflow-hidden">
        {trails.map((tr, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: tr.side === "left" ? "50%" : "50%",
              width: "3px",
              height: "10px",
              background: `rgb(${tr.hue})`,
              boxShadow: `0 0 12px 2px rgba(${tr.hue}, 0.9), 0 0 40px 6px rgba(${tr.hue}, 0.4)`,
              filter: "blur(0.5px)",
            }}
            initial={{ y: 0, x: 0, opacity: 0, scale: 0.3 }}
            animate={{
              y: ["0%", "100%"],
              x: tr.side === "left" ? ["-2%", "-40%"] : ["2%", "40%"],
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1, 1.4],
            }}
            transition={{
              duration: tr.duration,
              delay: tr.delay,
              repeat: Infinity,
              ease: "easeIn",
            }}
          />
        ))}
      </div>

      {/* Fog/haze near horizon */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "60%",
          height: "12%",
          background:
            "linear-gradient(to bottom, transparent, oklch(0.12 0.08 320 / 0.35), transparent)",
          filter: "blur(20px)",
        }}
      />
    </div>
  );
}
