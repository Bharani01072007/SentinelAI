import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Lock, Zap, Eye, Activity, ArrowRight, Play, CheckCircle, Brain } from 'lucide-react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'

const securityLogs = [
  'ALERT: Unauthorized access attempt blocked — 203.0.113.42',
  'INFO: AI Risk Engine updated — 2,847 events processed',
  'CRITICAL: Data exfiltration detected — Session terminated',
  'ALERT: Privilege escalation attempt — Employee ID 4421',
  'INFO: Quantum key rotation completed — Entropy: 256-bit',
  'WARN: VPN anomaly detected — Unknown endpoint',
  'INFO: Behaviour baseline updated — 1,247 users profiled',
  'CRITICAL: MFA bypass attempt — Account locked',
]

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        size: Math.random() * 2 + 0.5,
      })
    }

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(37,99,235,${0.15 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(6,182,212,${p.alpha})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

function StatCard({ value, label, suffix = '', prefix = '' }: { value: number; label: string; suffix?: string; prefix?: string }) {
  const count = useAnimatedCounter(value, 2000)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 text-center hover:neon-border-blue transition-all duration-300 group cursor-default"
    >
      <div className="text-3xl lg:text-4xl font-black gradient-text mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-[#94A3B8] font-medium leading-tight">{label}</div>
    </motion.div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [logIndex, setLogIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((i) => (i + 1) % securityLogs.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { icon: Brain, title: 'AI Behaviour Analytics', desc: 'ML-powered UEBA that learns normal patterns and flags anomalies in real-time' },
    { icon: Shield, title: 'Adaptive Authentication', desc: 'Dynamic access controls that respond instantly to risk score changes' },
    { icon: Eye, title: 'Explainable AI', desc: 'Every threat decision comes with a full explanation and evidence chain' },
    { icon: Lock, title: 'Quantum-Safe Encryption', desc: 'Post-quantum cryptography protecting your most sensitive data assets' },
    { icon: Activity, title: 'Real-Time Monitoring', desc: 'Continuous 24/7 surveillance across all user sessions and endpoints' },
    { icon: Zap, title: '<1s Detection', desc: 'Sub-second threat detection across 2M+ daily security events' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#050816' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 border-b border-white/5"
        style={{ background: 'rgba(5,8,22,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-glow-blue">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">SentinelAI</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[#94A3B8]">
          {['Platform', 'Solutions', 'Enterprise', 'Pricing', 'Docs'].map((item) => (
            <button key={item} className="hover:text-white transition-colors">{item}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost py-2 px-4 text-xs">Request Demo</button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary py-2 px-4 text-xs"
          >
            Launch Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        {/* Animated Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-40" />

        {/* Particle Canvas */}
        <ParticleCanvas />

        {/* Glow Orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 left-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />

        {/* Floating Security Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { Icon: Shield, top: '15%', left: '8%', delay: 0, color: '#2563EB' },
            { Icon: Lock, top: '20%', right: '10%', delay: 1, color: '#06B6D4' },
            { Icon: Eye, bottom: '30%', left: '6%', delay: 2, color: '#7C3AED' },
            { Icon: Activity, top: '60%', right: '8%', delay: 0.5, color: '#10B981' },
            { Icon: Zap, top: '40%', left: '4%', delay: 1.5, color: '#F59E0B' },
          ].map(({ Icon, top, left, right, bottom, delay, color }, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
              className="absolute"
              style={{ top, left, right, bottom }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(${color === '#2563EB' ? '37,99,235' : color === '#06B6D4' ? '6,182,212' : color === '#7C3AED' ? '124,58,237' : color === '#10B981' ? '16,185,129' : '245,158,11'},0.1)`, border: `1px solid ${color}33` }}>
                <Icon size={20} style={{ color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl px-6 mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', color: '#93C5FD' }}
          >
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            AI-Powered Security Operations Center
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-6"
          >
            <span className="text-white">AI-Powered</span>
            <br />
            <span className="gradient-text">Privileged Access</span>
            <br />
            <span className="text-white">Intelligence Platform</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Detect insider threats before they become breaches using AI-driven behaviour analytics,
            adaptive authentication, and explainable security intelligence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost flex items-center gap-2"
            >
              <Play size={14} />
              Request Demo
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              className="btn-primary flex items-center gap-2"
            >
              Launch Dashboard
              <ArrowRight size={14} />
            </motion.button>
          </motion.div>

          {/* Scrolling Security Log Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative mx-auto max-w-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse shrink-0" />
              <div className="text-xs font-mono text-[#4B5563] shrink-0">LIVE</div>
              <motion.p
                key={logIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-mono text-cyan-400 truncate"
              >
                {securityLogs[logIndex]}
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#4B5563]"
        >
          <div className="text-xs">Scroll to explore</div>
          <div className="w-px h-8 bg-gradient-to-b from-[#4B5563] to-transparent" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 lg:px-12 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Proven at Scale</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Trusted by the world's most <span className="gradient-text">security-conscious</span> organizations
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={998} suffix="%" label="Threat Detection Accuracy" />
            <StatCard value={40} suffix="%" label="Reduction in False Positives" />
            <StatCard value={2} suffix="M+" label="Security Events Processed Daily" />
            <StatCard value={1} prefix="<" suffix=" sec" label="Threat Detection Time" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Platform Capabilities</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Enterprise security <span className="gradient-text">reimagined with AI</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card-hover p-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-blue-500/20">
                    <Icon size={20} className="text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
              Ready to detect threats <span className="gradient-text">before they strike?</span>
            </h2>
            <p className="text-[#94A3B8] mb-8">
              Join 500+ enterprise security teams using SentinelAI to protect their most privileged assets.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Launch Dashboard <ArrowRight size={14} />
              </motion.button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-[#4B5563]">
              {['SOC 2 Type II Certified', 'GDPR Compliant', 'FedRAMP Authorized', 'ISO 27001'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-success" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">SentinelAI</span>
          </div>
          <p className="text-xs text-[#4B5563]">© 2025 SentinelAI. Enterprise AI Security Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

