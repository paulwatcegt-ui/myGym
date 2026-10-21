// Personal catalogue edits retain the original id, so plans and logs keep their references.
export function withExerciseOverride(ex, overrides) {
  const own = overrides?.[ex.id]
  if (!own || typeof own !== 'object') return ex
  const out = { ...ex, _libraryOverride: own }
  for (const key of ['n', 'desc', 'bp', 'eq']) if (typeof own[key] === 'string') out[key] = own[key]
  if (Array.isArray(own.st)) out.st = own.st.filter(s => typeof s === 'string')
  return out
}

export function saveExerciseOverride(S, id, patch, reset = false) {
  const map = S.exerciseOverrides ||= {}
  const previous = map[id] || {}
  map[id] = {
    ...(reset ? { hidden: !!previous.hidden } : previous), ...patch,
    _ts: Math.max(Date.now(), (Number(previous._ts) || 0) + 1),
  }
}
