import { useState } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { ArrowRight, Mail, Linkedin, Phone } from "lucide-react";
import { useApp } from "@/hooks/use-theme";
import { useProfileData } from "@/lib/profile-data-context";
import { Reveal, SectionHeader } from "./Reveal";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(2000),
});

export function Contact() {
  const { lang } = useApp();
  const { settings: p } = useProfileData();
  const isEs = lang === "es";
  const t = {
    eyebrow:
      (isEs ? p.contact_eyebrow_es : p.contact_eyebrow_en) || (isEs ? "Contacto" : "Contact"),
    title: (isEs ? p.contact_title_es : p.contact_title_en) || (isEs ? "Hablemos" : "Let’s talk"),
    sub:
      (isEs ? p.contact_sub_es : p.contact_sub_en) ||
      (isEs ? "¿Tienes un proyecto en mente?" : "Have a project in mind?"),
    form: isEs
      ? {
          name: "Nombre",
          email: "Email",
          message: "Mensaje",
          send: "Enviar",
          sent: "Se abrirá tu cliente de correo.",
          error: "Revisa los campos e inténtalo de nuevo.",
        }
      : {
          name: "Name",
          email: "Email",
          message: "Message",
          send: "Send",
          sent: "Your email client will open.",
          error: "Please review the fields and try again.",
        },
  };

  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setStatus("error");
      return;
    }
    const subject = encodeURIComponent(`Contact from ${parsed.data.name}`);
    const body = encodeURIComponent(
      `${parsed.data.message}\n\n— ${parsed.data.name} (${parsed.data.email})`,
    );
    if (!p.email) {
      setStatus("error");
      return;
    }
    window.location.href = `mailto:${p.email}?subject=${subject}&body=${body}`;
    setStatus("sent");
  }

  return (
    <section id="contact" className="px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={t.eyebrow} title={t.title} />

        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <p className="text-lg text-muted-foreground">{t.sub}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="mt-8 space-y-4">
                {[
                  p.email && { Icon: Mail, label: p.email, href: `mailto:${p.email}` },
                  p.phone && { Icon: Phone, label: p.phone, href: `tel:${p.phone}` },
                  p.linkedin && { Icon: Linkedin, label: p.linkedin, href: p.linkedin },
                ]
                  .filter((item): item is { Icon: typeof Mail; label: string; href: string } =>
                    Boolean(item),
                  )
                  .map(({ Icon, label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="group inline-flex items-center gap-3 text-foreground transition-opacity hover:opacity-70"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-base">{label}</span>
                      </a>
                    </li>
                  ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="md:col-span-7">
            <form onSubmit={onSubmit} className="space-y-6">
              <Field label={t.form.name}>
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-0 border-b border-border bg-transparent py-3 text-lg text-foreground outline-none transition-colors focus:border-foreground"
                />
              </Field>
              <Field label={t.form.email}>
                <input
                  required
                  type="email"
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-0 border-b border-border bg-transparent py-3 text-lg text-foreground outline-none transition-colors focus:border-foreground"
                />
              </Field>
              <Field label={t.form.message}>
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full resize-none border-0 border-b border-border bg-transparent py-3 text-lg text-foreground outline-none transition-colors focus:border-foreground"
                />
              </Field>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
              >
                {t.form.send}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </motion.button>

              {status === "sent" && <p className="text-sm text-muted-foreground">{t.form.sent}</p>}
              {status === "error" && <p className="text-sm text-destructive">{t.form.error}</p>}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-eyebrow mb-1 block">{label}</span>
      {children}
    </label>
  );
}
