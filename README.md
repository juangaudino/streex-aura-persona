# Aura Persona

Portfolio profesional y CV bilingüe de Juan Gaudino. Presenta experiencia,
proyectos, skills, mercados y recorrido profesional en una experiencia visual
minimalista con animaciones e interacción.

## Qué incluye

- Contenido en español e inglés con cambio de idioma.
- Tema claro/oscuro y layout responsive.
- Secciones animadas de presentación, experiencia, proyectos, skills y journey.
- Case studies con métricas y galerías.
- Panel privado de edición en `/admin` protegido por Supabase Auth y el rol
  `admin`.
- Fallback de contenido estático para que la página pueda renderizar mientras
  carga el contenido público de Supabase.

## Stack

- React 19, TanStack Start/Router y Vite 8.
- Tailwind CSS, Motion y componentes Radix UI.
- Supabase para Auth, Postgres y Storage.
- Cloudflare Workers como destino de hosting configurado.

## Desarrollo local

Requiere Node.js 22.12+ y npm.

```sh
git clone https://github.com/juangaudino/streex-aura-persona.git
cd streex-aura-persona
cp .env.example .env
npm ci
npm run dev
```

Comandos de validación:

```sh
npm run lint
npm run test
npm run typecheck
npm run build
npx wrangler deploy --dry-run
```

## Configuración y migración

Usa `.env.example` como plantilla y nunca versiona `.env` ni claves secretas.
La guía [`MIGRATION.md`](MIGRATION.md) documenta la migración de datos,
Storage, Auth y el despliegue independiente.

El dominio `https://professional-motion-story.lovable.app` pertenece al
deployment heredado y se conserva únicamente como referencia histórica. El
Worker y el proyecto Supabase destino todavía deben configurarse antes de
publicar una versión independiente.
