/**
 * Absolute site URL, set at build time. Set SITE_URL in the Netlify environment once the domain is decided;
 * until then Netlify's own URL variable is used (and localhost for local builds).
 */
export const siteUrl = (process.env.SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/$/, "");

/** Only production deploys may be indexed. Local builds (no CONTEXT) count as production so they can be verified. */
export const isProduction = !process.env.CONTEXT || process.env.CONTEXT === "production";
