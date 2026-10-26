import { useEffect, useId, useRef, type ReactNode } from 'react'

type DialogProps = {
  open: boolean
  title: string
  children: ReactNode
  actions: ReactNode
  onClose: () => void
}

// Modal built on the native <dialog> element (handles focus trapping and Escape)
export default function Dialog({ open, title, children, actions, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="dialog" aria-labelledby={titleId} onClose={onClose}>
      <h2 id={titleId} className="dialog-title">
        {title}
      </h2>
      <div className="dialog-body">{children}</div>
      <div className="dialog-actions">{actions}</div>
    </dialog>
  )
}
