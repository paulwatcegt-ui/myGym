// Explicit user-edited preferences; model replies cannot update these fields.
export const MEMORY_MAX = 1200;
export const PREFERENCE_MAX = 20;
export function cleanMemory(profile = {}) {
  profile = profile && typeof profile === 'object' ? profile : {};
  const ids = key => [...new Set((Array.isArray(profile[key]) ? profile[key] : [])
    .filter(v => typeof v === 'string' && v.length > 0 && v.length <= 64))].slice(0, PREFERENCE_MAX);
  const avoidedExerciseIds = ids('avoidedExerciseIds');
  return {
    memory: typeof profile.memory === 'string' ? profile.memory.trim().slice(0, MEMORY_MAX) : '',
    preferredExerciseIds: ids('preferredExerciseIds').filter(id => !avoidedExerciseIds.includes(id)),
    avoidedExerciseIds
  };
}
