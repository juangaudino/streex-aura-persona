import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, LogOut, Plus, Trash2, Pencil, X, Save, Briefcase, GraduationCap, Shield, Paperclip, FileText, Image as ImageIcon, Upload, Loader2, FileEdit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { timelineQuery, profileQuery, readAttachments, type TimelineItem, type TimelineKind, type TimelineAttachment, type ProfileSettings } from "@/lib/cv-queries";


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
        <p className="text-eyebrow mb-3">Timeline</p>
        <h1 className="text-display text-4xl md:text-5xl">Experiencia y educación</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Agrega, edita o elimina items del timeline. Los items con <em>kind: study</em> aparecen en la columna de educación, los <em>work</em> en experiencia. El orden en el sitio se controla con “sort_order” (más alto = más reciente = más arriba).
        </p>

        <TimelineEditor items={timeline.data ?? []} loading={timeline.isLoading} />
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
