import { useMemo, useState } from 'react'
import { t } from '../lib/i18n.js'
import { EXDB } from '../lib/exercises.js'
import { exName } from '../lib/coach.js'
import { cleanMemory, MEMORY_MAX, PREFERENCE_MAX } from '../../../api/coach/core/memory.js'
import { Button, TextArea, TextField } from '../components/ui.jsx'

// Saved only on explicit confirmation. Ordinary chat and model output never write memory.
export default function CoachMemory({ S, update, close }) {
  const [draft, setDraft] = useState(() => cleanMemory(S.coach?.profile))
  const [query, setQuery] = useState('')
  const rows = useMemo(() => {
    const own = Array.isArray(S.customEx) ? S.customEx : []
    const q = query.trim().toLowerCase()
    if (!q) return []
    return [...EXDB, ...own].filter(e => !S.exerciseOverrides?.[e.id]?.hidden &&
      [e.id, e.n, exName(e.id)].some(v => String(v || '').toLowerCase().includes(q))).slice(0, 12)
  }, [query, S.customEx, S.exerciseOverrides])
  const choose = (id, key) => setDraft(d => {
    if (d[key].includes(id) || d[key].length >= PREFERENCE_MAX) return d
    const other = key === 'preferredExerciseIds' ? 'avoidedExerciseIds' : 'preferredExerciseIds'
    return { ...d, [key]: [...d[key], id], [other]: d[other].filter(x => x !== id) }
  })
  const save = () => {
    update(s => { s.coach.profile = { ...s.coach.profile, ...cleanMemory(draft) } })
    close()
  }
  return <div className="chat-menu">
    <h3>{t('Coach memory')}</h3>
    <p className="muted small">{t('Only what you save here is remembered long term. It follows your existing profile storage and sync, and is sent to your AI provider with each request. Do not enter passwords or API keys. Chat does not update it automatically.')}</p>
    <label>{t('Long-term training notes')}
      <TextArea rows={4} maxLength={MEMORY_MAX} value={draft.memory}
        onChange={e => setDraft(d => ({ ...d, memory: e.target.value }))} />
    </label>
    <div className="muted small">{draft.memory.length}/{MEMORY_MAX}</div>
    {['preferredExerciseIds', 'avoidedExerciseIds'].map(key => <div key={key}>
      <h4>{key === 'preferredExerciseIds' ? t('Preferred exercises') : t('Exercises to avoid')}</h4>
      <div className="muted small">{draft[key].length}/{PREFERENCE_MAX}</div>
      {draft[key].map(id => <div className="row" key={id} style={{ justifyContent: 'space-between', gap: 8 }}>
        <span>{exName(id) || id}</span>
        <button className="chip" onClick={() => setDraft(d => ({ ...d, [key]: d[key].filter(x => x !== id) }))}>{t('Remove')}</button>
      </div>)}
    </div>)}
    <label>{t('Find an exercise')}
      <TextField value={query} onChange={e => setQuery(e.target.value)} placeholder={t('Search by name or ID')} />
    </label>
    {rows.map(e => <div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
      <div>{exName(e.id) || e.n}</div>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button className="chip" disabled={draft.preferredExerciseIds.includes(e.id) || draft.preferredExerciseIds.length >= PREFERENCE_MAX}
          onClick={() => choose(e.id, 'preferredExerciseIds')}>{t('Prefer')}</button>
        <button className="chip" disabled={draft.avoidedExerciseIds.includes(e.id) || draft.avoidedExerciseIds.length >= PREFERENCE_MAX}
          onClick={() => choose(e.id, 'avoidedExerciseIds')}>{t('Avoid')}</button>
      </div>
    </div>)}
    {!!query.trim() && !rows.length && <p className="muted small">{t('No matching exercises')}</p>}
    <p className="muted small">{t('Preferences guide suggestions, not medical safety. Existing exercises stay visible as context. Clearing requires Save; earlier chats and provider records are not deleted.')}</p>
    <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
      <Button onClick={() => setDraft(cleanMemory())}>{t('Clear memory and preferences')}</Button>
      <Button onClick={close}>{t('Cancel')}</Button>
      <Button variant="primary" onClick={save}>{t('Save')}</Button>
    </div>
  </div>
}
