import { describe, expect, it } from "vitest";

import {
  readAboutStats,
  readAttachments,
  readGallery,
  readMetrics,
} from "./cv-queries";

describe("CV data normalizers", () => {
  it("normalizes about stats and supports legacy labels", () => {
    expect(
      readAboutStats([
        { value: "15+", label: "years" },
        { value: 3, label_es: "países", label_en: "countries" },
        null,
      ]),
    ).toEqual([
      { value: "15+", label_es: "years", label_en: "years" },
      { value: "3", label_es: "países", label_en: "countries" },
    ]);
  });

  it("normalizes metrics and preserves prefixes and suffixes", () => {
    expect(
      readMetrics([{ value: 42, prefix: ">", suffix: "%", label: "lift" }]),
    ).toEqual([
      { value: "42", prefix: ">", suffix: "%", label_es: "lift", label_en: "lift" },
    ]);
  });

  it("keeps gallery paths even when a legacy URL is absent", () => {
    expect(
      readGallery([
        { path: "gallery/one.jpg", url: "/one.jpg", caption_es: "Uno" },
        { path: "gallery/missing.jpg", caption_en: "Missing URL" },
        "not-an-entry",
      ]),
    ).toEqual([
        {
          path: "gallery/one.jpg",
          url: "/one.jpg",
          caption_es: "Uno",
          caption_en: "",
        },
        {
          path: "gallery/missing.jpg",
          url: "",
          caption_es: "",
          caption_en: "Missing URL",
        },
      ]);
  });

  it("keeps attachment paths even when a legacy URL is absent", () => {
    expect(
      readAttachments([
        { path: "cv/a.pdf", url: "/a.pdf", name: "A", type: "application/pdf", size: 10 },
        { path: "cv/missing-url.pdf", name: "Missing URL" },
        { url: "/missing-path.pdf", name: "Missing path" },
      ]),
    ).toEqual([
      { path: "cv/a.pdf", url: "/a.pdf", name: "A", type: "application/pdf", size: 10 },
      { path: "cv/missing-url.pdf", url: "", name: "Missing URL", type: "", size: 0 },
    ]);
  });
});
