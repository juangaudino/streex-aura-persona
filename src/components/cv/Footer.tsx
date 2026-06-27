import { useApp } from "@/hooks/use-theme";
import { dict } from "@/i18n/dictionary";

export function Footer() {
  const { lang } = useApp();
  return (
    <footer className="border-t border-border px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} — {dict[lang].footer}</p>
        <p className="tabular-nums">v1.0</p>
      </div>
    </footer>
  );
}
