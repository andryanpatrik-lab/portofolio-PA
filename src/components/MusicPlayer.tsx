"use client";

import { useEffect } from "react";
import { initMusic } from "@/lib/music";

/** Arms the background music (src/lib/music.ts) once; renders nothing. An empty `src` keeps the feature off. */
export function MusicPlayer({ src }: { src: string }) {
  useEffect(() => {
    initMusic(src);
  }, [src]);
  return null;
}
