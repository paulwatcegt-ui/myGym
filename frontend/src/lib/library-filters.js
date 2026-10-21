// Personal library scope; it never changes the catalogue or exercise IDs used by training.
export const libraryFilterVisible = (S, group, value) =>
  S.libraryFilterVisibility?.[`${group}:${value}`]?.hidden !== true

export const visibleLibraryFilters = (S, group, options) =>
  orderLibraryFilters(S, group, options).filter(value => libraryFilterVisible(S, group, value))

export function orderLibraryFilters(S, group, options) {
  const saved = S.libraryFilterOrder?.[group]?.values
  const valid = new Set(options)
  return [...new Set([...(Array.isArray(saved) ? saved.filter(value => valid.has(value)) : []), ...options])]
}

export function setLibraryFilterOrder(S, group, values) {
  const map = S.libraryFilterOrder ||= {}
  map[group] = { values: [...new Set(values.filter(value => typeof value === 'string'))], _ts: Math.max(Date.now(), (Number(map[group]?._ts) || 0) + 1) }
}

export function resetLibraryFilterOrder(S) {
  for (const group of Object.keys(S.libraryFilterOrder || {})) setLibraryFilterOrder(S, group, [])
}

// Compute each group's choices against the full library, before search or chip filters.
// Otherwise a search with no selected matches could accidentally disable the restriction.
export function filterLibraryExercises(S, exercises, universe = exercises) {
  const groups = [['bodyParts', 'bp'], ['categories', 'cat'], ['equipment', 'eq']]
  const constraints = groups.flatMap(([group, field]) => {
    const options = [...new Set(universe.map(ex => ex[field]).filter(Boolean))]
    const allowed = new Set(visibleLibraryFilters(S, group, options))
    if (allowed.size === options.length) return []
    return [ex => allowed.has(ex[field])]
  })
  return exercises.filter(ex => constraints.every(matches => matches(ex)))
}

export function setLibraryFilterVisibility(S, group, value, visible) {
  const map = S.libraryFilterVisibility ||= {}
  const key = `${group}:${value}`
  map[key] = { hidden: !visible, _ts: Math.max(Date.now(), (Number(map[key]?._ts) || 0) + 1) }
}

export function showAllLibraryFilters(S) {
  const map = S.libraryFilterVisibility || {}
  for (const [key, entry] of Object.entries(map)) {
    if (entry?.hidden === true) map[key] = { hidden: false, _ts: Math.max(Date.now(), (Number(entry._ts) || 0) + 1) }
  }
}
