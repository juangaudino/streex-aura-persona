import type { Database } from "@/integrations/supabase/types";
import {
  getCachedSupabaseAdmin,
  signProfileStoragePaths,
  type PortfolioStorageBucket,
} from "./storage.server";

export const PROFILE_ACCESS_COOKIE = "__Host-streex-profile-access";
const PROFILE_ACCESS_MAX_AGE = 60 * 60 * 24 * 7;

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileSettings = Database["public"]["Tables"]["profile_settings"]["Row"];
type TimelineItem = Database["public"]["Tables"]["timeline_items"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type SkillRow = Database["public"]["Tables"]["skills"]["Row"];
type MarketRow = Database["public"]["Tables"]["markets"]["Row"];

export type PrivateProfileData = {
  profile: Profile;
  settings: ProfileSettings;
  timeline: TimelineItem[];
  projects: ProjectRow[];
  skills: SkillRow[];
  markets: MarketRow[];
};

export type ProfileAccessResult = { slug: string } | null;

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashProfileAccessToken(token: string): Promise<string> {
  const encoded = new TextEncoder().encode(token);
  return toHex(await crypto.subtle.digest("SHA-256", encoded));
}

export function profileAccessCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: PROFILE_ACCESS_MAX_AGE,
    path: "/",
  };
}

export async function redeemProfileAccessToken(token: string): Promise<ProfileAccessResult> {
  const normalized = token.trim();
  if (!/^[A-Za-z0-9_-]{32,200}$/.test(normalized)) return null;

  const tokenHash = await hashProfileAccessToken(normalized);
  const supabase = getCachedSupabaseAdmin();
  const { data, error } = await supabase
    .from("profile_access_links")
    .select("id, profile_id, expires_at, revoked_at, profiles!inner(slug, is_active)")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .maybeSingle();
  if (error || !data || data.profiles?.is_active !== true) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return null;

  await supabase
    .from("profile_access_links")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { slug: data.profiles.slug };
}

async function signRows(
  profileId: string,
  bucket: PortfolioStorageBucket,
  rows: Array<{ attachments?: unknown; gallery?: unknown }>,
  field: "attachments" | "gallery",
) {
  const paths: string[] = [];
  for (const row of rows) {
    if (!Array.isArray(row[field])) continue;
    for (const item of row[field]) {
      if (item && typeof item === "object" && "path" in item && typeof item.path === "string") {
        paths.push(item.path);
      }
    }
  }
  const urls = await signProfileStoragePaths(profileId, bucket, paths);
  return rows.map((row) => ({
    ...row,
    [field]: Array.isArray(row[field])
      ? row[field].map((item) =>
          item && typeof item === "object" && "path" in item && typeof item.path === "string"
            ? { ...item, url: urls[item.path] ?? "" }
            : item,
        )
      : row[field],
  }));
}

export async function loadPrivateProfile(
  slug: string,
  cookieToken?: string,
): Promise<PrivateProfileData | null> {
  if (!cookieToken) return null;

  const tokenHash = await hashProfileAccessToken(cookieToken);
  const supabase = getCachedSupabaseAdmin();
  const { data: access, error: accessError } = await supabase
    .from("profile_access_links")
    .select("profile_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .maybeSingle();
  if (accessError || !access) return null;
  if (access.expires_at && new Date(access.expires_at).getTime() <= Date.now()) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", access.profile_id)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (profileError || !profile) return null;

  const [settingsResult, timelineResult, projectsResult, skillsResult, marketsResult] =
    await Promise.all([
      supabase.from("profile_settings").select("*").eq("profile_id", profile.id).maybeSingle(),
      supabase
        .from("timeline_items")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order", { ascending: false }),
      supabase
        .from("projects")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("skills")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("markets")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order", { ascending: true }),
    ]);

  if (
    settingsResult.error ||
    timelineResult.error ||
    projectsResult.error ||
    skillsResult.error ||
    marketsResult.error ||
    !settingsResult.data
  ) {
    return null;
  }

  const signedProfileAssets = await signProfileStoragePaths(profile.id, "cv-attachments", [
    settingsResult.data.cv_url,
    settingsResult.data.photo_light_url,
    settingsResult.data.photo_dark_url,
  ]);
  const settings = {
    ...settingsResult.data,
    cv_url: signedProfileAssets[settingsResult.data.cv_url] ?? "",
    photo_light_url: signedProfileAssets[settingsResult.data.photo_light_url] ?? "",
    photo_dark_url: signedProfileAssets[settingsResult.data.photo_dark_url] ?? "",
  };

  const timeline = (await signRows(
    profile.id,
    "cv-attachments",
    timelineResult.data,
    "attachments",
  )) as TimelineItem[];
  const projects = (await signRows(
    profile.id,
    "cv-projects",
    projectsResult.data,
    "gallery",
  )) as ProjectRow[];

  return {
    profile,
    settings,
    timeline,
    projects,
    skills: skillsResult.data,
    markets: marketsResult.data,
  };
}
