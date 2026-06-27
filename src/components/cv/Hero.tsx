import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Download } from "lucide-react";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import portrait from "@/assets/portrait-placeholder.jpg";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const { lang } = useApp();
  const t = dict[lang].hero;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] items-end overflow-hidden pt-32 pb-16 md:pb-24"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:px-10">
        <motion.div style={{ y: textY, opacity }} className="md:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="text-eyebrow mb-6"
          >
            {t.eyebrow}
          </motion.p>

          <h1 className="text-display text-5xl sm:text-7xl md:text-8xl lg:text-[9rem]">
            {t.title.map((line, lineIdx) => (
              <span key={lineIdx} className="block overflow-hidden">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1,
                    ease,
                    delay: 0.15 + lineIdx * 0.08,
                  }}
                  className="inline-block"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.6 }}
            className="mt-8 max-w-md"
          >
            <p className="text-base text-foreground md:text-lg">{t.role}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.location}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a
              href="/cv.pdf"
              download
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
            >
              <Download className="h-4 w-4" />
              {t.cta}
            </a>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {t.ctaAlt}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease, delay: 0.3 }}
          className="relative md:col-span-5"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface">
            <img
              src={portrait}
              alt="Portrait"
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
