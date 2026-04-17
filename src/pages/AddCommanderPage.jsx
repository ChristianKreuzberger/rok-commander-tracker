import { useNavigate } from 'react-router-dom'
import CommanderForm from '../components/CommanderForm'

function AddCommanderPage({ onAdd }) {
  const navigate = useNavigate()

  const handleAdd = (commander) => {
    onAdd(commander)
    navigate('/')
  }

  return (
    <main className="app-main">
      <CommanderForm onSubmit={handleAdd} onCancel={() => navigate('/')} />
    </main>
  )
}

export default AddCommanderPage
