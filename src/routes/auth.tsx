import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "motion/react";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin · Login" }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) nav({ to: "/admin" });
  }, [loading, user, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/admin`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setNotice("Cuenta creada. Revisa tu email para confirmar (o ingresa si la confirmación está desactivada).");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/admin" });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) setErr(error.message);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <Link to="/" className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <p className="text-eyebrow mb-3">Panel</p>
        <h1 className="text-display text-3xl">{mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acceso restringido al administrador del sitio.
        </p>

        <button
          onClick={onGoogle}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Continuar con Google
        </button>

        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> o email <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-eyebrow mb-1 block">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-0 border-b border-border bg-transparent py-2 text-base outline-none focus:border-foreground"
            />
          </label>
          <label className="block">
            <span className="text-eyebrow mb-1 block">Password</span>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-0 border-b border-border bg-transparent py-2 text-base outline-none focus:border-foreground"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === "signin" ? "Entrar" : "Crear cuenta"}
          </button>

          {err && <p className="text-sm text-destructive">{err}</p>}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {mode === "signin" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entrar"}
        </button>
      </motion.div>
    </main>
  );
}
