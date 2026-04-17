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

  const handleAddMany = (newCommanders) => {
    const trackedNames = new Set(commanders.map(c => c.primary.name.trim().toLowerCase()))
    const toAdd = newCommanders.filter(c => !trackedNames.has(c.primary.name.trim().toLowerCase()))
    setCommanders([...commanders, ...toAdd])
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>⚔️ RoK Commander Tracker</h1>
          <SettingsMenu
            selectedCiv={selectedCiv}
            setSelectedCiv={setSelectedCiv}
            civilizations={civilizations}
          />
        </div>
      </header>
      <Routes>
        <Route
          path="/"
          element={
            <CommanderListPage
              commanders={commanders}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          }
        />
        <Route
          path="/add"
          element={<AddCommanderPage onAdd={handleAdd} onAddMany={handleAddMany} commanders={commanders} />}
        />
      </Routes>
    </div>
  )
}

export default App
