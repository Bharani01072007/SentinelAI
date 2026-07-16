/**
 * SentinelAI — AI Engine API Client
 * Manages all communication with the local FastAPI threat detection service.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://127.0.0.1:8000/api/v1'
    : '/api/v1');

export interface ActivityLogInput {
  employee_id: string;
  department: string;
  role: string;
  privilege_level: number;
  login_time: number;
  logout_time: number;
  session_duration_minutes: number;
  login_frequency_7d: number;
  failed_login_attempts: number;
  device_id: string;
  device_known: boolean;
  browser: string;
  operating_system: string;
  ip_address: string;
  vpn_used: boolean;
  login_location: string;
  location_anomaly: boolean;
  database_accessed: boolean;
  sensitive_db_accessed: boolean;
  server_accessed: boolean;
  sensitive_files_accessed: number;
  files_downloaded: number;
  download_size_mb: number;
  usb_connected: boolean;
  password_changed: boolean;
  privilege_escalation: boolean;
  permission_modified: boolean;
  historical_avg_login_hour: number;
  historical_avg_downloads: number;
  historical_risk_score: number;
}

export interface AnomalyResult {
  anomaly_score: number;
  normalized_score: number;
  prediction: 'normal' | 'anomaly';
  confidence: number;
}

export interface RuleContribution {
  rule_id: string;
  label: string;
  description: string;
  points: number;
  triggered: boolean;
  icon: string;
}

export interface RiskEngineResult {
  risk_score: number;
  risk_level: 'safe' | 'low_risk' | 'medium_risk' | 'high_risk' | 'critical';
  risk_label: string;
  risk_color: string;
  if_contribution: number;
  rules_contribution: number;
  triggered_rules: RuleContribution[];
  anomaly_result: AnomalyResult;
}

export interface ExplainabilityFactor {
  factor_id: string;
  label: string;
  description: string;
  impact: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  icon: string;
  color: string;
}

export interface ExplainabilityReport {
  summary: string;
  top_factors: ExplainabilityFactor[];
  behaviour_deviation: number;
  confidence_note: string;
}

export interface AccessDecision {
  decision: 'allow' | 'require_mfa' | 'restrict_downloads' | 'read_only' | 'block';
  decision_label: string;
  decision_color: string;
  restrictions: string[];
  notifications: string[];
  create_incident: boolean;
  incident_severity?: 'low' | 'medium' | 'high' | 'critical';
  recommended_actions: string[];
}

export interface AnalysisResponse {
  employee_id: string;
  timestamp: string;
  anomaly_result: AnomalyResult;
  risk_result: RiskEngineResult;
  explainability: ExplainabilityReport;
  access_decision: AccessDecision;
  processing_time_ms: number;
  model_version: string;
}

export interface ModelStatusResponse {
  status: 'ready' | 'training' | 'error' | 'not_trained';
  model_type: string;
  model_version: string;
  trained_at: string | null;
  training_samples: number;
  contamination: number;
  n_estimators: number;
  feature_count: number;
  xgboost_available: boolean;
}

export interface LiveThreatEvent {
  event_id: string;
  employee_id: string;
  employee_name: string;
  risk_score: number;
  risk_level: string;
  anomaly_score: number;
  prediction: string;
  top_factor: string;
  access_decision: string;
  location: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface CopilotChatCard {
  type: string;
  title: string;
  content: string;
  color: string;
}

export interface CopilotChatResponse {
  content: string;
  cards: CopilotChatCard[];
}


class AIEngineService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      const errorMsg = await response.text().catch(() => 'Unknown network error');
      throw new Error(`AI Engine API Error (${response.status}): ${errorMsg}`);
    }

    return response.json() as Promise<T>;
  }

  /** Analyze a single user log payload. */
  async analyzeLog(log: ActivityLogInput): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  /** Run a batch prediction suite. */
  async analyzeBatch(logs: ActivityLogInput[]): Promise<AnalysisResponse[]> {
    const res = await this.request<{ results: AnalysisResponse[] }>('/analyze/batch', {
      method: 'POST',
      body: JSON.stringify({ logs }),
    });
    return res.results;
  }

  /** Fetch current model configuration status. */
  async getModelStatus(): Promise<ModelStatusResponse> {
    return this.request<ModelStatusResponse>('/model/status');
  }

  /** Trigger an async background retrain on the Isolation Forest. */
  async retrainModel(contamination: number, nEstimators: number): Promise<{ message: string }> {
    return this.request<{ message: string }>('/model/retrain', {
      method: 'POST',
      body: JSON.stringify({ contamination, n_estimators: nEstimators }),
    });
  }

  /** Query current risk analytics for a specific employee. */
  async getEmployeeRisk(employeeId: string): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>(`/employees/${employeeId}/risk`);
  }

  /** Query the live feed list for recent alerts. */
  async getLiveThreats(): Promise<LiveThreatEvent[]> {
    return this.request<LiveThreatEvent[]>('/threats/live');
  }

  /** Send a message to the AI Copilot. */
  async askCopilot(message: string): Promise<CopilotChatResponse> {
    return this.request<CopilotChatResponse>('/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const aiEngine = new AIEngineService();
export default aiEngine;
