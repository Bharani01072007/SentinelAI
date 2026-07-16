import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export function getRiskLevel(score: number): 'safe' | 'monitor' | 'suspicious' | 'critical' {
  if (score < 25) return 'safe'
  if (score < 50) return 'monitor'
  if (score < 75) return 'suspicious'
  return 'critical'
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'safe': return '#10B981'
    case 'monitor': return '#2563EB'
    case 'suspicious': return '#F59E0B'
    case 'critical': return '#EF4444'
    default: return '#94A3B8'
  }
}

export function getRiskBadgeClass(level: string): string {
  switch (level) {
    case 'safe': return 'badge-safe'
    case 'monitor': return 'badge-monitor'
    case 'suspicious': return 'badge-warning'
    case 'critical': return 'badge-critical'
    default: return 'badge-monitor'
  }
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function generateSparklineData(points: number = 8) {
  return Array.from({ length: points }, (_, i) => ({
    value: Math.floor(Math.random() * 80) + 20,
    index: i,
  }))
}
