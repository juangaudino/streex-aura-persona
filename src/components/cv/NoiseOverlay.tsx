import { useEffect, useState } from "react";

/**
 * Fixed, viewport-wide grain overlay. Generates a small tileable noise texture
 * once on mount, then tiles it via background-image. Extremely cheap and gives
 * the site an analog, filmic feel.
 */
export function NoiseOverlay({ opacity = 0.04 }: { opacity?: number }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setUrl(canvas.toDataURL("image/png"));
  }, []);

  if (!url) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-overlay"
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: "128px 128px",
        opacity,
      }}
    />
  );
}
