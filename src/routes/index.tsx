import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu CV Digital · Streex Aura Persona" },
      {
        name: "description",
        content:
          "Tu CV Digital: perfiles profesionales privados, presentables y fáciles de compartir.",
      },
      { property: "og:title", content: "Tu CV Digital · Streex Aura Persona" },
      {
        property: "og:description",
        content: "Una forma más clara de presentar tu trayectoria profesional.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-3xl py-24">
        <p className="text-eyebrow mb-6">STREEX AURA PERSONA</p>
        <h1 className="text-display max-w-2xl text-6xl leading-[0.95] md:text-8xl">
          Tu CV Digital.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Perfiles profesionales claros, privados y fáciles de compartir. Cada trayectoria tiene su
          propio espacio, identidad y enlace de acceso.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
          >
            Acceso propietario
          </Link>
        </div>
      </section>
    </main>
  );
}
