import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type TimelineItem = Database["public"]["Tables"]["timeline_items"]["Row"];
export type TimelineKind = Database["public"]["Enums"]["timeline_kind"];
export type ProfileSettings = Database["public"]["Tables"]["profile_settings"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type SkillRow = Database["public"]["Tables"]["skills"]["Row"];

export type AboutStat = { value: string; label_es: string; label_en: string };

export function readAboutStats(raw: unknown): AboutStat[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      value: String(s.value ?? ""),
      label_es: String(s.label_es ?? s.label ?? ""),
      label_en: String(s.label_en ?? s.label ?? ""),
    }));
}

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async (): Promise<ProjectRow[]> => {
    const { data, error } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const skillsQuery = queryOptions({
  queryKey: ["skills"],
  queryFn: async (): Promise<SkillRow[]> => {
    const { data, error } = await supabase.from("skills").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const profileQuery = queryOptions({
  queryKey: ["profile_settings"],
  queryFn: async (): Promise<ProfileSettings | null> => {
    const { data, error } = await supabase
      .from("profile_settings")
      .select("*")
      .eq("singleton", true)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});


export type TimelineAttachment = {
  path: string;
  url: string;
  name: string;
  type: string;
  size: number;
};

export function readAttachments(raw: unknown): TimelineAttachment[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (a): a is TimelineAttachment =>
      !!a && typeof a === "object" && typeof (a as any).url === "string" && typeof (a as any).path === "string",
  );
}

export const timelineQuery = queryOptions({
  queryKey: ["timeline_items"],
  queryFn: async (): Promise<TimelineItem[]> => {
    const { data, error } = await supabase
      .from("timeline_items")
      .select("*")
      .order("sort_order", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
