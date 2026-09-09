# Estado del proyecto y guía de migración a GitHub + hosting propio

## 1. Estado actual del proyecto

CV/portfolio bilingüe (ES/EN) de Juan Gaudino, estilo Apple minimalista con estética OOH/publicidad exterior, en una sola página con panel de administración.

**Rutas**
- `/` — Sitio público: Hero (foto con máscaras, split-flap, parallax, backdrop de carretera, bokeh, tickers DOOH), About, Experience (timeline dual trabajo/estudio con adjuntos), Projects (casos de estudio con modal fullscreen), Skills, Journey (mapa LATAM→US), Contact, Footer.
- `/auth` — Login (Google + email/password).
- `/admin` — CMS completo: textos del sitio, timeline (con upload de imágenes/PDF), skills, campañas (con métricas y galería), mercados del Journey, métricas del About.

**Stack**
- React 19 + TanStack Start v1 (SSR full-stack) + Vite 8 + Tailwind v4.
- Animaciones: motion (Framer Motion), lenis (smooth scroll).
- Datos: TanStack Query + Supabase (Lovable Cloud).

## 2. Dependencias de la plataforma Lovable (lo que hay que resolver al salir)

Esto es lo importante para tu migración. Tu proyecto depende de Lovable en 4 puntos:

### a) Backend = Lovable Cloud (Supabase administrado)
Toda la data vive en una base Postgres administrada por Lovable:
- Tablas: `profile_settings`, `timeline_items`, `projects`, `skills`, `markets`, `user_roles`.
- Storage: bucket con adjuntos (certificados, galerías de campañas) y las fotos del hero.
- Auth: usuarios, login con Google y email/password, rol admin vía `user_roles` + función `has_role()`.

**Al migrar necesitas:**
1. Crear un proyecto propio en Supabase (gratis) u otro Postgres + storage + auth.
2. Exportar la data: en Lovable → Cloud → Advanced settings → Export data.
3. Recrear el schema: las migraciones SQL no están como archivos en el repo (se aplicaron por herramienta), así que habría que generar un dump del schema antes de salir. Puedo generar ese archivo SQL por ti.
4. Las URLs de storage de los adjuntos/fotos apuntan al proyecto actual: hay que descargar los archivos y re-subirlos al nuevo bucket (o servirlos desde tu propio hosting).

### b) Variables de entorno
El código lee (vía `.env`, no commitear valores reales en público):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (cliente)
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server functions)

En tu hosting tendrás que definirlas con los valores de TU nuevo backend.

### c) Paquetes propietarios de Lovable en package.json
- `@lovable.dev/vite-tanstack-config` — config de Vite completa (TanStack Start, React, Tailwind, nitro/cloudflare, aliases). Sin este paquete hay que reescribir `vite.config.ts` manualmente (factible: ~40 líneas con los plugins oficiales).
- `@lovable.dev/cloud-auth-js` — usado solo en `src/integrations/lovable/index.ts` para el login con Google. Reemplazable por `supabase.auth.signInWithOAuth({ provider: "google" })` directo (~10 líneas).
- Archivos auto-generados de integración (`src/integrations/supabase/*`): funcionan standalone, solo requieren las env vars correctas. Se pueden conservar tal cual.

### d) Build/runtime target
El build actual apunta a Cloudflare Workers (nitro preset "cloudflare"). Para tu hosting:
- **Opción A — Cloudflare Pages/Workers**: casi cero cambios.
- **Opción B — Vercel/Netlify**: cambiar el preset de nitro en la config de Vite.
- **Opción C — VPS/Node propio**: preset `node-server`, corres `bun run build` y sirves el output con Node.
- **Opción D — sitio estático**: no recomendado sin cambios, porque el sitio usa SSR y server functions.

## 3. Plan de migración recomendado

1. **Conectar GitHub ahora** (Plus menu → GitHub → Connect). Sync bidireccional: trabajas local, pusheas, y Lovable refleja los cambios. No hace falta "salir" de golpe.
2. **Generar dump del schema SQL** (puedo producir un `supabase/schema.sql` completo con tablas, enums, RLS, funciones y grants).
3. **Crear tu Supabase propio**, aplicar el schema, migrar data (export desde Lovable Cloud) y archivos de storage.
4. **Reemplazar `@lovable.dev/cloud-auth-js`** por la llamada nativa de Supabase y **reescribir `vite.config.ts`** sin el paquete de Lovable.
5. **Configurar Google OAuth** en tu Supabase (Google Cloud Console + provider config) con los redirect URLs de tu dominio.
6. **Deploy** en tu hosting con las env vars nuevas.
7. Verificar: `/` carga data, login admin funciona, uploads del admin funcionan.

## 4. Lo que NO se puede llevar

- La base de datos se exporta, pero el servicio administrado no: necesitas backend propio desde el día 1 del hosting externo, o el sitio público mostrará los fallbacks estáticos del diccionario (el sitio igual renderiza, pero sin ediciones del admin).
- Las fotos del hero/adjuntos hay que re-alojarlas (hoy son URLs del storage de Lovable).

## Qué haría en este proyecto si apruebas el plan

1. Crear `supabase/schema.sql` con el dump completo del schema actual (tablas, enums, políticas RLS, funciones `has_role`/`claim_admin`, bucket de storage).
2. Crear `MIGRATION.md` en la raíz con la guía paso a paso adaptada a este código (env vars, reemplazo de paquetes Lovable, presets de deploy por hosting).
3. (Opcional, ahora o después) Reemplazar `@lovable.dev/cloud-auth-js` por Supabase OAuth nativo para eliminar la dependencia propietaria.
4. (Opcional) Reescribir `vite.config.ts` sin `@lovable.dev/vite-tanstack-config` usando los plugins oficiales de TanStack/Vite/Tailwind.

Los pasos 1–2 no cambian nada del funcionamiento actual; 3–4 dejan el repo 100% portable.
