import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swords } from 'lucide-react'
import CommanderCard from '../components/CommanderCard'
import commandersData from '../../data/commanders.json'

const commanderLookup = Object.fromEntries(
  commandersData.commanders.map(c => [c.name.toLowerCase(), c])
)

const commanderNames = commandersData.commanders.map(c => c.name)

const defaultCommanderData = { stars: 6, level: 60, skills: [5, 5, 5, 5], talents: 0 }

function InlineAddInput({ onAdd, onCancel, commanders }) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const wrapRef = useRef(null)

  const trackedNames = new Set(commanders.map(c => c.primary.name.trim().toLowerCase()))
  const available = commanderNames.filter(n => !trackedNames.has(n.toLowerCase()))

  const filtered = value.trim()
    ? available.filter(n => n.toLowerCase().includes(value.toLowerCase()))
    : available

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) onCancel()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onCancel])

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      listRef.current.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const submit = (name) => {
    const trimmed = name.trim()
    if (!trimmed) { onCancel(); return }
    const canonical = commanderNames.find(n => n.toLowerCase() === trimmed.toLowerCase()) ?? trimmed
    onAdd(canonical)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onCancel(); return }
    if (!open) {
      if (e.key === 'ArrowDown') { setOpen(true); return }
      if (e.key === 'Enter') { e.preventDefault(); submit(value); return }
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
      if (activeIndex >= 0 && filtered[activeIndex]) submit(filtered[activeIndex])
      else submit(value)
    }
  }

  return (
    <div className="add-commander-tile add-commander-inline" ref={wrapRef}>
      <div className="inline-add-combobox">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setOpen(true); setActiveIndex(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Commander name..."
          autoComplete="off"
          className="inline-add-input"
        />
        {open && filtered.length > 0 && (
          <ul className="combobox-list" ref={listRef} role="listbox">
            {filtered.map((name, i) => (
              <li
                key={name}
                role="option"
                aria-selected={i === activeIndex}
                className={`combobox-option${i === activeIndex ? ' active' : ''}`}
                onMouseDown={() => submit(name)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" className="inline-add-cancel" onClick={onCancel} title="Cancel">✕</button>
    </div>
  )
}

const ALL_RARITIES = ['Legendary', 'Epic', 'Elite', 'Advanced']
const RARITY_ORDER = { Legendary: 0, Epic: 1, Elite: 2, Advanced: 3 }
const ALL_SPECIALTIES = [...new Set(commandersData.commanders.flatMap(c => c.specialties))].sort()

function CommanderListPage({ commanders, onAdd, onDelete }) {
  const navigate = useNavigate()
  const [isAddingInline, setIsAddingInline] = useState(false)

  const handleInlineAdd = (name) => {
    const now = Date.now()
    onAdd({ primary: { ...defaultCommanderData, name }, notes: '', createdAt: now, lastUpdatedAt: now })
    setIsAddingInline(false)
  }
  const [filterRarity, setFilterRarity] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const handleEditClick = (commander) => navigate('/edit/' + encodeURIComponent(commander.primary.name))

  const displayedCommanders = useMemo(() => {
    let result = [...commanders]

    if (filterRarity) {
      result = result.filter(c => {
        const data = commanderLookup[c.primary.name.toLowerCase()]
        return data?.rarity === filterRarity
      })
    }

    if (filterSpecialty) {
      result = result.filter(c => {
        const data = commanderLookup[c.primary.name.toLowerCase()]
        return data?.specialties?.includes(filterSpecialty)
      })
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.primary.stars - a.primary.stars
        case 'name':
          return a.primary.name.localeCompare(b.primary.name)
        case 'date_added':
          return (b.createdAt ?? 0) - (a.createdAt ?? 0)
        case 'skills': {
          const scoreA = a.primary.skills[0] * 1000 + a.primary.skills[1] * 100 + a.primary.skills[2] * 10 + a.primary.skills[3]
          const scoreB = b.primary.skills[0] * 1000 + b.primary.skills[1] * 100 + b.primary.skills[2] * 10 + b.primary.skills[3]
          return scoreB - scoreA
        }
        case 'rarity': {
          const ra = RARITY_ORDER[commanderLookup[a.primary.name.toLowerCase()]?.rarity] ?? 99
          const rb = RARITY_ORDER[commanderLookup[b.primary.name.toLowerCase()]?.rarity] ?? 99
          return ra - rb
        }
        default:
          return 0
      }
    })

    return result
  }, [commanders, filterRarity, filterSpecialty, sortBy])

  return (
    <main className="app-main">
      {commanders.length > 0 && (
        <div className="toolbar">
          <span>{commanders.length} commander{commanders.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {commanders.length > 0 && (
        <div className="filter-sort-bar">
          <div className="filter-group">
            <label className="filter-label">Rarity</label>
            <select className="filter-select" value={filterRarity} onChange={e => setFilterRarity(e.target.value)}>
              <option value="">All</option>
              {ALL_RARITIES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Unit Type</label>
            <select className="filter-select" value={filterSpecialty} onChange={e => setFilterSpecialty(e.target.value)}>
              <option value="">All</option>
              {ALL_SPECIALTIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Sort by</label>
            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
              <option value="stars">Stars</option>
              <option value="date_added">Date Added</option>
              <option value="skills">Skills Score</option>
            </select>
          </div>
          {(filterRarity || filterSpecialty) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setFilterRarity(''); setFilterSpecialty('') }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {commanders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚔️</div>
          <h2 className="empty-state-title">Your Army Awaits</h2>
          <p className="empty-state-subtitle">
            No commanders are being tracked yet.<br />
            Rally your finest leaders and forge an unstoppable empire!
          </p>
          <button className="btn btn-primary empty-state-cta" onClick={() => navigate('/add')}>
            + Track Your First Commander
          </button>
          <p className="empty-state-hint">Tap a commander card anytime to edit or upgrade their stats.</p>
        </div>
      ) : displayedCommanders.length === 0 ? (
        <div className="empty-state">
          <p>No commanders match the current filters.</p>
        </div>
      ) : (
        <div className="commanders-grid">
          {displayedCommanders.map(commander => (
            <CommanderCard
              key={commander.primary.name}
              commander={commander}
              onEdit={handleEditClick}
              onDelete={onDelete}
            />
          ))}
          {isAddingInline ? (
            <InlineAddInput
              onAdd={handleInlineAdd}
              onCancel={() => setIsAddingInline(false)}
              commanders={commanders}
            />
          ) : (
            <button className="add-commander-tile" onClick={() => setIsAddingInline(true)}>
              <Swords size={36} className="add-tile-icon" />
              <span className="add-tile-label">Add Commander</span>
            </button>
          )}
        </div>
      )}
    </main>
  )
}

export default CommanderListPage
