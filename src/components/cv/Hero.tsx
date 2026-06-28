import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { ArrowRight, Download } from "lucide-react";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import portraitLightAsset from "@/assets/juan-light.png.asset.json";
import portraitDarkAsset from "@/assets/juan-dark.png.asset.json";


const ease = [0.16, 1, 0.3, 1] as const;


// Mask: soft radial that keeps the face crisp and dissolves the edges
// (especially the bottom + outer rim) into the hero gradient.
const PORTRAIT_MASK =
  "radial-gradient(ellipse 78% 95% at 50% 38%, #000 42%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 92%)";
const PORTRAIT_BOTTOM_FADE =
  "linear-gradient(to bottom, #000 55%, rgba(0,0,0,0.6) 78%, rgba(0,0,0,0) 100%)";

export function Hero() {
  const { lang, theme } = useApp();
  const t = dict[lang].hero;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const matchedPortrait =
    theme === "dark" ? portraitDarkAsset.url : portraitLightAsset.url;

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] items-end overflow-hidden pt-32 pb-16 md:pb-24"
    >
      {/* Hero aurora gradient — sits behind everything, theme-aware */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(60% 70% at 78% 55%, color-mix(in oklab, var(--accent) 22%, transparent) 0%, transparent 60%), radial-gradient(90% 80% at 50% 100%, color-mix(in oklab, var(--foreground) 6%, transparent) 0%, transparent 70%)"
              : "radial-gradient(55% 65% at 78% 50%, color-mix(in oklab, var(--accent) 14%, transparent) 0%, transparent 60%), radial-gradient(90% 80% at 50% 100%, color-mix(in oklab, var(--foreground) 4%, transparent) 0%, transparent 70%)",
        }}
      />
      {/* Bottom fade into the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--background))",
        }}
      />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:px-10">
        <motion.div style={{ y: textY, opacity }} className="md:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="text-eyebrow mb-6"
          >
            {t.eyebrow}
          </motion.p>

          <h1 className="text-display text-5xl sm:text-7xl md:text-8xl lg:text-[9rem]">
            {t.title.map((line, lineIdx) => (
              <span key={lineIdx} className="block overflow-hidden">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1,
                    ease,
                    delay: 0.15 + lineIdx * 0.08,
                  }}
                  className="inline-block"
                >
                  {line}
                </motion.span>
              </span>
            ))}
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
            <a
              href="/cv.pdf"
              download
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
            >
              <Download className="h-4 w-4" />
              {t.cta}
            </a>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {t.ctaAlt}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease, delay: 0.3 }}
          className="relative md:col-span-5"
        >
          <div className="relative aspect-[4/5]">
            {/* Soft accent glow behind the head */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(45% 40% at 50% 35%, color-mix(in oklab, var(--accent) 28%, transparent) 0%, transparent 70%)",
                filter: "blur(28px)",
              }}
            />

            {/* Matched-bg portrait, masked so its edges dissolve into the hero gradient.
                Cross-fades when the user toggles theme. */}
            <AnimatePresence mode="sync">
              <motion.img
                key={theme}
                src={matchedPortrait}
                alt="Juan Gaudino"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease }}
                className="absolute inset-0 h-full w-full object-cover object-top"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(ellipse 85% 95% at 50% 40%, #000 50%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, #000 60%, rgba(0,0,0,0) 100%)",
                  maskImage:
                    "radial-gradient(ellipse 85% 95% at 50% 40%, #000 50%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, #000 60%, rgba(0,0,0,0) 100%)",
                  WebkitMaskComposite: "source-in",
                  maskComposite: "intersect",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
