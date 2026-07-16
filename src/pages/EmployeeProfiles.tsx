import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { employees } from '@/data/mockData'
import { getRiskColor, getRiskBadgeClass } from '@/lib/utils'
import { Eye, MapPin, Monitor } from 'lucide-react'

export default function EmployeeProfiles() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Employee Profiles</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">All monitored personnel and their security posture</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Employee', 'Department', 'Role', 'Risk Score', 'Status', 'Location', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#4B5563] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => {
                const riskColor = getRiskColor(emp.riskLevel)
                return (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/3 hover:bg-white/3 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/dashboard/employees/${emp.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: `${riskColor}25`, border: `1px solid ${riskColor}30` }}
                        >
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{emp.name}</p>
                          <p className="text-[10px] text-[#4B5563]">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8]">{emp.department}</td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8]">{emp.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded-full h-1 max-w-16">
                          <div className="h-1 rounded-full" style={{ width: `${emp.riskScore}%`, background: riskColor }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: riskColor }}>{emp.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getRiskBadgeClass(emp.riskLevel)}>{emp.riskLevel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                        <MapPin size={10} />{emp.location}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4B5563]">
                      {Math.floor((Date.now() - emp.lastLogin.getTime()) / 60000)}m ago
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all"
                        style={{ background: 'rgba(37,99,235,0.15)', color: '#60A5FA' }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/employees/${emp.id}`) }}
                      >
                        <Eye size={10} /> View
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
