"use client";

import { useEffect } from "react";
import { arriveBlackHole } from "@/lib/blackHole";

/** Mounted by the case study page: tells the black-hole transition that the new page is in place. Renders nothing. */
export function BlackHoleArrive() {
  useEffect(() => {
    arriveBlackHole();
  }, []);
  return null;
}
