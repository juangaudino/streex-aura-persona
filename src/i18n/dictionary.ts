export type Lang = "es" | "en";

export const dict = {
  es: {
    nav: {
      about: "Sobre mí",
      experience: "Experiencia",
      projects: "Campañas",
      contact: "Contacto",
      download: "Descargar CV",
    },
    hero: {
      eyebrow: "CV · 2026",
      title: ["Planifico medios", "que mueven", "mercados."],
      role: "Media Planner · Estratega OOH & DOOH",
      location: "Salt Lake City, UT · Disponible para el mercado U.S.",
      cta: "Descargar CV",
      ctaAlt: "Contactar",
    },
    about: {
      eyebrow: "Sobre mí",
      title: "15+ años conectando insights con resultados medibles.",
      body: [
        "Soy Juan Gaudino, media planner con más de 15 años gestionando campañas OOH y DOOH en mercados de Latinoamérica para marcas internacionales.",
        "Ahora basado en Utah, estoy expandiendo mi expertise hacia publicidad programática y analítica digital, con el foco puesto en aportar soluciones data-driven al mercado estadounidense.",
      ],
      stats: [
        { value: "15+", label: "Años de experiencia" },
        { value: "10+", label: "Planners liderados" },
        { value: "4+", label: "Mercados LATAM abiertos" },
      ],
    },
    experience: {
      eyebrow: "Trayectoria",
      title: "De LATAM a los Estados Unidos.",
      items: [
        {
          company: "LATCOM · Buenos Aires, Argentina",
          role: "Media Planning Coordinator",
          period: "May 2021 — Jul 2023",
          summary:
            "Lideré un equipo de 10+ planners coordinando campañas OOH y DOOH multimercado. Diseñé estrategias para marcas internacionales en transit, malls, aeropuertos y vallas digitales, negociando contratos con proveedores y optimizando costos.",
        },
        {
          company: "LATCOM · Vicente López, Buenos Aires",
          role: "Strategic Development Analyst — USA, LATAM & Europa",
          period: "Oct 2015 — Abr 2021",
          summary:
            "Diseñé y ejecuté planes estratégicos OOH/DOOH para clientes en USA, LATAM y Europa. Expandí cobertura a 4+ nuevos mercados LATAM y entregué reportes analíticos y proyecciones económicas para soportar decisiones ejecutivas.",
        },
        {
          company: "Weber State University · Ogden, Utah",
          role: "Entrepreneurship Certificate",
          period: "2026",
          summary:
            "Formación complementaria orientada a programmatic advertising, digital analytics y emprendimiento en el mercado estadounidense.",
        },
        {
          company: "Universidad Dr. Rafael Belloso Chacín (URBE) · Venezuela",
          role: "Licenciatura en Marketing y Publicidad",
          period: "2006",
          summary: "Base académica en marketing, publicidad y estrategia de marca.",
        },
      ],
    },
    projects: {
      eyebrow: "Campañas seleccionadas",
      title: "Verticales donde he ejecutado.",
      items: [
        { name: "Transit Media", desc: "Campañas OOH en buses, metro y transporte público multi-ciudad.", stack: "OOH · LATAM" },
        { name: "Malls & Retail", desc: "Activaciones DOOH en shoppings y high-traffic retail.", stack: "DOOH · Retail" },
        { name: "Airports", desc: "Planificación en aeropuertos clave de LATAM para marcas globales.", stack: "OOH/DOOH · Travel" },
        { name: "Digital Billboards", desc: "Pantallas digitales en corredores premium con segmentación por daypart.", stack: "DOOH · Programmatic" },
      ],
    },
    skills: {
      eyebrow: "Capacidades",
      title: "Estrategia, datos y liderazgo.",
      groups: {
        strategy: { label: "Estrategia", items: ["Media Planning", "OOH / DOOH", "Market Research", "Vendor Negotiation", "Regional Expansion", "Brand Strategy"] },
        analytics: { label: "Analítica", items: ["Programmatic Advertising", "Digital Analytics", "Reporting", "Economic Projections", "Campaign Performance", "Insights"] },
        leadership: { label: "Liderazgo", items: ["Team Leadership (10+)", "Client Relations", "Cross-market Coordination", "Vendor Partnerships", "Executive Reporting", "Bilingüe ES/EN"] },
      },
    },
    contact: {
      eyebrow: "Hablemos",
      title: "¿Un proyecto en mente? Conversemos.",
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
    footer: "Juan Gaudino · Salt Lake City, UT",
  },
  en: {
    nav: {
      about: "About",
      experience: "Experience",
      projects: "Campaigns",
      contact: "Contact",
      download: "Download CV",
    },
    hero: {
      eyebrow: "CV · 2026",
      title: ["I plan media", "that moves", "markets."],
      role: "Media Planner · OOH & DOOH Strategist",
      location: "Salt Lake City, UT · Open to U.S. market opportunities",
      cta: "Download CV",
      ctaAlt: "Get in touch",
    },
    about: {
      eyebrow: "About",
      title: "15+ years connecting insights to measurable results.",
      body: [
        "I'm Juan Gaudino, a media planner with over 15 years managing OOH and DOOH campaigns across Latin American markets for international brands.",
        "Now based in Utah, I'm expanding my expertise into programmatic advertising and digital analytics, focused on bringing fresh, data-driven solutions to the U.S. market.",
      ],
      stats: [
        { value: "15+", label: "Years of experience" },
        { value: "10+", label: "Planners led" },
        { value: "4+", label: "LATAM markets opened" },
      ],
    },
    experience: {
      eyebrow: "Journey",
      title: "From LATAM to the United States.",
      items: [
        {
          company: "LATCOM · Buenos Aires, Argentina",
          role: "Media Planning Coordinator",
          period: "May 2021 — Jul 2023",
          summary:
            "Led a team of 10+ planners coordinating multi-market OOH and DOOH campaigns. Designed strategies for top international brands across transit, malls, airports and digital billboards, negotiating vendor contracts and optimizing costs.",
        },
        {
          company: "LATCOM · Vicente López, Buenos Aires",
          role: "Strategic Development Analyst — USA, LATAM & Europe",
          period: "Oct 2015 — Apr 2021",
          summary:
            "Designed and executed strategic OOH/DOOH plans for clients in the U.S., LATAM and Europe. Expanded coverage to 4+ new LATAM markets and delivered analytical reports and economic projections to support executive decisions.",
        },
        {
          company: "Weber State University · Ogden, Utah",
          role: "Entrepreneurship Certificate",
          period: "2026",
          summary:
            "Continuing education focused on programmatic advertising, digital analytics, and entrepreneurship in the U.S. market.",
        },
        {
          company: "Universidad Dr. Rafael Belloso Chacín (URBE) · Venezuela",
          role: "Bachelor's Degree in Marketing & Advertising",
          period: "2006",
          summary: "Academic foundation in marketing, advertising and brand strategy.",
        },
      ],
    },
    projects: {
      eyebrow: "Selected campaigns",
      title: "Verticals I've executed in.",
      items: [
        { name: "Transit Media", desc: "OOH campaigns across buses, subway and public transport in multiple cities.", stack: "OOH · LATAM" },
        { name: "Malls & Retail", desc: "DOOH activations in shopping centers and high-traffic retail.", stack: "DOOH · Retail" },
        { name: "Airports", desc: "Planning across key LATAM airports for global brands.", stack: "OOH/DOOH · Travel" },
        { name: "Digital Billboards", desc: "Digital screens in premium corridors with daypart targeting.", stack: "DOOH · Programmatic" },
      ],
    },
    skills: {
      eyebrow: "Capabilities",
      title: "Strategy, data and leadership.",
      groups: {
        strategy: { label: "Strategy", items: ["Media Planning", "OOH / DOOH", "Market Research", "Vendor Negotiation", "Regional Expansion", "Brand Strategy"] },
        analytics: { label: "Analytics", items: ["Programmatic Advertising", "Digital Analytics", "Reporting", "Economic Projections", "Campaign Performance", "Insights"] },
        leadership: { label: "Leadership", items: ["Team Leadership (10+)", "Client Relations", "Cross-market Coordination", "Vendor Partnerships", "Executive Reporting", "Bilingual ES/EN"] },
      },
    },
    contact: {
      eyebrow: "Let's talk",
      title: "Got a project in mind? Let's chat.",
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
    footer: "Juan Gaudino · Salt Lake City, UT",
  },
} as const;

export type Dict = (typeof dict)["es"];
