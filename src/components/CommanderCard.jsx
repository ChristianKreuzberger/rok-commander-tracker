import { Pencil, Trash2 } from 'lucide-react'
import commandersData from '../../data/commanders.json'

const commanderLookup = Object.fromEntries(
  commandersData.commanders.map(c => [c.name.toLowerCase(), c])
)

function CommanderCard({ commander, onEdit, onDelete }) {
  const { primary, notes } = commander
  const cmdData = commanderLookup[primary.name.toLowerCase()] ?? null

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(6 - count)

  return (
    <div className="commander-card">
      <div className="card-header">
        <h3>{primary.name}</h3>
        <div className="card-actions">
          <button className="btn btn-sm btn-secondary btn-icon" onClick={() => onEdit(commander)} title="Edit"><Pencil size={16} /></button>
          <button className="btn btn-sm btn-danger btn-icon" onClick={() => onDelete(commander.primary.name)} title="Delete"><Trash2 size={16} /></button>
        </div>
      </div>

      {cmdData && (
        <div className="card-cmd-info">
          <span className="card-cmd-title">{cmdData.title}</span>
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
      )}

      <div className="pair-meta">
        <span className="stars">{renderStars(primary.stars)}</span>
        <span className="meta-tag">Lv. {primary.level}</span>
        <span className="meta-tag">{primary.talents} Talents</span>
      </div>

      <div className="skills-grid">
        {primary.skills.map((level, i) => (
          <span key={i} className={`skill-badge${level !== 5 ? ' skill-dimmed' : ''}`}>S{i + 1}: {level}</span>
        ))}
      </div>

      {notes && (
        <div className="notes">
          <strong>Notes:</strong> {notes}
        </div>
      )}
    </div>
  )
}

export default CommanderCard
