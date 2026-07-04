import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { profileQuery } from "@/lib/cv-queries";
import { SectionHeader } from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

export function Skills() {
  const { lang } = useApp();
  const fallback = dict[lang].skills;
  const { data: p } = useQuery(profileQuery);
  const isEs = lang === "es";
  const eyebrow = (isEs ? p?.skills_eyebrow_es : p?.skills_eyebrow_en) || fallback.eyebrow;
  const title = (isEs ? p?.skills_title_es : p?.skills_title_en) || fallback.title;
  const t = { eyebrow, title, groups: fallback.groups };
  const keys = Object.keys(t.groups) as Array<keyof typeof t.groups>;
  const [active, setActive] = useState<keyof typeof t.groups>(keys[0]);

  return (
    <section className="bg-surface px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />


        <div className="mb-10 flex flex-wrap gap-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                active === k ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active === k && (
                <motion.span
                  layoutId="skill-pill"
                  transition={{ duration: 0.5, ease }}
                  className="absolute inset-0 rounded-full bg-foreground"
                />
              )}
              <span className="relative">{t.groups[k].label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="flex flex-wrap gap-3"
          >
            {t.groups[active].items.map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: i * 0.03 }}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm text-foreground"
              >
                {item}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
