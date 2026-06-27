No me has pegado tu contenido todavía, así que armaré el sitio con **placeholders bien marcados** (nombre, bio, experiencia, proyectos, foto) que reemplazarás luego pegando tu CV o subiendo un PDF/foto en el chat. La estructura, animaciones y diseño ya quedarán listos.

## Dirección de diseño

Estilo **Apple minimalista**, no genérico:
- Tipografía: SF Pro–like vía `Inter Display` para titulares grandes (tracking apretado, peso 600) + `Inter` para body. Tamaños generosos al estilo apple.com (hero 96–120px desktop).
- Paleta sobria:
  - Light: fondo `#fbfbfd`, texto `#1d1d1f`, acento sutil `#0066cc`.
  - Dark: fondo `#000`, superficies `#0a0a0a`/`#141414`, texto `#f5f5f7`.
- Mucho espacio en blanco, grids asimétricos puntuales, divisores casi invisibles.
- Toggle ES/EN y Light/Dark discretos en la nav (icono).

## Animaciones e interactividad (premium pero sobrio)

Usando **Motion (framer-motion)** + scroll nativo:
- Hero con **reveal por palabras** del nombre/título (stagger 40ms, ease apple-cubic `[0.16, 1, 0.3, 1]`).
- **Parallax sutil** de foto/retrato en hero (translateY al scroll, sin exagerar).
- Secciones con **fade + translateY 24px** al entrar en viewport (una sola vez).
- Cursor magnético en CTAs principales (descargar CV, enviar mensaje).
- Timeline de experiencia con **línea que se dibuja** al hacer scroll (SVG path con `pathLength`).
- Cards de proyectos con **hover layered**: imagen escala 1.03, overlay con título sube, sombra crece.
- Toggle dark/light con **transición de color global** suave (300ms en `background`/`color`).
- Skills mostrados como **chips que se reordenan** al cambiar de categoría (layout animation de Motion).
- Smooth scroll (lenis) para sensación de inercia.

## Estructura del sitio

Single page, scroll vertical, secciones bien separadas:

```text
[Nav fija translúcida: Logo iniciales · Sobre · Experiencia · Proyectos · Contacto · ES/EN · ☀/☾]

1. Hero
   - Nombre enorme con reveal por palabras
   - Una línea de rol + ciudad
   - Foto profesional (right-aligned, tamaño grande, esquinas suaves)
   - CTA: "Descargar CV" + "Contactar"

2. Sobre mí
   - Bio de 2–3 párrafos, tipografía grande
   - Stats clave (años de experiencia, proyectos, etc.)

3. Experiencia
   - Timeline vertical con línea animada
   - Cada item: empresa · rol · años · 2 líneas de logros

4. Proyectos destacados
   - Grid de 3–6 cards con imagen, título, stack, link

5. Skills
   - Chips agrupados por categoría con tabs

6. Contacto
   - Formulario (nombre, email, mensaje) con validación zod
   - Links a LinkedIn, GitHub, email
   - Footer minimal

[Botón flotante: Descargar CV PDF]
```

## Idioma (ES/EN)

Diccionario simple en `src/i18n/{es,en}.ts` con todas las strings. Toggle persiste en `localStorage`. Sin librería pesada (i18next innecesario para un CV).

## Descargar CV en PDF

Dos opciones — recomiendo la **A**:
- **A (recomendada):** Subes tu PDF al chat, lo coloco en `public/cv.pdf` y el botón lo descarga directamente. Más fiel a tu CV real.
- B: Generar el PDF on-the-fly desde el contenido del sitio con `react-to-print` o `jspdf`. Más trabajo, peor tipografía.

## Formulario de contacto

- Validación cliente con `zod` + `react-hook-form` (ya están).
- Envío: necesita backend. Recomiendo activar **Lovable Cloud** para guardar mensajes en una tabla `contact_messages` y opcionalmente enviarte email vía Resend. Sin Cloud, el form solo validaría y abriría `mailto:`. Confirma si activo Cloud.

## Stack técnico

- TanStack Start (ya configurado), una sola ruta `/` por ahora.
- Motion (framer-motion), Lenis para smooth scroll, Lucide para iconos.
- Tokens de color en `src/styles.css` (light + `.dark`), toggle con clase en `<html>`.
- Componentes en `src/components/cv/`: `Nav`, `Hero`, `About`, `Experience`, `Projects`, `Skills`, `Contact`, `LanguageToggle`, `ThemeToggle`.
- Diccionarios en `src/i18n/`.
- Hook `useLang()` y `useTheme()` con persistencia en localStorage.

## Qué necesito de ti (después de aprobar el plan)

1. **Tu CV** — pégalo en el chat o sube el PDF (lo parseo).
2. **Tu foto profesional** — súbela en el chat.
3. **Confirmar si activo Lovable Cloud** para que el formulario guarde mensajes (recomendado).
4. **Si tienes un PDF de CV** ya diseñado para el botón de descarga.

Si apruebas, construyo todo el shell con placeholders y luego, cuando me pases el contenido, lo reemplazo en una pasada.
