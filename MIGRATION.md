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
- Los retratos y el PDF viven en el bucket privado `cv-attachments`; el Worker
  solo devuelve URLs firmadas después de validar el enlace del perfil.
- `@lovable.dev/cloud-auth-js`, el bridge de preview y el error reporting de
  Lovable fueron eliminados.
- `.env` ya no está versionado. Usa `.env.example` como plantilla.

Todavía existen referencias históricas a Lovable en `README.md` y en este
documento únicamente como contexto de migración. El despliegue heredado sigue
existiendo como referencia, pero el Worker independiente ya está publicado en
el dominio propio de la aplicación.

El destino Supabase independiente ya creado y verificado es
`streex-aura-persona` (`ynbpclhwshbilbdnerdu`, región `us-west-2`). Sus 14
migraciones registradas incluyen el esquema, Storage privado, el helper RLS
privado, el modelo multi-perfil y la fila inicial de `profile_settings`. Los asesores
de base de datos no reportan hallazgos; el asesor de Auth sí indica que la
protección contra contraseñas filtradas todavía está desactivada y debe
activarse desde el Dashboard.

La siguiente capa ya está aplicada en el destino: existe el perfil base
`juanooh`, cada tabla de contenido tiene una relación `profile_id` y
`profile_access_links` almacena únicamente hashes de enlaces compartibles. La
lectura pública antigua ya fue retirada: el REST API no concede `SELECT` a
`anon` y las rutas del perfil solo reciben datos mediante el Worker y una
cookie HttpOnly emitida por un enlace privado válido.

La historia de migraciones también fue reconciliada: las versiones que el
aplicador remoto había registrado con timestamps nuevos se marcaron como
equivalentes a los 14 archivos versionados en Git. `supabase migration list`
queda alineado y `supabase db push --dry-run` confirma que no hay migraciones
pendientes. No se ejecutó un reset remoto ni se modificó contenido existente.

Cloudflare está autenticado en la cuenta correcta y el Worker
`streex-aura-persona` está publicado en `persona.getstreex.com`. El build
genera `dist/server/.dev.vars` con los tres secretos server-only y el script
`npm run deploy` lo pasa explícitamente a Wrangler; `dist/` está ignorado por
Git y la `SUPABASE_SERVICE_ROLE_KEY` nunca debe enviarse por chat ni subirse al
repositorio.

## 1. Crear el backend destino

1. Crea o selecciona un proyecto Supabase propio.
2. Enlaza el repositorio solo cuando el destino esté confirmado:

   ```bash
   supabase link --project-ref <target-project-ref>
   ```

3. Para un proyecto nuevo, aplica las migraciones de
   `supabase/migrations/` en orden o usa `supabase/schema.sql` como baseline.
4. La migración `20260911003221_harden_storage_and_admin_claim.sql` crea los
   buckets privados, restringe Storage al rol admin, elimina el claim público
   de admin, impone 25 MiB y MIME permitidos en cada bucket, y limita el
   `EXECUTE` de las funciones `SECURITY DEFINER`.
5. La migración `20260911023126_harden_private_role_check.sql` mueve el helper
   `has_role` al esquema privado, elimina su endpoint implícito en el API
   público y ajusta las políticas RLS para evaluar auth y roles una vez por
   sentencia.
6. Configura Auth → Providers con Email y Google. En Google Cloud Console
   registra el callback que indique Supabase y las URLs de redirección de cada
   entorno.
7. Crea o confirma la cuenta del propietario y asígnale el rol admin mediante
   una inserción controlada en `user_roles`; puedes partir de
   `supabase/bootstrap_admin.sql.example` (el repositorio ya no expone
   `claim_admin()`).
8. Ejecuta `supabase/verify_destination.sql` en el SQL Editor del destino y
   revisa que las tablas, RLS, buckets privados, límites de Storage y permisos
   de funciones coincidan con el modelo esperado.

El repositorio ya está enlazado localmente al destino mediante el estado
ignorado de Supabase CLI. Para futuros cambios, crea una migración nueva,
pruébala localmente y usa `supabase db push --dry-run` antes de aplicarla; no
uses `db reset --linked` porque destruiría los datos del destino.

Durante la auditoría inicial, el backend heredado respondió correctamente a
REST, pero los buckets `cv-attachments` y `cv-projects` no existían. Esa
observación no representaba al destino nuevo: en `streex-aura-persona` ambos
buckets ya fueron creados como privados, con límite de 25 MiB y MIME permitido,
y se verificaron junto con las políticas RLS.

### Gate de seguridad antes de hacerlo público

El repositorio ya no muestra registro público ni expone `claim_admin()`: el
bootstrap del propietario es una inserción administrativa explícita mediante
`supabase/bootstrap_admin.sql.example`. Aun así, Auth conserva su propia
configuración en cada proyecto Supabase; antes del deploy público hay que crear
el admin del propietario y desactivar el registro público, o reemplazarlo por
una allowlist controlada. No se debe publicar dejando abierta la carrera de la
primera cuenta.

