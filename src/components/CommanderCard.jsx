function CommanderCard({ commander, onEdit, onDelete }) {
  const { primary, notes } = commander

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(6 - count)

  return (
    <div className="commander-card">
      <div className="card-header">
        <h3>{primary.name}</h3>
        <div className="card-actions">
          <button className="btn btn-sm btn-secondary" onClick={() => onEdit(commander)}>Edit</button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(commander.id)}>Delete</button>
        </div>
      </div>

      <div className="pair-meta">
        <span className="stars">{renderStars(primary.stars)}</span>
        <span className="meta-tag">Lv. {primary.level}</span>
        <span className="meta-tag">{primary.talents} Talents</span>
      </div>

      <div className="skills-grid">
        {primary.skills.map((level, i) => (
          <span key={i} className="skill-badge">S{i + 1}: {level}/5</span>
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
