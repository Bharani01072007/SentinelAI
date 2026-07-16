import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { employees } from '@/data/mockData'
import { getRiskColor, getRiskBadgeClass } from '@/lib/utils'
import type { Employee } from '@/types'

const departments = ['All', 'IT Infrastructure', 'Finance', 'Engineering', 'Security', 'AI Research', 'Legal & Compliance', 'IT Security']
const riskLevels = ['All', 'safe', 'monitor', 'suspicious', 'critical']

function EmployeeCard({ employee, index }: { employee: Employee; index: number }) {
  const navigate = useNavigate()
  const riskColor = getRiskColor(employee.riskLevel)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card-hover p-5 cursor-pointer group"
      onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${riskColor}40, ${riskColor}20)`, border: `1px solid ${riskColor}30` }}
          >
            {employee.avatar}
          </div>
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{
              background: employee.status === 'active' ? '#10B981' : employee.status === 'blocked' ? '#EF4444' : '#F59E0B',
              borderColor: '#111827'
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{employee.name}</p>
          <p className="text-xs text-[#94A3B8] truncate">{employee.role}</p>
          <p className="text-[10px] text-[#4B5563] truncate">{employee.department}</p>
        </div>
        <span className={getRiskBadgeClass(employee.riskLevel)}>
          {employee.riskLevel}
        </span>
      </div>

      {/* Risk Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#94A3B8]">Risk Score</span>
          <span className="text-xs font-bold" style={{ color: riskColor }}>{employee.riskScore}</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${employee.riskScore}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: index * 0.05 + 0.3 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${riskColor}80, ${riskColor})` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div>
          <div className="text-xs font-bold text-white">{employee.behaviourScore}</div>
          <div className="text-[9px] text-[#4B5563]">Behaviour</div>
        </div>
        <div>
          <div className={`text-xs font-bold ${
            employee.status === 'active' ? 'text-success' :
            employee.status === 'blocked' ? 'text-critical' : 'text-warning'
          }`}>{employee.status}</div>
          <div className="text-[9px] text-[#4B5563]">Status</div>
        </div>
        <div>
          <div className="text-xs font-bold text-white">
            {Math.floor((Date.now() - employee.lastLogin.getTime()) / 60000)}m
          </div>
          <div className="text-[9px] text-[#4B5563]">Last Login</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#4B5563]">{employee.location}</span>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all opacity-0 group-hover:opacity-100"
          style={{ background: 'rgba(37,99,235,0.15)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.2)' }}>
          <Eye size={11} />
          View
        </button>
      </div>
    </motion.div>
  )
}

export default function BehaviourAnalytics() {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedRisk, setSelectedRisk] = useState('All')

  const filtered = employees.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase())
    const matchDept = selectedDept === 'All' || emp.department === selectedDept
    const matchRisk = selectedRisk === 'All' || emp.riskLevel === selectedRisk
    return matchSearch && matchDept && matchRisk
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Behaviour Analytics</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">AI-powered employee behaviour profiling</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-critical">{employees.filter(e => e.riskLevel === 'critical').length} Critical</span>
          <span className="badge-warning">{employees.filter(e => e.riskLevel === 'suspicious').length} Suspicious</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              type="text"
              placeholder="Search employees by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            {departments.map((d) => <option key={d} value={d} className="bg-[#111827]">{d}</option>)}
          </select>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="input-field w-auto min-w-[120px]"
          >
            {riskLevels.map((r) => <option key={r} value={r} className="bg-[#111827]">{r === 'All' ? 'All Risks' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#94A3B8]">Showing {filtered.length} of {employees.length} employees</span>
        {(search || selectedDept !== 'All' || selectedRisk !== 'All') && (
          <button
            onClick={() => { setSearch(''); setSelectedDept('All'); setSelectedRisk('All') }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((emp, i) => (
          <EmployeeCard key={emp.id} employee={emp} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#94A3B8]">
          <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
          <p>No employees match your search criteria.</p>
        </div>
      )}
    </div>
  )
}