## 2. Migrar datos y archivos

Las tablas de contenido son `profile_settings`, `timeline_items`, `projects`,
`skills`, `markets` y `user_roles`. Exporta los datos del backend heredado,
revisa los UUID y las referencias, y restaura solo en el proyecto destino.

Los archivos administrables usan dos buckets privados:

- `cv-attachments`: adjuntos de experiencias.
- `cv-projects`: galerías de proyectos.

Las URLs guardadas en `attachments` y `gallery` son valores de compatibilidad y
no deben copiarse como si fueran permanentes. La app conserva los paths, genera
URLs firmadas de corta duración al subir y las renueva desde el Worker mediante
una server function que exige la cookie privada del perfil y solo acepta
archivos ya publicados en sus tablas.
Configura `SUPABASE_SERVICE_ROLE_KEY` únicamente como secreto server-side para
que esa renovación funcione en el deployment independiente.
Los retratos y el PDF de `juanooh` están en `cv-attachments/profile/juanooh/`.
El bucket es privado; no se deben volver a colocar estos archivos en `public/`.

## 3. Variables de entorno

```bash
# Browser/build-time: publishable key only
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<public-key>

# Server/Worker runtime
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_<public-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only-secret>
```

La service-role key no debe aparecer en `VITE_*`, código cliente, logs, GitHub,
el browser ni `wrangler.jsonc`.

## 4. Desarrollo y validación

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
npm run verify:independent
npx tsc --noEmit
npx wrangler deploy --dry-run
```

También se mantiene `bun.lock`; si usas Bun, instala con
`bun install --frozen-lockfile`. No mezcles cambios de lockfiles sin revisar
qué gestor será el estándar del CI.

## 5. Deploy independiente

El repositorio está desplegado en Cloudflare Workers:

```bash
npm run deploy
```

`wrangler.jsonc` declara como obligatorias `SUPABASE_URL`,
`SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. El build prepara un
archivo temporal dentro de `dist/server/` y `npm run deploy` lo pasa a Wrangler
como `--secrets-file`; no uses el `.env` completo como archivo de secrets
porque también contiene variables del navegador.

Para configurar o rotar secretos directamente en un Worker ya existente:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Wrangler valida esos nombres durante el deploy, y el valor de
`SUPABASE_SERVICE_ROLE_KEY` nunca debe entrar en `vars`, el bundle cliente o
el repositorio.
La cuenta local debe estar autenticada con `npx wrangler login`; un
`wrangler deploy --temporary` solo crea un preview y no sustituye el Worker
propio.
El `--dry-run` local solo valida el empaquetado; no prueba autenticación,
dominios, bindings ni datos de producción.

Para Vercel, Netlify o Node/VPS habrá que elegir explícitamente el adaptador y
el modelo de ejecución; no se debe inferir compatibilidad de un build verde.

## 6. Checklist de independencia

- [x] Build independiente de la configuración Vite de Lovable.
- [x] Auth independiente de `cloud-auth-js`.
- [x] Retratos y PDF migrados a Storage privado con URLs firmadas.
- [x] `.env` fuera del control de versiones.
- [x] Migraciones locales presentes y Storage documentado.
- [x] Lint, tests unitarios y validaciones de build documentados y ejecutados en CI.
- [x] Crear y seleccionar el proyecto Supabase destino.
- [x] Aplicar migraciones al destino y verificar RLS/Storage.
- [x] Crear la fila singleton inicial de `profile_settings` sin sobrescribir datos.
- [x] Reconciliar la historia local/remota de migraciones.
- [x] Crear el modelo multi-perfil y el perfil inicial `juanooh`.
- [x] Crear la cuenta propietaria en Auth y asignarle `admin`.
- [ ] Configurar Google OAuth y las URLs finales de redirección.
- [x] Crear la landing pública en `/` y rutas por perfil.
- [x] Implementar enlaces privados revocables sin login.
- [x] Cerrar lectura pública de contenido mediante RLS/Worker.
- [x] Migrar y validar los datos/contenidos iniciales de `juanooh`.
- [ ] Ejecutar QA autenticado del panel Admin y de la gestión de Storage.
- [x] Confirmar en el destino el gate de asesores de seguridad y rendimiento.
- [ ] Configurar Google OAuth.
- [x] Configurar el dominio final y publicar el Worker propio.
- [ ] Hacer QA autenticado.
- [x] README actualizado con el estado independiente y la referencia histórica
      al deployment de Lovable.

Hasta completar los elementos pendientes, el repositorio es portable a nivel
de código y build, pero todavía no constituye una migración operativa completa
del backend ni del deployment público.
