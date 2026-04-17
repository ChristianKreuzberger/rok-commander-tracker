function CommanderCard({ commander, onEdit, onDelete }) {
  const { name, stars, skills, notes } = commander

  const renderStars = (count) => {
    return '★'.repeat(count) + '☆'.repeat(5 - count)
  }

  return (
    <div className="commander-card">
      <div className="card-header">
        <h3>{name}</h3>
        <div className="card-actions">
          <button className="btn btn-sm btn-secondary" onClick={() => onEdit(commander)}>Edit</button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(commander.id)}>Delete</button>
        </div>
      </div>
      <div className="stars">{renderStars(stars)}</div>
      <div className="skills">
        <strong>Skills:</strong>
        <div className="skills-grid">
          {skills.map((level, i) => (
            <span key={i} className="skill-badge">S{i + 1}: {level}/5</span>
          ))}
        </div>
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
