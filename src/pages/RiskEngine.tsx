import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Shield, Clock, Brain, Activity, RotateCw } from 'lucide-react'
import { useAIEngine } from '@/hooks/useAIEngine'
import { AnalysisResponse } from '@/services/aiEngine'

interface RiskGaugeProps {
  score: number
  levelLabel: string
  color: string
}

function RiskGauge({ score, levelLabel, color }: RiskGaugeProps) {
  const circumference = 2 * Math.PI * 70
  const percentage = score / 100
  const strokeDashoffset = circumference * (1 - percentage * 0.75)

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <circle
          cx="100" cy="100" r="70"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset={circumference * 0.125}
          transform="rotate(135, 100, 100)"
        />

        {/* Progress arc */}
        <motion.circle
          cx="100" cy="100" r="70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          initial={{ strokeDashoffset: circumference * 0.75 + circumference * 0.125 }}
          animate={{ strokeDashoffset: circumference * 0.75 * (1 - score / 100) + circumference * 0.125 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform="rotate(135, 100, 100)"
          filter="url(#glow)"
        />

        {/* Center content */}
        <text x="100" y="88" textAnchor="middle" fill={color} fontSize="36" fontWeight="900" fontFamily="Inter">
          {Math.round(score)}
        </text>
        <text x="100" y="108" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="Inter">
          RISK SCORE
        </text>
        <text x="100" y="124" textAnchor="middle" fill={color} fontSize="12" fontWeight="700" fontFamily="Inter">
          {levelLabel.toUpperCase()}
        </text>

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((val, i) => {
          const angle = (135 + (val / 100) * 270) * (Math.PI / 180)
          const x1 = 100 + 58 * Math.cos(angle)
          const y1 = 100 + 58 * Math.sin(angle)
          const x2 = 100 + 68 * Math.cos(angle)
          const y2 = 100 + 68 * Math.sin(angle)
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          )
        })}

        {/* Labels */}
        {[
          { val: 0, label: '0' },
          { val: 100, label: '100' },
        ].map(({ val, label }) => {
          const angle = (135 + (val / 100) * 270) * (Math.PI / 180)
          const x = 100 + 85 * Math.cos(angle)
          const y = 100 + 85 * Math.sin(angle)
          return (
            <text key={val} x={x} y={y + 4} textAnchor="middle" fill="#4B5563" fontSize="9" fontFamily="Inter">
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

const employeeOptions = [
  { id: 'emp-001', name: 'Alexandra Chen (DB Admin)' },
  { id: 'emp-008', name: 'Robert Vasquez (PAM Admin)' },
  { id: 'emp-002', name: 'Marcus Reyes (Finance Director)' },
  { id: 'emp-005', name: 'Priya Sharma (ML Engineer)' },
  { id: 'emp-003', name: 'Sarah Williams (Cloud Architect)' },
  { id: 'emp-004', name: 'James Thornton (CISO)' }
]

export default function RiskEngine() {
  const [selectedId, setSelectedId] = useState('emp-001')
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const { analyzeEmployee, loading, error } = useAIEngine()

  const loadRiskData = async (empId: string) => {
    const data = await analyzeEmployee(empId)
    if (data) {
      setAnalysis(data)
    }
  }

  useEffect(() => {
    loadRiskData(selectedId)
  }, [selectedId])

  const categories = [
    { label: 'Safe', range: '0–19', color: '#10B981', active: analysis?.risk_result.risk_level === 'safe' },
    { label: 'Low Risk', range: '20–39', color: '#2563EB', active: analysis?.risk_result.risk_level === 'low_risk' },
    { label: 'Medium Risk', range: '40–59', color: '#7C3AED', active: analysis?.risk_result.risk_level === 'medium_risk' },
    { label: 'High Risk', range: '60–79', color: '#F59E0B', active: analysis?.risk_result.risk_level === 'high_risk' },
    { label: 'Critical', range: '80–100', color: '#EF4444', active: analysis?.risk_result.risk_level === 'critical' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Engine</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Machine Learning (Isolation Forest) Anomaly Detection & Contextual Risk Engine</p>
        </div>
        <button 
          onClick={() => loadRiskData(selectedId)} 
          disabled={loading}
          className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5"
        >
          <RotateCw size={12} className={loading ? 'animate-spin' : ''} />
          Reload Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-critical/30 bg-critical/10 text-critical text-xs">
          ⚠️ AI Engine Offline or connection failed. Please ensure the backend server is running on port 8000. Error details: {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="xl:col-span-1 space-y-4">
          {/* Employee Selector */}
          <div className="glass-card p-4">
            <label className="text-xs text-[#94A3B8] mb-2 block">Analyzing Employee Profile</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="input-field"
            >
              {employeeOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#111827]">{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Risk Gauge */}
          <div className="glass-card p-6 flex flex-col items-center">
            <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-4">Final Dynamic Risk Score</div>
            {analysis ? (
              <RiskGauge 
                score={analysis.risk_result.risk_score} 
                levelLabel={analysis.risk_result.risk_label} 
                color={analysis.risk_result.risk_color} 
              />
            ) : (
              <div className="w-[200px] h-[200px] rounded-full loading-skeleton" />
            )}

            {/* Pulse Indicator */}
            {analysis && (
              <div className="flex items-center gap-2 mt-4">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: analysis.risk_result.risk_color }}
                />
                <span className="text-xs font-semibold" style={{ color: analysis.risk_result.risk_color }}>
                  {analysis.risk_result.risk_label.toUpperCase()} RISK STATE
                </span>
              </div>
            )}
          </div>

          {/* Risk Categories */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Risk Category Bounds</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-center justify-between p-2 rounded-lg transition-all"
                  style={{
                    background: cat.active ? `${cat.color}15` : 'transparent',
                    border: cat.active ? `1px solid ${cat.color}30` : '1px solid transparent'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    <span className="text-xs font-medium" style={{ color: cat.active ? cat.color : '#94A3B8' }}>
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#4B5563]">{cat.range}</span>
                    {cat.active && (
                      <span className="text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: cat.color }}>
                        MATCH
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Anomaly & Rule Component Values */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Isolation Forest ML Score */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2 text-purple-400">
                  <Brain size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Isolation Forest Anomaly Score</span>
                </div>
                <div className="text-2xl font-black text-white mb-1">
                  {analysis.anomaly_result.anomaly_score.toFixed(4)}
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                  Raw distance from boundary. Normalized anomaly factor is <span className="text-purple-400 font-bold">{(analysis.anomaly_result.normalized_score * 100).toFixed(1)}%</span>. Confidence: {analysis.anomaly_result.confidence.toFixed(1)}%.
                </p>
              </div>

              {/* Rules & Heuristics Score */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Activity size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Business Heuristic Score</span>
                </div>
                <div className="text-2xl font-black text-white mb-1">
                  {analysis.risk_result.rules_contribution.toFixed(0)} / 60
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                  Triggered rules accumulate risk weight points, capped at 60 total points to combine with ML scores.
                </p>
              </div>
            </div>
          )}

          {/* Triggered Business Rules */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Active System Rules</h3>
            <div className="space-y-2">
              {analysis ? (
                analysis.risk_result.triggered_rules.map((rule) => (
                  <div
                    key={rule.rule_id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      rule.triggered 
                        ? 'bg-critical/5 border-critical/20' 
                        : 'bg-white/2 border-white/5 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{rule.icon}</div>
                      <div>
                        <p className={`text-xs font-bold ${rule.triggered ? 'text-critical' : 'text-white'}`}>
                          {rule.label}
                        </p>
                        <p className="text-[10px] text-[#94A3B8]">{rule.description}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${rule.triggered ? 'text-critical' : 'text-[#4B5563]'}`}>
                      {rule.triggered ? `+${rule.points} pts` : 'Inactive'}
                    </span>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((n) => <div key={n} className="h-12 loading-skeleton" />)
              )}
            </div>
          </div>

          {/* AI Assessment & Explanations */}
          {analysis && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Explainable AI Assessment</h3>
                  <p className="text-xs text-[#94A3B8]">{analysis.explainability.confidence_note}</p>
                </div>
              </div>
              <p className="text-xs text-white leading-relaxed bg-[#111827] p-3 rounded-xl border border-white/5 mb-4">
                {analysis.explainability.summary}
              </p>
              
              <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Primary Risk Factors</h4>
              <div className="space-y-1.5">
                {analysis.explainability.top_factors.map((factor) => (
                  <div key={factor.factor_id} className="flex items-center justify-between text-xs p-1.5 border-b border-white/3">
                    <span className="text-white flex items-center gap-1.5">
                      <span>{factor.icon}</span>
                      {factor.label}
                    </span>
                    <span className="font-bold" style={{ color: factor.color }}>
                      {factor.impact.toFixed(1)}% weight
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adaptive Access Decision */}
          {analysis && (
            <div 
              className="glass-card p-5 border transition-all"
              style={{ borderColor: `${analysis.access_decision.decision_color}30` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${analysis.access_decision.decision_color}15`, border: `1px solid ${analysis.access_decision.decision_color}30` }}
                >
                  <Shield size={16} style={{ color: analysis.access_decision.decision_color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Adaptive Policy Enforcement</h3>
                  <span className="text-xs font-bold" style={{ color: analysis.access_decision.decision_color }}>
                    {analysis.access_decision.decision_label}
                  </span>
                </div>
              </div>

              {analysis.access_decision.restrictions.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-1">Enforced Restrictions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.access_decision.restrictions.map((r, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-black/40 border border-white/5 text-[#94A3B8]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-1">Recommended Response Actions:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {analysis.access_decision.recommended_actions.map((act, i) => (
                    <li key={i} className="text-xs text-[#94A3B8] leading-relaxed">
                      {act}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
