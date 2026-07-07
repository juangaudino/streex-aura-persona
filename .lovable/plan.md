
# Plan: Efecto WOW en 3 fases

Elegiste tres upgrades. Los implemento en este orden para que el impacto se sienta desde el primer scroll y crezca a medida que el visitante baja.

---

## Fase 1 — Hero cinemático + cursor magnético

**Qué cambia visualmente**
- El nombre gigante se distorsiona sutilmente al pasar el mouse (efecto "displace" en las letras + weight shift).
- Los botones CTA "Download CV" y "Get in touch" ganan un efecto imán: el botón se inclina hacia el cursor cuando está cerca.
- Se agrega una capa de grano/noise animado muy sutil sobre la aurora existente (opacity 3–5%).
- Un contador de scroll minimalista abajo a la derecha ("01 / 06") que se actualiza según la sección visible.
- Mobile: se desactivan magnético y distorsión, se conserva el noise.

**Técnico**
- Motion for React + `useMotionValue` / `useTransform` (ya está instalado).
- Componente nuevo `MagneticButton` reutilizable, con guard de `prefers-reduced-motion` y `hover: none`.
- SVG filter `<feTurbulence>` + `feDisplacementMap` para la distorsión del H1, activado por hover con transición de amplitude.
- Noise: canvas 128×128 generado una sola vez, tileado con `background-image` y `animation: translate` de 200ms.
- Scroll indicator: `IntersectionObserver` sobre las secciones existentes.

---

## Fase 2 — Case studies fullscreen para campañas

**Qué cambia visualmente**
- Click en cualquier project card abre un modal fullscreen con animación tipo Apple: la card se expande desde su posición hasta ocupar toda la pantalla (`layoutId`).
- Dentro del case study:
  - **Hero del caso**: título grande + cliente + año + verticales.
  - **Métricas animadas**: 3–4 counters que corren de 0 al valor final al entrar en viewport ($ invertido, impresiones, ciudades, lift).
  - **Contexto** (challenge) → **Estrategia** (approach) → **Resultado** (outcome) en 3 bloques narrativos.
  - **Galería**: hasta 6 imágenes en grid asimétrico, click para lightbox.
- Botón "Close" arriba a la derecha y `ESC` cierra. Scroll interno del modal.

**Admin — CRUD extendido para projects**
La tabla `projects` gana columnas nuevas (bilingües donde corresponde):
- `client`, `year`, `verticals[]`
- `challenge_es`, `challenge_en`
- `approach_es`, `approach_en`
- `outcome_es`, `outcome_en`
- `metrics jsonb` → `[{value, label_es, label_en, prefix, suffix}]`
- `gallery jsonb` → `[{url, path, caption_es, caption_en}]`

En Admin se agrega un editor expandible por proyecto con secciones colapsables para challenge/approach/outcome, un editor de métricas (add/remove) y un uploader de galería (mismo patrón que attachments de timeline).

**Técnico**
- Modal con `AnimatePresence` + `layoutId` compartido entre card y modal para el morph.
- Counters con `useMotionValue` + `animate()` (Motion) disparados por `useInView`.
- Nueva migración: columnas + bucket `cv-projects` (público read, admin write).
- `readMetrics` y `readGallery` helpers en `cv-queries.ts`, tipados.
- Fallback: si un proyecto no tiene case study cargado, la card sigue funcionando como está hoy (sin modal).

---

## Fase 3 — Mapa LATAM→US interactivo

**Qué cambia visualmente**
- Nueva subsección al final de About (o inicio de Experience) titulada "Journey": mapa SVG estilizado de LATAM + sur de US.
- Los mercados donde operaste aparecen como puntos que pulsan (Buenos Aires, São Paulo, CDMX, Bogotá, Santiago, Lima, Salt Lake City, etc. — editables desde Admin).
- Una línea animada traza el journey Argentina → Salt Lake City al entrar en viewport (SVG `pathLength` de 0 a 1).
- Hover sobre un punto muestra un tooltip: ciudad, país, año en que operaste, tipo de campaña.
- Paleta consistente con el resto (accent color para los puntos activos, muted para los inactivos).

**Admin — nueva sección "Markets"**
Nueva tabla `markets`:
- `id`, `city`, `country`, `country_code`, `lat`, `lng`, `year_from`, `year_to`, `note_es`, `note_en`, `is_home boolean`, `sort_order`.

Editor en Admin con lista de mercados, drag/reorder no necesario (usa sort_order numérico como el resto). El path del journey se calcula automáticamente conectando los puntos con `is_home` primero o por orden.

**Técnico**
- SVG estático de fondo (LATAM + US sur) generado una sola vez, guardado en `src/assets/`. Proyección Mercator simplificada.
- Función `latLngToSvg(lat, lng)` que mapea coords geográficas a coords SVG del asset.
- Line drawing con Motion: `<motion.path strokeDasharray={pathLength} strokeDashoffset animate={{...}}>`.
- Puntos pulsantes: círculo SVG + `animate` en `r` y `opacity` en loop.
- Tooltip con Radix `HoverCard` para accesibilidad.

---

## Orden de entrega
1. **Fase 1** primero — es la más rápida y transforma la primera impresión.
2. **Fase 2** — el diferencial más grande para reclutadores (case studies reales).
3. **Fase 3** — el remate emocional del storytelling LATAM → US.

Cada fase queda navegable y editable desde Admin al terminarla, sin dependencias entre fases. Si querés cortar después de la 1 o la 2, el sitio queda coherente igual.

---

## Notas de scope
- No toco el sistema de theming ni la paleta actual — todo suma sobre los tokens existentes.
- Mobile-first en las tres fases: cursor magnético off, modal fullscreen usa sheet vertical, mapa se rota a formato vertical con lista.
- Todo el contenido nuevo (case studies, mercados) es editable desde Admin. Nada hardcodeado.
