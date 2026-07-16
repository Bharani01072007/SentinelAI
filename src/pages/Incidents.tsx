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

function IncidentCard({ incident, onUpdate }: { incident: Incident; onUpdate: (updated: Incident) => void }) {
  const [expanded, setExpanded] = useState(false)
  const sev = severityConfig[incident.severity]
  
  const isBlocked = incident.timeline.some(t => t.event.includes('blocked by CISO'))

  const handleBlockAccount = () => {
    const newTimelineEvent = {
      time: new Date(),
      event: `Employee account (${incident.employeeName}) blocked by CISO James Thornton`
    }
    const updated: Incident = {
      ...incident,
      timeline: [newTimelineEvent, ...incident.timeline],
    }
    onUpdate(updated)
    alert(`Account for ${incident.employeeName} has been blocked successfully.`)
  }

  const handleAssignAnalyst = () => {
    const isAssigned = incident.assignedTo === 'James Thornton'
    const newTimelineEvent = {
      time: new Date(),
      event: isAssigned 
        ? 'Incident unassigned by James Thornton' 
        : 'Incident assigned to James Thornton'
    }
    const updated: Incident = {
      ...incident,
      assignedTo: isAssigned ? undefined : 'James Thornton',
      status: isAssigned ? 'open' : 'investigating',
      timeline: [newTimelineEvent, ...incident.timeline]
    }
    onUpdate(updated)
  }

  const handleGenerateReport = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Header Banner
      doc.setFillColor(17, 24, 39)
      doc.rect(0, 0, 210, 40, 'F')

      // SentinelAI branding
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(255, 255, 255)
      doc.text('SentinelAI', 15, 26)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(148, 163, 184)
      doc.text('Incident Investigation Report', 55, 25)

      // Accent line
      doc.setDrawColor(239, 68, 68) // Red for incident
      doc.setLineWidth(1)
      doc.line(15, 40, 195, 40)

      // Title & Metadata
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(17, 24, 39)
      doc.text(incident.title, 15, 55)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(75, 85, 99)
      doc.text(`Incident ID: ${incident.id}`, 15, 62)
      doc.text(`Severity: ${incident.severity.toUpperCase()}`, 15, 67)
      doc.text(`Status: ${incident.status.toUpperCase()}`, 15, 72)
      doc.text(`Assigned Analyst: ${incident.assignedTo || 'Unassigned'}`, 15, 77)
      doc.text(`Target Employee: ${incident.employeeName} (${incident.employeeId})`, 15, 82)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 87)

      // Incident Description
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Incident Description', 15, 98)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const descLines = doc.splitTextToSize(incident.description, 180)
      doc.text(descLines, 15, 104)

      let currentY = 104 + (descLines.length * 5) + 6

      // Evidence
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Collected Evidence', 15, currentY)
      currentY += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      incident.evidence.forEach((ev) => {
        doc.setFillColor(239, 68, 68)
        doc.rect(17, currentY - 2, 1.5, 1.5, 'F')
        const evLines = doc.splitTextToSize(ev, 175)
        doc.text(evLines, 22, currentY)
        currentY += (evLines.length * 5) + 1
      })

      currentY += 5

      // Timeline
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Incident Timeline', 15, currentY)
      currentY += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      incident.timeline.forEach((t) => {
        const timeStr = new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const eventText = `[${timeStr}] ${t.event}`
        doc.setFillColor(37, 99, 235)
        doc.rect(17, currentY - 2, 1.5, 1.5, 'F')
        const tLines = doc.splitTextToSize(eventText, 175)
        doc.text(tLines, 22, currentY)
        currentY += (tLines.length * 5) + 1
      })

      currentY += 5

      // AI Recommendation
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('AI Recommendation & Mitigation Plan', 15, currentY)
      currentY += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const recLines = doc.splitTextToSize(incident.aiRecommendation, 180)
      doc.text(recLines, 15, currentY)

      // Footer
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('SentinelAI Inc. | Incident Investigation Unit | CONFIDENTIAL', 15, 285)

      doc.save(`incident-report-${incident.id}.pdf`)
    } catch (error) {
      console.error('Failed to generate incident PDF report', error)
    }
  }

  const handleMarkResolved = () => {
    const isResolved = incident.status === 'resolved'
    const newTimelineEvent = {
      time: new Date(),
      event: isResolved 
        ? 'Incident reopened by analyst' 
        : 'Incident marked resolved by analyst'
    }
    const updated: Incident = {
      ...incident,
      status: isResolved ? 'investigating' : 'resolved',
      timeline: [newTimelineEvent, ...incident.timeline]
    }
    onUpdate(updated)
  }

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
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {incident.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-xs text-[#F9FAFB]">{t.event}</p>
                          <p className="text-[10px] text-[#4B5563]">
                            {Math.max(0, Math.floor((Date.now() - new Date(t.time).getTime()) / 60000))}m ago
                          </p>
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
                <button 
                  onClick={handleBlockAccount}
                  className={`py-2 px-4 text-xs rounded-xl font-semibold transition-all ${
                    isBlocked 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed' 
                      : 'btn-primary'
                  }`}
                  disabled={isBlocked}
                >
                  {isBlocked ? 'Account Blocked' : 'Block Account'}
                </button>
                
                <button 
                  onClick={handleAssignAnalyst}
                  className="btn-ghost py-2 px-4 text-xs font-semibold"
                >
                  {incident.assignedTo === 'James Thornton' ? 'Unassign Analyst' : 'Assign Analyst'}
                </button>
                
                <button 
                  onClick={handleGenerateReport}
                  className="btn-ghost py-2 px-4 text-xs flex items-center gap-1.5 font-semibold"
                >
                  <FileText size={12} /> Generate Report
                </button>
                
                <button
                  onClick={handleMarkResolved}
                  className="py-2 px-4 text-xs rounded-xl font-semibold transition-all"
                  style={{ 
                    background: incident.status === 'resolved' ? 'rgba(37,99,235,0.1)' : 'rgba(16,185,129,0.1)', 
                    color: incident.status === 'resolved' ? '#60A5FA' : '#34D399', 
                    border: incident.status === 'resolved' ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(16,185,129,0.2)' 
                  }}
                >
                  {incident.status === 'resolved' ? 'Reopen Incident' : 'Mark Resolved'}
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
  const [incidentsList, setIncidentsList] = useState<Incident[]>(() => [...incidents])

  const handleUpdateIncident = (updated: Incident) => {
    setIncidentsList(prev => prev.map(i => i.id === updated.id ? updated : i))
  }

  const filtered = filter === 'all' 
    ? incidentsList 
    : incidentsList.filter((i) => i.severity === filter || i.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Incident Investigation</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Active security incidents requiring investigation</p>
        </div>
        <span className="badge-critical">{incidentsList.filter(i => i.status !== 'resolved').length} Active</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'critical', 'high', 'open', 'investigating', 'resolved'].map((f) => (
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
          <IncidentCard key={incident.id} incident={incident} onUpdate={handleUpdateIncident} />
        ))}
      </div>
    </div>
  )
}
