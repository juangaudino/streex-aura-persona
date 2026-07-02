import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type TimelineItem = Database["public"]["Tables"]["timeline_items"]["Row"];
export type TimelineKind = Database["public"]["Enums"]["timeline_kind"];

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
