import { isCustomEx } from './exercises.js'

// A curated starting order for browsing, not measured popularity. Exact IDs keep unusual
// variations and translated/personal names from inheriting a basic exercise's priority.
const COMMON_IDS = [
  '3593', // barbell squat
  '0025', // barbell bench press
  '0032', // barbell deadlift
  '0652', // pull-up
  '0662', // push-up
  '0198', // cable pulldown
  '0861', // cable seated row
  '0027', // barbell bent over row
  '0405', // dumbbell seated shoulder press
  '0739', // sled 45 degree leg press
  '0289', // dumbbell bench press
  '0314', // dumbbell incline bench press
  '0085', // barbell Romanian deadlift
  '0334', // dumbbell lateral raise
  '0293', // dumbbell bent over row
  '0294', // dumbbell biceps curl
  '0200', // cable rope pushdown
  '0585', // lever leg extension
  '0599', // lever seated leg curl
  '0336', // dumbbell lunge
  '0463', // front plank
  '1197', // squat
  '4727', // crunch, arms on chest
  '1162', // barbell standing military press
  '0586', // lever lying leg curl
  '0576', // lever chest press
  '1060', // barbell hip thrust
  '0145', // butt bridge
  '0313', // dumbbell hammer curl
  '5609', // cable standing face pull
  '0602', // lever seated reverse fly
  '0472', // hanging leg raise
  '0715', // side plank
  '3018', // standing calf raise
  '0612', // lunge
  '1182', // kneeling push-up
  '2612', // jump rope
  '2197', // run on treadmill
  '0798', // stationary bike walk
]
const COMMON_RANK = new Map(COMMON_IDS.map((id, index) => [id, index]))

// Keep personal exercises easy to find and preserve catalogue order for the remaining
// entries. Call only while browsing; search results retain their relevance ranking.
export function sortCommonExercisesFirst(list) {
  const rank = ex => isCustomEx(ex) ? -1 : (COMMON_RANK.get(ex.id) ?? COMMON_IDS.length)
  return [...list].sort((a, b) => rank(a) - rank(b))
}
