import { readFileSync } from "node:fs";
import { join } from "node:path";
import settings from "@content/ollama-test.json";
import { fits, type OllamaModel, type OllamaSettings } from "./ollamaFit";

export type OllamaData = { status: "ok" | "stale" | "no-data"; updatedAt: string | null; models: OllamaModel[] };

export const ollamaSettings: OllamaSettings = settings;

/** Reads public/data/ollama.json (written by scripts/fetch-ollama.mjs before the build). Missing file means no data. */
export function getOllama(): OllamaData {
  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), "public", "data", "ollama.json"), "utf8"));
    return { status: raw.status ?? "ok", updatedAt: raw.updatedAt ?? null, models: Array.isArray(raw.models) ? raw.models : [] };
  } catch {
    return { status: "no-data", updatedAt: null, models: [] };
  }
}

export function ollamaStats(models: OllamaModel[]) {
  const fitting = models.filter((m) => fits(m, ollamaSettings.ramGb, ollamaSettings));
  return { total: models.length, fitting };
}
