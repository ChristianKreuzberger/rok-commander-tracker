import { useNavigate } from 'react-router-dom'
import CommanderForm from '../components/CommanderForm'

function AddCommanderPage({ onAdd, onAddMany, commanders }) {
  const navigate = useNavigate()

  const handleAdd = (commander) => {
    onAdd(commander)
    navigate('/')
  }

  const handleAddMany = (cmds) => {
    onAddMany(cmds)
    navigate('/')
  }

  return (
    <main className="app-main">
      <CommanderForm
        onSubmit={handleAdd}
        onCancel={() => navigate('/')}
        onSubmitMany={handleAddMany}
        existingCommanders={commanders}
      />
    </main>
  )
}

export default AddCommanderPage
