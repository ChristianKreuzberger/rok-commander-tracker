import { Routes, Route } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import SettingsMenu from './components/SettingsMenu'
import CommanderListPage from './pages/CommanderListPage'
import AddCommanderPage from './pages/AddCommanderPage'
import civilizationsData from '../data/civilizations.json'
import './App.css'

function App() {
  const [commanders, setCommanders] = useLocalStorage('rok-commanders', [])
  const [selectedCiv, setSelectedCiv] = useLocalStorage('rok-civilization', '')

  const civilizations = civilizationsData.civilizations
  const activeCiv = civilizations.find(c => c.id === selectedCiv) ?? null

  const handleAdd = (commander) => {
    const name = commander.primary.name.trim().toLowerCase()
    if (commanders.some(c => c.primary.name.trim().toLowerCase() === name)) return
    const now = Date.now()
    setCommanders([...commanders, { ...commander, createdAt: now, lastUpdatedAt: now }])
  }

  const handleEdit = (updated) => {
    setCommanders(commanders.map(c =>
      c.primary.name.trim().toLowerCase() === updated.primary.name.trim().toLowerCase()
        ? { ...updated, lastUpdatedAt: Date.now() }
        : c
    ))
  }

  const handleDelete = (name) => {
    setCommanders(commanders.filter(c => c.primary.name.trim().toLowerCase() !== name.trim().toLowerCase()))
  }

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
      <Routes>
        <Route
          path="/"
          element={
            <CommanderListPage
              commanders={commanders}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          }
        />
        <Route
          path="/add"
          element={<AddCommanderPage onAdd={handleAdd} />}
        />
      </Routes>
    </div>
  )
}

export default App
