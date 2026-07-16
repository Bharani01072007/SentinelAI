"""
SentinelAI AI Engine — Adaptive Access Decision Engine

Maps the final dynamic risk score (0-100) to concrete access decisions:
- Risk < 20    --> ALLOW
- Risk 20-40   --> REQUIRE MFA (Step-up authentication)
- Risk 40-60   --> RESTRICT DOWNLOADS (Disable file downloads)
- Risk 60-80   --> READ ONLY (Disable write operations)
- Risk > 80    --> BLOCK SESSION (Lock account + raise incident)
"""

from __future__ import annotations
import logging
from data.schemas import AccessDecision, RiskEngineResult

logger = logging.getLogger("sentinelai.adaptive_access")

class AdaptiveAccessEngine:
    """
    Translates risk metrics into strict access enforcement policies.
    """
    def make_decision(self, risk_result: RiskEngineResult) -> AccessDecision:
        score = risk_result.risk_score

        if score < 20.0:
            return AccessDecision(
                decision="allow",
                decision_label="Allow Session",
                decision_color="#10B981", # Success Emerald Green
                restrictions=[],
                notifications=["Log: Access granted under standard profile"],
                create_incident=False,
                recommended_actions=["No actions required. Normal baseline monitoring active."]
            )
        elif score < 40.0:
            return AccessDecision(
                decision="require_mfa",
                decision_label="Require Step-Up MFA",
                decision_color="#2563EB", # Primary Blue
                restrictions=["Forced MFA prompt on resource request"],
                notifications=["Alert: MFA challenge requested"],
                create_incident=False,
                recommended_actions=[
                    "Prompt user for secondary MFA authentication.",
                    "Verify location if mismatch is detected."
                ]
            )
        elif score < 60.0:
            return AccessDecision(
                decision="restrict_downloads",
                decision_label="Restrict File Downloads",
                decision_color="#7C3AED", # Purple
                restrictions=["All files download sizes capped at 10MB", "Restricted sensitivity level docs blocked"],
                notifications=["Warn: Blocked sensitive download request", "Log: Action restricted by Risk Engine"],
                create_incident=False,
                recommended_actions=[
                    "Limit active downloads and database query exports.",
                    "Log active session telemetry with increased verbosity."
                ]
            )
        elif score < 80.0:
            return AccessDecision(
                decision="read_only",
                decision_label="Read-Only Mode Enforced",
                decision_color="#F59E0B", # Warning Gold
                restrictions=["All database insert/update operations blocked", "Write access to servers disabled"],
                notifications=["Warn: Write access blocked", "Security: Alerting local SOC panel"],
                create_incident=True,
                incident_severity="medium",
                recommended_actions=[
                    "Enforce strict read-only session scope.",
                    "Alert the security desk for active monitoring.",
                    "Establish side-channel confirmation if possible."
                ]
            )
        else:
            # Critical risk level (>=80)
            return AccessDecision(
                decision="block",
                decision_label="Block Session Immediately",
                decision_color="#EF4444", # Danger Red
                restrictions=["Account login disabled", "Current active tokens revoked", "VPN access terminated"],
                notifications=[
                    "CRITICAL: Active session terminated",
                    "SOC ALERT: Incident auto-created",
                    "Email/Sms dispatch to Security team"
                ],
                create_incident=True,
                incident_severity="critical",
                recommended_actions=[
                    "Instantly terminate all active OAuth/saml tokens.",
                    "Lock AD/Okta directory user account.",
                    "Dispatch active incident to on-call SOC analyst.",
                    "Begin computer forensic preservation."
                ]
            )
        
