import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chobbar — Activewear & streetwear",
    short_name: "Chobbar",
    description: "Activewear and streetwear made in Sialkot. Cash on delivery across Pakistan.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfbfa",
    theme_color: "#e11d48",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
