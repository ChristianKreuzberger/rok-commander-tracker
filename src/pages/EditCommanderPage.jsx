import { useNavigate, useParams } from 'react-router-dom'
import CommanderForm from '../components/CommanderForm'

function EditCommanderPage({ commanders, onEdit }) {
  const navigate = useNavigate()
  const { name } = useParams()

  const commander = commanders.find(
    c => c.primary.name.trim().toLowerCase() === decodeURIComponent(name).trim().toLowerCase()
  )

  if (!commander) {
    navigate('/')
    return null
  }

  const handleSubmit = (updated) => {
    onEdit(updated)
    navigate('/')
  }

  return (
    <main className="app-main">
      <CommanderForm
        commander={commander}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
      />
    </main>
  )
}

export default EditCommanderPage
