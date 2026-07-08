import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { profileQuery, projectsQuery, type ProjectRow } from "@/lib/cv-queries";
import { Reveal, SectionHeader } from "./Reveal";
import { CaseStudyModal } from "./CaseStudyModal";

const ease = [0.16, 1, 0.3, 1] as const;

const gradients = [
  "from-blue-500/20 via-purple-500/10 to-pink-500/20",
  "from-amber-500/20 via-orange-500/10 to-red-500/20",
  "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
  "from-violet-500/20 via-fuchsia-500/10 to-rose-500/20",
];

function hasCaseStudy(r: ProjectRow) {
  return !!(
    r.challenge_es || r.challenge_en ||
    r.approach_es || r.approach_en ||
    r.outcome_es || r.outcome_en ||
    (Array.isArray(r.metrics) && r.metrics.length) ||
    (Array.isArray(r.gallery) && r.gallery.length) ||
    r.client || r.year || (r.verticals && r.verticals.length)
  );
}

export function Projects() {
  const { lang } = useApp();
  const fallback = dict[lang].projects;
  const { data: p } = useQuery(profileQuery);
  const { data: rows } = useQuery(projectsQuery);
  const isEs = lang === "es";
  const eyebrow = (isEs ? p?.projects_eyebrow_es : p?.projects_eyebrow_en) || fallback.eyebrow;
  const title = (isEs ? p?.projects_title_es : p?.projects_title_en) || fallback.title;

  const [active, setActive] = useState<ProjectRow | null>(null);

  const dbItems = rows ?? [];

  const items = dbItems.length
    ? dbItems.map((r) => ({
        row: r,
        name: (isEs ? r.name_es : r.name_en) || r.name_es || r.name_en,
        desc: (isEs ? r.desc_es : r.desc_en) || r.desc_es || r.desc_en,
        stack: r.stack,
        link: r.link,
        image_url: r.image_url,
        openable: hasCaseStudy(r),
      }))
    : fallback.items.map((i) => ({
        row: null as ProjectRow | null,
        ...i,
        link: "#",
        image_url: "",
        openable: false,
      }));

  return (
    <section id="projects" className="px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={title} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {items.map((p, i) => {
            const layoutId = p.row ? `case-${p.row.id}` : undefined;
            const commonInner = (
              <>
                <motion.div
                  variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
                  transition={{ duration: 0.8, ease }}
                  className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} bg-cover bg-center`}
                  style={p.image_url ? { backgroundImage: `url(${p.image_url})` } : undefined}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-60" />

                <div className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </div>

                <div className="absolute inset-x-6 bottom-6 text-background mix-blend-difference">
                  <p className="text-xs uppercase tracking-widest opacity-70">
                    {p.stack}
                    {p.row?.year ? ` · ${p.row.year}` : ""}
                  </p>
                  <h3 className="text-display mt-2 text-2xl md:text-3xl">{p.name}</h3>
                  <p className="mt-2 max-w-md text-sm opacity-80">{p.desc}</p>
                  {p.openable && (
                    <p className="mt-3 text-[10px] uppercase tracking-[0.18em] opacity-70">
                      {isEs ? "Ver caso →" : "View case →"}
                    </p>
                  )}
                </div>
              </>
            );

            return (
              <Reveal key={(p.row?.id ?? p.name) + i} delay={i * 0.06}>
                {p.openable && p.row ? (
                  <motion.button
                    type="button"
                    layoutId={layoutId}
                    onClick={() => setActive(p.row)}
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    transition={{ duration: 0.7, ease }}
                    className="group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl bg-surface text-left"
                  >
                    {commonInner}
                  </motion.button>
                ) : (
                  <motion.a
                    href={p.link || "#"}
                    target={p.link && p.link !== "#" ? "_blank" : undefined}
                    rel={p.link && p.link !== "#" ? "noreferrer" : undefined}
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-surface"
                  >
                    {commonInner}
                  </motion.a>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>

      <CaseStudyModal
        project={active}
        layoutId={active ? `case-${active.id}` : undefined}
        onClose={() => setActive(null)}
      />
    </section>
  );
}
