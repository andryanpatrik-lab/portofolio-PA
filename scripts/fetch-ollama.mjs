// Builds public/data/ollama.json from the published "Ollama" tab (CSV) of the model-catalog sheet.
// Env: OLLAMA_CSV_URL (published CSV link, set in the host's build env, never committed), OLLAMA_CSV_FILE (local test file),
// PREV_DATA_URL (previous deployed base URL is derived from VERCEL_PROJECT_PRODUCTION_URL when not set).
// The build never fails because of this script: it falls back to the previous data, or to an empty "no-data" file.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { num, parseCsv } from "./fetch-models.mjs";

const OUT = new URL("../public/data/ollama.json", import.meta.url);

// Header name in the sheet -> field. Mapped by header, never by column position. The URL column is deliberately not kept.
const FIELDS = {
  "Model": "name",
  "Ukuran": "size",
  "Parameter (miliar)": "params",
  "Perkiraan RAM (GB)": "ram",
  "Kemampuan": "cap",
  "Pull (angka)": "pulls",
};
const NUMERIC = new Set(["params", "ram", "pulls"]);

export function toOllamaModels(csvText) {
  const rows = parseCsv(csvText);
  const header = rows.shift() ?? [];
  const index = new Map();
  header.forEach((h, i) => FIELDS[h.trim()] && index.set(FIELDS[h.trim()], i));
  if (!index.has("name") || !index.has("params")) throw new Error('CSV has no "Model" and "Parameter (miliar)" columns; is this the Ollama tab?');
  const models = [];
  for (const r of rows) {
    const m = {};
    for (const [field, i] of index) {
      const raw = (r[i] ?? "").trim();
      m[field] = NUMERIC.has(field) ? num(raw) : raw === "" ? null : raw;
    }
    if (!m.name) continue;
    models.push(m);
  }
  return models;
}

async function readPrevious() {
  const base = process.env.PREV_DATA_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/data/ollama.json` : "");
  if (!base) return null;
  try {
    const res = await fetch(base, { signal: AbortSignal.timeout(15000) });
    const data = res.ok ? await res.json() : null;
    return data && Array.isArray(data.models) && data.models.length ? data : null;
  } catch {
    return null;
  }
}

async function main() {
  let csv = null;
  let source = "no-data";
  try {
    if (process.env.OLLAMA_CSV_FILE) {
      csv = await readFile(process.env.OLLAMA_CSV_FILE, "utf8");
      source = "file";
    } else if (process.env.OLLAMA_CSV_URL) {
      const res = await fetch(process.env.OLLAMA_CSV_URL, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      csv = await res.text();
      source = "sheet";
    }
  } catch (e) {
    console.warn(`[fetch-ollama] cannot read the sheet: ${e.message}`);
  }

  let data = null;
  if (csv) {
    try {
      const models = toOllamaModels(csv);
      if (models.length) data = { status: "ok", source, updatedAt: new Date().toISOString(), models };
      else console.warn("[fetch-ollama] the CSV has no model rows");
    } catch (e) {
      console.warn(`[fetch-ollama] cannot parse the CSV: ${e.message}`);
    }
  }
  if (!data) {
    const prev = await readPrevious();
    if (prev) {
      data = { ...prev, status: "stale" };
      console.warn("[fetch-ollama] using the previous deployed data");
    } else data = { status: "no-data", source: "none", updatedAt: null, models: [] };
  }
  await mkdir(new URL("./", OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(data));
  console.log(`[fetch-ollama] ${data.status}: ${data.models.length} models`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
