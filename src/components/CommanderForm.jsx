import { useState, useRef, useEffect } from 'react'
import commandersData from '../../data/commanders.json'

const commanderNames = commandersData.commanders.map(c => c.name)
const commanderLookup = Object.fromEntries(
  commandersData.commanders.map(c => [c.name.toLowerCase(), c])
)

const defaultCommander = {
  name: '',
  stars: 6,
  level: 60,
  skills: [5, 5, 5, 5],
  talents: 0,
}

function CommanderCombobox({ value, onChange, required }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const filtered = value.trim()
    ? commanderNames.filter(n => n.toLowerCase().includes(value.toLowerCase()))
    : commanderNames

  const select = (name) => {
    onChange(name)
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { setOpen(true); return }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && filtered[activeIndex]) select(filtered[activeIndex])
      else setOpen(false)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.children[activeIndex]
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!inputRef.current?.closest('.combobox')?.contains(e.target)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="combobox">
      <div className="combobox-input-wrap">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); setActiveIndex(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Commander name"
          required={required}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <button
          type="button"
          className="combobox-chevron"
          tabIndex={-1}
          onClick={() => { setOpen(o => !o); inputRef.current?.focus() }}
          aria-label="Toggle list"
        >▾</button>
      </div>
      {open && filtered.length > 0 && (
        <ul className="combobox-list" ref={listRef} role="listbox">
          {filtered.map((name, i) => (
            <li
              key={name}
              role="option"
              aria-selected={i === activeIndex}
              className={`combobox-option${i === activeIndex ? ' active' : ''}`}
              onMouseDown={() => select(name)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CommanderSection({ label, data, onChange, required }) {
  const setField = (field, value) => onChange({ ...data, [field]: value })

  const cmdData = commanderLookup[data.name.toLowerCase()] ?? null

  const setSkill = (index, value) => {
    const newSkills = [...data.skills]
    newSkills[index] = Number(value)
    setField('skills', newSkills)
  }

  return (
    <fieldset className="commander-section">
      <legend>{label}</legend>

      <div className="form-group">
        <label>Name</label>
        <CommanderCombobox
          value={data.name}
          onChange={name => setField('name', name)}
          required={required}
        />
      </div>

      {cmdData && (
        <div className="cmd-preview">
          <div className="cmd-preview-title">{cmdData.title}</div>
          <div className="cmd-preview-row">
            <div className="cmd-preview-specialties">
              {cmdData.specialties.map(s => (
                <span key={s} className="specialty-badge">{s}</span>
              ))}
            </div>
            <div className="cmd-preview-stats">
              {cmdData.base_stats.troop_attack > 0 && <span className="stat-chip stat-atk">ATK +{cmdData.base_stats.troop_attack}%</span>}
              {cmdData.base_stats.troop_defense > 0 && <span className="stat-chip stat-def">DEF +{cmdData.base_stats.troop_defense}%</span>}
              {cmdData.base_stats.troop_hp > 0 && <span className="stat-chip stat-hp">HP +{cmdData.base_stats.troop_hp}%</span>}
              {cmdData.base_stats.march_speed > 0 && <span className="stat-chip stat-spd">SPD +{cmdData.base_stats.march_speed}%</span>}
            </div>
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Stars</label>
          <div className="star-picker">
            {[1, 2, 3, 4, 5, 6].map(s => (
              <button
                key={s}
                type="button"
                className={`star-btn${s <= data.stars ? ' active' : ''}`}
                onClick={() => setField('stars', s)}
              >★</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Level — <span className="level-value">{data.level}</span></label>
          <input
            type="range"
            min={1}
            max={60}
            value={data.level}
            onChange={e => setField('level', Number(e.target.value))}
            className="level-slider"
          />
        </div>

        <div className="form-group">
          <label>Talents</label>
          <input
            type="number"
            min={0}
            max={74}
            value={data.talents}
            onChange={e => setField('talents', Math.min(74, Math.max(0, Number(e.target.value))))}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Skill Levels</label>
        <div className="skills-inputs">
          {data.skills.map((level, i) => (
            <div key={i} className="skill-input">
              <label>S{i + 1}</label>
              <select value={level} onChange={e => setSkill(i, e.target.value)}>
                {[0, 1, 2, 3, 4, 5].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  )
}

function CommanderForm({ commander, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => {
    if (commander) {
      return {
        primary: { ...commander.primary },
        notes: commander.notes || '',
      }
    }
    return {
      primary: { ...defaultCommander },
      notes: '',
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.primary.name.trim()) return
    const result = {
      primary: formData.primary,
      notes: formData.notes,
    }
    onSubmit(commander ? { ...commander, ...result } : result)
  }

  return (
    <div className="form-overlay">
      <form className="commander-form" onSubmit={handleSubmit}>
        <h2>{commander ? 'Edit Commander' : 'Add Commander'}</h2>

        <CommanderSection
          label="Commander"
          data={formData.primary}
          onChange={primary => setFormData({ ...formData, primary })}
          required
        />

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Optional notes..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {commander ? 'Save Changes' : 'Add Commander'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommanderForm
