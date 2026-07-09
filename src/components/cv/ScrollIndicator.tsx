import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SECTIONS = [
  { id: "top", label: "Intro" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "journey", label: "Journey" },
  { id: "projects", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

/**
 * Minimalist scroll indicator fixed to the bottom-right. Shows the current
 * section index vs total (e.g. "02 / 06") and the section label.
 */
export function ScrollIndicator() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observers: IntersectionObserver[] = [];
    const visible = new Map<string, number>();

    SECTIONS.forEach((s, idx) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visible.set(s.id, entry.intersectionRatio);
          }
          let bestIdx = 0;
          let bestRatio = 0;
          SECTIONS.forEach((sec, i) => {
            const r = visible.get(sec.id) ?? 0;
            if (r > bestRatio) {
              bestRatio = r;
              bestIdx = i;
            }
          });
          setActive(bestIdx);
        },
        { threshold: [0, 0.15, 0.35, 0.6, 0.85, 1] },
      );
      io.observe(el);
      observers.push(io);
      // silence unused
      void idx;
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const total = SECTIONS.length.toString().padStart(2, "0");
  const current = (active + 1).toString().padStart(2, "0");
  const label = SECTIONS[active]?.label ?? "";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-5 right-5 z-40 hidden select-none items-center gap-3 md:flex"
    >
      <div className="h-px w-10 bg-foreground/20" />
      <div className="flex flex-col items-end leading-none">
        <span className="text-[10px] font-medium tabular-nums tracking-[0.2em] text-foreground/70">
          {current}
          <span className="text-foreground/30"> / {total}</span>
        </span>
        <div className="mt-1.5 h-3 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={label}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
