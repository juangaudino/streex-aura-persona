import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { Reveal, SectionHeader } from "./Reveal";

export function About() {
  const { lang } = useApp();
  const t = dict[lang].about;

  return (
    <section id="about" className="px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />

        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="space-y-6 md:col-span-7 md:col-start-2">
            {t.body.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-xl leading-relaxed text-muted-foreground md:text-2xl">{p}</p>
              </Reveal>
            ))}
          </div>

          <div className="md:col-span-3 md:col-start-10">
            <div className="grid grid-cols-3 gap-6 md:grid-cols-1 md:gap-10">
              {t.stats.map((s, i) => (
                <Reveal key={s.label} delay={0.2 + i * 0.08}>
                  <div>
                    <div className="text-display text-3xl tabular-nums md:text-5xl">{s.value}</div>
                    <div className="mt-2 text-xs text-muted-foreground md:text-sm">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
