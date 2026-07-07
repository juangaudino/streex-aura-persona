import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

type Props = {
  href?: string;
  onClick?: () => void;
  download?: boolean;
  className?: string;
  children: ReactNode;
  /** Max pixel offset the button leans toward the cursor */
  strength?: number;
  /** Distance (px) from center where magnetic effect starts */
  radius?: number;
  ariaLabel?: string;
  style?: CSSProperties;
};

/**
 * A button/link that leans toward the cursor when it enters its magnetic
 * radius. Automatically disabled on touch devices and for users with
 * `prefers-reduced-motion`.
 */
export function MagneticButton({
  href,
  onClick,
  download,
  className,
  children,
  strength = 14,
  radius = 120,
  ariaLabel,
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          x.set(0);
          y.set(0);
        });
        return;
      }
      const falloff = 1 - dist / radius;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        x.set((dx / radius) * strength * falloff * 1.6);
        y.set((dy / radius) * strength * falloff * 1.6);
      });
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y, radius, strength]);

  const inner = (
    <motion.span
      style={{ x: sx, y: sy, display: "inline-flex" }}
      className="pointer-events-none items-center gap-2"
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        download={download}
        aria-label={ariaLabel}
        className={className}
        style={style}
      >
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
      style={style}
      type="button"
    >
      {inner}
    </motion.button>
  );
}
