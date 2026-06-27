import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { Reveal, SectionHeader } from "./Reveal";

export function Experience() {
  const { lang } = useApp();
  const t = dict[lang].experience;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 30%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="experience" className="bg-surface px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />

        <div ref={ref} className="relative mx-auto max-w-4xl">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <motion.div
            style={{ scaleY: lineScale, transformOrigin: "top" }}
            className="absolute left-2 top-0 bottom-0 w-px bg-foreground md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-16 md:space-y-24">
            {t.items.map((item, i) => (
              <Reveal key={item.company + i} delay={0.05}>
                <div className="relative grid grid-cols-[auto_1fr] gap-6 md:grid-cols-2 md:gap-12">
                  <div className="absolute left-2 top-2 -translate-x-1/2 md:left-1/2">
                    <div className="h-3 w-3 rounded-full bg-foreground ring-4 ring-background" />
                  </div>

                  <div className={`col-start-2 md:col-start-1 ${i % 2 === 1 ? "md:col-start-2 md:pl-12" : "md:pr-12 md:text-right"}`}>
                    <p className="text-xs tabular-nums text-muted-foreground">{item.period}</p>
                    <h3 className="text-display mt-2 text-2xl md:text-3xl">{item.role}</h3>
                    <p className="mt-1 text-base text-muted-foreground">{item.company}</p>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {item.summary}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
