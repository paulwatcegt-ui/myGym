import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { allExercises, BODYPARTS, isCustomEx, searchExercises } from '../lib/exercises.js'
import { ALL_EQUIPMENT } from '../lib/equipment.js'
import { saveExerciseOverride } from '../lib/exercise-overrides.js'
import { t, exerciseNameFor, descFor, instrFor } from '../lib/i18n.js'
import { customExSheet, deleteCustomEx } from '../sheets.jsx'
import { Button, SearchField, TextField, SelectRow } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

function BuiltinEditor({ ex, close }) {
  const update = useStore(s => s.update)
  const [name, setName] = useState(ex.n)
  const [description, setDescription] = useState(null)
  const [steps, setSteps] = useState(null)
  const [bodyPart, setBodyPart] = useState(ex.bp)
  const [equipment, setEquipment] = useState(ex.eq)
  const save = () => {
    if (!name.trim()) { useUI.getState().toast(t('Give it a name')); return }
    const patch = {}
    if (name.trim() !== ex.n) patch.n = name.trim()
    if (bodyPart !== ex.bp) patch.bp = bodyPart
    if (equipment !== ex.eq) patch.eq = equipment
    if (description !== null) patch.desc = description.trim()
    if (steps !== null) patch.st = steps.split('\n').map(s => s.trim()).filter(Boolean)
    if (Object.keys(patch).length) update(S => saveExerciseOverride(S, ex.id, patch))
    close()
  }
  return <>
    <h3>{t('Edit exercise')}</h3>
    <p className="small dim">{t('Personal edits keep the original exercise and its training records.')}</p>
    <label>{t('Exercise name')}<TextField value={name} maxLength={80} onChange={e => setName(e.target.value)} /></label>
    <SelectRow title={t('Body part')} value={bodyPart} options={BODYPARTS.map(value => ({ value, label: t(value) }))} onChange={setBodyPart} />
    <SelectRow title={t('Equipment')} value={equipment} options={[...new Set([...ALL_EQUIPMENT, ex.eq])].map(value => ({ value, label: t(value) }))} onChange={setEquipment} />
    <label>{t('Exercise description')}<textarea className="input" rows={4} maxLength={2000} value={description ?? descFor(ex)} onChange={e => setDescription(e.target.value)} /></label>
    <label>{t('How to')}<textarea className="input" rows={7} maxLength={12000} value={steps ?? instrFor(ex).join('\n')} onChange={e => setSteps(e.target.value)} /></label>
    <p className="small dim">{t('Write one instruction per line.')}</p>
    <Button variant="primary" onClick={save}>{t('Save')}</Button>
  </>
}

export default function LibraryManage() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const update = useStore(s => s.update)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [shown, setShown] = useState(40)
  const exercises = searchExercises(allExercises(S, { includeHidden: true }), query).filter(ex =>
    filter === 'hidden' ? !!ex._libraryOverride?.hidden : filter === 'custom' ? isCustomEx(ex) : true)
  const edit = ex => isCustomEx(ex) ? customExSheet(ex) :
    useUI.getState().openSheet(close => <BuiltinEditor ex={ex} close={close} />)
  return <>
    <div className="hdr"><button className="iconbtn" aria-label={t('Exercises')} onClick={() => nav('/library')}><Icon name="chevronLeft" /></button>
      <div style={{ flex: 1, marginInlineStart: 12 }}><h1>{t('Manage exercises')}</h1></div></div>
    <p className="small dim">{t('Hidden exercises stay in your plans and history. You can restore them here.')}</p>
    <SearchField placeholder={t('Search…')} value={query} onChange={e => { setQuery(e.target.value); setShown(40) }} onClear={() => { setQuery(''); setShown(40) }} />
    <div className="chips" style={{ margin: '12px 0' }}>
      {[['all', 'All'], ['custom', 'Your exercises'], ['hidden', 'Hidden']].map(([value, label]) =>
        <button key={value} className={'chip nocap' + (filter === value ? ' on' : '')} onClick={() => { setFilter(value); setShown(40) }}>{t(label)}</button>)}
    </div>
    <Button icon="plus" onClick={() => customExSheet(null)}>{t('Create your own exercise')}</Button>
    <div className="list" style={{ marginTop: 12 }}>
      {exercises.slice(0, shown).map(ex => {
        const own = ex._libraryOverride
        return <div className="item" key={ex.id} style={{ flexWrap: 'wrap' }}>
          <div className="grow"><div className="tt">{exerciseNameFor(ex)}</div><div className="ss">{t(isCustomEx(ex) ? 'Your exercises' : 'Built-in exercise')}{own?.hidden ? ' · ' + t('Hidden') : ''}</div></div>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            <Button size="sm" icon="pencil" onClick={() => edit(ex)}>{t('Edit')}</Button>
            <Button size="sm" onClick={() => update(state => saveExerciseOverride(state, ex.id, { hidden: !own?.hidden }))}>{t(own?.hidden ? 'Restore exercise' : 'Hide exercise')}</Button>
            {isCustomEx(ex) ? <Button size="sm" variant="danger" icon="trash" onClick={() => deleteCustomEx(ex)}>{t('Delete')}</Button> :
              own && ['n', 'desc', 'st', 'bp', 'eq'].some(key => Object.hasOwn(own, key)) &&
              <Button size="sm" onClick={() => update(state => saveExerciseOverride(state, ex.id, {}, true))}>{t('Restore original exercise')}</Button>}
          </div>
        </div>
      })}
    </div>
    {!exercises.length && <div className="empty">{t('No match')}</div>}
    {exercises.length > shown && <Button onClick={() => setShown(count => count + 40)}>{t('Show more')}</Button>}
  </>
}
