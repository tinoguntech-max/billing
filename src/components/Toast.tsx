'use client'
import { useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-dark text-white px-5 py-3 rounded-2xl shadow-float text-sm font-medium animate-[slideUp_.3s_ease]">
      {type === 'success'
        ? <CheckCircle size={16} className="text-accent-mint" />
        : <XCircle size={16} className="text-accent-pink" />}
      {message}
    </div>
  )
}
