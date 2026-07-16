import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Wifi, Server, Globe, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { threatEvents } from '@/data/mockData'

function generateLiveData() {
  return Array.from({ length: 20 }, (_, i) => ({
    t: i,
    events: Math.floor(Math.random() * 60) + 20,
    blocked: Math.floor(Math.random() * 15),
    risk: Math.floor(Math.random() * 40) + 30,
  }))
}

export default function LiveMonitoring() {
  const [data, setData] = useState(generateLiveData())
  const [events, setEvents] = useState(threatEvents.slice(0, 8))

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1), {
          t: prev[prev.length - 1].t + 1,
          events: Math.floor(Math.random() * 60) + 20,
          blocked: Math.floor(Math.random() * 15),
          risk: Math.floor(Math.random() * 40) + 30,
        }]
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const nodes = [
    { id: 'users', label: 'Users', value: '2,847 online', color: '#06B6D4', x: 50, y: 20 },
    { id: 'endpoints', label: 'Endpoints', value: '3,142 devices', color: '#2563EB', x: 20, y: 50 },
    { id: 'network', label: 'Network', value: '98.9% uptime', color: '#7C3AED', x: 80, y: 50 },
    { id: 'servers', label: 'Servers', value: '156 critical', color: '#10B981', x: 35, y: 80 },
    { id: 'databases', label: 'Databases', value: '24 monitored', color: '#F59E0B', x: 65, y: 80 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Live Monitoring</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse inline-block" />
          Real-time surveillance across all systems
        </p>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Events/sec', value: '47', color: '#06B6D4', change: '+12%' },
          { label: 'Active Sessions', value: '2,847', color: '#2563EB', change: '+3%' },
          { label: 'Blocked Requests', value: '234', color: '#EF4444', change: '+28%' },
          { label: 'AI Alerts', value: '12', color: '#F59E0B', change: '+45%' },
        ].map((s) => (
          <motion.div
            key={s.label}
            className="glass-card p-4"
            animate={{ borderColor: [`${s.color}20`, `${s.color}40`, `${s.color}20`] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-xs text-[#94A3B8] mb-1">{s.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[10px] text-critical font-semibold">{s.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Real-Time Event Stream</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            <span className="text-[10px] text-success font-semibold">STREAMING</span>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 12, fontSize: 11 }} />
              <Line type="monotone" dataKey="events" stroke="#06B6D4" strokeWidth={2} dot={false} name="Events" isAnimationActive={false} />
              <Line type="monotone" dataKey="blocked" stroke="#EF4444" strokeWidth={2} dot={false} name="Blocked" isAnimationActive={false} />
              <Line type="monotone" dataKey="risk" stroke="#F59E0B" strokeWidth={2} dot={false} name="Risk" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Network Nodes + Event Log */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Infrastructure Map */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Infrastructure Status</h3>
          <div className="space-y-3">
            {[
              { name: 'Primary Datacenter', status: 'online', latency: '12ms', load: 67 },
              { name: 'Edge Nodes (EU)', status: 'online', latency: '8ms', load: 42 },
              { name: 'Cloud Cluster (AWS)', status: 'degraded', latency: '145ms', load: 89 },
              { name: 'Backup Systems', status: 'online', latency: '5ms', load: 23 },
              { name: 'VPN Gateway', status: 'online', latency: '32ms', load: 58 },
            ].map((node) => (
              <div key={node.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-success animate-pulse-slow' : 'bg-warning animate-pulse'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{node.name}</span>
                    <span className="text-[10px] text-[#4B5563]">{node.latency}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-1000"
                      style={{
                        width: `${node.load}%`,
                        background: node.load > 80 ? '#EF4444' : node.load > 60 ? '#F59E0B' : '#10B981'
                      }}
                    />
                  </div>
                </div>
                <span className={`text-[10px] font-semibold ${node.status === 'online' ? 'text-success' : 'text-warning'}`}>
                  {node.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Log */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Live Event Log</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            <AnimatePresence initial={false}>
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/3 transition-colors"
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    event.severity === 'critical' ? 'bg-critical animate-pulse' :
                    event.severity === 'high' ? 'bg-warning' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#F9FAFB] leading-tight">{event.description}</p>
                    <p className="text-[10px] text-[#4B5563] mt-0.5 flex items-center gap-1">
                      <Clock size={8} />
                      {Math.floor((Date.now() - event.timestamp.getTime()) / 60000)}m ago · {event.location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
