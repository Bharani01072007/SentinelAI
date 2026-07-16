import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, AlertTriangle, ShieldOff, Zap, Activity, Server, Brain, Radio,
  Clock, MapPin, Monitor, Database, FileText, Usb
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import StatCard from '@/components/shared/StatCard'
import { threatEvents, riskTrendData, threatDistribution, departmentRisk } from '@/data/mockData'
import { getRiskBadgeClass, getRiskColor, generateSparklineData } from '@/lib/utils'
import type { ThreatEvent } from '@/types'

const actionIcons: Record<string, React.ElementType> = {
  login: Monitor,
  logout: Monitor,
  database: Database,
  file_access: FileText,
  download: FileText,
  usb: Usb,
  vpn: Radio,
  blocked: ShieldOff,
  privilege: Zap,
}

const actionColors: Record<string, string> = {
  login: '#06B6D4',
  database: '#7C3AED',
  file_access: '#F59E0B',
  download: '#F59E0B',
  usb: '#EF4444',
  vpn: '#F59E0B',
  blocked: '#EF4444',
  privilege: '#EF4444',
}

function ThreatFeedItem({ event, index }: { event: ThreatEvent; index: number }) {
  const Icon = actionIcons[event.action] || Activity
  const color = actionColors[event.action] || '#94A3B8'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group cursor-pointer"
    >
      <div className="relative flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={14} style={{ color }} />
        </div>
        {index < threatEvents.length - 1 && (
          <div className="w-px h-4 mt-1"
            style={{ background: `linear-gradient(to bottom, ${color}40, transparent)` }} />
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-[#F9FAFB] leading-tight">{event.employeeName}</p>
            <p className="text-[11px] text-[#94A3B8] leading-snug mt-0.5">{event.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <span className={`badge-${event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'warning' : 'monitor'} text-[10px]`}>
              {event.severity}
            </span>
            <div className="text-[10px] text-[#4B5563] mt-1 flex items-center gap-1 justify-end">
              <MapPin size={8} />
              {event.location}
            </div>
          </div>
        </div>
      </div>
      <div className="shrink-0 text-right pt-0.5">
        {event.riskDelta > 0 && (
          <span className="text-[10px] font-bold text-critical">+{event.riskDelta}</span>
        )}
        <div className="text-[10px] text-[#4B5563] mt-0.5">
          {Math.floor((Date.now() - event.timestamp.getTime()) / 60000)}m ago
        </div>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-xs shadow-card">
        <p className="text-[#94A3B8] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [liveEvents, setLiveEvents] = useState<ThreatEvent[]>(threatEvents.slice(0, 6))
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { title: 'Employees Online', value: '2,847', icon: Users, color: 'blue' as const, trend: 3, sparkData: generateSparklineData() },
    { title: 'High Risk Users', value: '12', icon: AlertTriangle, color: 'critical' as const, trend: 25, sparkData: generateSparklineData() },
    { title: 'Blocked Sessions', value: '7', icon: ShieldOff, color: 'warning' as const, trend: 40, sparkData: generateSparklineData() },
    { title: 'Threats Today', value: '34', icon: Zap, color: 'critical' as const, trend: 12, sparkData: generateSparklineData() },
    { title: 'Avg. Risk Score', value: '47.2', icon: Activity, color: 'warning' as const, trend: 8, sparkData: generateSparklineData() },
    { title: 'Critical Systems', value: '156', icon: Server, color: 'cyan' as const, trend: -2, sparkData: generateSparklineData() },
    { title: 'AI Confidence', value: '87%', icon: Brain, color: 'purple' as const, trend: 5, sparkData: generateSparklineData() },
    { title: 'Live Events/sec', value: `${32 + tick % 20}`, icon: Radio, color: 'success' as const, trend: -5, sparkData: generateSparklineData() },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse inline-block" />
            All systems operational · Updated just now
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4B5563]">
            <Clock size={10} className="inline mr-1" />
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 0.05} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title text-base">Risk Score Trend</h3>
              <p className="text-xs text-[#94A3B8]">24-hour risk score evolution</p>
            </div>
            <span className="badge-critical text-[10px]">LIVE</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: '#4B5563', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" name="Risk Score" stroke="#EF4444" strokeWidth={2} fill="url(#riskGrad)" dot={false} />
                <Area type="monotone" dataKey="threats" name="Threats" stroke="#2563EB" strokeWidth={2} fill="url(#threatGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution */}
        <div className="glass-card p-5">
          <div className="mb-4">
            <h3 className="section-title text-base">Threat Distribution</h3>
            <p className="text-xs text-[#94A3B8]">By category today</p>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={threatDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" strokeWidth={0}>
                  {threatDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {threatDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[#94A3B8]">{item.name}</span>
                </div>
                <span className="font-semibold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Live Threat Feed */}
        <div className="xl:col-span-3 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title text-base">Live Threat Feed</h3>
              <p className="text-xs text-[#94A3B8]">Real-time security events</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-critical rounded-full animate-pulse" />
              <span className="text-[10px] text-critical font-semibold">LIVE</span>
            </div>
          </div>
          <div className="space-y-0">
            {liveEvents.map((event, i) => (
              <ThreatFeedItem key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>

        {/* Department Risk */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="mb-4">
            <h3 className="section-title text-base">Department Risk</h3>
            <p className="text-xs text-[#94A3B8]">Risk scores by department</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentRisk} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#4B5563', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <YAxis dataKey="department" type="category" tick={{ fill: '#94A3B8', fontSize: 9 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="riskScore" name="Risk Score" radius={[0, 4, 4, 0]}>
                  {departmentRisk.map((entry, i) => (
                    <Cell key={i} fill={entry.riskScore > 60 ? '#EF4444' : entry.riskScore > 40 ? '#F59E0B' : '#10B981'} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
