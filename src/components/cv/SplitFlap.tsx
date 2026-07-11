import { useEffect, useRef, useState } from "react";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—";

interface FlapProps {
  target: string;
  delay: number;
  trigger: number;
}

function Flap({ target, delay, trigger }: FlapProps) {
  const [display, setDisplay] = useState(target);
  const isSpace = target === " ";

  useEffect(() => {
    if (isSpace) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    const cycles = 6 + Math.floor(Math.random() * 4);
    let i = 0;
    const start = () => {
      const step = () => {
        if (i < cycles) {
          setDisplay(CHARSET[Math.floor(Math.random() * CHARSET.length)]);
          i++;
          timer = setTimeout(() => {
            raf = requestAnimationFrame(step);
          }, 45);
        } else {
          setDisplay(target);
        }
      };
      raf = requestAnimationFrame(step);
    };
    const startTimer = setTimeout(start, delay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, delay, trigger, isSpace]);

  if (isSpace) return <span className="inline-block w-[0.3em]">&nbsp;</span>;

  return (
    <span className="split-flap-cell">
      <span className="split-flap-char">{display}</span>
    </span>
  );
}

interface SplitFlapProps {
  text: string;
  baseDelay?: number;
  stagger?: number;
}

export function SplitFlap({ text, baseDelay = 0, stagger = 35 }: SplitFlapProps) {
  const [trigger, setTrigger] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }
  }, []);

  const chars = Array.from(text);

  return (
    <span
      className="inline-block cursor-default"
      onPointerEnter={() => setTrigger((t) => t + 1)}
    >
      {chars.map((c, i) => (
        <Flap
          key={`${i}-${c}`}
          target={c}
          delay={baseDelay + i * stagger}
          trigger={trigger}
        />
      ))}
    </span>
  );
}
