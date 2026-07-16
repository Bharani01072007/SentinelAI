import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Clock, FileText, User, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { incidents } from '@/data/mockData'
import type { Incident } from '@/types'

const severityConfig = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'CRITICAL' },
  high: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'HIGH' },
  medium: { color: '#2563EB', bg: 'rgba(37,99,235,0.1)', label: 'MEDIUM' },
  low: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'LOW' },
}

function IncidentCard({ incident }: { incident: Incident }) {
  const [expanded, setExpanded] = useState(false)
  const sev = severityConfig[incident.severity]

  return (
    <motion.div
      layout
      className="glass-card overflow-hidden"
      style={{ borderColor: expanded ? `${sev.color}30` : 'rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: sev.bg, border: `1px solid ${sev.color}30` }}
          >
            <AlertTriangle size={18} style={{ color: sev.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-white text-sm leading-tight">{incident.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.color}30` }}
                >
                  {sev.label}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  incident.status === 'open' ? 'badge-critical' :
                  incident.status === 'investigating' ? 'badge-warning' : 'badge-safe'
                }`}>
                  {incident.status.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] mb-2 line-clamp-2">{incident.description}</p>
            <div className="flex items-center gap-4 text-[10px] text-[#4B5563]">
              <span className="flex items-center gap-1"><User size={10} />{incident.employeeName}</span>
              <span className="flex items-center gap-1"><Clock size={10} />
                {Math.floor((Date.now() - incident.createdAt.getTime()) / 60000)}m ago
              </span>
              {incident.assignedTo && (
                <span className="text-blue-400">Assigned: {incident.assignedTo}</span>
              )}
            </div>
          </div>
          {expanded ? <ChevronUp size={16} className="text-[#4B5563] shrink-0" /> : <ChevronDown size={16} className="text-[#4B5563] shrink-0" />}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/5"
          >
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Evidence */}
                <div>
                  <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Evidence</h4>
                  <div className="space-y-1.5">
                    {incident.evidence.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#F9FAFB]">
                        <div className="w-1 h-1 bg-warning rounded-full mt-1.5 shrink-0" />
                        {e}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Incident Timeline</h4>
                  <div className="space-y-2">
                    {incident.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-xs text-[#F9FAFB]">{t.event}</p>
                          <p className="text-[10px] text-[#4B5563]">{Math.floor((Date.now() - t.time.getTime()) / 60000)}m ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="glass-card p-4" style={{ background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center">
                    <CheckCircle size={11} className="text-purple-400" />
                  </div>
                  <span className="text-xs font-semibold text-purple-400">AI Recommendation</span>
                </div>
                <p className="text-xs text-[#F9FAFB] leading-relaxed">{incident.aiRecommendation}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary py-2 px-4 text-xs">Block Account</button>
                <button className="btn-ghost py-2 px-4 text-xs">Assign Analyst</button>
                <button className="btn-ghost py-2 px-4 text-xs flex items-center gap-1.5">
                  <FileText size={12} /> Generate Report
                </button>
                <button
                  className="py-2 px-4 text-xs rounded-xl font-semibold transition-all"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Incidents() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? incidents : incidents.filter((i) => i.severity === filter || i.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Incident Investigation</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Active security incidents requiring investigation</p>
        </div>
        <span className="badge-critical">{incidents.length} Active</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'critical', 'high', 'open', 'investigating'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
              filter === f
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            {f === 'all' ? 'All Incidents' : f}
          </button>
        ))}
      </div>

      {/* Incident Cards */}
      <div className="space-y-4">
        {filtered.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  )
}
