from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Literal

class ActivityLogInput(BaseModel):
    employee_id: str = Field(..., description="Unique badge/employee identifier")
    department: str = Field(..., description="Department name")
    role: str = Field(..., description="Role title")
    privilege_level: int = Field(default=1, ge=1, le=5)
    
    login_time: float = Field(..., description="Hour of day (0-23)")
    logout_time: float = Field(..., description="Hour of day (0-23)")
    session_duration_minutes: float = Field(..., ge=0.0)
    login_frequency_7d: int = Field(..., ge=0)
    failed_login_attempts: int = Field(default=0, ge=0)

    device_id: str
    device_known: bool = True
    browser: str = "Chrome"
    operating_system: str = "Windows"
    ip_address: str
    vpn_used: bool = False
    
    login_location: str
    location_anomaly: bool = False

    database_accessed: bool = False
    sensitive_db_accessed: bool = False
    server_accessed: bool = False
    sensitive_files_accessed: int = 0
    
    files_downloaded: int = 0
    download_size_mb: float = 0.0

    usb_connected: bool = False
    password_changed: bool = False
    privilege_escalation: bool = False
    permission_modified: bool = False

    # Dynamic baseline data passed during stream
    historical_avg_login_hour: float = 9.0
    historical_avg_downloads: float = 10.0
    historical_risk_score: float = 10.0

class AnomalyResult(BaseModel):
    anomaly_score: float
    normalized_score: float
    prediction: Literal["normal", "anomaly"]
    confidence: float

class RuleContribution(BaseModel):
    rule_id: str
    label: str
    description: str
    points: int
    triggered: bool
    icon: str

class RiskEngineResult(BaseModel):
    risk_score: float
    risk_level: Literal["safe", "low_risk", "medium_risk", "high_risk", "critical"]
    risk_label: str
    risk_color: str
    if_contribution: float
    rules_contribution: float
    triggered_rules: List[RuleContribution]
    anomaly_result: AnomalyResult

class ExplainabilityFactor(BaseModel):
    factor_id: str
    label: str
    description: str
    impact: float
    severity: Literal["critical", "high", "medium", "low", "info"]
    icon: str
    color: str

class ExplainabilityReport(BaseModel):
    summary: str
    top_factors: List[ExplainabilityFactor]
    behaviour_deviation: float
    confidence_note: str

class AccessDecision(BaseModel):
    decision: Literal["allow", "require_mfa", "restrict_downloads", "read_only", "block"]
    decision_label: str
    decision_color: str
    restrictions: List[str]
    notifications: List[str]
    create_incident: bool
    incident_severity: Optional[Literal["low", "medium", "high", "critical"]] = None
    recommended_actions: List[str]

class AnalysisResponse(BaseModel):
    employee_id: str
    timestamp: datetime
    anomaly_result: AnomalyResult
    risk_result: RiskEngineResult
    explainability: ExplainabilityReport
    access_decision: AccessDecision
    processing_time_ms: float
    model_version: str
    engine_version: str = "1.0.0"

class BatchAnalysisRequest(BaseModel):
    logs: List[ActivityLogInput]

class BatchAnalysisResponse(BaseModel):
    results: List[AnalysisResponse]
    total_analyzed: int
    critical_count: int
    high_risk_count: int
    processing_time_ms: float


# ─────────────────────────────────────────────────────────────
# COPILOT CHAT SCHEMAS
# ─────────────────────────────────────────────────────────────

class CopilotChatRequest(BaseModel):
    message: str

class CopilotChatCard(BaseModel):
    type: str
    title: str
    content: str
    color: str

class CopilotChatResponse(BaseModel):
    content: str
    cards: List[CopilotChatCard]

