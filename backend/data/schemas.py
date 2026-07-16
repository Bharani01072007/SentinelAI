"""
SentinelAI AI Engine — Pydantic Schemas
All request/response data models for the API layer.
"""

from __future__ import annotations
from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import datetime


# ─────────────────────────────────────────────────────────────
# INPUT MODELS
# ─────────────────────────────────────────────────────────────

class ActivityLog(BaseModel):
    """Raw activity log submitted by the frontend or collection agent."""

    # Identity
    employee_id: str = Field(..., description="Unique employee identifier")
    department: str = Field(..., description="Employee department")
    role: str = Field(..., description="Job role / title")
    privilege_level: int = Field(default=1, ge=1, le=5, description="Access privilege level (1=low, 5=admin)")

    # Session info
    login_time: float = Field(..., description="Login hour of day (0–23)")
    logout_time: float = Field(..., description="Logout hour of day (0–23)")
    session_duration_minutes: float = Field(..., ge=0, description="Session duration in minutes")
    login_frequency_7d: int = Field(..., ge=0, description="Number of logins in past 7 days")
    failed_login_attempts: int = Field(default=0, ge=0, description="Failed login count in this session")

    # Device & network
    device_id: str = Field(..., description="Device identifier")
    device_known: bool = Field(default=True, description="Is device registered in MDM?")
    browser: str = Field(default="Chrome", description="Browser used")
    operating_system: str = Field(default="Windows", description="Operating system")
    ip_address: str = Field(..., description="Client IP address")
    vpn_used: bool = Field(default=False, description="VPN connection detected")

    # Location
    login_location: str = Field(..., description="Geographic location of login")
    location_anomaly: bool = Field(default=False, description="Login from unusual/new country")

    # Resource access
    database_accessed: bool = Field(default=False, description="Any database accessed")
    sensitive_db_accessed: bool = Field(default=False, description="Sensitive/critical database accessed")
    server_accessed: bool = Field(default=False, description="Server access occurred")
    sensitive_files_accessed: int = Field(default=0, ge=0, description="Number of sensitive files opened")

    # Download / exfiltration signals
    files_downloaded: int = Field(default=0, ge=0, description="Number of files downloaded")
    download_size_mb: float = Field(default=0.0, ge=0, description="Total download size in MB")

    # Peripheral / privilege
    usb_connected: bool = Field(default=False, description="USB storage device connected")
    password_changed: bool = Field(default=False, description="Password changed during session")
    privilege_escalation: bool = Field(default=False, description="Privilege escalation attempted/succeeded")
    permission_modified: bool = Field(default=False, description="Access permissions modified")

    # Historical baseline
    historical_avg_login_hour: float = Field(default=9.0, description="Employee's typical login hour")
    historical_avg_downloads: float = Field(default=10.0, description="Employee's average daily downloads")
    historical_risk_score: float = Field(default=10.0, ge=0, le=100, description="Prior risk score")

    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)


class BatchAnalysisRequest(BaseModel):
    """Batch analysis request for multiple employees."""
    logs: List[ActivityLog]


class RetrainRequest(BaseModel):
    """Trigger model retraining."""
    contamination: float = Field(default=0.05, ge=0.01, le=0.5)
    n_estimators: int = Field(default=200, ge=50, le=1000)


# ─────────────────────────────────────────────────────────────
# AI ENGINE INTERMEDIATE MODELS
# ─────────────────────────────────────────────────────────────

class FeatureVector(BaseModel):
    """Normalised feature vector passed to the ML model."""
    employee_id: str
    raw_features: List[float]
    feature_names: List[str]
    normalized_features: List[float]


class AnomalyResult(BaseModel):
    """Output from the Isolation Forest anomaly detector."""
    anomaly_score: float = Field(..., description="Raw IF score (negative = more anomalous)")
    normalized_score: float = Field(..., ge=0, le=1, description="Score normalised to 0–1 (1=most anomalous)")
    prediction: Literal["normal", "anomaly"]
    confidence: float = Field(..., ge=0, le=100, description="Confidence in the prediction (%)")


