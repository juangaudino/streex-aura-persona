import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { signPublishedStoragePaths, type PortfolioStorageBucket } from "./storage.server";

const storageUrlRequest = z.object({
  bucket: z.enum(["cv-attachments", "cv-projects"]),
  paths: z.array(z.string().min(1).max(512)).max(100),
});

export const refreshStorageUrls = createServerFn({ method: "POST" })
  .validator(storageUrlRequest)
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const urls = await signPublishedStoragePaths(data.bucket as PortfolioStorageBucket, data.paths);
    return { urls };
  });
