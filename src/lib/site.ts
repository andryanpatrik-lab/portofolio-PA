/**
 * Absolute site URL, set at build time. Set SITE_URL in the hosting environment once the domain is decided.
 * Until then the host's own URL is used: Vercel's production URL, Netlify's URL, or localhost for local builds.
 */
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
export const siteUrl = (process.env.SITE_URL || vercelUrl || process.env.URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Only production deploys may be indexed (Vercel: VERCEL_ENV, Netlify: CONTEXT). Previews and branch deploys are
 * noindex. Local builds have neither variable and count as production so they can be verified.
 */
const deployEnv = process.env.VERCEL_ENV || process.env.CONTEXT;
export const isProduction = !deployEnv || deployEnv === "production";
