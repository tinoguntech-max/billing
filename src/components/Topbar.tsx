'use client'
import { useState } from 'react'
import { Menu, Bell, Search } from 'lucide-react'

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-white border-b border-purple-50 px-6 py-4 flex items-center justify-between shadow-soft">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-muted">
          <Menu size={22} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Cari pelanggan, tagihan..."
            className="pl-9 pr-4 py-2 rounded-xl border border-purple-100 bg-pastel-lavender text-sm w-64 focus:outline-none focus:border-accent-purple" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-xl bg-pastel-yellow flex items-center justify-center">
          <Bell size={16} className="text-accent-yellow" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-pink rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#9B6FD4,#4BA3E3)' }}>AD</div>
      </div>
    </header>
  )
}
