"""
SentinelAI AI Engine — Risk Scoring Engine

Calculates a final dynamic risk score (0–100) by combining:
1. Machine Learning Score (40% weight): Isolation Forest anomaly score
2. Business Rules / Heuristics (60% weight): Specific threat signals
   - Unknown Device: +15
   - Midnight Login: +20
   - Location Anomaly (Different Country): +20
   - USB Connected: +10
   - Mass Download: +25
   - Privilege Escalation: +30
   - Sensitive DB Access: +20
   - Failed Logins (>5): +15
   - Historical High Risk Behavior: +20
"""

from __future__ import annotations
import logging
from typing import List, Tuple
from data.schemas import ActivityLog, AnomalyResult, RiskEngineResult, RuleContribution

logger = logging.getLogger("sentinelai.risk_engine")

class RiskEngine:
    """
    Evaluates business rules alongside machine learning outputs to calculate
    a contextualized enterprise risk score.
    """
    def __init__(self) -> None:
        # Define rule configurations
        self.rules_config = {
            "unknown_device": ("Unknown Device", "Session initiated from unregistered device", 15, "💻"),
            "midnight_login": ("Midnight Login", "Activity during off-hours (11 PM - 5 AM)", 20, "🌙"),
            "location_anomaly": ("Location Anomaly", "Connection from unusual/new country", 20, "🌍"),
            "usb_connected": ("USB Connected", "USB storage device connection detected", 10, "🔌"),
            "mass_download": ("Mass Download", "Data download volume significantly exceeds baseline", 25, "📥"),
            "privilege_escalation": ("Privilege Escalation", "Unauthorized administrative privilege request", 30, "⚡"),
            "sensitive_db_access": ("Sensitive DB Access", "Access to critical/restricted database tables", 20, "📂"),
            "failed_logins": ("Multiple Failed Logins", "More than 5 failed login attempts in session", 15, "🔒"),
            "historical_risk": ("Prior High Risk Profile", "Employee has prior high risk history", 20, "👤")
        }

    def evaluate(self, log: ActivityLog, anomaly_result: AnomalyResult) -> RiskEngineResult:
        """
        Evaluate rules, weight them against the Isolation Forest anomaly score,
        and generate a final 0-100 score.
        """
        rule_contributions: List[RuleContribution] = []
        rules_score = 0

        # Rule 1: Unknown Device
        trigger_device = not log.device_known
        self._add_rule("unknown_device", trigger_device, rule_contributions)
        if trigger_device:
            rules_score += 15

        # Rule 2: Midnight Login (Hour 22 to 5)
        trigger_midnight = log.login_time >= 22.0 or log.login_time <= 5.0
        self._add_rule("midnight_login", trigger_midnight, rule_contributions)
        if trigger_midnight:
            rules_score += 20

        # Rule 3: Location Anomaly
        trigger_location = log.location_anomaly
        self._add_rule("location_anomaly", trigger_location, rule_contributions)
        if trigger_location:
            rules_score += 20

        # Rule 4: USB Connected
        trigger_usb = log.usb_connected
        self._add_rule("usb_connected", trigger_usb, rule_contributions)
        if trigger_usb:
            rules_score += 10

        # Rule 5: Mass Download (Triggered if downloads > 100 files OR size > 500MB OR download deviation > 4.0)
        dl_deviation = log.files_downloaded / max(log.historical_avg_downloads, 1.0)
        trigger_download = log.files_downloaded > 100 or log.download_size_mb > 500.0 or dl_deviation > 4.0
        self._add_rule("mass_download", trigger_download, rule_contributions)
        if trigger_download:
            rules_score += 25

        # Rule 6: Privilege Escalation
        trigger_priv = log.privilege_escalation
        self._add_rule("privilege_escalation", trigger_priv, rule_contributions)
        if trigger_priv:
            rules_score += 30

        # Rule 7: Sensitive DB Access
        trigger_db = log.sensitive_db_accessed
        self._add_rule("sensitive_db_access", trigger_db, rule_contributions)
        if trigger_db:
            rules_score += 20

        # Rule 8: Failed Logins (> 5)
        trigger_failed = log.failed_login_attempts > 5
        self._add_rule("failed_logins", trigger_failed, rule_contributions)
        if trigger_failed:
            rules_score += 15

        # Rule 9: Previous High Risk
        trigger_hist = log.historical_risk_score > 50.0
        self._add_rule("historical_risk", trigger_hist, rule_contributions)
        if trigger_hist:
            rules_score += 20

        # Weight combination:
        # - Isolation Forest contribution capped at 40 points (anomaly score range is 0.0 - 1.0)
        # - Business rules contribution capped at 60 points
        if_contribution = anomaly_result.normalized_score * 40.0

        # Map rules score (which can sum up to 180) down to a 0-60 cap, using a saturating sum
        rules_contribution = min(60.0, rules_score)

        # Final score is sum of both components, rounded to integer
        final_score = float(round(if_contribution + rules_contribution))
        final_score = min(100.0, max(0.0, final_score))

        # Risk categorization
        if final_score < 20:
            level = "safe"
            label = "Safe"
            color = "#10B981" # Emerald Green
        elif final_score < 40:
            level = "low_risk"
            label = "Low Risk"
            color = "#2563EB" # Primary Blue
        elif final_score < 60:
            level = "medium_risk"
            label = "Medium Risk"
            color = "#7C3AED" # Purple
        elif final_score < 80:
            level = "high_risk"
            label = "High Risk"
            color = "#F59E0B" # Warning Gold
        else:
            level = "critical"
            label = "Critical"
            color = "#EF4444" # Danger Red

        return RiskEngineResult(
            risk_score=final_score,
            risk_level=level,
            risk_label=label,
            risk_color=color,
            if_contribution=if_contribution,
            rules_contribution=rules_contribution,
            triggered_rules=rule_contributions,
            anomaly_result=anomaly_result
        )

    def _add_rule(self, rule_id: str, triggered: bool, list_ref: List[RuleContribution]) -> None:
        """Helper to create and append RuleContribution objects."""
        label, desc, points, icon = self.rules_config[rule_id]
        list_ref.append(RuleContribution(
            rule_id=rule_id,
            label=label,
            description=desc,
            points=points,
            triggered=triggered,
            icon=icon
        ))
