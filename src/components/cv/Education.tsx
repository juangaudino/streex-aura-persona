import { motion } from "motion/react";
import { GraduationCap } from "lucide-react";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { Reveal, SectionHeader } from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

export function Education() {
  const { lang } = useApp();
  const t = dict[lang].education;

  return (
    <section id="education" className="px-6 py-32 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />

        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="mb-12 max-w-2xl text-base text-muted-foreground md:text-lg">
              {t.caption}
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {t.items.map((item, i) => (
              <Reveal key={item.school} delay={i * 0.08}>
                <motion.article
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.4, ease }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background/60 p-8 backdrop-blur-sm transition-colors hover:border-foreground/30"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(60% 50% at 80% 0%, color-mix(in oklab, var(--accent) 14%, transparent) 0%, transparent 70%)",
                    }}
                  />

                  <div className="relative flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors group-hover:text-foreground">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {item.period}
                    </span>
                  </div>

                  <h3 className="text-display relative mt-6 text-xl md:text-2xl">
                    {item.degree}
                  </h3>
                  <p className="relative mt-1 text-sm text-foreground/80">
                    {item.school}
                  </p>
                  <p className="relative text-xs text-muted-foreground">
                    {item.place}
                  </p>

                  <p className="relative mt-5 text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
