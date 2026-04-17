import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CommanderCard from '../components/CommanderCard'
import CommanderForm from '../components/CommanderForm'
import commandersData from '../../data/commanders.json'

const commanderLookup = Object.fromEntries(
  commandersData.commanders.map(c => [c.name.toLowerCase(), c])
)

const ALL_RARITIES = ['Legendary', 'Epic', 'Elite', 'Advanced']
const RARITY_ORDER = { Legendary: 0, Epic: 1, Elite: 2, Advanced: 3 }
const ALL_SPECIALTIES = [...new Set(commandersData.commanders.flatMap(c => c.specialties))].sort()

function CommanderListPage({ commanders, onEdit, onDelete }) {
  const navigate = useNavigate()
  const [editingCommander, setEditingCommander] = useState(null)
  const [filterRarity, setFilterRarity] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const handleEditClick = (commander) => setEditingCommander(commander)

  const handleCancelEdit = () => setEditingCommander(null)

  const handleEditSubmit = (updated) => {
    onEdit(updated)
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
          <button className="btn btn-primary" onClick={() => navigate('/add')}>
            + Add Commander
          </button>
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

      {editingCommander && (
        <CommanderForm
          commander={editingCommander}
          onSubmit={handleEditSubmit}
          onCancel={handleCancelEdit}
        />
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
        </div>
      )}
    </main>
  )
}

export default CommanderListPage
