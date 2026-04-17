import { useState } from 'react'
import { Pencil, Trash2, Shield, Zap, Crosshair, Castle, Crown, Heart, Flag, Package, Swords, Layers, Shuffle, Wind, Sparkles, ShieldCheck, Sword, ChevronDown, ChevronRight } from 'lucide-react'
import commandersData from '../../data/commanders.json'

const SPECIALTY_ICONS = {
  Infantry: Sword,
  Cavalry: Zap,
  Archer: Crosshair,
  Garrison: Castle,
  Leadership: Crown,
  Support: Heart,
  Peacekeeping: Flag,
  Gathering: Package,
  Conquering: Swords,
  Integration: Layers,
  Versatility: Shuffle,
  Mobility: Wind,
  Attack: Shield,
  Defense: ShieldCheck,
  Skill: Sparkles,
}

const commanderLookup = Object.fromEntries(
  commandersData.commanders.map(c => [c.name.toLowerCase(), c])
)

function isMaxed(primary) {
  return (
    primary.stars === 6 &&
    primary.level === 60 &&
    primary.skills.every(s => s === 5)
  )
}

function CommanderCard({ commander, onEdit, onDelete }) {
  const { primary, notes } = commander
  const cmdData = commanderLookup[primary.name.toLowerCase()] ?? null
  const maxed = isMaxed(primary)
  const [collapsed, setCollapsed] = useState(maxed)

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(6 - count)
  const rarityClass = cmdData?.rarity ? `card-rarity-${cmdData.rarity.toLowerCase()}` : ''

  if (collapsed) {
    return (
      <div className={`commander-card commander-card-collapsed ${rarityClass}`}>
        <div className="card-collapsed-row">
          <button
            className="btn-collapse-toggle"
            onClick={() => setCollapsed(false)}
            title="Expand"
          >
            <ChevronRight size={14} />
          </button>
          <h3 className="card-collapsed-name" onClick={() => setCollapsed(false)}>{primary.name}</h3>
          {maxed && <span className="maxed-badge">MAX</span>}
          {!maxed && <span className="card-collapsed-stars">{renderStars(primary.stars)}</span>}
          <div className="card-actions">
            <button className="btn btn-sm btn-secondary btn-icon" onClick={() => onEdit(commander)} title="Edit"><Pencil size={16} /></button>
            <button className="btn btn-sm btn-danger btn-icon" onClick={() => onDelete(commander.primary.name)} title="Delete"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`commander-card ${rarityClass}`}>
      <div className="card-header">
        <div className="card-header-left">
          <button
            className="btn-collapse-toggle"
            onClick={() => setCollapsed(true)}
            title="Collapse"
          >
            <ChevronDown size={14} />
          </button>
          <h3>{primary.name}</h3>
          {maxed && <span className="maxed-badge">MAX</span>}
        </div>
        <div className="card-actions">
          <button className="btn btn-sm btn-secondary btn-icon" onClick={() => onEdit(commander)} title="Edit"><Pencil size={16} /></button>
          <button className="btn btn-sm btn-danger btn-icon" onClick={() => onDelete(commander.primary.name)} title="Delete"><Trash2 size={16} /></button>
        </div>
      </div>

      {cmdData && (
        <div className="card-cmd-info">
          <div className="cmd-preview-specialties">
            {cmdData.specialties.map(s => {
              const Icon = SPECIALTY_ICONS[s]
              return (
                <span key={s} className="specialty-badge">
                  {Icon && <Icon size={10} />}
                  {s}
                </span>
              )
            })}
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

      <div className="skills-row">
        <span className="skills-label">Skills:</span>
        {primary.skills.map((level, i) => (
          <span key={i} className={`skill-num${level !== 5 ? ' skill-dimmed' : ''}`}>{level}</span>
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
