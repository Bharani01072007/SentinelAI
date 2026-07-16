import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Bot, Moon, Sun, ChevronDown, Menu,
  User, LogOut, Settings, Shield, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopNavProps {
  onMenuToggle: () => void
}

export default function TopNav({ onMenuToggle }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const navigate = useNavigate()

  const notifications = [
    { id: 1, type: 'critical', message: 'Robert Vasquez — Session blocked', time: '2m ago' },
    { id: 2, type: 'critical', message: 'Alexandra Chen — Unusual login detected', time: '8m ago' },
    { id: 3, type: 'warning', message: 'Marcus Reyes — Privilege escalation attempt', time: '35m ago' },
  ]

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 h-14 border-b border-white/5"
      style={{ background: 'rgba(5,8,22,0.85)', backdropFilter: 'blur(16px)' }}
    >
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-[#94A3B8] hover:text-white transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Search employees, events, incidents..."
            className="input-field pl-9 h-8 text-xs w-full max-w-md"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          />
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 glass-card p-2 shadow-card"
              >
                <div className="text-[10px] text-[#4B5563] px-2 mb-2">QUICK ACCESS</div>
                {['Alexandra Chen — DB Admin', 'Robert Vasquez — PAM Admin', 'Incident #001 — Critical'].map((item) => (
                  <button key={item} className="w-full text-left px-2 py-1.5 text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 rounded transition-colors">
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* AI Copilot Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/ai-copilot')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#A78BFA'
          }}
        >
          <Bot size={12} />
          AI Copilot
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-critical rounded-full animate-pulse" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 glass-card shadow-card overflow-hidden"
              >
                <div className="flex items-center justify-between p-3 border-b border-white/5">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  <span className="badge-critical text-[10px]">3 new</span>
                </div>
                <div className="p-2 space-y-1">
                  {notifications.map((n) => (
                    <div key={n.id} className={cn(
                      'flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer'
                    )}>
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                        n.type === 'critical' ? 'bg-critical' : 'bg-warning'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#F9FAFB] leading-tight">{n.message}</p>
                        <p className="text-[10px] text-[#4B5563] mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
        >
          {darkMode ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">JT</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-white">James Thornton</div>
              <div className="text-[10px] text-[#4B5563]">CISO</div>
            </div>
            <ChevronDown size={12} className="text-[#4B5563] hidden sm:block" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 glass-card shadow-card overflow-hidden"
              >
                {[
                  { icon: User, label: 'Profile' },
                  { icon: Shield, label: 'Security' },
                  { icon: Settings, label: 'Settings' },
                  { icon: LogOut, label: 'Logout', danger: true },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5',
                        item.danger ? 'text-critical hover:text-critical' : 'text-[#94A3B8] hover:text-white'
                      )}
                    >
                      <Icon size={13} />
                      {item.label}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
