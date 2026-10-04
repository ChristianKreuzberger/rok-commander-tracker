import { Routes, Route } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import SettingsMenu from './components/SettingsMenu'
import CommanderListPage from './pages/CommanderListPage'
import AddCommanderPage from './pages/AddCommanderPage'
import EditCommanderPage from './pages/EditCommanderPage'
import {
  addCommander,
  editCommander,
  deleteCommander,
  addManyCommanders,
} from './lib/commanders'
import civilizationsData from '../data/civilizations.json'
import './App.css'

function App() {
  const [commanders, setCommanders] = useLocalStorage('rok-commanders', [])
  const [selectedCiv, setSelectedCiv] = useLocalStorage('rok-civilization', '')

  const civilizations = civilizationsData.civilizations

  const handleAdd = (commander) =>
    setCommanders(addCommander(commanders, commander))
  const handleEdit = (updated) =>
    setCommanders(editCommander(commanders, updated))
  const handleDelete = (name) =>
    setCommanders(deleteCommander(commanders, name))
  const handleAddMany = (newCommanders) =>
    setCommanders(addManyCommanders(commanders, newCommanders))

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
              onDelete={handleDelete}
            />
          }
        />
        <Route
          path="/add"
          element={
            <AddCommanderPage
              onAdd={handleAdd}
              onAddMany={handleAddMany}
              commanders={commanders}
            />
          }
        />
        <Route
          path="/edit/:name"
          element={
            <EditCommanderPage commanders={commanders} onEdit={handleEdit} />
          }
        />
      </Routes>
      <footer className="app-footer">
        Made with ❤️ on{' '}
        <a
          href="https://github.com/ChristianKreuzberger/rok-commander-tracker"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </footer>
    </div>
  )
}

export default App
