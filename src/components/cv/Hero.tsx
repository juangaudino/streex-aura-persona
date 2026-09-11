import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Download } from "lucide-react";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { profileQuery } from "@/lib/cv-queries";
import { MagneticButton } from "./MagneticButton";

import { HighwayBackdrop } from "./HighwayBackdrop";

const portraitLightAsset = "/juan-light.png";
const portraitDarkAsset = "/juan-dark.png";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const { lang, theme } = useApp();
  const fallback = dict[lang].hero;
  const { data: p } = useQuery(profileQuery);
  const isEs = lang === "es";
  const t = {
    eyebrow: (isEs ? p?.hero_eyebrow_es : p?.hero_eyebrow_en) || fallback.eyebrow,
    title: ((isEs ? p?.hero_title_es : p?.hero_title_en) as string[] | undefined)?.length
      ? isEs
        ? p!.hero_title_es
        : p!.hero_title_en
      : [...fallback.title],
    role: (isEs ? p?.hero_role_es : p?.hero_role_en) || fallback.role,
    location: (isEs ? p?.hero_location_es : p?.hero_location_en) || fallback.location,
    cta: (isEs ? p?.hero_cta_es : p?.hero_cta_en) || fallback.cta,
    ctaAlt: (isEs ? p?.hero_cta_alt_es : p?.hero_cta_alt_en) || fallback.ctaAlt,
  };

  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Cursor parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });

  const portraitX = useTransform(sx, (v) => v * 14);
  const portraitYParallax = useTransform(sy, (v) => v * 10);
  const glowX = useTransform(sx, (v) => v * 30);
  const glowY = useTransform(sy, (v) => v * 20);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        mx.set(Math.max(-1, Math.min(1, nx)));
        my.set(Math.max(-1, Math.min(1, ny)));
      });
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my]);

  const matchedPortrait = theme === "dark" ? portraitDarkAsset : portraitLightAsset;

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] items-end overflow-hidden pt-32 pb-16 md:pb-24"
    >
      <HighwayBackdrop />

      {/* Bottom fade into the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 -z-10"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--background))",
        }}
      />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:px-10">
        <motion.div style={{ y: textY, opacity }} className="md:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="text-eyebrow mb-6"
            style={{ color: "rgb(255, 190, 110)" }}
          >
            {t.eyebrow}
          </motion.p>

          <h1 className="text-display text-5xl sm:text-7xl md:text-8xl lg:text-[9rem]">
            {(() => {
              let wordCounter = 0;
              return t.title.map((line, lineIdx) => {
                const words = line.split(" ");
                return (
                  <span key={lineIdx} className="block">
                    {words.map((word, wIdx) => {
                      const idx = wordCounter++;
                      return (
                        <motion.span
                          key={`${lineIdx}-${wIdx}`}
                          initial={{ opacity: 0, filter: "blur(14px)", y: 8 }}
                          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                          transition={{
                            duration: 1.1,
                            ease,
                            delay: 0.2 + idx * 0.12,
                          }}
                          className="inline-block mr-[0.25em] will-change-[filter,opacity,transform]"
                        >
                          {word}
                        </motion.span>
                      );
                    })}
                  </span>
                );
              });
            })()}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.6 }}
            className="mt-8 max-w-md"
          >
            <p className="text-base text-foreground md:text-lg">{t.role}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.location}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <MagneticButton
              href="/cv.pdf"
              download
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
            >
              <Download className="h-4 w-4" />
              {t.cta}
            </MagneticButton>
            <MagneticButton
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {t.ctaAlt}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease, delay: 0.3 }}
          className="relative md:col-span-5"
        >
          {/* Billboard scene */}
          <div className="relative aspect-[4/5]">
            {/* Support posts */}
            <div
              aria-hidden
              className="absolute left-[18%] top-[70%] bottom-0 w-[6px] rounded-sm"
              style={{
                background:
                  "linear-gradient(to right, oklch(0.28 0.01 260), oklch(0.18 0.005 260), oklch(0.10 0.005 260))",
                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
              }}
            />
            <div
              aria-hidden
              className="absolute right-[18%] top-[70%] bottom-0 w-[6px] rounded-sm"
              style={{
                background:
                  "linear-gradient(to right, oklch(0.28 0.01 260), oklch(0.18 0.005 260), oklch(0.10 0.005 260))",
                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
              }}
            />

            {/* Billboard frame */}
            <div className="absolute inset-x-[4%] top-0 h-[72%]">
              {/* Outer metallic frame */}
              <div
                className="absolute inset-0 rounded-[6px]"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.30 0.01 260), oklch(0.14 0.005 260) 40%, oklch(0.20 0.008 260) 60%, oklch(0.10 0.005 260))",
                  padding: "10px",
                  boxShadow:
                    "0 30px 60px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05) inset",
                }}
              >
                {/* Inner poster surface */}
                <div
                  className="relative h-full w-full overflow-hidden rounded-[3px]"
                  style={{
                    background:
                      "linear-gradient(180deg, oklch(0.10 0.02 280), oklch(0.06 0.01 260))",
                  }}
                >
                  {/* Glow behind head */}
                  <motion.div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      x: glowX,
                      y: glowY,
                      background:
                        "radial-gradient(50% 45% at 50% 40%, rgba(255,190,110,0.35) 0%, transparent 70%)",
                      filter: "blur(24px)",
                    }}
                  />

                  <AnimatePresence mode="sync">
                    <motion.img
                      key={theme}
                      src={matchedPortrait}
                      alt="Juan Gaudino"
                      initial={{ opacity: 0, scale: 1.04, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease }}
                      style={{
                        x: portraitX,
                        y: portraitYParallax,
                        WebkitMaskImage:
                          "radial-gradient(ellipse 90% 100% at 50% 42%, #000 55%, rgba(0,0,0,0.85) 78%, rgba(0,0,0,0) 100%)",
                        maskImage:
                          "radial-gradient(ellipse 90% 100% at 50% 42%, #000 55%, rgba(0,0,0,0.85) 78%, rgba(0,0,0,0) 100%)",
                      }}
                      className="absolute inset-0 h-full w-full object-cover object-top will-change-transform"
                    />
                  </AnimatePresence>

                  {/* Subtle vignette on poster */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(80% 100% at 50% 40%, transparent 50%, rgba(0,0,0,0.55))",
                    }}
                  />
                </div>
              </div>

              {/* Top lamp bar */}
              <div
                aria-hidden
                className="absolute -top-3 left-[8%] right-[8%] h-2 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.32 0.01 260), oklch(0.14 0.005 260))",
                }}
              />
              {/* Bulbs */}
              <div
                aria-hidden
                className="absolute -top-4 left-[8%] right-[8%] flex justify-between px-3"
              >
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="block h-2 w-2 rounded-full"
                    style={{
                      background: "rgb(255, 210, 140)",
                      boxShadow:
                        "0 0 10px 3px rgba(255,190,110,0.9), 0 0 24px 8px rgba(255,180,80,0.35)",
                    }}
                    animate={{ opacity: [0.75, 1, 0.85, 1, 0.75] }}
                    transition={{
                      duration: 3 + (i % 3) * 0.7,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Ground shadow */}
            <div
              aria-hidden
              className="absolute inset-x-[10%] bottom-[-4%] h-4 rounded-[50%]"
              style={{
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55), transparent 70%)",
                filter: "blur(6px)",
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
