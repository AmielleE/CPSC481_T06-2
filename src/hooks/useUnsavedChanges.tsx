import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Dialog from '../components/Dialog'

// Shared save flow for edit pages:
// - saveChanges() saves and briefly reports "Changes saved"
// - while there are unsaved changes, in-app link clicks (including the sidebar), requestNavigate()
//   and browser reloads ask the user to save, discard or stay
export function useUnsavedChanges(dirty: boolean, save: () => void, subject: string, canSave = true) {
  const navigate = useNavigate()
  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (!dirty) return

    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element).closest?.('a[href^="#/"]')
      if (!link) return
      e.preventDefault()
      e.stopPropagation() // runs in the capture phase, so React Router never sees the click
      setPendingPath(link.getAttribute('href')!.slice(1))
    }
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [dirty])

  useEffect(() => {
    if (!justSaved) return
    const timer = setTimeout(() => setJustSaved(false), 2500)
    return () => clearTimeout(timer)
  }, [justSaved])

  function saveChanges() {
    save()
    setJustSaved(true)
  }

  // For navigation that isn't a link click, e.g. arrow buttons and keyboard shortcuts
  function requestNavigate(path: string) {
    if (dirty) setPendingPath(path)
    else navigate(path)
  }

  function leave(saveFirst: boolean) {
    if (!pendingPath) return
    if (saveFirst) save()
    setPendingPath(null)
    navigate(pendingPath)
  }

  const status = dirty ? 'Unsaved changes' : justSaved ? 'Changes saved' : ''

  const dialog = (
    <Dialog
      open={pendingPath !== null}
      title="Save changes before leaving?"
      onClose={() => setPendingPath(null)}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => setPendingPath(null)}>
            Stay on page
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => leave(false)}>
            Discard changes
          </button>
          <button type="button" className="btn" disabled={!canSave} onClick={() => leave(true)}>
            Save and continue
          </button>
        </>
      }
    >
      <p>You have unsaved changes to this {subject}.</p>
      {!canSave && <p className="field-error">Some changes can’t be saved yet. Stay to fix them, or discard them.</p>}
    </Dialog>
  )

  return { saveChanges, status, requestNavigate, dialog }
}
