import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type TimelineItem = Database["public"]["Tables"]["timeline_items"]["Row"];
export type TimelineKind = Database["public"]["Enums"]["timeline_kind"];
export type ProfileSettings = Database["public"]["Tables"]["profile_settings"]["Row"];

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
