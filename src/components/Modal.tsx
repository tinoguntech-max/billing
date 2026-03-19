'use client'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  headerColor?: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, headerColor = 'bg-pastel-lavender', children }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-float w-full max-w-lg overflow-hidden animate-[fadeIn_.2s_ease]">
        <div className={`flex items-center justify-between px-6 py-4 border-b border-purple-50 ${headerColor}`}>
          <h3 className="font-bold text-dark">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-muted hover:text-dark transition-colors">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
