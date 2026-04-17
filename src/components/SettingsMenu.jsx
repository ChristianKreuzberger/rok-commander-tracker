import { useState, useRef, useEffect } from 'react'
import { version } from '../../package.json'

function readLocalStorage() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    try {
      data[key] = JSON.parse(localStorage.getItem(key))
    } catch {
      data[key] = localStorage.getItem(key)
    }
  }
  return data
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const [inspecting, setInspecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setInspecting(false)
        setConfirmingClear(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleExport = () => {
    const data = readLocalStorage()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rok-tracker-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const storageData = open && inspecting ? readLocalStorage() : null

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(storageData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClearStorage = () => {
    localStorage.clear()
    setConfirmingClear(false)
    setInspecting(false)
    setOpen(false)
    window.location.reload()
  }

  return (
    <div className="settings-menu" ref={ref}>
      <button
        className="btn btn-icon settings-btn"
        onClick={() => setOpen(o => !o)}
        title="Settings / Help"
        aria-expanded={open}
      >
        ⚙️
      </button>

      {open && (
        <div className="settings-panel">
          <div className="settings-row">
            <span className="settings-label">RoK Commander Tracker</span>
            <span className="settings-version">v{version}</span>
          </div>

          <div className="settings-divider" />

          <div className="settings-row settings-row--col">
            <span className="settings-label">Local Storage Data</span>
            {!confirmingClear ? (
              <div className="settings-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setInspecting(v => !v)}
                >
                  {inspecting ? 'Hide' : 'Inspect'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleExport}>
                  Export JSON
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmingClear(true)}>
                  Clear All Data
                </button>
              </div>
            ) : (
              <div className="settings-clear-confirm">
                <span className="settings-warn">This will permanently delete all your data. Are you sure?</span>
                <div className="settings-actions">
                  <button className="btn btn-danger btn-sm" onClick={handleClearStorage}>
                    Yes, clear everything
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setConfirmingClear(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {inspecting && (
            <div className="settings-data-wrap">
              <button className="btn btn-secondary btn-sm settings-copy-btn" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <pre className="settings-data">
                {JSON.stringify(storageData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
