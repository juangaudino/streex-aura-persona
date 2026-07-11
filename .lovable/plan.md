
# Plan · Estética OOH nocturna + Split-Flap Hero

Nivel de inmersión: 3/5 — ambientación consistente pero sin caer en escenografía cargada. Paleta noche urbana (negro profundo, ámbar cálido, luz de neón).

## 1. Quitar el efecto de distorsión del título

En `src/components/cv/Hero.tsx` elimino el filtro SVG `feTurbulence` + `feDisplacementMap`, el estado `nameHover`, y todo el `useEffect` que lo anima. El título queda limpio para recibir el nuevo efecto.

## 2. Split-Flap en el título del hero

Nuevo componente `src/components/cv/SplitFlap.tsx`:

- Cada letra es una "aleta" con perspectiva 3D (`transform-style: preserve-3d`).
- Al hover sobre el título, cada letra cicla 4–6 caracteres aleatorios (A–Z, símbolos) y "aterriza" en la correcta con un flip mecánico (rotateX 90° → 0°, easing `[0.2, 0.9, 0.3, 1]`).
- Sonido visual: línea horizontal fina que divide cada aleta (top/bottom) simulando la ranura mecánica del panel Solari.
- Escalonado por letra (`stagger 20ms`) para el efecto de tablero de aeropuerto.
- Respeta `prefers-reduced-motion` (queda estático).
- Se dispara también una vez al montar, no sólo en hover — así el WOW aparece sin interacción.

## 3. Hero como Billboard

Refactor visual de `Hero.tsx`:

- El bloque derecho (retrato) se enmarca dentro de un **billboard SVG**: estructura con dos postes de acero, marco con luces puntuales arriba (bombillas ámbar con `filter: drop-shadow` y pulso sutil), esquineros metálicos.
- El retrato mantiene el mask actual pero dentro del "cartel".
- Debajo del billboard, base con sombra proyectada larga hacia el suelo.
- El texto del hero queda a la izquierda, sobre la escena.

## 4. Highway parallax de fondo

Nuevo componente `src/components/cv/HighwayBackdrop.tsx` (montado dentro del hero, `-z-10`):

- Horizonte bajo con degradado noche → magenta apagado → negro.
- Línea de carretera en perspectiva (SVG) desapareciendo en el horizonte, con líneas discontinuas animadas hacia adelante (loop infinito lento).
- 6–10 "estelas" de luces de auto: pares de puntos rojos/blancos moviéndose por los carriles a distintas velocidades, con blur y bloom.
- Todo respeta reduced-motion (estático).

## 5. City lights bokeh en secciones clave

Nuevo `src/components/cv/CityBokeh.tsx`: capa fija detrás de About, Journey y Contact con 30–40 círculos borrosos (ámbar, blanco cálido, cian tenue) distribuidos aleatoriamente, con `filter: blur(24px)` y opacidad baja (6–12%). Drift suave con `motion` (translate ±20px, 20s loop).

## 6. Ticker DOOH

Nuevo `src/components/cv/DoohTicker.tsx`: banda horizontal delgada tipo pantalla LED (fondo negro, texto ámbar monoespaciado, scanlines sutiles con `repeating-linear-gradient`). Contenido animado (marquee infinito):

- "IMPRESSIONS · 2.4B+"
- "MARKETS · 7"
- "CAMPAIGNS · 120+"
- "YEARS · 15+"
- "OOH · DOOH · PROGRAMMATIC"

Se monta dos veces: una justo debajo del hero (transición al About) y otra antes del footer. Los valores se leen de `profile_settings` (stats existentes) para que sigan siendo editables desde admin — no se agrega tabla nueva.

## 7. Paleta y tokens

En `src/styles.css` agrego tokens semánticos para el modo nocturno:

- `--ooh-amber: oklch(0.82 0.16 75)` (luz de billboard)
- `--ooh-neon: oklch(0.75 0.22 320)` (neón magenta)
- `--ooh-road: oklch(0.15 0.02 260)` (asfalto)
- `--ooh-glow`: gradiente compuesto reutilizable

Se aplican solo en los nuevos componentes; el resto del sitio conserva sus tokens actuales.

## 8. Cambios en `src/routes/index.tsx`

- Se envuelve la sección Hero con `HighwayBackdrop`.
- Se agrega `DoohTicker` después del hero y antes del footer.
- `CityBokeh` se monta como capa global fija detrás del contenido.

## Archivos afectados

Nuevos:
- `src/components/cv/SplitFlap.tsx`
- `src/components/cv/HighwayBackdrop.tsx`
- `src/components/cv/CityBokeh.tsx`
- `src/components/cv/DoohTicker.tsx`

Editados:
- `src/components/cv/Hero.tsx` (quitar distorsión, montar SplitFlap + marco billboard)
- `src/routes/index.tsx` (integrar backdrop, bokeh, tickers)
- `src/styles.css` (tokens OOH)

## Fuera de alcance

- No se toca el admin ni el schema.
- No se cambia el contenido textual del CV.
- No se altera Journey, Projects, Skills, Contact más allá de la capa de bokeh detrás.
