import { useState } from 'react'

type EditableTextProps = {
  value: string
  onChange: (value: string) => void
  label: string // e.g. "collection name"; used for accessible names
  as?: 'h1' | 'h2' | 'p'
  className?: string // applied to both the text and its edit field
  textClassName?: string // applied to the text only
  multiline?: boolean
  placeholder?: string
  fallback?: string // restored if the field is left empty (for required text like names)
}

// Pencil while viewing, check mark while editing; stays in the same corner either way
function EditButton({ label, editing, onClick }: { label: string; editing: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={editing ? `Done editing ${label}` : `Edit ${label}`}
      title={editing ? 'Done' : 'Edit'}
      onMouseDown={(e) => e.preventDefault()} // keep focus in the field so its blur doesn't fire first
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={editing ? 'M5 12l5 5L20 7' : 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4'} />
      </svg>
    </button>
  )
}

// Text that turns into an input when clicked. The text and its edit field share one
// fixed-width box so nothing shifts when editing starts.
export default function EditableText({
  value,
  onChange,
  label,
  as: Tag = 'p',
  className = '',
  textClassName = '',
  multiline = false,
  placeholder,
  fallback,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false)

  function finish() {
    if (fallback !== undefined) onChange(value.trim() || fallback)
    setEditing(false)
  }

  const fieldProps = {
    className: `editable-field ${className}`,
    'aria-label': label.charAt(0).toUpperCase() + label.slice(1),
    autoFocus: true,
    value,
    onBlur: finish,
  }

  return (
    <div className="editable">
      {!editing ? (
        <Tag className={`editable-text ${className} ${textClassName}`} onClick={() => setEditing(true)}>
          {value || placeholder}
        </Tag>
      ) : multiline ? (
        <textarea
          {...fieldProps}
          rows={Math.max(3, value.split('\n').length + 1)}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          {...fieldProps}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && finish()}
        />
      )}
      <EditButton label={label} editing={editing} onClick={() => (editing ? finish() : setEditing(true))} />
    </div>
  )
}
