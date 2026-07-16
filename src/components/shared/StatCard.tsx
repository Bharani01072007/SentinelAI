import React from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  sparkData?: { value: number }[]
  color?: 'blue' | 'cyan' | 'purple' | 'success' | 'warning' | 'critical'
  subtitle?: string
  animate?: boolean
  delay?: number
}

const colorMap = {
  blue: { text: '#60A5FA', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.2)', stroke: '#2563EB', fill: 'rgba(37,99,235,0.1)' },
  cyan: { text: '#22D3EE', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)', stroke: '#06B6D4', fill: 'rgba(6,182,212,0.1)' },
  purple: { text: '#A78BFA', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)', stroke: '#7C3AED', fill: 'rgba(124,58,237,0.1)' },
  success: { text: '#34D399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', stroke: '#10B981', fill: 'rgba(16,185,129,0.1)' },
  warning: { text: '#FCD34D', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', stroke: '#F59E0B', fill: 'rgba(245,158,11,0.1)' },
  critical: { text: '#FCA5A5', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', stroke: '#EF4444', fill: 'rgba(239,68,68,0.1)' },
}

export default function StatCard({
  title, value, icon: Icon, trend, sparkData, color = 'blue', subtitle, animate = true, delay = 0
}: StatCardProps) {
  const colors = colorMap[color]

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="stat-card group"
    >
      {/* Glow background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        style={{ background: `radial-gradient(ellipse at top left, ${colors.bg}, transparent 70%)` }} />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-[#94A3B8] mb-1">{title}</p>
          <motion.div
            key={typeof value === 'number' ? value : undefined}
            initial={animate ? { scale: 0.8, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black"
            style={{ color: colors.text }}
          >
            {value}
          </motion.div>
          {subtitle && <p className="text-[10px] text-[#4B5563] mt-0.5">{subtitle}</p>}
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
          <Icon size={16} style={{ color: colors.text }} />
        </div>
      </div>

      {/* Sparkline */}
      {sparkData && (
        <div className="h-10 -mx-1 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                strokeWidth={1.5}
                fill={`url(#spark-${color})`}
                dot={false}
              />
              <Tooltip content={() => null} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trend */}
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          <span className={cn(
            'text-[10px] font-semibold',
            trend > 0 ? 'text-critical' : 'text-success'
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-[10px] text-[#4B5563]">vs yesterday</span>
        </div>
      )}
    </motion.div>
  )
}
