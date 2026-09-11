import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ duration: 0.9, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-16 md:mb-24">
      <Reveal>
        <p className="text-eyebrow mb-5">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="text-display max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h2>
      </Reveal>
    </div>
  );
}
