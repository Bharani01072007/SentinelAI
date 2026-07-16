import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Monitor, Clock, AlertTriangle, Activity, RotateCw } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { employees, loginPatternData, downloadTrendData } from '@/data/mockData'
import { getRiskColor, getRiskBadgeClass } from '@/lib/utils'
import { useAIEngine } from '@/hooks/useAIEngine'
import { AnalysisResponse } from '@/services/aiEngine'

const behaviourTimeline = [
  { time: '00:00', normal: 0, anomaly: 2 },
  { time: '04:00', normal: 0, anomaly: 8 },
  { time: '08:00', normal: 15, anomaly: 6 },
  { time: '12:00', normal: 22, anomaly: 14 },
  { time: '16:00', normal: 18, anomaly: 25 },
  { time: '20:00', normal: 5, anomaly: 31 },
  { time: '23:00', normal: 1, anomaly: 28 },
]

const systemAccessData = [
  { subject: 'Database', A: 80, B: 95, fullMark: 100 },
  { subject: 'File Server', A: 65, B: 40, fullMark: 100 },
  { subject: 'Email', A: 90, B: 85, fullMark: 100 },
  { subject: 'VPN', A: 30, B: 75, fullMark: 100 },
  { subject: 'Admin Panel', A: 15, B: 60, fullMark: 100 },
  { subject: 'Cloud', A: 55, B: 80, fullMark: 100 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-xs shadow-card">
        <p className="text-[#94A3B8] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color ?? p.fill }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function EmployeeBehaviour() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const employee = employees.find((e) => e.id === id) ?? employees[0]
  
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const { analyzeEmployee, loading, error } = useAIEngine()

  const loadBehaviourData = async () => {
    if (id) {
      const data = await analyzeEmployee(id)
      if (data) {
        setAnalysis(data)
      }
    }
  }

  useEffect(() => {
    loadBehaviourData()
  }, [id])

  const currentRiskScore = analysis ? analysis.risk_result.risk_score : employee.riskScore
  const currentRiskLevel = analysis ? analysis.risk_result.risk_level : employee.riskLevel
  const currentRiskLabel = analysis ? analysis.risk_result.risk_label : employee.riskLevel
  const riskColor = getRiskColor(currentRiskLevel)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/behaviour')}
          className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Behaviour Analytics
        </button>
        <button 
          onClick={loadBehaviourData} 
          disabled={loading}
          className="btn-ghost py-1 px-2.5 text-xs flex items-center gap-1"
        >
          <RotateCw size={10} className={loading ? 'animate-spin' : ''} />
          Reload AI Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-critical/30 bg-critical/10 text-critical text-xs">
          ⚠️ AI Engine Offline or connection failed. Reverting to pre-seeded mockups. Please ensure the backend is running.
        </div>
      )}

      {/* Profile + AI Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Employee Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          {/* Avatar */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-3 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${riskColor}60, ${riskColor}20)`, border: `2px solid ${riskColor}40` }}
              >
                {employee.avatar}
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2"
                style={{
                  background: employee.status === 'active' ? '#10B981' : employee.status === 'blocked' ? '#EF4444' : '#F59E0B',
                  borderColor: '#111827'
                }}
              />
            </div>
            <h2 className="text-lg font-bold text-white">{employee.name}</h2>
            <p className="text-sm text-[#94A3B8]">{employee.role}</p>
            <p className="text-xs text-[#4B5563]">{employee.department}</p>
          </div>

          {/* Risk Score Gauge */}
          <div className="glass-card p-4 mb-4" style={{ borderColor: `${riskColor}30` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">AI Risk Score</span>
              <span className="font-black text-2xl" style={{ color: riskColor }}>
                {Math.round(currentRiskScore)}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentRiskScore}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${riskColor}80, ${riskColor})` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#4B5563] mt-1">
              <span>Safe (0)</span>
              <span>Critical (100)</span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-3">
            {[
              { label: 'Status', value: employee.status, colored: true },
              { label: 'Location', value: employee.location, icon: MapPin },
              { label: 'Device', value: employee.device, icon: Monitor },
              { label: 'Baseline Behaviour Score', value: `${employee.behaviourScore}/100` },
              { label: 'Last Login', value: `${Math.floor((Date.now() - employee.lastLogin.getTime()) / 60000)}m ago`, icon: Clock },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-[#94A3B8]">{item.label}</span>
                <span className={`text-xs font-semibold ${
                  item.colored ? (
                    employee.status === 'active' ? 'text-success' :
                    employee.status === 'blocked' ? 'text-critical' : 'text-warning'
                  ) : 'text-white'
                }`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: AI Summary + Anomaly Factors */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-2 space-y-4"
        >
          {/* AI Behaviour Summary */}
          <div className="glass-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Activity size={16} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Behaviour Summary</h3>
                <p className="text-xs text-[#94A3B8]">
                  Generated by SentinelAI Local Engine · {analysis ? 'Real-Time' : 'Historical Mockup'}
                </p>
              </div>
              <span className={getRiskBadgeClass(currentRiskLevel)} style={{ marginLeft: 'auto' }}>
                {currentRiskLabel.toUpperCase()}
              </span>
            </div>
            <div 
              className="glass-card p-4 mb-3" 
              style={{ 
                background: currentRiskScore > 50 ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)', 
                borderColor: currentRiskScore > 50 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)' 
              }}
            >
              <p className="text-xs text-[#F9FAFB] leading-relaxed">
                {analysis ? (
                  analysis.explainability.summary
                ) : (
                  `⚠ Critical Anomaly Detected. User's behaviour has deviated significantly from their established 90-day baseline. The combination of off-hours access, unregistered device registration, and mass data download presents a high-confidence threat pattern.`
                )}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="glass-card p-3">
                <div className="text-lg font-black text-critical">
                  {analysis ? (analysis.anomaly_result.normalized_score * 100).toFixed(0) : '87'}%
                </div>
                <div className="text-[10px] text-[#94A3B8]">Anomaly score</div>
              </div>
              <div className="glass-card p-3">
                <div className="text-lg font-black text-warning">
                  {analysis ? analysis.explainability.behaviour_deviation.toFixed(0) : '340'}%
                </div>
                <div className="text-[10px] text-[#94A3B8]">Above Baseline</div>
              </div>
              <div className="glass-card p-3">
                <div className="text-lg font-black text-purple-400">
                  {analysis ? analysis.explainability.top_factors.length : '5'}
                </div>
                <div className="text-[10px] text-[#94A3B8]">Threat Factors</div>
              </div>
            </div>
          </div>

          {/* Anomaly Factors list */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-3">AI Explainable Risk Factors</h3>
            <div className="space-y-2">
              {analysis ? (
                analysis.explainability.top_factors.map((factor, i) => (
                  <motion.div
                    key={factor.factor_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/3 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: factor.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white flex items-center gap-1">
                          <span>{factor.icon}</span>
                          {factor.label}
                        </span>
                        <span className="text-xs font-bold" style={{ color: factor.color }}>
                          {factor.impact.toFixed(1)}% impact
                        </span>
                      </div>
                      <p className="text-[10px] text-[#94A3B8]">{factor.description}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-xs text-[#94A3B8] py-4 text-center">
                  Select "Reload AI Data" or connect the backend engine to pull live explainability reports.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Pattern */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-1">Login Pattern</h3>
          <p className="text-xs text-[#94A3B8] mb-4">Normal vs Current · 24h comparison</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loginPatternData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" tick={{ fill: '#4B5563', fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4B5563', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }} />
                <Area type="monotone" dataKey="normal" name="Normal" stroke="#10B981" strokeWidth={1.5} fill="url(#normalGrad)" dot={false} />
                <Area type="monotone" dataKey="current" name="Current" stroke="#EF4444" strokeWidth={1.5} fill="url(#currentGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Download Trend */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-1">Download Trend</h3>
          <p className="text-xs text-[#94A3B8] mb-4">MB downloaded · Normal vs Current week</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downloadTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#4B5563', fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4B5563', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }} />
                <Bar dataKey="normal" name="Normal" fill="#10B981" opacity={0.7} radius={[2, 2, 0, 0]} />
                <Bar dataKey="current" name="Current" fill="#EF4444" opacity={0.8} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behaviour Timeline */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-1">Behaviour Timeline</h3>
          <p className="text-xs text-[#94A3B8] mb-4">Activity frequency · Normal vs Anomalous</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={behaviourTimeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="anomalyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: '#4B5563', fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4B5563', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }} />
                <Area type="monotone" dataKey="normal" name="Normal" stroke="#10B981" strokeWidth={1.5} fill="rgba(16,185,129,0.1)" dot={false} />
                <Area type="monotone" dataKey="anomaly" name="Anomaly" stroke="#F59E0B" strokeWidth={2} fill="url(#anomalyGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Access Pattern Radar */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-1">System Access Pattern</h3>
          <p className="text-xs text-[#94A3B8] mb-4">Access frequency by system type</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={systemAccessData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 9 }} />
                <Radar name="Normal" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={1.5} />
                <Radar name="Current" dataKey="B" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} strokeWidth={1.5} />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
