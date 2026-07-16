export type RiskLevel = 'safe' | 'monitor' | 'suspicious' | 'critical'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ActionType = 'login' | 'logout' | 'file_access' | 'download' | 'usb' | 'vpn' | 'blocked' | 'database' | 'privilege'

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar: string
  riskScore: number
  riskLevel: RiskLevel
  behaviourScore: number
  status: 'active' | 'blocked' | 'monitoring'
  lastLogin: Date
  location: string
  device: string
}

export interface ThreatEvent {
  id: string
  timestamp: Date
  employeeId: string
  employeeName: string
  action: ActionType
  description: string
  riskDelta: number
  riskScore: number
  severity: IncidentSeverity
  location: string
  device: string
}

export interface Incident {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  employeeId: string
  employeeName: string
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  evidence: string[]
  aiRecommendation: string
  timeline: { time: Date; event: string }[]
}

export interface AuditLog {
  id: string
  timestamp: Date
  employeeId: string
  employeeName: string
  action: string
  resource: string
  riskScore: number
  status: 'allowed' | 'blocked' | 'flagged'
  ipAddress: string
  location: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  cards?: SecurityCard[]
}

export interface SecurityCard {
  type: 'risk' | 'recommendation' | 'evidence' | 'comparison'
  title: string
  content: string
  severity?: IncidentSeverity
}

export interface RiskFactor {
  factor: string
  description: string
  impact: number
  icon: string
}
