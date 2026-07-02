
# Plan: Panel Admin para editar el CV

Activo **Lovable Cloud** (base de datos + auth + IA) y muevo todo el contenido del sitio desde `src/i18n/dictionary.ts` a la base de datos, con un panel `/admin` protegido por Google sign-in + rol admin.

## 1. Backend (Lovable Cloud)

**Auth**: Google OAuth (managed) + email/password como fallback.

**Tablas** (todas con RLS: lectura pública, escritura solo admin):

- `profile_settings` (singleton) — hero, about, contact, foto
- `timeline_items` — id, kind (`work`|`study`), title_es, title_en, org, location, start_date, end_date (nullable = "actual"), description_es, description_en, bullets_es[], bullets_en[], sort_order
- `projects` — id, title, description_es, description_en, tags[], link, image_url, sort_order
- `skills` — id, name, category, sort_order
- `user_roles` + enum `app_role` + función `has_role()` (patrón seguro estándar)

**Policies**:
- `SELECT` público (anon + authenticated) en todo lo de contenido
- `INSERT/UPDATE/DELETE` solo si `has_role(auth.uid(), 'admin')`
- `user_roles`: solo authenticated puede leer los propios; nadie escribe desde el cliente (se asigna vía SQL/función)

**Bootstrap admin**: te asigno el rol `admin` a tu user_id la primera vez que inicies sesión (via SQL insert después de tu primer login con Google).

## 2. Traducción con IA

Server function `translate-to-english` usando **Lovable AI Gateway** (`google/gemini-3-flash-preview`, gratis en el free tier). En cada campo bilingüe del admin habrá un botón "✨ Traducir a EN" que rellena el campo EN a partir del ES; el resultado queda editable.

## 3. Frontend

**Rutas nuevas**:
- `/auth` — login público (Google + email/password)
- `/_authenticated/admin` — dashboard con tabs: Perfil · Timeline · Proyectos · Skills

**UI admin** (shadcn + estilo Apple existente):
- Cada tab con lista + drawer/dialog para crear/editar
- Drag handle para reordenar (dnd-kit) → actualiza `sort_order`
- Toggle work/study en timeline items, date pickers, chip para "presente"
- Preview link al home para ver los cambios en vivo

**Migración de datos**: seed migration que inserta todo el contenido actual de `dictionary.ts` en las tablas, así arrancás con tu CV real ya cargado.

**Refactor del sitio público**:
- `Hero`, `About`, `Experience`, `Projects`, `Skills`, `Contact` pasan a leer con TanStack Query (`useSuspenseQuery`) desde server functions públicas (publishable key + policy anon SELECT)
- El toggle ES/EN sigue funcionando; simplemente elige la columna `_es` o `_en`
- `dictionary.ts` queda solo con labels de UI (nav, botones, form)

## 4. Orden de implementación

1. Activar Cloud + crear tablas, RLS, seed con tu CV actual
2. Configurar Google OAuth + user_roles + asignarte admin
3. Refactorizar componentes públicos para leer de la DB
4. Construir `/auth` y `/_authenticated/admin` con CRUD por sección
5. Server function de traducción IA + botón en el form
6. Reordenamiento drag & drop

## Notas técnicas

- Foto del hero: subida a Storage bucket público `assets/` (reemplaza las URLs hardcoded del CDN)
- Bullets se guardan como `text[]` en Postgres
- `end_date` null = "Presente/Actual" en la UI
- Todo el admin en un solo idioma de UI (español, ya que sos vos el único que lo usa)

¿Le doy?
