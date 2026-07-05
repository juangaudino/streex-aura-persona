import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, LogOut, Plus, Trash2, Pencil, X, Save, Briefcase, GraduationCap, Shield, Paperclip, FileText, Image as ImageIcon, Upload, Loader2, FileEdit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { timelineQuery, profileQuery, projectsQuery, skillsQuery, readAttachments, readAboutStats, type TimelineItem, type TimelineKind, type TimelineAttachment, type ProfileSettings, type ProjectRow, type SkillRow, type AboutStat } from "@/lib/cv-queries";


export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Timeline" }] }),
  component: AdminPage,
});

const ease = [0.16, 1, 0.3, 1] as const;

function AdminPage() {
  const nav = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [claimErr, setClaimErr] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  const timeline = useQuery(timelineQuery);

  if (loading || !user) {
    return <FullScreen>Cargando…</FullScreen>;
  }

  if (!isAdmin) {
    return (
      <FullScreen>
        <div className="max-w-md text-center">
          <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="text-display mt-4 text-2xl">Acceso restringido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta cuenta ({user.email}) no tiene rol de admin.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Si eres el dueño del sitio y aún no hay ningún admin registrado, puedes reclamar el rol ahora.
          </p>
          <button
            disabled={claiming}
            onClick={async () => {
              setClaiming(true);
              setClaimErr(null);
              const { data, error } = await supabase.rpc("claim_admin");
              setClaiming(false);
              if (error) {
                setClaimErr(error.message);
                return;
              }
              if (data === true) {
                window.location.reload();
              } else {
                setClaimErr("Ya existe un admin. Contacta al dueño del sitio.");
              }
            }}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
          >
            Reclamar rol de admin
          </button>
          {claimErr && <p className="mt-3 text-sm text-destructive">{claimErr}</p>}
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Volver al sitio</Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                nav({ to: "/auth" });
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </FullScreen>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Sitio
            </Link>
            <span className="text-eyebrow">Admin</span>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              qc.clear();
              nav({ to: "/auth" });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Salir
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <ContentEditor />

        <div className="mt-24">
          <p className="text-eyebrow mb-3">About · Stats</p>
          <h1 className="text-display text-4xl md:text-5xl">Métricas destacadas</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Los tres números que aparecen en la sección About (por ej. “15+ Años de experiencia”). Editá valor y etiquetas bilingües.
          </p>
          <AboutStatsEditor />
        </div>

        <div className="mt-24">
          <p className="text-eyebrow mb-3">Campañas / Proyectos</p>
          <h1 className="text-display text-4xl md:text-5xl">Verticales destacadas</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Sumá, editá o borrá las tarjetas de la sección de campañas.
          </p>
          <ProjectsEditor />
        </div>

        <div className="mt-24">
          <p className="text-eyebrow mb-3">Skills</p>
          <h1 className="text-display text-4xl md:text-5xl">Capacidades</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Cada skill pertenece a una categoría (ej. strategy, analytics, leadership). El label de la categoría se puede traducir. Ordená con “sort_order”.
          </p>
          <SkillsEditor />
        </div>

        <div className="mt-24">
          <p className="text-eyebrow mb-3">Timeline</p>
          <h1 className="text-display text-4xl md:text-5xl">Experiencia y educación</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Agrega, edita o elimina items del timeline. Los items con <em>kind: study</em> aparecen en la columna de educación, los <em>work</em> en experiencia. El orden en el sitio se controla con “sort_order” (más alto = más reciente = más arriba).
          </p>

          <TimelineEditor items={timeline.data ?? []} loading={timeline.isLoading} />
        </div>
      </section>

    </main>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      {children}
    </main>
  );
}

type Draft = {
  id?: string;
  kind: TimelineKind;
  title_es: string;
  title_en: string;
  org: string;
  location: string;
  period_label_es: string;
  period_label_en: string;
  summary_es: string;
  summary_en: string;
  sort_order: number;
  attachments: TimelineAttachment[];
};

const emptyDraft = (nextOrder: number): Draft => ({
  kind: "work",
  title_es: "",
  title_en: "",
  org: "",
  location: "",
  period_label_es: "",
  period_label_en: "",
  summary_es: "",
  summary_en: "",
  sort_order: nextOrder,
  attachments: [],
});

function TimelineEditor({ items, loading }: { items: TimelineItem[]; loading: boolean }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);

  const nextOrder = useMemo(
    () => (items.length ? Math.max(...items.map((i) => i.sort_order)) + 10 : 100),
    [items],
  );

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        kind: d.kind,
        title_es: d.title_es,
        title_en: d.title_en,
        org: d.org,
        location: d.location,
        period_label_es: d.period_label_es,
        period_label_en: d.period_label_en,
        summary_es: d.summary_es,
        summary_en: d.summary_en,
        sort_order: d.sort_order,
        attachments: d.attachments as unknown as never,
      };
      if (d.id) {
        const { error } = await supabase.from("timeline_items").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("timeline_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeline_items"] });
      setEditing(null);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("timeline_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timeline_items"] }),
  });

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Cargando…" : `${items.length} item${items.length === 1 ? "" : "s"}`}
        </p>
        <button
          onClick={() => setEditing(emptyDraft(nextOrder))}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-3.5 w-3.5" /> Nuevo item
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id}>
            <motion.article
              layout
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                      it.kind === "study"
                        ? "border-accent/40 text-accent"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {it.kind === "study" ? <GraduationCap className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                    {it.kind}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {it.period_label_es || it.period_label_en}
                  </span>
                  <span className="text-[10px] text-muted-foreground">order {it.sort_order}</span>
                  {readAttachments(it.attachments).length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      <Paperclip className="h-3 w-3" />
                      {readAttachments(it.attachments).length}
                    </span>
                  )}
                  <span className="hidden">{/* keep grid stable */}</span>
                </div>
                <h3 className="text-display mt-1 truncate text-lg">
                  {it.title_es || it.title_en}
                </h3>
                <p className="truncate text-sm text-muted-foreground">{it.org}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() =>
                    setEditing({
                      id: it.id,
                      kind: it.kind,
                      title_es: it.title_es,
                      title_en: it.title_en,
                      org: it.org,
                      location: it.location,
                      period_label_es: it.period_label_es,
                      period_label_en: it.period_label_en,
                      summary_es: it.summary_es,
                      summary_en: it.summary_en,
                      sort_order: it.sort_order,
                      attachments: readAttachments(it.attachments),
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar este item?")) del.mutate(it.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Borrar
                </button>
              </div>
            </motion.article>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm md:items-center"
            onClick={() => setEditing(null)}
          >
            <motion.form
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-background p-6 md:rounded-3xl md:p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-eyebrow">{editing.id ? "Editar" : "Nuevo"}</p>
                  <h2 className="text-display mt-1 text-2xl">Timeline item</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <label className="col-span-2 flex flex-col gap-1 md:col-span-1">
                  <span className="text-eyebrow">Tipo</span>
                  <div className="flex gap-2">
                    {(["work", "study"] as TimelineKind[]).map((k) => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setEditing({ ...editing, kind: k })}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm ${
                          editing.kind === k
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {k === "study" ? <GraduationCap className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
                        {k === "study" ? "Estudio" : "Trabajo"}
                      </button>
                    ))}
                  </div>
                </label>

                <TextField
                  label="Sort order"
                  type="number"
                  value={String(editing.sort_order)}
                  onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })}
                />

                <TextField label="Título (ES)" value={editing.title_es} onChange={(v) => setEditing({ ...editing, title_es: v })} className="col-span-2 md:col-span-1" />
                <TextField label="Title (EN)" value={editing.title_en} onChange={(v) => setEditing({ ...editing, title_en: v })} className="col-span-2 md:col-span-1" />

                <TextField label="Organización" value={editing.org} onChange={(v) => setEditing({ ...editing, org: v })} className="col-span-2 md:col-span-1" placeholder="LATCOM · Buenos Aires" />
                <TextField label="Ubicación" value={editing.location} onChange={(v) => setEditing({ ...editing, location: v })} className="col-span-2 md:col-span-1" />

                <TextField label="Período (ES)" value={editing.period_label_es} onChange={(v) => setEditing({ ...editing, period_label_es: v })} className="col-span-2 md:col-span-1" placeholder="May 2021 — Jul 2023" />
                <TextField label="Period (EN)" value={editing.period_label_en} onChange={(v) => setEditing({ ...editing, period_label_en: v })} className="col-span-2 md:col-span-1" />

                <TextArea label="Resumen (ES)" value={editing.summary_es} onChange={(v) => setEditing({ ...editing, summary_es: v })} className="col-span-2" />
                <TextArea label="Summary (EN)" value={editing.summary_en} onChange={(v) => setEditing({ ...editing, summary_en: v })} className="col-span-2" />

                <div className="col-span-2">
                  <AttachmentsEditor
                    value={editing.attachments}
                    onChange={(next) => setEditing({ ...editing, attachments: next })}
                  />
                </div>
              </div>

              {save.error && <p className="mt-4 text-sm text-destructive">{(save.error as Error).message}</p>}

              <div className="mt-8 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={save.isPending}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {save.isPending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextField({
  label, value, onChange, className = "", type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; className?: string; type?: string; placeholder?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
      />
    </label>
  );
}

