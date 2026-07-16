import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { threatEvents } from '@/data/mockData'
import { Clock, MapPin } from 'lucide-react'

function ThreatGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>()
  const timeRef = useRef(0)

  const nodes = [
    { id: 'user', label: 'USER', x: 0.5, y: 0.1, color: '#06B6D4', size: 22 },
    { id: 'device', label: 'DEVICE', x: 0.2, y: 0.35, color: '#2563EB', size: 18 },
    { id: 'vpn', label: 'VPN', x: 0.8, y: 0.35, color: '#7C3AED', size: 16 },
    { id: 'database', label: 'DATABASE', x: 0.15, y: 0.65, color: '#F59E0B', size: 20 },
    { id: 'files', label: 'FILES', x: 0.5, y: 0.65, color: '#EF4444', size: 18 },
    { id: 'network', label: 'NETWORK', x: 0.85, y: 0.65, color: '#7C3AED', size: 16 },
    { id: 'risk', label: 'RISK: 87', x: 0.5, y: 0.9, color: '#EF4444', size: 24 },
  ]

  const edges = [
    { from: 'user', to: 'device', color: '#06B6D4', active: true },
    { from: 'user', to: 'vpn', color: '#7C3AED', active: true },
    { from: 'device', to: 'database', color: '#F59E0B', active: true },
    { from: 'device', to: 'files', color: '#EF4444', active: true },
    { from: 'vpn', to: 'network', color: '#7C3AED', active: false },
    { from: 'vpn', to: 'files', color: '#EF4444', active: true },
    { from: 'database', to: 'risk', color: '#EF4444', active: true },
    { from: 'files', to: 'risk', color: '#EF4444', active: true },
    { from: 'network', to: 'risk', color: '#7C3AED', active: false },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      timeRef.current += 0.02
      ctx.clearRect(0, 0, w, h)

      const getPos = (n: typeof nodes[0]) => ({ x: n.x * w, y: n.y * h })

      // Draw edges
      edges.forEach((edge) => {
        const from = nodes.find((n) => n.id === edge.from)!
        const to = nodes.find((n) => n.id === edge.to)!
        const fp = getPos(from)
        const tp = getPos(to)

        ctx.beginPath()
        ctx.strokeStyle = edge.active ? `${edge.color}60` : 'rgba(255,255,255,0.05)'
        ctx.lineWidth = edge.active ? 1.5 : 0.5
        ctx.setLineDash(edge.active ? [] : [4, 4])
        ctx.moveTo(fp.x, fp.y)
        ctx.lineTo(tp.x, tp.y)
        ctx.stroke()
        ctx.setLineDash([])

        // Animated particles on active edges
        if (edge.active) {
          const t = (timeRef.current * 0.5) % 1
          const px = fp.x + (tp.x - fp.x) * t
          const py = fp.y + (tp.y - fp.y) * t
          ctx.beginPath()
          ctx.arc(px, py, 3, 0, Math.PI * 2)
          ctx.fillStyle = edge.color
          ctx.fill()
          // Glow
          ctx.beginPath()
          ctx.arc(px, py, 6, 0, Math.PI * 2)
          ctx.fillStyle = `${edge.color}30`
          ctx.fill()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        const pos = getPos(node)
        const pulse = Math.sin(timeRef.current * 2 + node.id.length) * 0.15 + 0.85

        // Outer glow
        const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, node.size * 2.5)
        grad.addColorStop(0, `${node.color}30`)
        grad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, node.size * 2.5 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Node circle
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, node.size * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `${node.color}25`
        ctx.fill()
        ctx.strokeStyle = node.color
        ctx.lineWidth = 2
        ctx.stroke()

        // Label
        ctx.fillStyle = node.color
        ctx.font = `bold ${node.id === 'risk' ? 11 : 9}px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(node.label, pos.x, pos.y + node.size + 14)
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
}

export default function ThreatTimeline() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Threat Timeline</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">Interactive threat intelligence graph</p>
      </div>

      {/* Threat Graph */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Threat Connection Map</h3>
            <p className="text-xs text-[#94A3B8]">Alexandra Chen · Active threat path visualization</p>
          </div>
          <span className="badge-critical animate-pulse">LIVE THREAT</span>
        </div>
        <div style={{ height: 380 }}>
          <ThreatGraph />
        </div>
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {[
            { label: 'User', color: '#06B6D4' },
            { label: 'Device', color: '#2563EB' },
            { label: 'VPN', color: '#7C3AED' },
            { label: 'Database', color: '#F59E0B' },
            { label: 'Files', color: '#EF4444' },
            { label: 'Risk Score', color: '#EF4444' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs text-[#94A3B8]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Timeline */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Threat Event Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-critical via-warning to-blue-500/20" />
          <div className="space-y-0 pl-10">
            {threatEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative mb-4"
              >
                <div
                  className="absolute -left-7 w-3.5 h-3.5 rounded-full border-2 top-1"
                  style={{
                    background: event.severity === 'critical' ? '#EF4444' : event.severity === 'high' ? '#F59E0B' : '#2563EB',
                    borderColor: '#050816',
                    boxShadow: `0 0 8px ${event.severity === 'critical' ? '#EF4444' : '#F59E0B'}`
                  }}
                />
                <div className="glass-card p-3 hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{event.employeeName}</span>
                        <span className={`text-[10px] font-semibold ${
                          event.severity === 'critical' ? 'text-critical' :
                          event.severity === 'high' ? 'text-warning' : 'text-blue-400'
                        }`}>
                          [{event.severity.toUpperCase()}]
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8]">{event.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-[#4B5563]">
                        <span className="flex items-center gap-1"><Clock size={8} />
                          {Math.floor((Date.now() - event.timestamp.getTime()) / 60000)}m ago
                        </span>
                        <span className="flex items-center gap-1"><MapPin size={8} />{event.location}</span>
                      </div>
                    </div>
                    {event.riskDelta > 0 && (
                      <span className="text-xs font-black text-critical shrink-0">+{event.riskDelta}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
