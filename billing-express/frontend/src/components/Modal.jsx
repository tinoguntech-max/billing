import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, headerColor = 'bg-pastel-lavender', children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className={`${headerColor} px-6 py-4 flex items-center justify-between`}>
          <h2 className="font-bold text-dark text-base">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center text-muted hover:bg-white transition-colors">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

