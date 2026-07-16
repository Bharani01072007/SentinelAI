import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, Key, Shield, RefreshCw, Database, CheckCircle } from 'lucide-react'

function EncryptionFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    let t = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      t += 0.02

      // Draw flow lines
      const steps = 6
      for (let i = 0; i < steps; i++) {
        const x = (w / (steps + 1)) * (i + 1)
        const y = h / 2

        // Node
        const pulse = Math.sin(t * 2 + i) * 0.2 + 0.8
        ctx.beginPath()
        ctx.arc(x, y, 20 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(6,182,212,0.15)`
        ctx.fill()
        ctx.strokeStyle = '#06B6D4'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Connecting line
        if (i < steps - 1) {
          const nextX = (w / (steps + 1)) * (i + 2)
          ctx.beginPath()
          ctx.strokeStyle = 'rgba(6,182,212,0.3)'
          ctx.lineWidth = 1
          ctx.moveTo(x + 20, y)
          ctx.lineTo(nextX - 20, y)
          ctx.stroke()

          // Particle
          const pt = ((t * 0.5 + i * 0.3) % 1)
          const px = x + 20 + (nextX - x - 40) * pt
          ctx.beginPath()
          ctx.arc(px, y, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#06B6D4'
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="w-full" style={{ height: 80 }} />
}

const quantumFeatures = [
  {
    icon: Lock,
    title: 'AES-256 Encrypted Logs',
    desc: 'All audit logs encrypted at rest using AES-256-GCM with hardware-backed key storage.',
    status: 'Active',
    statusColor: '#10B981',
    metric: '100% coverage',
  },
  {
    icon: Database,
    title: 'Quantum-Safe Storage',
    desc: 'Post-quantum cryptography (CRYSTALS-Kyber) protecting data against future quantum threats.',
    status: 'Active',
    statusColor: '#10B981',
    metric: 'NIST PQC Level 3',
  },
  {
    icon: RefreshCw,
    title: 'Automatic Key Rotation',
    desc: 'Cryptographic keys rotated every 30 days with zero-downtime transition protocols.',
    status: 'Scheduled',
    statusColor: '#06B6D4',
    metric: 'Next: 12 days',
  },
  {
    icon: Key,
    title: 'Digital Signatures',
    desc: 'All security events cryptographically signed using CRYSTALS-Dilithium signatures.',
    status: 'Active',
    statusColor: '#10B981',
    metric: '2M+ signed events',
  },
]

function ShieldAnimation() {
  return (
    <div className="relative flex items-center justify-center h-64">
      {/* Outer rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          className="absolute rounded-full border border-cyan-500/30"
          style={{ width: 60 + i * 50, height: 60 + i * 50 }}
        />
      ))}

      {/* Rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute w-48 h-48 rounded-full border border-dashed border-blue-500/20"
      />

      {/* Center shield */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(124,58,237,0.2))',
          border: '2px solid rgba(6,182,212,0.5)',
          boxShadow: '0 0 40px rgba(6,182,212,0.3)',
        }}
      >
        <Shield size={36} className="text-cyan-400" />
      </motion.div>

      {/* Orbiting nodes */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute"
          style={{ width: 160, height: 160 }}
        >
          <div
            className="absolute w-3 h-3 rounded-full bg-cyan-400/60"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${angle}deg) translateX(80px) translateY(-50%)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default function QuantumSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Quantum Security</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">Post-quantum cryptography and advanced encryption systems</p>
      </div>

      {/* Hero Card */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(6,182,212,0.05) 0%, transparent 60%)' }} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-semibold"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#22D3EE' }}>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Quantum-Resistant Infrastructure
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Future-Proof Security with <span className="neon-text-cyan">Post-Quantum</span> Cryptography
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
              SentinelAI implements NIST-approved post-quantum cryptographic algorithms,
              ensuring your sensitive data remains protected even against quantum computing threats.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Algorithm', value: 'CRYSTALS-Kyber' },
                { label: 'Key Size', value: '256-bit' },
                { label: 'NIST Level', value: 'Level 3' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-sm font-bold text-cyan-400">{s.value}</div>
                  <div className="text-[10px] text-[#4B5563]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <ShieldAnimation />
        </div>
      </div>

      {/* Encryption Flow */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-2">Encryption Data Flow</h3>
        <p className="text-xs text-[#94A3B8] mb-4">End-to-end encryption pipeline for all security events</p>
        <EncryptionFlow />
        <div className="flex justify-between text-[10px] text-[#4B5563] mt-2 px-2">
          {['Raw Event', 'Normalize', 'Hash', 'Sign', 'Encrypt', 'Store'].map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {quantumFeatures.map((feature, i) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5 hover:neon-border-cyan transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${feature.statusColor}15`, color: feature.statusColor, border: `1px solid ${feature.statusColor}30` }}>
                      {feature.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-2">{feature.desc}</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={11} className="text-success" />
                    <span className="text-[10px] font-medium text-success">{feature.metric}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Key Rotation Schedule */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Key Rotation Schedule</h3>
        <div className="space-y-3">
          {[
            { key: 'Primary Encryption Key (KEK)', lastRotated: '4 days ago', next: '26 days', status: 'Active' },
            { key: 'Data Encryption Keys (DEK)', lastRotated: '2 days ago', next: '28 days', status: 'Active' },
            { key: 'Session Signing Keys', lastRotated: '7 hours ago', next: '17 hours', status: 'Due Soon' },
            { key: 'API Authentication Keys', lastRotated: '12 days ago', next: '18 days', status: 'Active' },
          ].map((k) => (
            <div key={k.key} className="flex items-center gap-4 p-3 rounded-xl bg-white/3">
              <Key size={14} className="text-cyan-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white">{k.key}</p>
                <p className="text-[10px] text-[#4B5563]">Last rotated: {k.lastRotated}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#94A3B8]">Next in</p>
                <p className="text-xs font-semibold text-white">{k.next}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                k.status === 'Active' ? 'badge-safe' : 'badge-warning'
              }`}>
                {k.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