function TextArea({
  label, value, onChange, className = "",
}: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-eyebrow">{label}</span>
      <textarea
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-foreground"
      />
    </label>
  );
}

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // 10 years

function isImage(type: string) {
  return type.startsWith("image/");
}

function AttachmentsEditor({
  value,
  onChange,
}: {
  value: TimelineAttachment[];
  onChange: (next: TimelineAttachment[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    setErr(null);
    try {
      const uploaded: TimelineAttachment[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 25 * 1024 * 1024) {
          throw new Error(`"${file.name}" supera los 25MB`);
        }
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `timeline/${crypto.randomUUID()}-${safe}`;
        const up = await supabase.storage
          .from("cv-attachments")
          .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
        if (up.error) throw up.error;
        const signed = await supabase.storage.from("cv-attachments").createSignedUrl(path, SIGNED_URL_TTL);
        if (signed.error) throw signed.error;
        uploaded.push({
          path,
          url: signed.data.signedUrl,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
        });
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function removeAt(idx: number) {
    const target = value[idx];
    if (!target) return;
    if (!confirm(`¿Eliminar "${target.name}"?`)) return;
    await supabase.storage.from("cv-attachments").remove([target.path]);
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-eyebrow flex items-center gap-1.5">
          <Paperclip className="h-3 w-3" /> Adjuntos (certificados, imágenes, PDFs)
        </span>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Subiendo…" : "Subir archivos"}
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {err && <p className="text-xs text-destructive">{err}</p>}

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          Sin archivos. Subí imágenes o PDFs de certificados, diplomas, etc.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {value.map((a, i) => (
            <li
              key={a.path}
              className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-2.5"
            >
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                {isImage(a.type) ? (
                  <img
                    src={a.url}
                    alt={a.name}
                    className="h-12 w-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm">{a.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {(a.size / 1024).toFixed(0)} KB · {a.type.split("/")[1] || "file"}
                  </p>
                </div>
              </a>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------- Site content editor ----------------

type ContentDraft = Pick<
  ProfileSettings,
  | "hero_eyebrow_es" | "hero_eyebrow_en"
  | "hero_role_es" | "hero_role_en"
  | "hero_location_es" | "hero_location_en"
  | "hero_cta_es" | "hero_cta_en"
  | "hero_cta_alt_es" | "hero_cta_alt_en"
  | "about_eyebrow_es" | "about_eyebrow_en"
  | "about_title_es" | "about_title_en"
  | "experience_eyebrow_es" | "experience_eyebrow_en"
  | "experience_title_es" | "experience_title_en"
  | "experience_lane_work_es" | "experience_lane_work_en"
  | "experience_lane_study_es" | "experience_lane_study_en"
  | "experience_tag_work_es" | "experience_tag_work_en"
  | "experience_tag_study_es" | "experience_tag_study_en"
  | "projects_eyebrow_es" | "projects_eyebrow_en"
  | "projects_title_es" | "projects_title_en"
  | "skills_eyebrow_es" | "skills_eyebrow_en"
  | "skills_title_es" | "skills_title_en"
  | "contact_eyebrow_es" | "contact_eyebrow_en"
  | "contact_title_es" | "contact_title_en"
  | "contact_sub_es" | "contact_sub_en"
> & {
  hero_title_es: string;
  hero_title_en: string;
  about_body_es: string;
  about_body_en: string;
};

function toDraft(p: ProfileSettings): ContentDraft {
  return {
    hero_eyebrow_es: p.hero_eyebrow_es,
    hero_eyebrow_en: p.hero_eyebrow_en,
    hero_title_es: (p.hero_title_es ?? []).join("\n"),
    hero_title_en: (p.hero_title_en ?? []).join("\n"),
    hero_role_es: p.hero_role_es,
    hero_role_en: p.hero_role_en,
    hero_location_es: p.hero_location_es,
    hero_location_en: p.hero_location_en,
    hero_cta_es: p.hero_cta_es,
    hero_cta_en: p.hero_cta_en,
    hero_cta_alt_es: p.hero_cta_alt_es,
    hero_cta_alt_en: p.hero_cta_alt_en,
    about_eyebrow_es: p.about_eyebrow_es,
    about_eyebrow_en: p.about_eyebrow_en,
    about_title_es: p.about_title_es,
    about_title_en: p.about_title_en,
    about_body_es: (p.about_body_es ?? []).join("\n\n"),
    about_body_en: (p.about_body_en ?? []).join("\n\n"),
    experience_eyebrow_es: p.experience_eyebrow_es,
    experience_eyebrow_en: p.experience_eyebrow_en,
    experience_title_es: p.experience_title_es,
    experience_title_en: p.experience_title_en,
    experience_lane_work_es: p.experience_lane_work_es,
    experience_lane_work_en: p.experience_lane_work_en,
    experience_lane_study_es: p.experience_lane_study_es,
    experience_lane_study_en: p.experience_lane_study_en,
    experience_tag_work_es: p.experience_tag_work_es,
    experience_tag_work_en: p.experience_tag_work_en,
    experience_tag_study_es: p.experience_tag_study_es,
    experience_tag_study_en: p.experience_tag_study_en,
    projects_eyebrow_es: p.projects_eyebrow_es,
    projects_eyebrow_en: p.projects_eyebrow_en,
    projects_title_es: p.projects_title_es,
    projects_title_en: p.projects_title_en,
    skills_eyebrow_es: p.skills_eyebrow_es,
    skills_eyebrow_en: p.skills_eyebrow_en,
    skills_title_es: p.skills_title_es,
    skills_title_en: p.skills_title_en,
    contact_eyebrow_es: p.contact_eyebrow_es,
    contact_eyebrow_en: p.contact_eyebrow_en,
    contact_title_es: p.contact_title_es,
    contact_title_en: p.contact_title_en,
    contact_sub_es: p.contact_sub_es,
    contact_sub_en: p.contact_sub_en,
  };
}

function ContentEditor() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery(profileQuery);
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile && !draft) setDraft(toDraft(profile));
  }, [profile, draft]);

  const save = useMutation({
    mutationFn: async (d: ContentDraft) => {
      if (!profile) throw new Error("Perfil no cargado");
      const payload = {
        ...d,
        hero_title_es: d.hero_title_es.split("\n").map((s) => s.trim()).filter(Boolean),
        hero_title_en: d.hero_title_en.split("\n").map((s) => s.trim()).filter(Boolean),
        about_body_es: d.about_body_es.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
        about_body_en: d.about_body_en.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
      };
      const { error } = await supabase.from("profile_settings").update(payload).eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile_settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading || !draft) {
    return (
      <div>
        <p className="text-eyebrow mb-3">Contenido</p>
        <h1 className="text-display text-4xl md:text-5xl">Textos del sitio</h1>
        <p className="mt-6 text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  const update = <K extends keyof ContentDraft>(k: K, v: ContentDraft[K]) =>
    setDraft({ ...draft, [k]: v });

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow mb-3">Contenido</p>
          <h1 className="text-display text-4xl md:text-5xl">Textos del sitio</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Editá todos los títulos, eyebrows y textos de cada sección en español e inglés. Los cambios se ven en el sitio al guardar.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {saved && <span className="text-xs text-accent">Guardado ✓</span>}
          <button
            onClick={() => save.mutate(draft)}
            disabled={save.isPending}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {save.isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {save.error && <p className="mt-4 text-sm text-destructive">{(save.error as Error).message}</p>}

      <div className="mt-10 space-y-10">
        <ContentSection title="Hero" icon={FileEdit}>
          <BilingualField label="Eyebrow" es={draft.hero_eyebrow_es} en={draft.hero_eyebrow_en} onEs={(v) => update("hero_eyebrow_es", v)} onEn={(v) => update("hero_eyebrow_en", v)} />
          <BilingualArea label="Título (una línea por fila)" es={draft.hero_title_es} en={draft.hero_title_en} onEs={(v) => update("hero_title_es", v)} onEn={(v) => update("hero_title_en", v)} rows={4} />
          <BilingualField label="Rol" es={draft.hero_role_es} en={draft.hero_role_en} onEs={(v) => update("hero_role_es", v)} onEn={(v) => update("hero_role_en", v)} />
          <BilingualField label="Ubicación" es={draft.hero_location_es} en={draft.hero_location_en} onEs={(v) => update("hero_location_es", v)} onEn={(v) => update("hero_location_en", v)} />
          <BilingualField label="CTA principal" es={draft.hero_cta_es} en={draft.hero_cta_en} onEs={(v) => update("hero_cta_es", v)} onEn={(v) => update("hero_cta_en", v)} />
          <BilingualField label="CTA secundario" es={draft.hero_cta_alt_es} en={draft.hero_cta_alt_en} onEs={(v) => update("hero_cta_alt_es", v)} onEn={(v) => update("hero_cta_alt_en", v)} />
        </ContentSection>

        <ContentSection title="About" icon={FileEdit}>
          <BilingualField label="Eyebrow" es={draft.about_eyebrow_es} en={draft.about_eyebrow_en} onEs={(v) => update("about_eyebrow_es", v)} onEn={(v) => update("about_eyebrow_en", v)} />
          <BilingualField label="Título" es={draft.about_title_es} en={draft.about_title_en} onEs={(v) => update("about_title_es", v)} onEn={(v) => update("about_title_en", v)} />
          <BilingualArea label="Cuerpo (párrafos separados por línea en blanco)" es={draft.about_body_es} en={draft.about_body_en} onEs={(v) => update("about_body_es", v)} onEn={(v) => update("about_body_en", v)} rows={6} />
        </ContentSection>

        <ContentSection title="Experiencia" icon={Briefcase}>
          <BilingualField label="Eyebrow" es={draft.experience_eyebrow_es} en={draft.experience_eyebrow_en} onEs={(v) => update("experience_eyebrow_es", v)} onEn={(v) => update("experience_eyebrow_en", v)} />
          <BilingualField label="Título" es={draft.experience_title_es} en={draft.experience_title_en} onEs={(v) => update("experience_title_es", v)} onEn={(v) => update("experience_title_en", v)} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <BilingualField label="Columna trabajo" es={draft.experience_lane_work_es} en={draft.experience_lane_work_en} onEs={(v) => update("experience_lane_work_es", v)} onEn={(v) => update("experience_lane_work_en", v)} />
            <BilingualField label="Columna estudio" es={draft.experience_lane_study_es} en={draft.experience_lane_study_en} onEs={(v) => update("experience_lane_study_es", v)} onEn={(v) => update("experience_lane_study_en", v)} />
            <BilingualField label="Tag trabajo" es={draft.experience_tag_work_es} en={draft.experience_tag_work_en} onEs={(v) => update("experience_tag_work_es", v)} onEn={(v) => update("experience_tag_work_en", v)} />
            <BilingualField label="Tag estudio" es={draft.experience_tag_study_es} en={draft.experience_tag_study_en} onEs={(v) => update("experience_tag_study_es", v)} onEn={(v) => update("experience_tag_study_en", v)} />
          </div>
        </ContentSection>

        <ContentSection title="Proyectos / Campañas" icon={FileEdit}>
          <BilingualField label="Eyebrow" es={draft.projects_eyebrow_es} en={draft.projects_eyebrow_en} onEs={(v) => update("projects_eyebrow_es", v)} onEn={(v) => update("projects_eyebrow_en", v)} />
          <BilingualField label="Título" es={draft.projects_title_es} en={draft.projects_title_en} onEs={(v) => update("projects_title_es", v)} onEn={(v) => update("projects_title_en", v)} />
        </ContentSection>

        <ContentSection title="Skills" icon={FileEdit}>
          <BilingualField label="Eyebrow" es={draft.skills_eyebrow_es} en={draft.skills_eyebrow_en} onEs={(v) => update("skills_eyebrow_es", v)} onEn={(v) => update("skills_eyebrow_en", v)} />
          <BilingualField label="Título" es={draft.skills_title_es} en={draft.skills_title_en} onEs={(v) => update("skills_title_es", v)} onEn={(v) => update("skills_title_en", v)} />
        </ContentSection>

        <ContentSection title="Contacto" icon={FileEdit}>
          <BilingualField label="Eyebrow" es={draft.contact_eyebrow_es} en={draft.contact_eyebrow_en} onEs={(v) => update("contact_eyebrow_es", v)} onEn={(v) => update("contact_eyebrow_en", v)} />
          <BilingualField label="Título" es={draft.contact_title_es} en={draft.contact_title_en} onEs={(v) => update("contact_title_es", v)} onEn={(v) => update("contact_title_en", v)} />
          <BilingualArea label="Subtítulo" es={draft.contact_sub_es} en={draft.contact_sub_en} onEs={(v) => update("contact_sub_es", v)} onEn={(v) => update("contact_sub_en", v)} rows={2} />
        </ContentSection>
      </div>

      <div className="mt-8 flex items-center justify-end gap-2">
        {saved && <span className="text-xs text-accent">Guardado ✓</span>}
        <button
          onClick={() => save.mutate(draft)}
          disabled={save.isPending}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {save.isPending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function ContentSection({
  title, icon: Icon, children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-display text-xl">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function BilingualField({
  label, es, en, onEs, onEn,
}: {
  label: string;
  es: string;
  en: string;
  onEs: (v: string) => void;
  onEn: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-eyebrow">{label} · ES</span>
        <input
          value={es}
          onChange={(e) => onEs(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-eyebrow">{label} · EN</span>
        <input
          value={en}
          onChange={(e) => onEn(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </label>
    </div>
  );
}

function BilingualArea({
  label, es, en, onEs, onEn, rows = 3,
}: {
  label: string;
  es: string;
  en: string;
  onEs: (v: string) => void;
  onEn: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-eyebrow">{label} · ES</span>
        <textarea
          value={es}
          rows={rows}
          onChange={(e) => onEs(e.target.value)}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-foreground"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-eyebrow">{label} · EN</span>
        <textarea
          value={en}
          rows={rows}
          onChange={(e) => onEn(e.target.value)}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-foreground"
        />
      </label>
    </div>
  );
}

// ---------------- About stats editor ----------------

function AboutStatsEditor() {
  const qc = useQueryClient();
  const { data: profile } = useQuery(profileQuery);
  const [stats, setStats] = useState<AboutStat[] | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile && !stats) setStats(readAboutStats(profile.about_stats));
  }, [profile, stats]);

  const save = useMutation({
    mutationFn: async (next: AboutStat[]) => {
      if (!profile) throw new Error("Perfil no cargado");
      const { error } = await supabase
        .from("profile_settings")
        .update({ about_stats: next as unknown as never })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile_settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (!stats) return <p className="mt-6 text-sm text-muted-foreground">Cargando…</p>;

  const update = (i: number, patch: Partial<AboutStat>) =>
    setStats(stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  return (
    <div className="mt-8 space-y-4">
      {stats.map((s, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <TextField label="Valor" value={s.value} onChange={(v) => update(i, { value: v })} placeholder="15+" />
            <TextField label="Label ES" value={s.label_es} onChange={(v) => update(i, { label_es: v })} className="md:col-span-1" />
            <TextField label="Label EN" value={s.label_en} onChange={(v) => update(i, { label_en: v })} className="md:col-span-1" />
            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={() => setStats(stats.filter((_, idx) => idx !== i))}
                className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Quitar
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStats([...stats, { value: "", label_es: "", label_en: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs hover:bg-secondary"
        >
          <Plus className="h-3.5 w-3.5" /> Añadir métrica
        </button>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-accent">Guardado ✓</span>}
          <button
            onClick={() => save.mutate(stats)}
            disabled={save.isPending}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {save.isPending ? "Guardando…" : "Guardar métricas"}
          </button>
        </div>
      </div>
      {save.error && <p className="text-sm text-destructive">{(save.error as Error).message}</p>}
    </div>
  );
}

// ---------------- Projects editor ----------------

type ProjectDraft = {
  id?: string;
  name_es: string;
  name_en: string;
  desc_es: string;
  desc_en: string;
  stack: string;
  link: string;
  image_url: string;
  sort_order: number;
};

const emptyProject = (nextOrder: number): ProjectDraft => ({
  name_es: "", name_en: "", desc_es: "", desc_en: "", stack: "", link: "", image_url: "", sort_order: nextOrder,
});

function ProjectsEditor() {
  const qc = useQueryClient();
  const { data: rows, isLoading } = useQuery(projectsQuery);
  const [editing, setEditing] = useState<ProjectDraft | null>(null);
  const items = rows ?? [];
  const nextOrder = useMemo(
    () => (items.length ? Math.max(...items.map((i) => i.sort_order)) + 10 : 10),
    [items],
  );

  const save = useMutation({
    mutationFn: async (d: ProjectDraft) => {
      const payload = {
        name_es: d.name_es, name_en: d.name_en,
        desc_es: d.desc_es, desc_en: d.desc_en,
        stack: d.stack, link: d.link, image_url: d.image_url,
        sort_order: d.sort_order,
      };
      if (d.id) {
        const { error } = await supabase.from("projects").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setEditing(null);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Cargando…" : `${items.length} campaña${items.length === 1 ? "" : "s"}`}
        </p>
        <button
          onClick={() => setEditing(emptyProject(nextOrder))}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
        >
          <Plus className="h-3.5 w-3.5" /> Nueva campaña
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{it.stack || "—"}</span>
                <span className="text-[10px] text-muted-foreground">order {it.sort_order}</span>
              </div>
              <h3 className="text-display mt-1 truncate text-lg">{it.name_es || it.name_en}</h3>
              <p className="truncate text-sm text-muted-foreground">{it.desc_es || it.desc_en}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setEditing({
                  id: it.id, name_es: it.name_es, name_en: it.name_en,
                  desc_es: it.desc_es, desc_en: it.desc_en,
                  stack: it.stack, link: it.link, image_url: it.image_url, sort_order: it.sort_order,
                })}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </button>
              <button
                onClick={() => { if (confirm("¿Eliminar esta campaña?")) del.mutate(it.id); }}
                className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm md:items-center"
            onClick={() => setEditing(null)}
          >
            <motion.form
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-background p-6 md:rounded-3xl md:p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-eyebrow">{editing.id ? "Editar" : "Nueva"}</p>
                  <h2 className="text-display mt-1 text-2xl">Campaña</h2>
                </div>
                <button type="button" onClick={() => setEditing(null)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <TextField label="Nombre (ES)" value={editing.name_es} onChange={(v) => setEditing({ ...editing, name_es: v })} className="col-span-2 md:col-span-1" />
                <TextField label="Name (EN)" value={editing.name_en} onChange={(v) => setEditing({ ...editing, name_en: v })} className="col-span-2 md:col-span-1" />
                <TextArea label="Descripción (ES)" value={editing.desc_es} onChange={(v) => setEditing({ ...editing, desc_es: v })} className="col-span-2" />
                <TextArea label="Description (EN)" value={editing.desc_en} onChange={(v) => setEditing({ ...editing, desc_en: v })} className="col-span-2" />
                <TextField label="Stack / Tag" value={editing.stack} onChange={(v) => setEditing({ ...editing, stack: v })} className="col-span-2 md:col-span-1" placeholder="OOH · LATAM" />
                <TextField label="Sort order" type="number" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })} className="col-span-2 md:col-span-1" />
                <TextField label="Link (opcional)" value={editing.link} onChange={(v) => setEditing({ ...editing, link: v })} className="col-span-2" placeholder="https://…" />
                <TextField label="Image URL (opcional)" value={editing.image_url} onChange={(v) => setEditing({ ...editing, image_url: v })} className="col-span-2" placeholder="https://…" />
              </div>

              {save.error && <p className="mt-4 text-sm text-destructive">{(save.error as Error).message}</p>}

              <div className="mt-8 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
                <button type="submit" disabled={save.isPending} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50">
                  <Save className="h-4 w-4" /> {save.isPending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------- Skills editor ----------------

type SkillDraft = {
  id?: string;
  name: string;
  category: string;
  category_label_es: string;
  category_label_en: string;
  sort_order: number;
};

const emptySkill = (nextOrder: number, category = "", label_es = "", label_en = ""): SkillDraft => ({
  name: "", category, category_label_es: label_es, category_label_en: label_en, sort_order: nextOrder,
});

function SkillsEditor() {
  const qc = useQueryClient();
  const { data: rows, isLoading } = useQuery(skillsQuery);
  const [editing, setEditing] = useState<SkillDraft | null>(null);
  const items = rows ?? [];
  const nextOrder = useMemo(
    () => (items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0),
    [items],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { category: string; label_es: string; label_en: string; items: SkillRow[] }>();
    for (const r of items) {
      if (!map.has(r.category)) map.set(r.category, { category: r.category, label_es: r.category_label_es, label_en: r.category_label_en, items: [] });
      map.get(r.category)!.items.push(r);
    }
    return Array.from(map.values());
  }, [items]);

  const save = useMutation({
    mutationFn: async (d: SkillDraft) => {
      const payload = {
        name: d.name, category: d.category,
        category_label_es: d.category_label_es, category_label_en: d.category_label_en,
        sort_order: d.sort_order,
      };
      if (d.id) {
        const { error } = await supabase.from("skills").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("skills").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["skills"] }); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skills"] }),
  });

  // Bulk update a category's labels across all its rows
  const renameCategory = useMutation({
    mutationFn: async ({ category, label_es, label_en }: { category: string; label_es: string; label_en: string }) => {
      const { error } = await supabase
        .from("skills")
        .update({ category_label_es: label_es, category_label_en: label_en })
        .eq("category", category);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skills"] }),
  });

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Cargando…" : `${items.length} skill${items.length === 1 ? "" : "s"} · ${grouped.length} categoría${grouped.length === 1 ? "" : "s"}`}
        </p>
        <button
          onClick={() => setEditing(emptySkill(nextOrder))}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
        >
          <Plus className="h-3.5 w-3.5" /> Nueva skill
        </button>
      </div>

      <div className="space-y-6">
        {grouped.map((g) => (
          <SkillCategoryCard
            key={g.category}
            group={g}
            onAddSkill={() => setEditing(emptySkill(nextOrder, g.category, g.label_es, g.label_en))}
            onEdit={(s) => setEditing({
              id: s.id, name: s.name, category: s.category,
              category_label_es: s.category_label_es, category_label_en: s.category_label_en,
              sort_order: s.sort_order,
            })}
            onDelete={(id) => { if (confirm("¿Eliminar esta skill?")) del.mutate(id); }}
            onRenameCategory={(label_es, label_en) => renameCategory.mutate({ category: g.category, label_es, label_en })}
            renaming={renameCategory.isPending}
          />
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm md:items-center"
            onClick={() => setEditing(null)}
          >
            <motion.form
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-background p-6 md:rounded-3xl md:p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-eyebrow">{editing.id ? "Editar" : "Nueva"}</p>
                  <h2 className="text-display mt-1 text-2xl">Skill</h2>
                </div>
                <button type="button" onClick={() => setEditing(null)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <TextField label="Nombre" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} className="col-span-2" placeholder="Media Planning" />
                <TextField label="Categoría (id interno)" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} className="col-span-2 md:col-span-1" placeholder="strategy" />
                <TextField label="Sort order" type="number" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })} className="col-span-2 md:col-span-1" />
                <TextField label="Label categoría (ES)" value={editing.category_label_es} onChange={(v) => setEditing({ ...editing, category_label_es: v })} className="col-span-2 md:col-span-1" />
                <TextField label="Label categoría (EN)" value={editing.category_label_en} onChange={(v) => setEditing({ ...editing, category_label_en: v })} className="col-span-2 md:col-span-1" />
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Tip: para agrupar skills en la misma categoría, usá el mismo id (por ej. <code>strategy</code>) y los mismos labels.
              </p>

              {save.error && <p className="mt-4 text-sm text-destructive">{(save.error as Error).message}</p>}

              <div className="mt-8 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
                <button type="submit" disabled={save.isPending} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50">
                  <Save className="h-4 w-4" /> {save.isPending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkillCategoryCard({
  group, onAddSkill, onEdit, onDelete, onRenameCategory, renaming,
}: {
  group: { category: string; label_es: string; label_en: string; items: SkillRow[] };
  onAddSkill: () => void;
  onEdit: (s: SkillRow) => void;
  onDelete: (id: string) => void;
  onRenameCategory: (label_es: string, label_en: string) => void;
  renaming: boolean;
}) {
  const [labelEs, setLabelEs] = useState(group.label_es);
  const [labelEn, setLabelEn] = useState(group.label_en);
  useEffect(() => { setLabelEs(group.label_es); setLabelEn(group.label_en); }, [group.label_es, group.label_en]);
  const dirty = labelEs !== group.label_es || labelEn !== group.label_en;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <p className="text-eyebrow mb-2">Categoría · <code className="text-muted-foreground">{group.category}</code></p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <input value={labelEs} onChange={(e) => setLabelEs(e.target.value)} placeholder="Label ES" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground" />
            <input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} placeholder="Label EN" className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={() => onRenameCategory(labelEs, labelEn)}
              disabled={renaming}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> Guardar labels
            </button>
          )}
          <button type="button" onClick={onAddSkill} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">
            <Plus className="h-3.5 w-3.5" /> Añadir
          </button>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2">
        {group.items.map((s) => (
          <li key={s.id} className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
            <button type="button" onClick={() => onEdit(s)} className="hover:text-foreground">{s.name}</button>
            <span className="text-[10px] text-muted-foreground">#{s.sort_order}</span>
            <button type="button" onClick={() => onDelete(s.id)} className="text-muted-foreground hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
