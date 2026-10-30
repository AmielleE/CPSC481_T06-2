import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Dialog from '../components/Dialog'
import './useUnsavedChanges.css'

type UnsavedChangesResult = {
  saveChanges: () => void
  status: string
  requestNavigate: (path: string) => void
  dialog: React.ReactNode
}

export function useUnsavedChanges(
  dirty: boolean,
  save: () => void,
  subject: string,
  canSave = true
): UnsavedChangesResult {
  const navigate = useNavigate()

  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  // ========================================
  // PROTECT UNSAVED CHANGES
  // ========================================

  useEffect(() => {
    if (!dirty) return

    function handleLinkClick(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      if (!(event.target instanceof Element)) return

      const link = event.target.closest('a[href^="#/"]')

      if (!link) return

      const href = link.getAttribute('href')

      if (!href) return

      event.preventDefault()
      event.stopPropagation()

      setPendingPath(href.slice(1))
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }

    document.addEventListener('click', handleLinkClick, true)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('click', handleLinkClick, true)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [dirty])

  // ========================================
  // SAVE CONFIRMATION
  // ========================================

  useEffect(() => {
    if (!justSaved) return

    const timer = window.setTimeout(() => {
      setJustSaved(false)
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [justSaved])

  function saveChanges() {
    if (!canSave) return

    save()
    setJustSaved(true)
  }

  // ========================================
  // NAVIGATION
  // ========================================

  function requestNavigate(path: string) {
    if (dirty) {
      setPendingPath(path)
    } else {
      navigate(path)
    }
  }

  function closeDialog() {
    setPendingPath(null)
  }

  function leavePage(saveFirst: boolean) {
    if (!pendingPath) return

    if (saveFirst) {
      if (!canSave) return
      save()
    }

    const destination = pendingPath

    setPendingPath(null)
    navigate(destination)
  }

  // ========================================
  // STATUS
  // ========================================

  const status = dirty
    ? 'Unsaved changes'
    : justSaved
      ? 'Changes saved'
      : ''

  // ========================================
  // CONFIRMATION DIALOG
  // ========================================

  const dialog = (
    <Dialog
      open={pendingPath !== null}
      title="Unsaved Changes"
      onClose={closeDialog}
      actions={
        <div className="unsaved-dialog-actions">
          <button
            type="button"
            className="unsaved-dialog-stay"
            onClick={closeDialog}
          >
            STAY ON PAGE
          </button>

          <button
            type="button"
            className="unsaved-dialog-discard"
            onClick={() => leavePage(false)}
          >
            DISCARD CHANGES
          </button>

          <button
            type="button"
            className="unsaved-dialog-save"
            disabled={!canSave}
            onClick={() => leavePage(true)}
          >
            SAVE & CONTINUE
          </button>
        </div>
      }
    >
      <div className="unsaved-dialog-content">
        <p>
          You have unsaved changes to this {subject}.
          Would you like to save them before leaving?
        </p>

        {!canSave && (
          <p className="unsaved-dialog-error">
            Some changes cannot be saved yet.
            Please correct them or discard your changes.
          </p>
        )}
      </div>
    </Dialog>
  )

  return {
    saveChanges,
    status,
    requestNavigate,
    dialog,
  }
}