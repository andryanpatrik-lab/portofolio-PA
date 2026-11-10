import localFont from "next/font/local";

export const spaceGrotesk = localFont({
  src: [
    { path: "../fonts/space-grotesk-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../fonts/space-grotesk-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/space-grotesk-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const jetbrainsMono = localFont({
  src: [{ path: "../fonts/jetbrains-mono-latin-500-normal.woff2", weight: "500", style: "normal" }],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
