import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react";
import { X, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/hooks/use-theme";
import type { ProjectRow } from "@/lib/cv-queries";
import {
  readMetrics,
  readGallery,
  type ProjectMetric,
  type ProjectGalleryItem,
} from "@/lib/cv-queries";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = {
  project: ProjectRow | null;
  layoutId?: string;
  onClose: () => void;
};

export function CaseStudyModal({ project, layoutId, onClose }: Props) {
  const { lang } = useApp();
  const isEs = lang === "es";
  const [lightbox, setLightbox] = useState<ProjectGalleryItem | null>(null);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose, lightbox]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] overflow-y-auto bg-background"
          onClick={onClose}
        >
          <motion.div
            layoutId={layoutId}
            onClick={(e) => e.stopPropagation()}
            className="relative min-h-screen"
            transition={{ duration: 0.7, ease }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close case study"
              className="fixed right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition hover:bg-secondary md:right-10 md:top-10"
            >
              <X className="h-4 w-4" />
            </button>

            <CaseStudyContent project={project} isEs={isEs} onOpenImage={setLightbox} />
          </motion.div>

          <AnimatePresence>
            {lightbox && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/90 p-6"
                onClick={() => setLightbox(null)}
              >
                <motion.img
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  src={lightbox.url}
                  alt={(isEs ? lightbox.caption_es : lightbox.caption_en) || ""}
                  className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CaseStudyContent({
  project,
  isEs,
  onOpenImage,
}: {
  project: ProjectRow;
  isEs: boolean;
  onOpenImage: (g: ProjectGalleryItem) => void;
}) {
  const title = (isEs ? project.name_es : project.name_en) || project.name_es || project.name_en;
  const desc = (isEs ? project.desc_es : project.desc_en) || project.desc_es || project.desc_en;
  const challenge = isEs ? project.challenge_es : project.challenge_en;
  const approach = isEs ? project.approach_es : project.approach_en;
  const outcome = isEs ? project.outcome_es : project.outcome_en;
  const metrics = readMetrics(project.metrics);
  const gallery = readGallery(project.gallery);
  const verticals = project.verticals ?? [];

  const blocks: Array<{ label: string; body: string }> = [];
  if (challenge) blocks.push({ label: isEs ? "El desafío" : "The challenge", body: challenge });
  if (approach) blocks.push({ label: isEs ? "La estrategia" : "The approach", body: approach });
  if (outcome) blocks.push({ label: isEs ? "El resultado" : "The outcome", body: outcome });

  return (
    <div className="mx-auto max-w-6xl px-6 pb-32 pt-20 md:px-10 md:pt-28">
      {/* Hero */}
      <div className="mb-16 md:mb-24">
        <p className="text-eyebrow mb-5">
          {project.stack || (isEs ? "Caso" : "Case")}
          {project.year ? ` · ${project.year}` : ""}
        </p>
        <h1 className="text-display text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
          {title}
        </h1>
        {desc && <p className="mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">{desc}</p>}
        <div className="mt-8 flex flex-wrap gap-2">
          {project.client && (
            <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              {isEs ? "Cliente" : "Client"}: {project.client}
            </span>
          )}
          {verticals.map((v) => (
            <span
              key={v}
              className="rounded-full bg-secondary px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground"
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Cover image */}
      {project.image_url && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="mb-16 overflow-hidden rounded-3xl bg-surface md:mb-24"
        >
          <img src={project.image_url} alt={title} className="h-auto w-full object-cover" />
        </motion.div>
      )}

      {/* Metrics */}
      {metrics.length > 0 && (
        <div className="mb-16 grid grid-cols-2 gap-6 border-y border-border py-12 md:mb-24 md:grid-cols-4 md:gap-8">
          {metrics.map((m, i) => (
            <MetricCounter key={i} metric={m} isEs={isEs} delay={i * 0.1} />
          ))}
        </div>
      )}

      {/* Narrative blocks */}
      {blocks.length > 0 && (
        <div className="mb-16 grid grid-cols-1 gap-10 md:mb-24 md:grid-cols-3 md:gap-12">
          {blocks.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}
            >
              <p className="text-eyebrow mb-4">{`0${i + 1} · ${b.label}`}</p>
              <p className="whitespace-pre-line text-base leading-relaxed text-foreground md:text-lg">
                {b.body}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="mb-16 md:mb-24">
          <p className="text-eyebrow mb-6">{isEs ? "Galería" : "Gallery"}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {gallery.map((g, i) => {
              const spanBig = i % 5 === 0;
              return (
                <motion.button
                  key={g.path || g.url + i}
                  type="button"
                  onClick={() => onOpenImage(g)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, ease, delay: (i % 6) * 0.05 }}
                  className={`group relative overflow-hidden rounded-2xl bg-surface ${spanBig ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}
                >
                  <img
                    src={g.url}
                    alt={(isEs ? g.caption_es : g.caption_en) || ""}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {((isEs ? g.caption_es : g.caption_en) || "") && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-4 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
                      {isEs ? g.caption_es : g.caption_en}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* External link */}
      {project.link && project.link !== "#" && (
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:bg-secondary"
        >
          {isEs ? "Ver más" : "View more"} <ArrowUpRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function MetricCounter({
  metric,
  isEs,
  delay,
}: {
  metric: ProjectMetric;
  isEs: boolean;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const numeric = Number(metric.value.replace(/[^0-9.-]/g, ""));
  const isNumeric = Number.isFinite(numeric) && metric.value.trim() !== "";
  const rounded = useTransform(mv, (v) => {
    if (!isNumeric) return metric.value;
    const decimals = metric.value.includes(".") ? 1 : 0;
    return v.toFixed(decimals);
  });
  const [display, setDisplay] = useState<string>(isNumeric ? "0" : metric.value);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(String(v)));
    return () => unsub();
  }, [rounded]);

  useEffect(() => {
    if (!inView || !isNumeric) return;
    const controls = animate(mv, numeric, { duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, mv, numeric, isNumeric, delay]);

  return (
    <div ref={ref}>
      <p className="text-display text-4xl leading-none md:text-6xl">
        {metric.prefix}
        {display}
        {metric.suffix}
      </p>
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
        {isEs ? metric.label_es : metric.label_en}
      </p>
    </div>
  );
}
