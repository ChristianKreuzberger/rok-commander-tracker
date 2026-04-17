import { useState, useMemo } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import CommanderCard from './components/CommanderCard'
import CommanderForm from './components/CommanderForm'
import SettingsMenu from './components/SettingsMenu'
import civilizationsData from '../data/civilizations.json'
import commandersData from '../data/commanders.json'
import './App.css'

const commanderLookup = Object.fromEntries(
  commandersData.commanders.map(c => [c.name.toLowerCase(), c])
)

const ALL_RARITIES = ['Elite', 'Epic', 'Legendary']
const ALL_SPECIALTIES = [...new Set(commandersData.commanders.flatMap(c => c.specialties))].sort()

function App() {
  const [commanders, setCommanders] = useLocalStorage('rok-commanders', [])
  const [selectedCiv, setSelectedCiv] = useLocalStorage('rok-civilization', '')
  const [showForm, setShowForm] = useState(false)
  const [editingCommander, setEditingCommander] = useState(null)
  const [filterRarity, setFilterRarity] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const civilizations = civilizationsData.civilizations
  const activeCiv = civilizations.find(c => c.id === selectedCiv) ?? null

  const handleAdd = (commander) => {
    const name = commander.primary.name.trim().toLowerCase()
    if (commanders.some(c => c.primary.name.trim().toLowerCase() === name)) return
    const now = Date.now()
    setCommanders([...commanders, { ...commander, createdAt: now, lastUpdatedAt: now }])
    setShowForm(false)
  }

  const handleEdit = (updated) => {
    setCommanders(commanders.map(c =>
      c.primary.name.trim().toLowerCase() === updated.primary.name.trim().toLowerCase()
        ? { ...updated, lastUpdatedAt: Date.now() }
        : c
    ))
    setEditingCommander(null)
  }

  const handleDelete = (name) => {
    setCommanders(commanders.filter(c => c.primary.name.trim().toLowerCase() !== name.trim().toLowerCase()))
  }

  const handleEditClick = (commander) => {
    setEditingCommander(commander)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCommander(null)
  }

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
        default:
          return 0
      }
    })

    return result
  }, [commanders, filterRarity, filterSpecialty, sortBy])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>⚔️ RoK Commander Tracker</h1>
          <div className="civ-picker">
            <label htmlFor="civ-select" className="civ-label">Civilization</label>
            <select
              id="civ-select"
              className="civ-select"
              value={selectedCiv}
              onChange={e => setSelectedCiv(e.target.value)}
            >
              <option value="">— Select —</option>
              {civilizations.map(civ => (
                <option key={civ.id} value={civ.id}>{civ.name}</option>
              ))}
            </select>
          </div>
          <SettingsMenu />
        </div>
        {activeCiv ? (
          <p className="civ-subtitle">
            {activeCiv.name} · {activeCiv.special_unit.name} ({activeCiv.special_unit.type}) · {activeCiv.starting_commander}
          </p>
        ) : (
          <p>Rise of Kingdoms</p>
        )}
      </header>
      <main className="app-main">
        <div className="toolbar">
          <span>{commanders.length} commander{commanders.length !== 1 ? 's' : ''}</span>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Commander
          </button>
        </div>

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

        {(showForm || editingCommander) && (
          <CommanderForm
            commander={editingCommander}
            onSubmit={editingCommander ? handleEdit : handleAdd}
            onCancel={handleCancel}
          />
        )}

        {commanders.length === 0 ? (
          <div className="empty-state">
            <p>No commanders tracked yet.</p>
            <p>Click "Add Commander" to get started!</p>
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
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
