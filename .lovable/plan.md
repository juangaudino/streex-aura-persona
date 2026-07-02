## Objetivo

Un solo timeline con **dos carriles paralelos** compartiendo el mismo eje temporal: **Experiencia** a un lado, **Educación** al otro. Así se ve claramente cuándo estudiaste y trabajaste al mismo tiempo.

## Cambios

### 1. Volver a fusionar los datos en `src/i18n/dictionary.ts`
- Eliminar la sección `education` separada que agregué.
- Cada item del timeline tendrá un campo extra `kind: "work" | "study"` y un `year` numérico (inicio) para poder ordenarlo cronológicamente descendente.
- Items resultantes (ES/EN):
  - 2026 · study · Weber State University — Entrepreneurship Certificate
  - 2021–2023 · work · LATCOM — Media Planning Coordinator
  - 2015–2021 · work · LATCOM — Strategic Development Analyst
  - 2006 · study · URBE — Licenciatura en Marketing y Publicidad

### 2. Rediseñar `src/components/cv/Experience.tsx` como timeline de dos carriles

Layout desktop (≥ md):

```text
     EXPERIENCIA              │              EDUCACIÓN
                              │
                              ●  2026
                              │  Weber State — Entrepreneurship
   2021–2023  ●               │
   LATCOM · Coordinator       │
                              │
   2015–2021  ●               │
   LATCOM · Analyst           │
                              │
                              ●  2006
                              │  URBE — Marketing & Advertising
```

- La línea central sigue siendo el eje de tiempo con la animación de scroll (spring + glow viajero) que ya construimos.
- Cada item se ancla al lado que le corresponde según `kind`: `work` → izquierda, `study` → derecha. Los headers "Experiencia" / "Educación" quedan fijos arriba del carril como etiquetas de columna.
- Los nodos en el eje mantienen el hover con scale + halo accent; el item del lado opuesto que caiga en el mismo rango temporal se resalta sutilmente (opacidad ligeramente elevada) para reforzar la idea de simultaneidad.

Layout mobile (< md):
- Un solo carril vertical a la izquierda (como está hoy), pero cada item lleva un chip pequeño "Trabajo" / "Estudio" en color accent para distinguir el tipo. No se puede mostrar "paralelo" real con el ancho mobile sin sacrificar legibilidad.

### 3. Deshacer la sección Education separada
- Borrar `src/components/cv/Education.tsx`.
- Quitar el import y el `<Education />` de `src/routes/index.tsx`.
- Sacar la entrada `education` del `Nav` si la agregué (revisar al implementar).

### 4. Header de la sección
- Mantener el `SectionHeader` actual con `t.title` ("De LATAM a los Estados Unidos" / "From LATAM to the United States").
- Sobre el timeline, agregar dos labels de columna ("Experiencia" | "Educación") en desktop, alineados a los carriles.

## Notas técnicas

- Se mantiene `useScroll` + `useSpring` para la línea de progreso y el glow viajero que ya funciona.
- El hover sigue con el patrón actual (`onMouseEnter`/`Leave`, dimming del resto, scale del nodo, subrayado animado del rol).
- Grid desktop: `grid-cols-[1fr_auto_1fr]` con la línea central como columna del medio (ancho fijo), y cada item usa `col-start-1` o `col-start-3` según `kind`.
- Sin nuevas dependencias.
