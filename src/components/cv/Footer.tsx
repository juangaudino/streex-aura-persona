import { useApp } from "@/hooks/use-theme";
import { useProfileData } from "@/lib/profile-data-context";

export function Footer() {
  const { lang } = useApp();
  const { settings } = useProfileData();
  return (
    <footer className="border-t border-border px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} —{" "}
          {settings.name || (lang === "es" ? "CV Digital" : "Digital CV")}
        </p>
        {settings.email && <p className="tabular-nums">{settings.email}</p>}
      </div>
    </footer>
  );
}
