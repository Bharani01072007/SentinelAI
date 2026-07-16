import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import Landing from '@/pages/Landing'

// Lazy load all dashboard pages
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const LiveMonitoring = lazy(() => import('@/pages/LiveMonitoring'))
const BehaviourAnalytics = lazy(() => import('@/pages/BehaviourAnalytics'))
const EmployeeBehaviour = lazy(() => import('@/pages/EmployeeBehaviour'))
const RiskEngine = lazy(() => import('@/pages/RiskEngine'))
const ThreatTimeline = lazy(() => import('@/pages/ThreatTimeline'))
const EmployeeProfiles = lazy(() => import('@/pages/EmployeeProfiles'))
const Incidents = lazy(() => import('@/pages/Incidents'))
const AdaptiveAccess = lazy(() => import('@/pages/AdaptiveAccess'))
const AICopilot = lazy(() => import('@/pages/AICopilot'))
const AuditLogs = lazy(() => import('@/pages/AuditLogs'))
const QuantumSecurity = lazy(() => import('@/pages/QuantumSecurity'))
const Reports = lazy(() => import('@/pages/Reports'))
const Settings = lazy(() => import('@/pages/Settings'))

function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="loading-skeleton h-24 rounded-xl" />
      ))}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="loading-skeleton h-32 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<AppShell />}>
          <Route index element={
            <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>
          } />
          <Route path="monitoring" element={
            <Suspense fallback={<PageLoader />}><LiveMonitoring /></Suspense>
          } />
          <Route path="behaviour" element={
            <Suspense fallback={<PageLoader />}><BehaviourAnalytics /></Suspense>
          } />
          <Route path="employees" element={
            <Suspense fallback={<PageLoader />}><EmployeeProfiles /></Suspense>
          } />
          <Route path="employees/:id" element={
            <Suspense fallback={<PageLoader />}><EmployeeBehaviour /></Suspense>
          } />
          <Route path="risk-engine" element={
            <Suspense fallback={<PageLoader />}><RiskEngine /></Suspense>
          } />
          <Route path="threat-timeline" element={
            <Suspense fallback={<PageLoader />}><ThreatTimeline /></Suspense>
          } />
          <Route path="incidents" element={
            <Suspense fallback={<PageLoader />}><Incidents /></Suspense>
          } />
          <Route path="adaptive-access" element={
            <Suspense fallback={<PageLoader />}><AdaptiveAccess /></Suspense>
          } />
          <Route path="ai-copilot" element={
            <Suspense fallback={<PageLoader />}><AICopilot /></Suspense>
          } />
          <Route path="audit-logs" element={
            <Suspense fallback={<PageLoader />}><AuditLogs /></Suspense>
          } />
          <Route path="quantum" element={
            <Suspense fallback={<PageLoader />}><QuantumSecurity /></Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<PageLoader />}><Reports /></Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<PageLoader />}><Settings /></Suspense>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
