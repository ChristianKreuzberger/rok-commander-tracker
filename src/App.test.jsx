// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

const maxedCommander = {
  primary: {
    name: 'Test Commander',
    stars: 6,
    level: 60,
    talents: 0,
    skills: [5, 5, 5, 5],
  },
  notes: '',
  createdAt: 1,
  lastUpdatedAt: 1,
}

const renderApp = () =>
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )

describe('App', () => {
  beforeEach(() => localStorage.clear())
  afterEach(cleanup)

  it('shows the empty state when nothing is tracked', () => {
    renderApp()
    expect(screen.getByText('+ Track Your First Commander')).toBeTruthy()
  })

  it('renders a stored commander with the MAX badge', () => {
    localStorage.setItem('rok-commanders', JSON.stringify([maxedCommander]))
    renderApp()
    expect(screen.getByText('Test Commander')).toBeTruthy()
    expect(screen.getByText('MAX')).toBeTruthy()
  })

  it('deletes a commander and persists the change', () => {
    localStorage.setItem('rok-commanders', JSON.stringify([maxedCommander]))
    renderApp()
    fireEvent.click(screen.getByTitle('Delete'))
    expect(screen.queryByText('Test Commander')).toBeNull()
    expect(JSON.parse(localStorage.getItem('rok-commanders'))).toEqual([])
  })
})
