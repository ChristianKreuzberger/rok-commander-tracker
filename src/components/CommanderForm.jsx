import { useState } from 'react'

const defaultCommander = {
  name: '',
  stars: 6,
  level: 60,
  skills: [0, 0, 0, 0],
  talents: 0,
}

function CommanderSection({ label, data, onChange, required }) {
  const setField = (field, value) => onChange({ ...data, [field]: value })

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
        <input
          type="text"
          value={data.name}
          onChange={e => setField('name', e.target.value)}
          placeholder="Commander name"
          required={required}
        />
      </div>

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
