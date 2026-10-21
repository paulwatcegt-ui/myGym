import { useDeferredValue, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { EXDB, BODYPARTS, allExercises, equipmentOf, byCategory, searchExercises, similarExercises } from '../lib/exercises.js'
import { MUSCLE_NAME } from '../lib/muscles.js'
import { activeProfile, exAvailable } from '../lib/equipment.js'
import { filterLibraryExercises, libraryFilterVisible, visibleLibraryFilters } from '../lib/library-filters.js'
import { sortCommonExercisesFirst } from '../lib/library-order.js'
import { bestWeightFor } from '../lib/history.js'
import { fmtNum, exCount } from '../lib/format.js'
import { t, tn, exerciseNameFor, exerciseNameClass } from '../lib/i18n.js'
import { Thumb } from '../components/Media.jsx'
import { exerciseDetailSheet, addToRoutineSheet } from '../sheets.jsx'
import Icon from '../components/Icon.jsx'
import ExerciseViewToggle from '../components/ExerciseViewToggle.jsx'
import { Button } from '../components/ui.jsx'
import { tappable, useRevealActiveChip } from '../lib/use-sheet-keyboard.js'
import { useAutoMore } from '../lib/use-auto-more.js'
import { isFav, sortFavouritesFirst, sortYoursFirst, usageOf } from '../lib/favourites.js'

export default function Library() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const [q, setQ] = useState('')
  const [bp, setBp] = useState('')
  const [eq, setEq] = useState('')
  const [cat, setCat] = useState('')
  const [showAll, setShowAll] = useState(false)   // ignore the active equipment profile for this session
  const [shown, setShown] = useState(40)
  const bpStrip = useRef(null), eqStrip = useRef(null), catStrip = useRef(null)
  const moreRef = useAutoMore(() => setShown(s => s + 40))
  const profile = activeProfile(S)
  // Your own exercises, counted the way the list below shows them (allExercises puts every
  // custom entry in front of the catalogue; deleting one removes it from customEx outright).
  const ownCount = (S.customEx || []).filter(c => c && c.id).length
  const all = allExercises(S)
  const scoped = filterLibraryExercises(S, all, allExercises(S, { includeHidden: true }))
  const scopeActive = scoped.length !== all.length
  const bodyParts = visibleLibraryFilters(S, 'bodyParts', BODYPARTS)
  const bpOn = bodyParts.includes(bp) ? bp : ''
  const inPart = searchExercises(scoped.filter(e => !bpOn || e.bp === bpOn), q)
  // Kind of exercise (strength, stretching, cardio...), the same fallback as equipment below: a
  // choice the search or body part has narrowed away is ignored for now, never a dead end.
  const { opts: allCatOpts, on: catOn, list: base } = byCategory(inPart, libraryFilterVisible(S, 'categories', cat) ? cat : '')
  const catOpts = visibleLibraryFilters(S, 'categories', allCatOpts)
  const eqFiltered = (profile && !showAll) ? base.filter(e => exAvailable(S, e)) : base
  const allEqOpts = equipmentOf(eqFiltered)
  const eqOpts = visibleLibraryFilters(S, 'equipment', allEqOpts)
  // Drop the equipment filter if the search narrowed it away, so you never hit a dead end.
  const eqOn = eqOpts.includes(eq) ? eq : ''
  // Browse common exercises first within the filters; favourites still take precedence.
  // Search keeps its relevance order, with favourites and previously used exercises on top.
  const narrowedList = eqOn ? eqFiltered.filter(e => e.eq === eqOn) : eqFiltered
  const usage = useMemo(() => (q.trim() ? usageOf(S) : null), [q, S.routines, S.workouts])
  const f = usage ? sortYoursFirst(narrowedList, S, usage) : sortFavouritesFirst(sortCommonExercisesFirst(narrowedList), S)
  useRevealActiveChip(bpStrip, bpOn)
  useRevealActiveChip(eqStrip, eqOn)
  useRevealActiveChip(catStrip, catOn)
  // A live count at the end of the search field while a search or filter narrows the list
  // (idea and first version: GitLab !31) — how many are left, before scrolling to find out.
  const narrowed = !!(scopeActive || q.trim() || bpOn || eqOn || catOn)
  // Close but not exact (a typo too many, most of the words, a similar name), under the results
  // once they are all on screen, so a search almost never ends on "No match".
  // Worked out a beat behind the typing (useDeferredValue): the list itself never waits for it.
  const qLate = useDeferredValue(q)
  const similar = q.trim() && qLate === q && f.length <= shown
    ? similarExercises(scoped.filter(e => (!bpOn || e.bp === bpOn) && (!catOn || e.cat === catOn) && (!eqOn || e.eq === eqOn) && (!profile || showAll || exAvailable(S, e))), q, f, f.length ? 12 : 30)
    : []
  const row = e => {
    const best = bestWeightFor(S, e.id)
    return <div key={e.id} className="item" {...tappable(() => exerciseDetailSheet(e))}>
      <Thumb ex={e} />
      <div className="grow"><div className={`tt ${exerciseNameClass(e)}`}>{isFav(S, e.id) && <Icon name="starFill" className="fav-star" />}{exerciseNameFor(e)}</div><div className="ss capitalize">{t(MUSCLE_NAME[e.tg] || e.tg || e.bp)} · {t(e.eq)}</div></div>
      {best > 0 && <span className="tag acc">{fmtNum(best)}</span>}
      <Button size="sm" variant="tinted" icon="plus" onClick={ev => { ev.stopPropagation(); addToRoutineSheet(e) }}>{t('Plan')}</Button>
    </div>
  }

  return <>
    <div className="hdr lib-hdr"><div><h1>{t('Exercises')}</h1></div>
      <Button size="sm" variant="tinted" icon="figureStrength" onClick={() => nav('/muscles')}>{t('By muscle')}</Button>
      <div className="sub lib-count">{scopeActive ? exCount(f.length) : ownCount
        ? tn('{1} animated exercises + 1 of your own', '{1} animated exercises + {0} of your own', ownCount, EXDB.length)
        : t('{0} exercises with animations', EXDB.length)}</div>
    </div>
    <div className="search-row" style={{ marginBottom: 10 }}><div className={'search' + (narrowed ? ' has-count' : '') + (q ? ' has-clear' : '')}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
      <input className="input" placeholder={t('Search…')} value={q} onChange={e => { setQ(e.target.value); setShown(40) }} />
      {narrowed && <span className="search-count" role="status" aria-label={exCount(f.length)}>{fmtNum(f.length)}</span>}
      {q && <button className="clear" onClick={() => { setQ(''); setShown(40) }} aria-label={t('Clear')}><Icon name="xmark" /></button>}</div>
      <button className="iconbtn ex-view-btn" aria-label={t('Manage exercises')} title={t('Manage exercises')} onClick={() => nav('/library/manage')}><Icon name="gear" /></button>
      <ExerciseViewToggle /></div>
    {profile && <div className="small dim row" style={{ margin: '-4px 2px 10px', gap: 6, alignItems: 'center' }}>
      <Icon name="kettlebell" style={{ fontSize: 13 }} />
      {showAll ? t('Showing all equipment') : t('Showing what you have in "{0}"', profile.name)}
      <button className="chip nocap" style={{ marginInlineStart: 'auto', padding: '3px 10px', fontSize: 12 }} onClick={() => setShowAll(v => !v)}>
        {showAll ? t('Filter by "{0}"', profile.name) : t('Show all equipment')}
      </button>
    </div>}
    {/* Changing body part keeps the equipment filter (issue #71): the eqOn fallback above drops
        it only for the current view if the new body part has nothing under it, without forgetting
        the choice. "All" clears it, since it spans every body part. */}
    <div className="chips" ref={bpStrip} style={{ marginBottom: allEqOpts.length > 1 || allCatOpts.length > 1 ? 8 : 12 }}>
      <button className={'chip nocap' + (!bpOn ? ' on' : '')} onClick={() => { setBp(''); setEq(''); setShown(40) }}>{t('All')}</button>
      {bodyParts.map(b => <button key={b} className={'chip' + (bpOn === b ? ' on' : '')} onClick={() => { setBp(b); setShown(40) }}>{t(b)}</button>)}
    </div>
    {allCatOpts.length > 1 && <div className="chips" ref={catStrip} style={{ marginBottom: 8 }}>
      <button className={'chip nocap' + (!catOn ? ' on' : '')} onClick={() => { setCat(''); setShown(40) }}>{t('Any type')}</button>
      {catOpts.map(x => <button key={x} className={'chip' + (catOn === x ? ' on' : '')} onClick={() => { setCat(x); setShown(40) }}>{t(x)}</button>)}
    </div>}
    {allEqOpts.length > 1 && <div className="chips" ref={eqStrip} style={{ marginBottom: 12 }}>
      <button className={'chip nocap' + (!eqOn ? ' on' : '')} onClick={() => { setEq(''); setShown(40) }}>{t('Any equipment')}</button>
      {eqOpts.map(x => <button key={x} className={'chip' + (eqOn === x ? ' on' : '')} onClick={() => { setEq(x); setShown(40) }}>{t(x)}</button>)}
    </div>}
    <div className={'list' + (S.exerciseView === 'cards' ? ' ex-grid' : '')}>
      {f.slice(0, shown).map(row)}
      {f.length === 0 && !similar.length && <div className="empty"><div className="ico"><Icon name="magnifier" /></div>{t('No match')}</div>}
      {similar.length > 0 && <h4 className="sec similar-label">{f.length ? t('Similar exercises') : t('No exact match. These come close:')}</h4>}
      {similar.map(row)}
    </div>
    {f.length > shown && <><div style={{ height: 10 }} /><Button ref={moreRef} onClick={() => setShown(s => s + 40)}>{t('Show more')}</Button></>}
  </>
}

