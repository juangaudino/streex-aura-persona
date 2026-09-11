# Guía de migración: de Lovable a un proyecto independiente

Este documento describe el estado real del repositorio y el procedimiento para
conectarlo a un backend y un hosting propios. No se debe aplicar sobre el
proyecto Supabase heredado sin hacer antes una copia, reconciliar migraciones y
confirmar que ese proyecto es el destino correcto.

## Estado actual del repositorio

La capa de aplicación ya no depende del runtime de Lovable:

- Vite usa los plugins públicos de TanStack Start, Cloudflare, React y Tailwind.
- `wrangler.jsonc` define el Worker y `src/server.ts` es su entrypoint.
- Auth usa directamente `supabase.auth` para email/password y Google.
- Los retratos del Hero viven en `public/juan-light.png` y
  `public/juan-dark.png`; no dependen de `/__l5e`.
- `@lovable.dev/cloud-auth-js`, el bridge de preview y el error reporting de
  Lovable fueron eliminados.
- `.env` ya no está versionado. Usa `.env.example` como plantilla.

Todavía existen referencias históricas a Lovable en `README.md` y en este
documento únicamente como contexto de migración. El despliegue público
existente también continúa siendo el sitio heredado hasta que se publique un
Worker propio.

## 1. Crear el backend destino

1. Crea o selecciona un proyecto Supabase propio.
2. Enlaza el repositorio solo cuando el destino esté confirmado:

   ```bash
   supabase link --project-ref <target-project-ref>
   ```

3. Para un proyecto nuevo, aplica las migraciones de
   `supabase/migrations/` en orden o usa `supabase/schema.sql` como baseline.
4. La migración `20260911003221_harden_storage_and_admin_claim.sql` crea los
   buckets privados, restringe Storage al rol admin, hace atómico el primer
   claim de admin y limita el `EXECUTE` de las funciones `SECURITY DEFINER`.
5. Configura Auth → Providers con Email y Google. En Google Cloud Console
   registra el callback que indique Supabase y las URLs de redirección de cada
   entorno.
6. Registra una cuenta desde `/auth` y asígnale el primer rol admin mediante
   `claim_admin()` o una inserción controlada en `user_roles`.

El proyecto Supabase actualmente configurado durante la auditoría respondió
correctamente a REST, pero los buckets `cv-attachments` y `cv-projects` no
existían. Por eso no se debe asumir que el Storage actual está operativo.

## 2. Migrar datos y archivos

Las tablas de contenido son `profile_settings`, `timeline_items`, `projects`,
`skills`, `markets` y `user_roles`. Exporta los datos del backend heredado,
revisa los UUID y las referencias, y restaura solo en el proyecto destino.

Los archivos administrables usan dos buckets privados:

- `cv-attachments`: adjuntos de experiencias.
- `cv-projects`: galerías de proyectos.

Las URLs guardadas en `attachments` y `gallery` pueden ser URLs firmadas y no
deben copiarse como si fueran permanentes. Sube los archivos al destino,
conserva sus paths y genera nuevas URLs según el modelo de acceso elegido.
Los retratos del Hero ya son locales y no requieren Storage.

## 3. Variables de entorno

```bash
# Browser/build-time: publishable key only
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<public-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>

# Server/Worker runtime
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_<public-key>
SUPABASE_PROJECT_ID=<project-ref>
SUPABASE_SERVICE_ROLE_KEY=<server-only-secret>
```

La service-role key no debe aparecer en `VITE_*`, código cliente, logs, GitHub,
el browser ni `wrangler.jsonc`.

## 4. Desarrollo y validación

```bash
npm install
npm run dev
npm run build
npx tsc --noEmit
npx wrangler deploy --dry-run
```

También se mantiene `bun.lock`; si usas Bun, instala con
`bun install --frozen-lockfile`. No mezcles cambios de lockfiles sin revisar
qué gestor será el estándar del CI.

## 5. Deploy independiente

El repositorio está preparado para Cloudflare Workers:

```bash
npm run deploy
```

Antes del primer deploy configura las variables en el entorno del Worker,
confirma el nombre del Worker en `wrangler.jsonc` y decide el dominio público.
El `--dry-run` local solo valida el empaquetado; no prueba autenticación,
dominios, bindings ni datos de producción.

Para Vercel, Netlify o Node/VPS habrá que elegir explícitamente el adaptador y
el modelo de ejecución; no se debe inferir compatibilidad de un build verde.

## 6. Checklist de independencia

- [x] Build independiente de la configuración Vite de Lovable.
- [x] Auth independiente de `cloud-auth-js`.
- [x] Retratos principales servidos desde el repositorio.
- [x] `.env` fuera del control de versiones.
- [x] Migraciones locales presentes y Storage documentado.
- [ ] Crear y seleccionar el proyecto Supabase destino.
- [ ] Aplicar migraciones al destino y verificar RLS/Storage.
- [ ] Migrar y validar datos reales.
- [ ] Configurar Google OAuth y el dominio final.
- [ ] Publicar el Worker propio y hacer QA autenticado.
- [ ] Decidir si se actualiza el README histórico con la documentación final.

Hasta completar los elementos pendientes, el repositorio es portable a nivel
de código y build, pero todavía no constituye una migración operativa completa
del backend ni del deployment público.
