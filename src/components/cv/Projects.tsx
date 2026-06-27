import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";
import { Reveal, SectionHeader } from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

const gradients = [
  "from-blue-500/20 via-purple-500/10 to-pink-500/20",
  "from-amber-500/20 via-orange-500/10 to-red-500/20",
  "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
  "from-violet-500/20 via-fuchsia-500/10 to-rose-500/20",
];

export function Projects() {
  const { lang } = useApp();
  const t = dict[lang].projects;

  return (
    <section id="projects" className="px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {t.items.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06}>
              <motion.a
                href="#"
                whileHover="hover"
                initial="rest"
                animate="rest"
                className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-surface"
              >
                <motion.div
                  variants={{
                    rest: { scale: 1 },
                    hover: { scale: 1.04 },
                  }}
                  transition={{ duration: 0.8, ease }}
                  className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-60" />

                <div className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </div>

                <div className="absolute inset-x-6 bottom-6 text-background mix-blend-difference">
                  <p className="text-xs uppercase tracking-widest opacity-70">{p.stack}</p>
                  <h3 className="text-display mt-2 text-2xl md:text-3xl">{p.name}</h3>
                  <p className="mt-2 max-w-md text-sm opacity-80">{p.desc}</p>
                </div>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