class RuleContribution(BaseModel):
    """A single triggered business rule and its risk contribution."""
    rule_id: str
    label: str
    description: str
    points: int
    triggered: bool
    icon: str


class RiskEngineResult(BaseModel):
    """Output from the Risk Scoring Engine."""
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: Literal["safe", "low_risk", "medium_risk", "high_risk", "critical"]
    risk_label: str
    risk_color: str

    # Component breakdown
    if_contribution: float = Field(..., description="Isolation Forest contribution to risk (0–40)")
    rules_contribution: float = Field(..., description="Business rules total contribution (0–60)")

    triggered_rules: List[RuleContribution]
    anomaly_result: AnomalyResult


class ExplainabilityFactor(BaseModel):
    """A single human-readable explanation for a risk factor."""
    factor_id: str
    label: str
    description: str
    impact: float = Field(..., ge=0, le=100, description="Percentage contribution to risk score")
    severity: Literal["critical", "high", "medium", "low", "info"]
    icon: str
    color: str


class ExplainabilityReport(BaseModel):
    """Complete explainability report for an analysis result."""
    summary: str
    top_factors: List[ExplainabilityFactor]
    behaviour_deviation: float = Field(..., description="% deviation from historical baseline")
    confidence_note: str


class AccessDecision(BaseModel):
    """Adaptive access control decision."""
    decision: Literal["allow", "require_mfa", "restrict_downloads", "read_only", "block"]
    decision_label: str
    decision_color: str
    restrictions: List[str]
    notifications: List[str]
    create_incident: bool
    incident_severity: Optional[Literal["low", "medium", "high", "critical"]] = None
    recommended_actions: List[str]


# ─────────────────────────────────────────────────────────────
# API RESPONSE MODELS
# ─────────────────────────────────────────────────────────────

class AnalysisResponse(BaseModel):
    """Complete threat analysis response for a single employee."""
    employee_id: str
    timestamp: datetime

    # Core ML outputs
    anomaly_result: AnomalyResult
    risk_result: RiskEngineResult
    explainability: ExplainabilityReport
    access_decision: AccessDecision

    # Processing metadata
    processing_time_ms: float
    model_version: str
    engine_version: str = "1.0.0"


class BatchAnalysisResponse(BaseModel):
    """Batch analysis results."""
    results: List[AnalysisResponse]
    total_analyzed: int
    critical_count: int
    high_risk_count: int
    processing_time_ms: float


class ModelStatusResponse(BaseModel):
    """Current model status and training metrics."""
    status: Literal["ready", "training", "error", "not_trained"]
    model_type: str
    model_version: str
    trained_at: Optional[datetime]
    training_samples: int
    contamination: float
    n_estimators: int
    feature_count: int
    xgboost_available: bool = False
    xgboost_message: str = "XGBoost module reserved for supervised learning once labeled data is available."


class LiveThreatEvent(BaseModel):
    """A single live threat feed event."""
    event_id: str
    employee_id: str
    employee_name: str
    risk_score: float
    risk_level: str
    anomaly_score: float
    prediction: str
    top_factor: str
    access_decision: str
    location: str
    timestamp: datetime
    severity: Literal["critical", "high", "medium", "low"]


# ─────────────────────────────────────────────────────────────
# COPILOT CHAT SCHEMAS
# ─────────────────────────────────────────────────────────────

class CopilotChatRequest(BaseModel):
    """Payload representing a message sent by the user to the copilot."""
    message: str = Field(..., description="Message string")


class CopilotChatCard(BaseModel):
    """Structured card payload returning metadata for styled visual indicators."""
    type: str
    title: str
    content: str
    color: str


class CopilotChatResponse(BaseModel):
    """Structured response from the Gemini Copilot."""
    content: str = Field(..., description="Markdown response string")
    cards: List[CopilotChatCard] = Field(default_factory=list, description="Array of security cards to render")
