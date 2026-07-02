// UI labels (nav, form, buttons). El contenido del CV vive en la base de datos.
export type Lang = "es" | "en";

export const dict = {
  es: {
    nav: {
      about: "Sobre mí",
      experience: "Experiencia",
      projects: "Campañas",
      contact: "Contacto",
      download: "Descargar CV",
      admin: "Admin",
    },
    hero: { cta: "Descargar CV", ctaAlt: "Contactar" },
    experience: {
      laneWork: "Experiencia",
      laneStudy: "Educación",
      tagWork: "Trabajo",
      tagStudy: "Estudio",
      eyebrow: "Trayectoria",
      title: "De LATAM a los Estados Unidos.",
    },
    projects: { eyebrow: "Campañas seleccionadas", title: "Verticales donde he ejecutado." },
    skills: { eyebrow: "Capacidades", title: "Estrategia, datos y liderazgo." },
    contact: {
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
      admin: "Admin",
    },
    hero: { cta: "Download CV", ctaAlt: "Get in touch" },
    experience: {
      laneWork: "Experience",
      laneStudy: "Education",
      tagWork: "Work",
      tagStudy: "Study",
      eyebrow: "Journey",
      title: "From LATAM to the United States.",
    },
    projects: { eyebrow: "Selected campaigns", title: "Verticals I've executed in." },
    skills: { eyebrow: "Capabilities", title: "Strategy, data and leadership." },
    contact: {
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
