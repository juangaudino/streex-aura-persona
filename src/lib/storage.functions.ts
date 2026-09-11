import { createServerFn } from "@tanstack/react-start";
import { getCookie, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  loadPrivateProfile,
  redeemProfileAccessToken,
  PROFILE_ACCESS_COOKIE,
} from "./profile.server";
import { signProfileStoragePaths, type PortfolioStorageBucket } from "./storage.server";

const storageUrlRequest = z.object({
  bucket: z.enum(["cv-attachments", "cv-projects"]),
  paths: z.array(z.string().min(1).max(512)).max(100),
});

export const refreshStorageUrls = createServerFn({ method: "POST" })
  .validator(storageUrlRequest)
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const token = getCookie(PROFILE_ACCESS_COOKIE);
    if (!token) return { urls: {} };

    const access = await redeemProfileAccessToken(token);
    if (!access) return { urls: {} };

    const profile = await loadPrivateProfile(access.slug, token);
    if (!profile) return { urls: {} };

    const urls = await signProfileStoragePaths(
      profile.profile.id,
      data.bucket as PortfolioStorageBucket,
      data.paths,
    );
    return { urls };
  });
