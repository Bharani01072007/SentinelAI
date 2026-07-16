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
    await new Promise((r) => setTimeout(r, 1500))
    setGenerating(false)
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
