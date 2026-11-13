// Builds public/data/models.json from the published "Full Model" CSV of the model-catalog sheet.
// Env: MODELS_CSV_URL (published CSV link, set in the host's build env, never committed), MODELS_CSV_FILE (local test file),
// PREV_DATA_URL (previous deployed JSON, used when the sheet cannot be read). The build never fails because of this script:
// it falls back to the previous data, or to an empty "no-data" file.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const OUT = new URL("../public/data/models.json", import.meta.url);

/** Splits CSV text into rows of cells (handles quotes, escaped quotes, CRLF, and commas or newlines inside quotes). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** id-ID numbers: "1.787,814" -> 1787.814, "0,80" -> 0.8, "64,5%" -> 64.5, "" -> null. */
export function num(value) {
  if (value == null) return null;
  const s = String(value).trim().replace(/[%\s]/g, "");
  if (s === "" || s === "-" || s === "—") return null;
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// Header name in the sheet -> field. Mapped by header, never by column position.
const FIELDS = {
  "Kunci": "key",
  "ID model": "id",
  "Vendor": "vendor",
  "Jenis": "type",
  "Konteks": "context",
  "OpenRouter input": "orIn",
  "OpenRouter output": "orOut",
  "Sumopod input": "spIn",
  "Sumopod output": "spOut",
  "Sumopod cache": "spCache",
  "TokenKu input": "tkIn",
  "TokenKu output": "tkOut",
  "TokenKu cache read": "tkCache",
  "Satuan TokenKu": "tkUnit",
  "Campuran 3:1 OpenRouter": "mixOr",
  "Campuran 3:1 Sumopod": "mixSp",
  "Campuran 3:1 TokenKu": "mixTk",
  "Termurah": "best",
  "TokenKu vs OpenRouter": "tkVsOr",
  "TokenKu vs Sumopod": "tkVsSp",
  "Jumlah sumber": "sources",
  "Tersedia di": "avail",
  "Catatan TokenKu": "note",
  "Tanggal data TokenKu": "tkDate",
};
const NUMERIC = new Set(["context", "orIn", "orOut", "spIn", "spOut", "spCache", "tkIn", "tkOut", "tkCache", "mixOr", "mixSp", "mixTk", "tkVsOr", "tkVsSp", "sources"]);

export function toModels(csvText) {
  const rows = parseCsv(csvText);
  const header = rows.shift() ?? [];
  const index = new Map();
  header.forEach((h, i) => FIELDS[h.trim()] && index.set(FIELDS[h.trim()], i));
  if (!index.has("id")) throw new Error('CSV has no "ID model" column; is this the Full Model tab?');
  const models = [];
  for (const r of rows) {
    const m = {};
    for (const [field, i] of index) {
      const raw = (r[i] ?? "").trim();
      m[field] = NUMERIC.has(field) ? num(raw) : raw === "" ? null : raw;
    }
    if (!m.id) continue;
    models.push(m);
  }
  return models;
}

async function readPrevious() {
  const url = process.env.PREV_DATA_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/data/models.json` : "");
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = res.ok ? await res.json() : null;
    return data && Array.isArray(data.models) && data.models.length ? data : null;
  } catch {
    return null;
  }
}

async function readFx() {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=IDR", { signal: AbortSignal.timeout(15000) });
    const j = await res.json();
    const rate = j?.rates?.IDR;
    return typeof rate === "number" ? { rate, date: j.date ?? null } : null;
  } catch {
    return null;
  }
}

async function main() {
  let csv = null;
  let source = "no-data";
  try {
    if (process.env.MODELS_CSV_FILE) {
      csv = await readFile(process.env.MODELS_CSV_FILE, "utf8");
      source = "file";
    } else if (process.env.MODELS_CSV_URL) {
      const res = await fetch(process.env.MODELS_CSV_URL, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      csv = await res.text();
      source = "sheet";
    }
  } catch (e) {
    console.warn(`[fetch-models] cannot read the sheet: ${e.message}`);
  }

  let data = null;
  if (csv) {
    try {
      const models = toModels(csv);
      if (models.length) data = { status: "ok", source, updatedAt: new Date().toISOString(), fx: await readFx(), models };
      else console.warn("[fetch-models] the CSV has no model rows");
    } catch (e) {
      console.warn(`[fetch-models] cannot parse the CSV: ${e.message}`);
    }
  }
  if (!data) {
    const prev = await readPrevious();
    if (prev) {
      data = { ...prev, status: "stale" };
      console.warn("[fetch-models] using the previous deployed data");
    } else data = { status: "no-data", source: "none", updatedAt: null, fx: null, models: [] };
  }
  await mkdir(new URL("./", OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(data));
  console.log(`[fetch-models] ${data.status}: ${data.models.length} models`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
