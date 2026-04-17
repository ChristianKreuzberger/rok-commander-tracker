import { useState } from 'react'

const defaultFormData = {
  name: '',
  stars: 5,
  skills: [0, 0, 0, 0],
  notes: '',
}

function CommanderForm({ commander, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    commander
      ? { name: commander.name, stars: commander.stars, skills: [...commander.skills], notes: commander.notes || '' }
      : { ...defaultFormData, skills: [0, 0, 0, 0] }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSubmit(commander ? { ...commander, ...formData } : formData)
  }

  const setSkill = (index, value) => {
    const newSkills = [...formData.skills]
    newSkills[index] = Number(value)
    setFormData({ ...formData, skills: newSkills })
  }

  return (
    <div className="form-overlay">
      <form className="commander-form" onSubmit={handleSubmit}>
        <h2>{commander ? 'Edit Commander' : 'Add Commander'}</h2>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Commander name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="stars">Stars</label>
          <select
            id="stars"
            value={formData.stars}
            onChange={e => setFormData({ ...formData, stars: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5].map(s => (
              <option key={s} value={s}>{s} Star{s > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Skill Levels</label>
          <div className="skills-inputs">
            {formData.skills.map((level, i) => (
              <div key={i} className="skill-input">
                <label htmlFor={`skill-${i}`}>S{i + 1}</label>
                <select
                  id={`skill-${i}`}
                  value={level}
                  onChange={e => setSkill(i, e.target.value)}
                >
                  {[0, 1, 2, 3, 4, 5].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
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
