import { useEffect } from "react";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { redeemProfileAccess } from "@/lib/profile.functions";

export const Route = createFileRoute("/share/$token")({
  loader: async ({ params }) => {
    const access = await redeemProfileAccess({ data: { token: params.token } });
    if (!access) throw notFound({ routeId: "/share/$token", throw: true });
    return access;
  },
  notFoundComponent: InvalidShareLink,
  component: ShareLinkRoute,
});

function ShareLinkRoute() {
  const nav = useNavigate();
  const access = Route.useLoaderData();

  useEffect(() => {
    if (access?.slug) {
      nav({ to: "/$profileSlug", params: { profileSlug: access.slug }, replace: true });
    }
  }, [access, nav]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <p className="text-sm text-muted-foreground">Abriendo CV privado…</p>
    </main>
  );
}

function InvalidShareLink() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <p className="text-sm text-muted-foreground">
        Este enlace privado no es válido o ha expirado.
      </p>
    </main>
  );
}
