import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  setResponseHeader,
  setResponseStatus,
} from "@tanstack/react-start/server";
import { z } from "zod";
import {
  loadPrivateProfile,
  profileAccessCookieOptions,
  PROFILE_ACCESS_COOKIE,
  redeemProfileAccessToken,
} from "./profile.server";

const tokenRequest = z.object({
  token: z.string().trim().min(1).max(200),
});

const slugRequest = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const redeemProfileAccess = createServerFn({ method: "POST" })
  .validator(tokenRequest)
  .handler(async ({ data }) => {
    const access = await redeemProfileAccessToken(data.token);
    if (!access) {
      setResponseStatus(404);
      return null;
    }

    setCookie(PROFILE_ACCESS_COOKIE, data.token.trim(), profileAccessCookieOptions());
    setResponseHeader("Cache-Control", "private, no-store");
    return access;
  });

export const getPrivateProfile = createServerFn({ method: "GET" })
  .validator(slugRequest)
  .handler(async ({ data }) => {
    const profile = await loadPrivateProfile(data.slug, getCookie(PROFILE_ACCESS_COOKIE));
    if (!profile) {
      setResponseStatus(404);
      return null;
    }
    setResponseHeader("Cache-Control", "private, no-store");
    setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    return profile;
  });
