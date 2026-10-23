// Only allowlisted exercise labels are added to outbound payloads. Never walk arbitrary S.
import { LIB_BY_ID } from './library.js';
export function localizePayload(payload, state) {
  const zh = /^zh(?:[-_]|$)/i.test(payload.meta.lang);
  if (!zh && !Object.keys(state.exerciseOverrides || {}).length) return payload;
  const customs = new Map((Array.isArray(state.customEx) ? state.customEx : []).filter(x => x && typeof x.id === 'string').map(x => [x.id, x]));
  const label = id => {
    const ex = LIB_BY_ID.get(String(id));
    const personal = state.exerciseOverrides?.[id]?.n;
    const own = customs.get(id)?.n;
    const original = ex?.n || own;
    const name = typeof personal === 'string' && personal.trim() ? personal : own || (zh ? ex?.nZh : ex?.n);
    return typeof name === 'string' && name ? { name: name.slice(0, 80), originalName: typeof original === 'string' ? original.slice(0, 80) : undefined } : null;
  };
  const apply = value => {
    if (!value || typeof value !== 'object') return;
    const names = label(value.id);
    if (!names) return;
    if (Object.prototype.hasOwnProperty.call(value, 'n')) value.n = names.name;
    else value.displayName = names.name;
    if (Object.prototype.hasOwnProperty.call(value, 'name')) value.name = names.name;
    value.originalName = names.originalName;
  };
  // Visit exercise records only, never routine/workout names, notes, or arbitrary objects.
  for (const plan of [payload.plan, payload.proposedPlan]) for (const r of plan?.routines || []) (r.ex || []).forEach(apply);
  (payload.library || []).forEach(apply);
  (payload.aggregates?.exercises || []).forEach(apply);
  for (const w of [payload.session, ...(payload.previous || []), ...(payload.window?.workouts || [])]) (w?.entries || []).forEach(apply);
  (payload.history?.workingWeights || []).forEach(apply);
  return payload;
}
