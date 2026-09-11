import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PortfolioPage } from "@/components/cv/PortfolioPage";
import { getPrivateProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/$profileSlug")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  notFoundComponent: PrivateProfileNotFound,
  component: PrivateProfileRoute,
});

function PrivateProfileRoute() {
  const { profileSlug } = Route.useParams();
  const query = useQuery({
    queryKey: ["private-profile", profileSlug],
    queryFn: () => getPrivateProfile({ data: { slug: profileSlug } }),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <p className="text-sm text-muted-foreground">Cargando CV privado…</p>
      </main>
    );
  }

  const data = query.data;
  if (query.isError || !data) return <PrivateProfileNotFound />;

  return <PortfolioPage data={data} />;
}

function PrivateProfileNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md text-center">
        <p className="text-eyebrow mb-4">CV PRIVADO</p>
        <h1 className="text-display text-4xl">Este perfil no está disponible.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Necesitas un enlace privado válido para acceder a este CV.
        </p>
      </section>
    </main>
  );
}
