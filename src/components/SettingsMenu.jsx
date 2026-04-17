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

export default function SettingsMenu({ selectedCiv, setSelectedCiv, civilizations }) {
  const [open, setOpen] = useState(false)
  const [inspecting, setInspecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [importPreview, setImportPreview] = useState(null)
  const ref = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setInspecting(false)
        setConfirmingClear(false)
        setImportPreview(null)
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

  const handleImportClick = () => {
    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  const handleImportFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed['rok-commanders'])) {
          setImportPreview({ error: 'Invalid file format. Expected a RoK Tracker export.' })
          return
        }
        const incoming = parsed['rok-commanders']
        const existing = JSON.parse(localStorage.getItem('rok-commanders') || '[]')
        const existingNames = new Set(existing.map(c => c.primary?.name?.trim().toLowerCase()))
        const toAdd = incoming.filter(c => c.primary?.name && !existingNames.has(c.primary.name.trim().toLowerCase()))
        setImportPreview({ added: toAdd.length, skipped: incoming.length - toAdd.length, data: parsed })
      } catch {
        setImportPreview({ error: 'Could not parse file. Make sure it is a valid JSON export.' })
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = () => {
    if (!importPreview || importPreview.error) return
    const { data } = importPreview
    const incoming = data['rok-commanders']
    const existing = JSON.parse(localStorage.getItem('rok-commanders') || '[]')
    const existingNames = new Set(existing.map(c => c.primary?.name?.trim().toLowerCase()))
    const toAdd = incoming.filter(c => c.primary?.name && !existingNames.has(c.primary.name.trim().toLowerCase()))
    localStorage.setItem('rok-commanders', JSON.stringify([...existing, ...toAdd]))
    if (data['rok-civilization']) {
      localStorage.setItem('rok-civilization', JSON.stringify(data['rok-civilization']))
    }
    setImportPreview(null)
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
        <svg className="settings-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.74-.07-1.08l2.3-1.8c.21-.16.27-.45.13-.68l-2.18-3.78a.52.52 0 0 0-.64-.22l-2.71 1.09c-.57-.44-1.18-.81-1.86-1.09l-.41-2.88A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.41 2.88c-.68.28-1.29.65-1.86 1.09L4.52 5.3a.5.5 0 0 0-.64.22L1.7 9.3c-.14.23-.08.52.13.68l2.3 1.8c-.04.34-.07.7-.07 1.08s.03.74.07 1.08l-2.3 1.8c-.21.16-.27.45-.13.68l2.18 3.78c.13.23.41.31.64.22l2.71-1.09c.57.44 1.18.81 1.86 1.09l.41 2.88c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.41-2.88c.68-.28 1.29-.65 1.86-1.09l2.71 1.09c.23.09.51 0 .64-.22l2.18-3.78c.14-.23.08-.52-.13-.68l-2.3-1.8z"/>
        </svg>
      </button>

      {open && (
        <div className="settings-panel">
          <div className="settings-row">
            <span className="settings-label">RoK Commander Tracker</span>
            <span className="settings-version">v{version}</span>
          </div>

          <div className="settings-divider" />

          <div className="settings-row">
            <label htmlFor="civ-select-settings" className="settings-label">Civilization</label>
            <select
              id="civ-select-settings"
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
                <button className="btn btn-secondary btn-sm" onClick={handleImportClick}>
                  Import JSON
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

          {importPreview && (
            <div className="settings-import-preview">
              {importPreview.error ? (
                <span className="settings-warn">{importPreview.error}</span>
              ) : (
                <span className="settings-label">
                  {importPreview.added} commander{importPreview.added !== 1 ? 's' : ''} will be added
                  {importPreview.skipped > 0 && `, ${importPreview.skipped} duplicate${importPreview.skipped !== 1 ? 's' : ''} skipped`}.
                </span>
              )}
              <div className="settings-actions">
                {!importPreview.error && (
                  <button className="btn btn-primary btn-sm" onClick={handleConfirmImport}>
                    Confirm Import
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => setImportPreview(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

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
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
        aria-hidden="true"
      />
    </div>
  )
}
