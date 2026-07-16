import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, BarChart2, Calendar, TrendingUp, Shield } from 'lucide-react'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { riskTrendData, departmentRisk } from '@/data/mockData'

const reportTypes = [
  { id: 'daily', label: 'Daily Report', icon: Calendar, desc: 'Last 24 hours of security activity' },
  { id: 'weekly', label: 'Weekly Report', icon: BarChart2, desc: 'Past 7 days summary and trends' },
  { id: 'monthly', label: 'Monthly Report', icon: TrendingUp, desc: 'Monthly threat analysis and KPIs' },
  { id: 'risk', label: 'Risk Report', icon: Shield, desc: 'Comprehensive risk assessment' },
]

const summaryStats = [
  { label: 'Total Events', value: '47,832', trend: '+12%' },
  { label: 'Threats Detected', value: '34', trend: '+8%' },
  { label: 'Blocked Sessions', value: '7', trend: '+40%' },
  { label: 'Avg Risk Score', value: '47.2', trend: '+5%' },
]

export default function Reports() {
  const [selected, setSelected] = useState('weekly')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
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
      doc.text('Enterprise Cyber Threat Intelligence Platform', 55, 25)

      // Brand Accent Line
      doc.setDrawColor(37, 99, 235)
      doc.setLineWidth(1)
      doc.line(15, 40, 195, 40)

      // Report Header Details
      const reportName = reportTypes.find((r) => r.id === selected)?.label || 'Security Report'
      const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(17, 24, 39)
      doc.text(reportName, 15, 55)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(75, 85, 99)
      doc.text(`Generated on: ${dateStr}`, 15, 62)
      doc.text('Classification: CONFIDENTIAL / INTERNAL USE ONLY', 15, 67)

      // Summary Cards Block
      doc.setFillColor(243, 244, 246)
      doc.rect(15, 75, 180, 25, 'F')
      doc.setDrawColor(229, 231, 235)
      doc.rect(15, 75, 180, 25, 'S')

      const cardWidth = 45
      summaryStats.forEach((stat, idx) => {
        const startX = 15 + idx * cardWidth
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128)
        doc.text(stat.label, startX + 5, 83)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(17, 24, 39)
        doc.text(stat.value, startX + 5, 92)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(239, 68, 68)
        doc.text(stat.trend, startX + 32, 92)
      })

      // Department Risk Table
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(17, 24, 39)
      doc.text('Department Risk Breakdown', 15, 115)

      doc.setFillColor(37, 99, 235)
      doc.rect(15, 120, 180, 8, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(255, 255, 255)
      doc.text('Department', 20, 126)
      doc.text('Risk Score', 85, 126)
      doc.text('Monitored Employees', 120, 126)
      doc.text('Threat Events', 165, 126)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(55, 65, 81)
      
      let currentY = 134
      departmentRisk.forEach((row, index) => {
        if (index % 2 === 1) {
          doc.setFillColor(249, 250, 251)
          doc.rect(15, currentY - 5, 180, 7, 'F')
        }
        
        doc.text(row.department, 20, currentY)
        doc.text(row.riskScore.toString(), 85, currentY)
        doc.text(row.employees.toString(), 120, currentY)
        doc.text(row.threats.toString(), 165, currentY)
        
        doc.setDrawColor(243, 244, 246)
        doc.line(15, currentY + 2, 195, currentY + 2)
        currentY += 8
      })

      // AI Recommendations section
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(17, 24, 39)
      doc.text('AI Threat Insights & Recommendations', 15, currentY + 12)

      let aiInsights: string[] = []
      if (selected === 'daily') {
        aiInsights = [
          'High Risk Alerts: Flagged unusual geo-locations in IT Infrastructure. Immediate confirmation required.',
          'MFA Hardening: Force step-up MFA challenge for all external remote admin connections.',
          'Session Auditing: 7 active sessions blocked automatically. Recommend security audit for employee IDs emp-001 and emp-008.',
        ]
      } else if (selected === 'weekly') {
        aiInsights = [
          'Overall Threat Trend: Elevated risk scores observed during non-business hours (average score 47.2, up 5% this week).',
          'Data Leakage Control: Restrict mass downloads from IT Security and Finance databases outside regular work schedules.',
          'Vulnerability Mitigation: Audit recent permission changes and S3 bucket configuration revisions in Engineering.',
        ]
      } else if (selected === 'monthly') {
        aiInsights = [
          'Executive Insight: Internal threat indicators show persistent exfiltration behaviors from specific privileged accounts.',
          'Role Configuration: Conduct complete access audit for DB Admin and Cloud Architect credentials.',
          'Automation Tuning: Adjust contamination parameter in the Isolation Forest threat model (currently 5%) to reduce false positives.',
        ]
      } else {
        aiInsights = [
          'Critical Posture Assessment: Average risk indicators suggest heightened vulnerability within high-privilege IT teams.',
          'Access Controls: Revoke active session tokens for blocked employees immediately.',
          'SOC Review: Schedule forensic analysis of data-exfil log patterns in Mumbai/Singapore networks.',
        ]
      }

      currentY += 20
      aiInsights.forEach((insight) => {
        doc.setFillColor(37, 99, 235)
        doc.rect(17, currentY - 2, 2, 2, 'F')
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(55, 65, 81)
        
        const lines = doc.splitTextToSize(insight, 170)
        doc.text(lines, 23, currentY)
        currentY += lines.length * 5 + 2
      })

      // Footer
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('SentinelAI Inc. | www.sentinel.corp | CONFIDENTIAL', 15, 285)
      doc.text('Page 1 of 1', 185, 285)

      // Download
      doc.save(`sentinelai-${selected}-report.pdf`)
    } catch (error) {
      console.error('Error generating PDF report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Department', 'Risk Score', 'Monitored Employees', 'Threat Events']
    const rows = departmentRisk.map(row => [
      row.department,
      row.riskScore,
      row.employees,
      row.threats
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `sentinelai-department-risk-${selected}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">Generate and export security intelligence reports</p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((r) => {
          const Icon = r.icon
          const isSelected = selected === r.id
          return (
            <motion.button
              key={r.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(r.id)}
              className="glass-card p-4 text-left transition-all"
              style={{
                borderColor: isSelected ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.06)',
                background: isSelected ? 'rgba(37,99,235,0.08)' : 'rgba(17,24,39,0.8)',
              }}
            >
              <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                style={{ background: isSelected ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isSelected ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                <Icon size={16} className={isSelected ? 'text-blue-400' : 'text-[#94A3B8]'} />
              </div>
              <p className={`text-sm font-semibold mb-1 ${isSelected ? 'text-blue-400' : 'text-white'}`}>{r.label}</p>
              <p className="text-[10px] text-[#4B5563]">{r.desc}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s) => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs text-[#94A3B8] mb-1">{s.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black text-white">{s.value}</span>
              <span className="text-[10px] text-critical font-semibold">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Risk Trend — Past 24h</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="repRiskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: '#4B5563', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 12, fontSize: 11 }} />
                <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} fill="url(#repRiskGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Department Risk Summary</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentRisk} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="department" tick={{ fill: '#4B5563', fontSize: 8 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="riskScore" fill="#2563EB" opacity={0.8} radius={[4, 4, 0, 0]} name="Risk Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Export Report</h3>
        <p className="text-xs text-[#94A3B8] mb-4">
          Generate a comprehensive {reportTypes.find((r) => r.id === selected)?.label} with all security metrics,
          threat analysis, and AI recommendations.
        </p>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            className="btn-primary flex items-center gap-2"
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText size={14} />
                Generate PDF Report
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="btn-ghost flex items-center gap-2"
          >
            <Download size={14} />
            Export CSV
          </motion.button>
        </div>

        {/* Report Preview */}
        <div className="mt-4 p-4 rounded-xl border border-white/5 bg-black/20">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-white">Report Preview</span>
            <span className="badge-monitor text-[10px]">PREVIEW</span>
          </div>
          <div className="space-y-2">
            {[
              'Executive Summary — Critical threats and recommended actions',
              'Risk Score Analysis — Trend analysis and predictions',
              'Employee Behaviour Report — Anomaly detection summary',
              'Incident Log — All active and resolved incidents',
              'AI Model Performance — Detection accuracy and confidence metrics',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <div className="w-1 h-1 bg-blue-400 rounded-full" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
