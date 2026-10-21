import { useEffect, useRef, useState } from 'react'
import { libraryFilterVisible, orderLibraryFilters, setLibraryFilterOrder, setLibraryFilterVisibility } from '../lib/library-filters.js'
import { moved } from '../lib/use-list-reorder.js'
import { t } from '../lib/i18n.js'
import Icon from './Icon.jsx'

// Pointer capture works for mouse, pen and touch. Only the handle takes over touch gestures;
// the checkboxes and the surrounding grid still allow normal scrolling.
export default function LibraryFilterGroup({ S, update, group, label, options }) {
  const grid = useRef(null), gesture = useRef(null), frame = useRef(null)
  const [preview, setPreview] = useState(null)
  const ordered = orderLibraryFilters(S, group, options)
  const values = preview || ordered
  const stopFrame = () => { cancelAnimationFrame(frame.current); frame.current = null }
  useEffect(() => () => { gesture.current = null; cancelAnimationFrame(frame.current) }, [])

  const finish = commit => {
    const g = gesture.current
    if (!g) return
    gesture.current = null
    stopFrame()
    try { g.el.releasePointerCapture?.(g.id) } catch { /* already released */ }
    setPreview(null)
    if (commit && g.to !== g.from) update(state => setLibraryFilterOrder(state, group, moved(g.values, g.from, g.to)))
  }
  const locate = g => {
    if (!g.moving && Math.hypot(g.x - g.x0, g.y - g.y0) < 5) return
    g.moving = true
    const scroll = window.scrollY - g.scrollY
    let distance = Infinity, to = g.from
    g.rects.forEach((r, i) => {
      const d = Math.hypot(g.x - (r.left + r.width / 2), g.y - (r.top + r.height / 2 - scroll))
      if (d < distance) { distance = d; to = i }
    })
    if (to !== g.to) { g.to = to; setPreview(moved(g.values, g.from, to)) }
  }
  const tick = () => {
    const g = gesture.current
    if (!g) return
    if (g.moving) {
      const edge = 48
      const dy = g.y < edge ? -8 : g.y > window.innerHeight - edge ? 8 : 0
      if (dy) { window.scrollBy(0, dy); locate(g) }
    }
    frame.current = requestAnimationFrame(tick)
  }
  // Capture on the stable grid, not a button whose DOM position changes during sorting.
  // Moving a captured button would release touch capture in Chromium/WebView.
  const dragHandlers = {
    onPointerMove: e => {
      const g = gesture.current
      if (!g || g.id !== e.pointerId) return
      e.preventDefault(); g.x = e.clientX; g.y = e.clientY; locate(g)
    },
    onPointerUp: e => { if (gesture.current?.id === e.pointerId) finish(true) },
    onPointerCancel: e => { if (gesture.current?.id === e.pointerId) finish(false) },
    onLostPointerCapture: e => { if (gesture.current?.id === e.pointerId) finish(false) },
  }
  const handle = index => ({
    onPointerDown: e => {
      if (gesture.current || e.isPrimary === false || (e.button != null && e.button !== 0)) return
      e.preventDefault()
      const rects = [...grid.current.children].map(el => el.getBoundingClientRect())
      gesture.current = { id: e.pointerId, el: grid.current, from: index, to: index, values: ordered, rects, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, scrollY: window.scrollY }
      try { grid.current.setPointerCapture(e.pointerId) } catch { /* unsupported */ }
      setPreview(ordered)
      frame.current = requestAnimationFrame(tick)
    },
    onKeyDown: e => {
      if (e.key === 'Escape') { finish(false); return }
      const delta = ['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : 0
      if (!delta || gesture.current) return
      e.preventDefault()
      const to = index + delta
      if (to >= 0 && to < ordered.length) update(state => setLibraryFilterOrder(state, group, moved(ordered, index, to)))
    },
  })
  return <fieldset className="library-filter-group">
    <legend>{t(label)}</legend>
    <div className="library-filter-grid" ref={grid} {...dragHandlers}>
      {values.map((value, index) => <div key={value} className={'library-filter-option' + (preview && gesture.current?.values[gesture.current.from] === value ? ' is-dragging' : '')}>
        <label><input type="checkbox" checked={libraryFilterVisible(S, group, value)} onChange={e => update(state => setLibraryFilterVisibility(state, group, value, e.target.checked))} /><span>{t(value)}</span></label>
        <button type="button" className="library-filter-handle" aria-label={t('Reorder {0}', t(value))} title={t('Reorder {0}', t(value))} {...handle(index)}><Icon name="grip" /></button>
      </div>)}
    </div>
  </fieldset>
}
