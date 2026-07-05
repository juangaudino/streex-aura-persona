import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { profileQuery, skillsQuery } from "@/lib/cv-queries";
import { SectionHeader } from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

type Group = { key: string; label: string; items: string[] };

export function Skills() {
  const { lang } = useApp();
  const fallback = dict[lang].skills;
  const { data: p } = useQuery(profileQuery);
  const { data: rows } = useQuery(skillsQuery);
  const isEs = lang === "es";
  const eyebrow = (isEs ? p?.skills_eyebrow_es : p?.skills_eyebrow_en) || fallback.eyebrow;
  const title = (isEs ? p?.skills_title_es : p?.skills_title_en) || fallback.title;

  const groups: Group[] = useMemo(() => {
    if (rows && rows.length) {
      const map = new Map<string, Group>();
      for (const r of rows) {
        const label = (isEs ? r.category_label_es : r.category_label_en) || r.category;
        if (!map.has(r.category)) map.set(r.category, { key: r.category, label, items: [] });
        map.get(r.category)!.items.push(r.name);
      }
      return Array.from(map.values());
    }
    return (Object.keys(fallback.groups) as Array<keyof typeof fallback.groups>).map((k) => ({
      key: k as string,
      label: fallback.groups[k].label,
      items: [...fallback.groups[k].items],
    }));
  }, [rows, isEs, fallback.groups]);

  const [active, setActive] = useState<string>(groups[0]?.key ?? "");
  useEffect(() => {
    if (!groups.find((g) => g.key === active) && groups[0]) setActive(groups[0].key);
  }, [groups, active]);
  const activeGroup = groups.find((g) => g.key === active) ?? groups[0];
  const t = { eyebrow, title };

  return (
    <section className="bg-surface px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />


        <div className="mb-10 flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g.key}
              onClick={() => setActive(g.key)}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                active === g.key ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active === g.key && (
                <motion.span
                  layoutId="skill-pill"
                  transition={{ duration: 0.5, ease }}
                  className="absolute inset-0 rounded-full bg-foreground"
                />
              )}
              <span className="relative">{g.label}</span>
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
            {activeGroup?.items.map((item, i) => (
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
