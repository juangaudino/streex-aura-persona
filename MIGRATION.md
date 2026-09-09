# Guía de migración: de Lovable a GitHub + hosting propio

Este documento explica cómo sacar este proyecto de Lovable y correrlo de forma
independiente: tu propio backend (Supabase), tu propio hosting y cero
dependencias de paquetes propietarios.

---

## 0. Panorama rápido

El proyecto depende de Lovable en 4 puntos:

| # | Dependencia | Dónde está | Solución |
|---|-------------|-----------|----------|
| 1 | Base de datos + Auth + Storage (Lovable Cloud) | 6 tablas, 2 buckets de storage | Supabase propio + `supabase/schema.sql` |
| 2 | Variables de entorno | `.env` (no commitear) | Definirlas en tu hosting |
| 3 | `@lovable.dev/vite-tanstack-config` | `vite.config.ts` | Reescribir con plugins oficiales (sección 4) |
| 4 | `@lovable.dev/cloud-auth-js` | `src/integrations/lovable/index.ts` | Reemplazar por Supabase OAuth nativo (sección 5) |

> Hasta completar los pasos 1–5, el sitio público igual renderiza (usa los
> textos de respaldo de `src/i18n/dictionary.ts`), pero sin datos del admin.

---

## 1. Llevar el código a GitHub

Dos opciones:

**A. Sync nativo de Lovable (recomendado para empezar)**
En el editor de Lovable: menú **+ → GitHub → Connect project → Create Repository**.
Sync bidireccional en tiempo real; puedes trabajar local y en Lovable a la vez.

**B. Exportar y subir manualmente**
Descarga el ZIP del codebase y súbelo a un repo nuevo. Pierdes el sync con
Lovable (el proyecto de Lovable queda congelado).

```bash
git clone git@github.com:tu-usuario/tu-repo.git
cd tu-repo
bun install   # o npm install
```

## 2. Backend propio (Supabase)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, pega y ejecuta todo `supabase/schema.sql`
   (crea tablas, enums, políticas de acceso, funciones y triggers).
3. En **Storage**, crea dos buckets **privados**: `cv-attachments` y `cv-projects`.
4. En **Authentication → Providers**, habilita **Email** y **Google**
   (para Google necesitas crear credenciales OAuth en Google Cloud Console y
   pegarlas en Supabase; la URL de callback que te da Supabase va en Google).
5. **Crea tu cuenta y reclama el admin**: regístrate desde la app (`/auth`),
   luego en el SQL Editor ejecuta:
   ```sql
   select public.claim_admin();  -- con tu sesión activa, o:
   insert into public.user_roles (user_id, role)
     values ('<tu-user-uuid>', 'admin');
   ```
6. **Migrar los datos**: en Lovable ve a **Cloud → Advanced settings →
   Export data** para obtener un dump de las tablas, y restáuralo en tu
   proyecto (SQL Editor o `psql`). O simplemente vuelve a cargar el contenido
   desde el panel `/admin` (son pocos datos).
7. **Archivos de storage** (fotos del hero, certificados, galerías): hoy son
   URLs del storage de Lovable. Descárgalos y súbelos a los buckets nuevos,
   luego actualiza las URLs desde `/admin`.

## 3. Variables de entorno

Crea un `.env` local (y configúralas en tu hosting) con los valores de TU
proyecto Supabase (Settings → API):

```bash
# Cliente (visibles en el browser)
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>

# Servidor (server functions / SSR)
SUPABASE_URL=https://<tu-proyecto>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # nunca exponer al browser
```

## 4. Quitar `@lovable.dev/vite-tanstack-config`

Reemplaza `vite.config.ts` por la config estándar de TanStack Start:

```ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 8080 },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      // Elige el preset según tu hosting:
      // target: "cloudflare-module"  // Cloudflare Workers/Pages
      // target: "vercel"             // Vercel
      // target: "netlify"            // Netlify
      // target: "node-server"        // VPS / Node propio (default)
    }),
    viteReact(),
    tailwindcss(),
  ],
});
```

Luego: `bun remove @lovable.dev/vite-tanstack-config` y asegúrate de tener
instalados `@tanstack/react-start`, `@vitejs/plugin-react`,
`@tailwindcss/vite` y `vite-tsconfig-paths`.

Notas:
- `src/server.ts` es un wrapper de errores propio; si lo conservas, mantén la
  opción `server: { entry: "server" }` en la config de tanstackStart.
- Si usas `node-server`: `bun run build` genera `.output/`, y lo sirves con
  `node .output/server/index.mjs` detrás de tu proxy.

## 5. Quitar `@lovable.dev/cloud-auth-js`

En `src/routes/auth.tsx`, donde hoy se usa:

```ts
import { lovable } from "@/integrations/lovable";
await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
```

reemplázalo por la llamada nativa de Supabase:

```ts
import { supabase } from "@/integrations/supabase/client";
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: window.location.origin + "/auth" },
});
```

Después: `bun remove @lovable.dev/cloud-auth-js` y borra
`src/integrations/lovable/`.

## 6. Deploy

- **Cloudflare Pages/Workers**: preset `cloudflare-module`, casi cero cambios
  (es el target actual del proyecto).
- **Vercel / Netlify**: preset correspondiente, conecta el repo y listo.
- **VPS propio**: preset `node-server`, `bun run build` en CI, sirve
  `.output/server/index.mjs` con un proceso Node (pm2/systemd) + nginx.

En todos los casos: define las variables de entorno de la sección 3 en el
panel del hosting.

## 7. Checklist de verificación post-migración

- [ ] `/` carga y muestra datos desde TU base (edita algo en `/admin` y verifica)
- [ ] Login con Google y email funciona en `/auth`
- [ ] `/admin` te reconoce como admin (rol en `user_roles`)
- [ ] Subir un adjunto (imagen/PDF) a una experiencia funciona
- [ ] El PDF del CV (`public/cv.pdf`) descarga
- [ ] Las fotos del hero apuntan al nuevo storage (o a `src/assets/`)

## Notas finales

- **No commitees `.env`** con claves reales; el anon key es público por diseño
  pero el `service_role` jamás debe llegar al browser ni al repo.
- Los archivos `src/integrations/supabase/*` son standalone: funcionan igual
  fuera de Lovable, solo necesitan las env vars correctas. No hace falta
  tocarlos (salvo regenerar `types.ts` con `supabase gen types` si cambias
  el schema).
- Este documento asume Supabase como backend nuevo; cualquier otro stack
  (Postgres + Auth.js + S3, por ejemplo) requiere reescribir
  `src/lib/cv-queries.ts` y la auth.
