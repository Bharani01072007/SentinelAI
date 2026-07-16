import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Shield, ShieldOff, Eye, Lock, AlertTriangle, ArrowDown } from 'lucide-react'

const accessRules = [
  {
    range: 'Risk < 20',
    action: 'Allow Access',
    description: 'Full access granted. Normal user behaviour detected.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
    icon: CheckCircle,
    badge: 'ALLOW',
  },
  {
    range: 'Risk 20–40',
    action: 'Require MFA',
    description: 'Step-up authentication required. Verify identity before proceeding.',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.3)',
    icon: Shield,
    badge: 'MFA',
  },
  {
    range: 'Risk 40–60',
    action: 'Restrict Downloads',
    description: 'Read access only. File exports and downloads temporarily disabled.',
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.1)',
    border: 'rgba(37,99,235,0.3)',
    icon: Eye,
    badge: 'RESTRICT',
  },
  {
    range: 'Risk 60–80',
    action: 'Read-Only Mode',
    description: 'All write operations suspended. Session under active monitoring.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    icon: Lock,
    badge: 'READ-ONLY',
  },
  {
    range: 'Risk 80–100',
    action: 'Block Session',
    description: 'Session terminated immediately. Account locked pending investigation.',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    icon: ShieldOff,
    badge: 'BLOCKED',
  },
]

function FlowArrow({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ArrowDown size={16} style={{ color }} />
      </motion.div>
    </div>
  )
}

export default function AdaptiveAccess() {
  const [activeRisk, setActiveRisk] = useState(75)

  const currentRule = accessRules.findIndex((r, i) => {
    const min = i * 20
    const max = (i + 1) * 20
    return activeRisk >= min && activeRisk < max
  })
  const activeIndex = currentRule === -1 ? 4 : currentRule

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Adaptive Access</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">Dynamic access control based on real-time risk scoring</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Risk Simulator */}
        <div className="xl:col-span-1 glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Risk Simulator</h3>
          <p className="text-xs text-[#94A3B8] mb-6">Adjust the risk score to see how access policies adapt in real-time.</p>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94A3B8]">Current Risk Score</span>
              <span className="text-xl font-black" style={{
                color: accessRules[activeIndex]?.color ?? '#EF4444'
              }}>{activeRisk}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={activeRisk}
              onChange={(e) => setActiveRisk(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10B981 0%, #06B6D4 20%, #2563EB 40%, #F59E0B 60%, #EF4444 80%, #EF4444 100%)`
              }}
            />
            <div className="flex justify-between text-[9px] text-[#4B5563] mt-1">
              <span>Safe</span>
              <span>Monitor</span>
              <span>Restrict</span>
              <span>Read-Only</span>
              <span>Block</span>
            </div>
          </div>

          {/* Current Policy */}
          {activeIndex >= 0 && activeIndex < accessRules.length && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl"
              style={{
                background: accessRules[activeIndex].bg,
                border: `1px solid ${accessRules[activeIndex].border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {React.createElement(accessRules[activeIndex].icon, {
                  size: 16,
                  style: { color: accessRules[activeIndex].color }
                })}
                <span className="text-sm font-bold" style={{ color: accessRules[activeIndex].color }}>
                  {accessRules[activeIndex].action}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {accessRules[activeIndex].description}
              </p>
            </motion.div>
          )}
        </div>

        {/* Flow Diagram */}
        <div className="xl:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-white mb-6">Access Policy Workflow</h3>
          <div className="flex flex-col items-center max-w-lg mx-auto">
            {accessRules.map((rule, i) => {
              const Icon = rule.icon
              const isActive = i === activeIndex
              return (
                <React.Fragment key={rule.range}>
                  <motion.div
                    animate={{
                      scale: isActive ? 1.02 : 1,
                      boxShadow: isActive ? `0 0 30px ${rule.color}40` : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-full p-4 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: isActive ? rule.bg : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? rule.border : 'rgba(255,255,255,0.06)'}`,
                    }}
                    onClick={() => setActiveRisk(i * 20 + 10)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${rule.color}20`, border: `1px solid ${rule.color}30` }}
                      >
                        <Icon size={18} style={{ color: rule.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold" style={{ color: isActive ? rule.color : '#F9FAFB' }}>
                            {rule.action}
                          </span>
                          {isActive && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: rule.color, color: '#000' }}
                            >
                              ACTIVE
                            </motion.span>
                          )}
                        </div>
                        <p className="text-xs text-[#94A3B8]">{rule.description}</p>
                      </div>
                      <div
                        className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                        style={{
                          background: `${rule.color}20`,
                          color: rule.color,
                          border: `1px solid ${rule.color}30`
                        }}
                      >
                        {rule.range}
                      </div>
                    </div>
                  </motion.div>
                  {i < accessRules.length - 1 && <FlowArrow color={i < activeIndex ? rule.color : 'rgba(255,255,255,0.15)'} />}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sessions Allowed', value: '2,631', color: '#10B981' },
          { label: 'MFA Challenges', value: '143', color: '#06B6D4' },
          { label: 'Downloads Restricted', value: '28', color: '#F59E0B' },
          { label: 'Sessions Blocked', value: '7', color: '#EF4444' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[#94A3B8]">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
