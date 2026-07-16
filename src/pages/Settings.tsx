import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Bell, Sliders, Brain, Shield, Save, Check } from 'lucide-react'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-white/10'}`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
      />
    </button>
  )
}

function SliderInput({ label, value, onChange, min = 0, max = 100, color = '#2563EB' }: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; color?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#94A3B8]">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${color} ${(value - min) / (max - min) * 100}%, rgba(255,255,255,0.1) ${(value - min) / (max - min) * 100}%)` }}
      />
    </div>
  )
}

export default function Settings() {
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState({
    criticalAlerts: true,
    highRiskUsers: true,
    blockedSessions: false,
    weeklyReports: true,
    aiInsights: true,
  })
  const [thresholds, setThresholds] = useState({
    blockThreshold: 80,
    mfaThreshold: 40,
    monitorThreshold: 25,
  })
  const [aiSettings, setAiSettings] = useState({
    sensitivity: 75,
    falsePositiveFilter: 60,
    anomalyWindow: 90,
    confidenceMin: 70,
  })

  const handleSave = async () => {
    setSaved(true)
    await new Promise((r) => setTimeout(r, 2000))
    setSaved(false)
  }

  const roles = [
    { name: 'Security Analyst', users: 8, permissions: ['View incidents', 'Investigate employees', 'Generate reports'] },
    { name: 'SOC Manager', users: 3, permissions: ['All analyst permissions', 'Block sessions', 'Configure rules'] },
    { name: 'CISO', users: 1, permissions: ['Full access', 'Manage roles', 'System settings', 'API keys'] },
    { name: 'IT Admin', users: 12, permissions: ['View dashboard', 'Manage users', 'Audit logs'] },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Configure platform behaviour and security policies</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="btn-primary flex items-center gap-2 py-2"
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Roles & Permissions */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-blue-400" />
            <h3 className="font-semibold text-white">Roles & Permissions</h3>
          </div>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.name} className="p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{role.name}</span>
                  <span className="text-[10px] text-[#94A3B8]">{role.users} users</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((p) => (
                    <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Rules */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-cyan-400" />
            <h3 className="font-semibold text-white">Notification Rules</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(notifs).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-xs font-medium text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-[10px] text-[#4B5563]">
                    {key === 'criticalAlerts' ? 'Instant alerts for critical threats' :
                     key === 'highRiskUsers' ? 'Alert when risk score > 75' :
                     key === 'blockedSessions' ? 'Notify when a session is blocked' :
                     key === 'weeklyReports' ? 'Weekly summary every Monday' :
                     'AI-generated threat insights'}
                  </p>
                </div>
                <Toggle
                  checked={value}
                  onChange={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Threshold Settings */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sliders size={16} className="text-purple-400" />
            <h3 className="font-semibold text-white">Risk Thresholds</h3>
          </div>
          <div className="space-y-4">
            <SliderInput
              label="Block Session Threshold"
              value={thresholds.blockThreshold}
              onChange={(v) => setThresholds((p) => ({ ...p, blockThreshold: v }))}
              color="#EF4444"
            />
            <SliderInput
              label="Require MFA Threshold"
              value={thresholds.mfaThreshold}
              onChange={(v) => setThresholds((p) => ({ ...p, mfaThreshold: v }))}
              color="#06B6D4"
            />
            <SliderInput
              label="Begin Monitoring Threshold"
              value={thresholds.monitorThreshold}
              onChange={(v) => setThresholds((p) => ({ ...p, monitorThreshold: v }))}
              color="#10B981"
            />
            <div className="p-3 rounded-xl bg-white/3 mt-2">
              <div className="text-[10px] text-[#4B5563] mb-2">Current Policy</div>
              <div className="flex justify-between text-[10px]">
                <span className="text-success">0–{thresholds.monitorThreshold}: Allow</span>
                <span className="text-blue-400">{thresholds.monitorThreshold}–{thresholds.mfaThreshold}: Monitor</span>
                <span className="text-warning">{thresholds.mfaThreshold}–{thresholds.blockThreshold}: MFA</span>
                <span className="text-critical">{thresholds.blockThreshold}+: Block</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Model Settings */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} className="text-purple-400" />
            <h3 className="font-semibold text-white">AI Model Settings</h3>
          </div>
          <div className="space-y-4">
            <SliderInput
              label="AI Sensitivity"
              value={aiSettings.sensitivity}
              onChange={(v) => setAiSettings((p) => ({ ...p, sensitivity: v }))}
              color="#7C3AED"
            />
            <SliderInput
              label="False Positive Filter"
              value={aiSettings.falsePositiveFilter}
              onChange={(v) => setAiSettings((p) => ({ ...p, falsePositiveFilter: v }))}
              color="#7C3AED"
            />
            <SliderInput
              label="Behaviour Baseline Window (days)"
              value={aiSettings.anomalyWindow}
              onChange={(v) => setAiSettings((p) => ({ ...p, anomalyWindow: v }))}
              min={7}
              max={180}
              color="#7C3AED"
            />
            <SliderInput
              label="Min. Confidence to Alert (%)"
              value={aiSettings.confidenceMin}
              onChange={(v) => setAiSettings((p) => ({ ...p, confidenceMin: v }))}
              color="#7C3AED"
            />
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={12} className="text-purple-400" />
              <span className="text-[10px] font-semibold text-purple-400">Model: SentinelGPT v4</span>
            </div>
            <p className="text-[10px] text-[#4B5563]">Trained on 2.4M security incidents · Last updated: 2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  )
}
