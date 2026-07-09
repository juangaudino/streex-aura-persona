import { useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/hooks/use-theme";
import { marketsQuery, profileQuery, type MarketRow } from "@/lib/cv-queries";
import { Reveal, SectionHeader } from "./Reveal";

// SVG canvas
const W = 900;
const H = 600;

// Geographic bounding box that covers Salt Lake City (north/west) down to
// Buenos Aires / São Paulo (south/east). Simple equirectangular projection —
// good enough for a stylized route map.
const LAT_MAX = 48; // north
const LAT_MIN = -40; // south
const LNG_MIN = -120; // west
const LNG_MAX = -34; // east

function project(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;
  return { x, y };
}

const ease = [0.16, 1, 0.3, 1] as const;

export function Journey() {
  const { lang } = useApp();
  const isEs = lang === "es";
  const { data: markets } = useQuery(marketsQuery);
  const { data: p } = useQuery(profileQuery);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [hovered, setHovered] = useState<string | null>(null);

  const eyebrow = (isEs ? p?.journey_eyebrow_es : p?.journey_eyebrow_en) || "Journey";
  const title =
    (isEs ? p?.journey_title_es : p?.journey_title_en) ||
    (isEs ? "De LATAM a Estados Unidos" : "From LATAM to the U.S.");
  const body =
    (isEs ? p?.journey_body_es : p?.journey_body_en) ||
    (isEs
      ? "Mercados donde planifiqué y activé campañas OOH/DOOH."
      : "Markets where I planned and activated OOH/DOOH campaigns.");

  const points = useMemo(() => {
    const rows: MarketRow[] = markets ?? [];
    return rows.map((m) => ({ ...m, ...project(m.lat, m.lng) }));
  }, [markets]);

  // Path: connect points in sort_order, ending on the home market (last visually).
  const pathD = useMemo(() => {
    if (!points.length) return "";
    const nonHome = points.filter((p) => !p.is_home);
    const home = points.filter((p) => p.is_home);
    const ordered = [...nonHome, ...home];
    return ordered
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(" ");
  }, [points]);

  return (
    <section id="journey" className="px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={title} />

        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-4 md:col-start-1">
            <Reveal>
              <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">{body}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="mt-10 space-y-3">
                {points.map((m) => {
                  const active = hovered === m.id;
                  return (
                    <li
                      key={m.id}
                      onMouseEnter={() => setHovered(m.id)}
                      onMouseLeave={() => setHovered(null)}
                      className={`flex items-baseline justify-between gap-4 border-b border-border py-2 text-sm transition-colors ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${
                            m.is_home ? "bg-accent" : "bg-foreground"
                          }`}
                        />
                        <span className="font-medium">{m.city}</span>
                        <span className="text-xs text-muted-foreground/70">{m.country}</span>
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground/80">
                        {m.year_from ?? ""}
                        {m.year_to ? `–${m.year_to}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>

          <div ref={ref} className="md:col-span-8 md:col-start-5">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-4 md:p-6">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="h-auto w-full"
                  role="img"
                  aria-label={title}
                >
                  <defs>
                    <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="color-mix(in oklab, var(--accent) 22%, transparent)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="color-mix(in oklab, var(--border) 60%, transparent)"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>

                  <rect width={W} height={H} fill="url(#mapGrid)" />
                  <rect width={W} height={H} fill="url(#mapGlow)" />

                  {/* Journey line */}
                  {pathD && (
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="color-mix(in oklab, var(--accent) 85%, transparent)"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeDasharray="4 6"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                      transition={{ duration: 2.4, ease, delay: 0.4 }}
                    />
                  )}

                  {/* Market points */}
                  {points.map((m, i) => {
                    const isActive = hovered === m.id;
                    return (
                      <g key={m.id} onMouseEnter={() => setHovered(m.id)} onMouseLeave={() => setHovered(null)}>
                        {/* Pulse ring */}
                        <motion.circle
                          cx={m.x}
                          cy={m.y}
                          r={4}
                          fill="none"
                          stroke={m.is_home ? "var(--accent)" : "currentColor"}
                          strokeWidth={1}
                          className={m.is_home ? "" : "text-foreground"}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={
                            inView
                              ? { scale: [1, 3.2, 1], opacity: [0.6, 0, 0.6] }
                              : { scale: 0, opacity: 0 }
                          }
                          transition={{
                            duration: 2.6,
                            ease: "easeOut",
                            repeat: Infinity,
                            delay: 0.6 + i * 0.15,
                          }}
                          style={{ transformOrigin: `${m.x}px ${m.y}px` }}
                        />
                        <motion.circle
                          cx={m.x}
                          cy={m.y}
                          r={isActive ? 6 : 4}
                          fill={m.is_home ? "var(--accent)" : "currentColor"}
                          className={m.is_home ? "" : "text-foreground"}
                          initial={{ scale: 0 }}
                          animate={inView ? { scale: 1 } : { scale: 0 }}
                          transition={{ duration: 0.5, ease, delay: 0.5 + i * 0.12 }}
                          style={{
                            cursor: "pointer",
                            filter: isActive
                              ? "drop-shadow(0 0 8px color-mix(in oklab, var(--accent) 80%, transparent))"
                              : "none",
                          }}
                        />
                        {/* Label */}
                        <motion.text
                          x={m.x + 10}
                          y={m.y + 4}
                          fontSize={11}
                          fill="currentColor"
                          className="pointer-events-none fill-foreground"
                          initial={{ opacity: 0 }}
                          animate={inView ? { opacity: isActive || m.is_home ? 1 : 0.65 } : { opacity: 0 }}
                          transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                          style={{ fontFamily: "inherit", fontWeight: m.is_home ? 600 : 400 }}
                        >
                          {m.city}
                        </motion.text>
                      </g>
                    );
                  })}
                </svg>

                {hovered && (
                  <HoverCard
                    market={points.find((m) => m.id === hovered)!}
                    isEs={isEs}
                  />
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function HoverCard({
  market,
  isEs,
}: {
  market: MarketRow & { x: number; y: number };
  isEs: boolean;
}) {
  const note = isEs ? market.note_es : market.note_en;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-xl border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur"
    >
      <p className="text-xs font-medium text-foreground">
        {market.city}
        <span className="ml-1.5 text-muted-foreground">· {market.country}</span>
      </p>
      {(market.year_from || market.year_to) && (
        <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
          {market.year_from}
          {market.year_to ? `–${market.year_to}` : ""}
          {market.is_home ? (isEs ? " · Base actual" : " · Home base") : ""}
        </p>
      )}
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </motion.div>
  );
}
