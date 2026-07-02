import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { Reveal, SectionHeader } from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

export function Experience() {
  const { lang } = useApp();
  const t = dict[lang].experience;
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 30%"],
  });
  const lineScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1]),
    { stiffness: 80, damping: 24, mass: 0.4 },
  );

  return (
    <section id="experience" className="bg-surface px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />

        <div
          ref={ref}
          className="relative mx-auto max-w-4xl"
          onMouseLeave={() => setHovered(null)}
        >
          {/* Track */}
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          {/* Progress line */}
          <motion.div
            style={{ scaleY: lineScale, transformOrigin: "top" }}
            className="absolute left-2 top-0 bottom-0 w-px bg-foreground md:left-1/2 md:-translate-x-1/2"
          />
          {/* Traveling glow */}
          <motion.div
            aria-hidden
            style={{ top: useTransform(lineScale, (v) => `${v * 100}%`) }}
            className="pointer-events-none absolute left-2 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
          >
            <div className="h-16 w-16 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_45%,transparent)_0%,transparent_70%)] blur-md" />
          </motion.div>

          <div className="space-y-16 md:space-y-24">
            {t.items.map((item, i) => {
              const isHovered = hovered === i;
              const dim = hovered !== null && !isHovered;
              const leftSide = i % 2 === 0;
              return (
                <Reveal key={item.company + i} delay={0.05}>
                  <motion.div
                    onMouseEnter={() => setHovered(i)}
                    animate={{ opacity: dim ? 0.35 : 1 }}
                    transition={{ duration: 0.4, ease }}
                    className="group relative grid grid-cols-[auto_1fr] gap-6 md:grid-cols-2 md:gap-12"
                  >
                    {/* Node */}
                    <div className="absolute left-2 top-2 -translate-x-1/2 md:left-1/2">
                      <motion.div
                        animate={{
                          scale: isHovered ? 1.6 : 1,
                          boxShadow: isHovered
                            ? "0 0 0 6px color-mix(in oklab, var(--accent) 25%, transparent), 0 0 24px color-mix(in oklab, var(--accent) 55%, transparent)"
                            : "0 0 0 0px transparent",
                        }}
                        transition={{ duration: 0.35, ease }}
                        className="h-3 w-3 rounded-full bg-foreground ring-4 ring-background"
                      />
                    </div>

                    <motion.div
                      animate={{ x: isHovered ? (leftSide ? -6 : 6) : 0 }}
                      transition={{ duration: 0.4, ease }}
                      className={`col-start-2 md:col-start-1 ${
                        leftSide ? "md:pr-12 md:text-right" : "md:col-start-2 md:pl-12"
                      }`}
                    >
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {item.period}
                      </p>
                      <h3 className="text-display mt-2 text-2xl md:text-3xl">
                        <span className="relative inline-block">
                          {item.role}
                          <motion.span
                            aria-hidden
                            initial={false}
                            animate={{ scaleX: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.5, ease }}
                            style={{
                              transformOrigin: leftSide ? "right" : "left",
                            }}
                            className="absolute -bottom-1 left-0 right-0 h-px bg-foreground/60"
                          />
                        </span>
                      </h3>
                      <p className="mt-1 text-base text-muted-foreground">
                        {item.company}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                        {item.summary}
                      </p>
                    </motion.div>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
