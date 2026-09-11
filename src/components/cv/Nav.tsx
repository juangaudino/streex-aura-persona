import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun, Download, Lock } from "lucide-react";
import { useApp } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useProfileData } from "@/lib/profile-data-context";

export function Nav() {
  const { theme, toggleTheme, lang, toggleLang } = useApp();
  const { isAdmin } = useAuth();
  const { settings } = useProfileData();
  const t =
    lang === "es"
      ? {
          about: "Sobre mí",
          experience: "Experiencia",
          projects: "Proyectos",
          contact: "Contacto",
          admin: "Admin",
          download: "Descargar CV",
        }
      : {
          about: "About",
          experience: "Experience",
          projects: "Projects",
          contact: "Contact",
          admin: "Admin",
          download: "Download CV",
        };
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#about", label: t.about },
    { href: "#experience", label: t.experience },
    { href: "#projects", label: t.projects },
    { href: "#contact", label: t.contact },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b" : ""
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <a href="#top" className="text-display text-lg tracking-tight">
          ✦
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle language"
          >
            {lang.toUpperCase()}
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              aria-label="Admin"
            >
              <Lock className="h-3 w-3" />
              {t.admin}
            </Link>
          )}
          <a
            href={settings.cv_url || "#contact"}
            download={Boolean(settings.cv_url)}
            className="ml-1 hidden items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-transform hover:scale-[1.03] sm:flex"
          >
            <Download className="h-3.5 w-3.5" />
            {t.download}
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
