import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PortfolioStorageBucket = "cv-attachments" | "cv-projects";

const STORAGE_URL_TTL_SECONDS = 60 * 60;
const PATH_LIMIT = 512;

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for Storage URL signing");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    global: { fetch: createSupabaseFetch(serviceRoleKey) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

let supabaseAdmin: ReturnType<typeof getSupabaseAdmin> | undefined;

function getCachedSupabaseAdmin() {
  if (!supabaseAdmin) supabaseAdmin = getSupabaseAdmin();
  return supabaseAdmin;
}

function isAllowedPath(bucket: PortfolioStorageBucket, path: string): boolean {
  if (!path || path.length > PATH_LIMIT) return false;
  return bucket === "cv-projects" ? path.startsWith("gallery/") : path.startsWith("timeline/");
}

function collectPaths(raw: unknown, bucket: PortfolioStorageBucket, allowed: Set<string>) {
  if (!Array.isArray(raw)) return;
  for (const value of raw) {
    if (!value || typeof value !== "object") continue;
    const path = "path" in value && typeof value.path === "string" ? value.path : "";
    if (isAllowedPath(bucket, path)) allowed.add(path);
  }
}

async function findPublishedPaths(bucket: PortfolioStorageBucket): Promise<Set<string>> {
  const supabase = getCachedSupabaseAdmin();
  const allowed = new Set<string>();

  if (bucket === "cv-projects") {
    const { data, error } = await supabase.from("projects").select("gallery");
    if (error) throw error;
    for (const row of data ?? []) collectPaths(row.gallery, bucket, allowed);
  } else {
    const { data, error } = await supabase.from("timeline_items").select("attachments");
    if (error) throw error;
    for (const row of data ?? []) collectPaths(row.attachments, bucket, allowed);
  }

  return allowed;
}

export async function signPublishedStoragePaths(
  bucket: PortfolioStorageBucket,
  paths: string[],
): Promise<Record<string, string>> {
  const requested = [...new Set(paths)].filter((path) => isAllowedPath(bucket, path));
  if (!requested.length) return {};

  const published = await findPublishedPaths(bucket);
  const supabase = getCachedSupabaseAdmin();
  const signed = await Promise.all(
    requested.filter((path) => published.has(path)).map(async (path) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, STORAGE_URL_TTL_SECONDS);
      if (error) throw error;
      return [path, data.signedUrl] as const;
    }),
  );

  return Object.fromEntries(signed);
}
