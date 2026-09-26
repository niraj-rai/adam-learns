/**
 * Path segments inside the app, e.g. "/adam-learns/labs/x" or "/labs/x" → ["labs", "x"].
 * The router's pathname normally omits the base path, so the base is stripped only if present.
 */
export function appSegments(path: string, baseUrl: string = import.meta.env.BASE_URL ?? '/') {
  const base = baseUrl.replace(/\/$/, '')
  const rel = base && (path === base || path.startsWith(`${base}/`)) ? path.slice(base.length) : path
  return rel.split('/').filter(Boolean)
}
