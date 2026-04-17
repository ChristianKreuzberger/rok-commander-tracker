import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import CommanderCard from './components/CommanderCard'
import CommanderForm from './components/CommanderForm'
import './App.css'

function App() {
  const [commanders, setCommanders] = useLocalStorage('rok-commanders', [])
  const [showForm, setShowForm] = useState(false)
  const [editingCommander, setEditingCommander] = useState(null)

  const handleAdd = (commander) => {
    setCommanders([...commanders, { ...commander, id: Date.now() }])
    setShowForm(false)
  }

  const handleEdit = (updated) => {
    setCommanders(commanders.map(c => c.id === updated.id ? updated : c))
    setEditingCommander(null)
  }

  const handleDelete = (id) => {
    setCommanders(commanders.filter(c => c.id !== id))
  }

  const handleEditClick = (commander) => {
    setEditingCommander(commander)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCommander(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚔️ RoK Commander Tracker</h1>
        <p>Rise of Kingdoms</p>
      </header>
      <main className="app-main">
        <div className="toolbar">
          <span>{commanders.length} commander{commanders.length !== 1 ? 's' : ''} tracked</span>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Commander
          </button>
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
        ) : (
          <div className="commanders-grid">
            {commanders.map(commander => (
              <CommanderCard
                key={commander.id}
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
