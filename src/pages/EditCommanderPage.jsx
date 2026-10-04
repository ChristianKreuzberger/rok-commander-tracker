import { useNavigate, useParams } from 'react-router-dom'
import { normalizeName } from '../lib/commanders'
import CommanderForm from '../components/CommanderForm'

function EditCommanderPage({ commanders, onEdit }) {
  const navigate = useNavigate()
  const { name } = useParams()

  const commander = commanders.find(
    (c) =>
      normalizeName(c.primary.name) === normalizeName(decodeURIComponent(name)),
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
