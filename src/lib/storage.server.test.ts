import { describe, expect, it } from "vitest";

import { isAllowedStoragePath } from "./storage.server";

describe("Storage path whitelist", () => {
  it("accepts only the prefix belonging to each public bucket", () => {
    expect(isAllowedStoragePath("cv-projects", "gallery/project.png")).toBe(true);
    expect(isAllowedStoragePath("cv-attachments", "timeline/certificate.pdf")).toBe(true);
    expect(isAllowedStoragePath("cv-projects", "timeline/certificate.pdf")).toBe(false);
    expect(isAllowedStoragePath("cv-attachments", "gallery/project.png")).toBe(false);
  });

  it("rejects empty and oversized paths", () => {
    expect(isAllowedStoragePath("cv-projects", "")).toBe(false);
    expect(isAllowedStoragePath("cv-projects", `gallery/${"a".repeat(512)}`)).toBe(false);
  });
});
