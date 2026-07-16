import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Filter, ChevronUp, ChevronDown } from 'lucide-react'
import { auditLogs } from '@/data/mockData'
import { getRiskColor, getRiskBadgeClass } from '@/lib/utils'

type SortKey = 'timestamp' | 'employeeName' | 'action' | 'riskScore' | 'status'

export default function AuditLogs() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const perPage = 8

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = auditLogs
    .filter((log) => {
      const matchSearch = log.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || log.status === filterStatus
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      let av: any = a[sortKey]
      let bv: any = b[sortKey]
      if (sortKey === 'timestamp') { av = a.timestamp.getTime(); bv = b.timestamp.getTime() }
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })

  const paged = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp size={10} className="text-[#4B5563]" />
    return sortDir === 'asc' ? <ChevronUp size={10} className="text-blue-400" /> : <ChevronDown size={10} className="text-blue-400" />
  }

  const exportCsv = () => {
    const headers = ['Timestamp', 'Employee', 'Action', 'Resource', 'Risk Score', 'Status', 'IP', 'Location']
    const rows = filtered.map((l) => [
      l.timestamp.toISOString(), l.employeeName, l.action, l.resource, l.riskScore, l.status, l.ipAddress, l.location
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit-logs.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Complete security event audit trail</p>
        </div>
        <button onClick={exportCsv} className="btn-ghost py-2 px-4 text-xs flex items-center gap-2">
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
          <input
            type="text"
            placeholder="Search by employee or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all" className="bg-[#111827]">All Status</option>
          <option value="allowed" className="bg-[#111827]">Allowed</option>
          <option value="blocked" className="bg-[#111827]">Blocked</option>
          <option value="flagged" className="bg-[#111827]">Flagged</option>
        </select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Logs', value: filtered.length, color: '#60A5FA' },
          { label: 'Allowed', value: filtered.filter((l) => l.status === 'allowed').length, color: '#34D399' },
          { label: 'Flagged', value: filtered.filter((l) => l.status === 'flagged').length, color: '#FCD34D' },
          { label: 'Blocked', value: filtered.filter((l) => l.status === 'blocked').length, color: '#FCA5A5' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-[#94A3B8]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  { key: 'timestamp' as SortKey, label: 'Timestamp' },
                  { key: 'employeeName' as SortKey, label: 'Employee' },
                  { key: 'action' as SortKey, label: 'Action' },
                  { key: null, label: 'Resource' },
                  { key: 'riskScore' as SortKey, label: 'Risk' },
                  { key: 'status' as SortKey, label: 'Status' },
                  { key: null, label: 'IP / Location' },
                ].map(({ key, label }) => (
                  <th
                    key={label}
                    className={`px-4 py-3 text-left text-[10px] font-semibold text-[#4B5563] uppercase tracking-wider ${key ? 'cursor-pointer hover:text-[#94A3B8] transition-colors' : ''}`}
                    onClick={() => key && handleSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {key && <SortIcon k={key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/3 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-[#4B5563] text-[10px] whitespace-nowrap">
                    {log.timestamp.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{log.employeeName}</td>
                  <td className="px-4 py-3">
                    <code className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded font-mono">{log.action}</code>
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8] font-mono text-[10px]">{log.resource}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold`} style={{ color: getRiskColor(log.riskScore > 75 ? 'critical' : log.riskScore > 50 ? 'suspicious' : log.riskScore > 25 ? 'monitor' : 'safe') }}>
                      {log.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      log.status === 'allowed' ? 'badge-safe' :
                      log.status === 'blocked' ? 'badge-critical' : 'badge-warning'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[10px] text-[#94A3B8] font-mono">{log.ipAddress}</div>
                    <div className="text-[10px] text-[#4B5563]">{log.location}</div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <span className="text-xs text-[#4B5563]">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  p === page
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-[#94A3B8] hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
