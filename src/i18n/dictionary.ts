export type Lang = "es" | "en";

export const dict = {
  es: {
    nav: {
      about: "Sobre mí",
      experience: "Experiencia",
      projects: "Proyectos",
      contact: "Contacto",
      download: "Descargar CV",
    },
    hero: {
      eyebrow: "Portfolio · 2026",
      title: ["Diseño,", "construyo y", "lanzo producto."],
      role: "Product Designer & Engineer",
      location: "Basado en Madrid · Disponible para proyectos",
      cta: "Descargar CV",
      ctaAlt: "Contactar",
    },
    about: {
      eyebrow: "Sobre mí",
      title: "Construyo productos digitales que se sienten inevitables.",
      body: [
        "Llevo más de una década en la intersección entre diseño e ingeniería, ayudando a equipos a transformar ideas complejas en interfaces claras y memorables.",
        "Mi enfoque combina rigor técnico con sensibilidad por el detalle. Creo que el buen software es invisible: simplemente funciona.",
      ],
      stats: [
        { value: "10+", label: "Años de experiencia" },
        { value: "45", label: "Productos lanzados" },
        { value: "12", label: "Países" },
      ],
    },
    experience: {
      eyebrow: "Trayectoria",
      title: "Una década construyendo.",
      items: [
        {
          company: "[Empresa Actual]",
          role: "Senior Product Designer",
          period: "2023 — Presente",
          summary: "Liderando el diseño de la plataforma principal. Sistema de diseño y experiencias clave end-to-end.",
        },
        {
          company: "[Empresa Anterior]",
          role: "Design Lead",
          period: "2020 — 2023",
          summary: "Construí el equipo de diseño desde cero. Lancé tres productos que escalaron a millones de usuarios.",
        },
        {
          company: "[Studio]",
          role: "Product Designer",
          period: "2017 — 2020",
          summary: "Trabajé con startups en seed y series A. Branding, producto y dirección creativa.",
        },
        {
          company: "[Agencia]",
          role: "Diseñador Junior",
          period: "2015 — 2017",
          summary: "Primeros pasos. Aprendí a iterar rápido y a defender ideas con datos.",
        },
      ],
    },
    projects: {
      eyebrow: "Trabajo seleccionado",
      title: "Proyectos destacados.",
      items: [
        { name: "[Proyecto Uno]", desc: "Plataforma SaaS de analytics en tiempo real.", stack: "Diseño · React · Datos" },
        { name: "[Proyecto Dos]", desc: "App móvil de finanzas personales con IA.", stack: "Mobile · IA · Producto" },
        { name: "[Proyecto Tres]", desc: "Sistema de diseño open source con 30k descargas.", stack: "Sistema · Open Source" },
        { name: "[Proyecto Cuatro]", desc: "Rediseño completo de e-commerce que duplicó conversión.", stack: "E-commerce · UX" },
      ],
    },
    skills: {
      eyebrow: "Stack",
      title: "Herramientas del oficio.",
      groups: {
        design: { label: "Diseño", items: ["Figma", "Framer", "Principle", "After Effects", "Photoshop", "Illustrator"] },
        code: { label: "Código", items: ["TypeScript", "React", "Next.js", "Node", "Tailwind", "Motion"] },
        prod: { label: "Producto", items: ["Investigación", "Discovery", "Roadmapping", "A/B Testing", "Analytics", "Liderazgo"] },
      },
    },
    contact: {
      eyebrow: "Hablemos",
      title: "¿Tienes una idea? Cuéntamela.",
      sub: "Respondo en menos de 48h. También puedes encontrarme aquí:",
      form: {
        name: "Nombre",
        email: "Email",
        message: "Mensaje",
        send: "Enviar mensaje",
        sent: "Mensaje enviado. Te respondo pronto.",
        error: "Algo falló. Inténtalo de nuevo.",
      },
    },
    footer: "Diseñado y construido con cuidado.",
  },
  en: {
    nav: {
      about: "About",
      experience: "Experience",
      projects: "Work",
      contact: "Contact",
      download: "Download CV",
    },
    hero: {
      eyebrow: "Portfolio · 2026",
      title: ["I design,", "build and", "ship product."],
      role: "Product Designer & Engineer",
      location: "Based in Madrid · Available for projects",
      cta: "Download CV",
      ctaAlt: "Get in touch",
    },
    about: {
      eyebrow: "About",
      title: "I build digital products that feel inevitable.",
      body: [
        "For over a decade I've worked at the intersection of design and engineering, helping teams turn complex ideas into clear, memorable interfaces.",
        "My approach combines technical rigor with a sensitivity for detail. I believe good software is invisible: it just works.",
      ],
      stats: [
        { value: "10+", label: "Years of experience" },
        { value: "45", label: "Products shipped" },
        { value: "12", label: "Countries" },
      ],
    },
    experience: {
      eyebrow: "Journey",
      title: "A decade of building.",
      items: [
        {
          company: "[Current Company]",
          role: "Senior Product Designer",
          period: "2023 — Present",
          summary: "Leading design for the core platform. Design system and key end-to-end experiences.",
        },
        {
          company: "[Previous Company]",
          role: "Design Lead",
          period: "2020 — 2023",
          summary: "Built the design team from scratch. Shipped three products that scaled to millions.",
        },
        {
          company: "[Studio]",
          role: "Product Designer",
          period: "2017 — 2020",
          summary: "Worked with seed and Series A startups. Branding, product and creative direction.",
        },
        {
          company: "[Agency]",
          role: "Junior Designer",
          period: "2015 — 2017",
          summary: "First steps. Learned to iterate fast and defend ideas with data.",
        },
      ],
    },
    projects: {
      eyebrow: "Selected work",
      title: "Featured projects.",
      items: [
        { name: "[Project One]", desc: "Real-time analytics SaaS platform.", stack: "Design · React · Data" },
        { name: "[Project Two]", desc: "Personal finance mobile app powered by AI.", stack: "Mobile · AI · Product" },
        { name: "[Project Three]", desc: "Open source design system with 30k downloads.", stack: "System · Open Source" },
        { name: "[Project Four]", desc: "Full e-commerce redesign that doubled conversion.", stack: "E-commerce · UX" },
      ],
    },
    skills: {
      eyebrow: "Stack",
      title: "Tools of the trade.",
      groups: {
        design: { label: "Design", items: ["Figma", "Framer", "Principle", "After Effects", "Photoshop", "Illustrator"] },
        code: { label: "Code", items: ["TypeScript", "React", "Next.js", "Node", "Tailwind", "Motion"] },
        prod: { label: "Product", items: ["Research", "Discovery", "Roadmapping", "A/B Testing", "Analytics", "Leadership"] },
      },
    },
    contact: {
      eyebrow: "Let's talk",
      title: "Got an idea? Tell me about it.",
      sub: "I reply within 48h. You can also find me here:",
      form: {
        name: "Name",
        email: "Email",
        message: "Message",
        send: "Send message",
        sent: "Message sent. I'll get back to you soon.",
        error: "Something went wrong. Try again.",
      },
    },
    footer: "Designed and built with care.",
  },
} as const;

export type Dict = (typeof dict)["es"];
