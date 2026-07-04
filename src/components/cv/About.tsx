import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { profileQuery } from "@/lib/cv-queries";
import { Reveal, SectionHeader } from "./Reveal";

type Stat = { value: string; label_es?: string; label_en?: string; label?: string };

export function About() {
  const { lang } = useApp();
  const fallback = dict[lang].about;
  const { data: p } = useQuery(profileQuery);
  const isEs = lang === "es";

  const eyebrow = (isEs ? p?.about_eyebrow_es : p?.about_eyebrow_en) || fallback.eyebrow;
  const title = (isEs ? p?.about_title_es : p?.about_title_en) || fallback.title;
  const bodyDb = (isEs ? p?.about_body_es : p?.about_body_en) as string[] | undefined;
  const body = bodyDb && bodyDb.length ? bodyDb : [...fallback.body];

  const statsRaw = (p?.about_stats as unknown as Stat[] | null) ?? null;
  const stats = statsRaw?.length
    ? statsRaw.map((s) => ({
        value: s.value,
        label: (isEs ? s.label_es : s.label_en) || s.label || "",
      }))
    : fallback.stats.map((s) => ({ value: s.value, label: s.label }));

  return (
    <section id="about" className="px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={title} />

        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="space-y-6 md:col-span-7 md:col-start-2">
            {body.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-xl leading-relaxed text-muted-foreground md:text-2xl">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <div className="md:col-span-3 md:col-start-10">
            <div className="grid grid-cols-3 gap-6 md:grid-cols-1 md:gap-10">
              {stats.map((s, i) => (
                <Reveal key={`${s.label}-${i}`} delay={0.2 + i * 0.08}>
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
