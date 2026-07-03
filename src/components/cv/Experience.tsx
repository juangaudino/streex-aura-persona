import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, GraduationCap, Paperclip, FileText } from "lucide-react";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { timelineQuery, readAttachments, type TimelineItem, type TimelineAttachment } from "@/lib/cv-queries";
import { Reveal, SectionHeader } from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

type Item = {
  key: string;
  kind: "work" | "study";
  role: string;
  company: string;
  period: string;
  summary: string;
  attachments: TimelineAttachment[];
};

export function Experience() {
  const { lang } = useApp();
  const t = dict[lang].experience;
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const { data: dbItems } = useQuery(timelineQuery);

  const items: Item[] = useMemo(() => {
    if (dbItems && dbItems.length) {
      return dbItems.map((it: TimelineItem) => ({
        key: it.id,
        kind: it.kind,
        role: lang === "es" ? it.title_es : it.title_en,
        company: it.org,
        period: lang === "es" ? it.period_label_es : it.period_label_en,
        summary: lang === "es" ? it.summary_es : it.summary_en,
      }));
    }
    // Fallback to static dictionary while data loads or if empty.
    return t.items.map((it, i) => ({
      key: `${it.company}-${i}`,
      kind: it.kind,
      role: it.role,
      company: it.company,
      period: it.period,
      summary: it.summary,
    }));
  }, [dbItems, lang, t.items]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 30%"],
  });
  const lineScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1]),
    { stiffness: 80, damping: 24, mass: 0.4 },
  );
  const glowTop = useTransform(lineScale, (v) => `${v * 100}%`);

  return (
    <section id="experience" className="bg-surface px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />

        <div className="mx-auto hidden max-w-5xl grid-cols-[1fr_auto_1fr] items-end gap-8 pb-8 md:grid">
          <div className="flex items-center justify-end gap-2 text-right">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-eyebrow">{t.laneWork}</span>
          </div>
          <div className="w-3" />
          <div className="flex items-center gap-2">
            <span className="text-eyebrow">{t.laneStudy}</span>
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        <div
          ref={ref}
          className="relative mx-auto max-w-5xl"
          onMouseLeave={() => setHovered(null)}
        >
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <motion.div
            style={{ scaleY: lineScale, transformOrigin: "top" }}
            className="absolute left-2 top-0 bottom-0 w-px bg-foreground md:left-1/2 md:-translate-x-1/2"
          />
          <motion.div
            aria-hidden
            style={{ top: glowTop }}
            className="pointer-events-none absolute left-2 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
          >
            <div className="h-16 w-16 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_45%,transparent)_0%,transparent_70%)] blur-md" />
          </motion.div>

          <div className="space-y-14 md:space-y-20">
            {items.map((item, i) => {
              const isStudy = item.kind === "study";
              const isHovered = hovered === i;
              const dim = hovered !== null && !isHovered;
              const Icon = isStudy ? GraduationCap : Briefcase;

              return (
                <Reveal key={item.key} delay={0.05}>
                  <motion.div
                    onMouseEnter={() => setHovered(i)}
                    animate={{ opacity: dim ? 0.3 : 1 }}
                    transition={{ duration: 0.4, ease }}
                    className="group relative grid grid-cols-[auto_1fr] gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8"
                  >
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
                      animate={{ x: isHovered ? (isStudy ? 6 : -6) : 0 }}
                      transition={{ duration: 0.4, ease }}
                      className={
                        isStudy
                          ? "col-start-2 md:col-start-3 md:pl-10"
                          : "col-start-2 md:col-start-1 md:pr-10 md:text-right"
                      }
                    >
                      <div className={`flex items-center gap-2 ${isStudy ? "" : "md:justify-end"}`}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                            isStudy
                              ? "border-accent/40 text-accent"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          {isStudy ? t.tagStudy : t.tagWork}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">{item.period}</span>
                      </div>

                      <h3 className="text-display mt-3 text-2xl md:text-3xl">
                        <span className="relative inline-block">
                          {item.role}
                          <motion.span
                            aria-hidden
                            initial={false}
                            animate={{ scaleX: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.5, ease }}
                            style={{ transformOrigin: isStudy ? "left" : "right" }}
                            className="absolute -bottom-1 left-0 right-0 h-px bg-foreground/60"
                          />
                        </span>
                      </h3>
                      <p className="mt-1 text-base text-muted-foreground">{item.company}</p>
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
