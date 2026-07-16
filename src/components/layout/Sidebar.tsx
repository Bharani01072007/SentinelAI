import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Activity, Brain, Gauge, Clock, Users, AlertTriangle,
  Shield, Bot, FileText, Lock, BarChart2, Settings, ChevronLeft,
  ChevronRight, Zap, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAIEngine } from '@/hooks/useAIEngine'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/monitoring', label: 'Live Monitoring', icon: Activity },
  { path: '/dashboard/behaviour', label: 'Behaviour Analytics', icon: Brain },
  { path: '/dashboard/risk-engine', label: 'Risk Engine', icon: Gauge },
  { path: '/dashboard/threat-timeline', label: 'Threat Timeline', icon: Clock },
  { path: '/dashboard/employees', label: 'Employee Profiles', icon: Users },
  { path: '/dashboard/incidents', label: 'Incidents', icon: AlertTriangle, badge: '3' },
  { path: '/dashboard/adaptive-access', label: 'Adaptive Access', icon: Shield },
  { path: '/dashboard/ai-copilot', label: 'AI Copilot', icon: Bot },
  { path: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
  { path: '/dashboard/quantum', label: 'Quantum Security', icon: Lock },
  { path: '/dashboard/reports', label: 'Reports', icon: BarChart2 },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const location = useLocation()
  const { modelStatus } = useAIEngine()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 p-4 border-b border-white/5',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-glow-blue">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide">SentinelAI</span>
              <div className="text-[10px] text-cyan-400 font-medium">SOC PLATFORM</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-glow-blue">
            <Zap size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 items-center justify-center transition-colors text-[#94A3B8] hover:text-white"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-[#94A3B8] hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {!collapsed && (
          <div className="text-[10px] font-semibold text-[#4B5563] uppercase tracking-widest px-3 mb-2">
            Operations
          </div>
        )}
        {navItems.slice(0, 8).map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'sidebar-link relative',
                isActive && 'active',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="badge-critical text-[10px] px-1.5 py-0.5 min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-critical rounded-full" />
              )}
            </NavLink>
          )
        })}

        {!collapsed && (
          <div className="text-[10px] font-semibold text-[#4B5563] uppercase tracking-widest px-3 mt-4 mb-2">
            Intelligence
          </div>
        )}
        {!collapsed && <div className="border-t border-white/5 my-2" />}

        {navItems.slice(8).map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'sidebar-link',
                isActive && 'active',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Status Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5">
          <div className="glass-card p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${modelStatus?.status === 'ready' ? 'bg-success animate-pulse-slow' : 'bg-critical animate-pulse'}`} />
              <span className="text-xs text-[#94A3B8]">
                {modelStatus?.status === 'ready' ? 'Local ML Engine Active' : 'ML Engine Offline'}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1">
              <div 
                className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" 
                style={{ width: modelStatus?.status === 'ready' ? '100%' : '0%' }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#4B5563]">
              <span>Model: {modelStatus?.status === 'ready' ? 'IsolationForest' : 'Connecting...'}</span>
              <span>Samples: {modelStatus?.training_samples || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden shrink-0"
        style={{ background: 'rgba(17,24,39,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-60 z-50 overflow-hidden"
              style={{ background: 'rgba(17,24,39,0.98)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
