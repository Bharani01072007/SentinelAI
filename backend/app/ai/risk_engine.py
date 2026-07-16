import logging
from typing import Dict, List, Tuple, Any
from app.schemas.log import ActivityLogInput, RuleContribution, RiskEngineResult, AnomalyResult, AccessDecision

logger = logging.getLogger("sentinelai.ai.risk_engine")

class RiskEngine:
    """Calculates security threat ratings and matches them to access permissions."""
    
    def evaluate(self, log: ActivityLogInput, anomaly_res: AnomalyResult) -> Tuple[RiskEngineResult, AccessDecision]:
        """
        Processes session logs and anomaly results.
        Returns:
            RiskEngineResult: calculated score details
            AccessDecision: mapped enforcement action
        """
        triggered_rules: List[RuleContribution] = []
        rules_score = 0
        
        # 1. Unknown Device: +15
        device_rule_triggered = not log.device_known
        triggered_rules.append(RuleContribution(
            rule_id="RULE_01_UNKNOWN_DEVICE",
            label="Unknown Device Access",
            description="Access from an unmanaged/unregistered endpoint.",
            points=15,
            triggered=device_rule_triggered,
            icon="Laptop"
        ))
        if device_rule_triggered:
            rules_score += 15

        # 2. Midnight Login: +20 (typical off-hours: 22h to 5h)
        is_midnight = log.login_time >= 22.0 or log.login_time <= 5.0
        triggered_rules.append(RuleContribution(
            rule_id="RULE_02_MIDNIGHT_LOGIN",
            label="Off-Hours Access Trigger",
            description="Login activity detected during off-business hours (10PM - 5AM).",
            points=20,
            triggered=is_midnight,
            icon="Moon"
        ))
        if is_midnight:
            rules_score += 20

        # 3. VPN: +10
        triggered_rules.append(RuleContribution(
            rule_id="RULE_03_VPN_CONNECTION",
            label="VPN Connection Active",
            description="Connection established through proxy or corporate VPN tunnel.",
            points=10,
            triggered=log.vpn_used,
            icon="ShieldAlert"
        ))
        if log.vpn_used:
            rules_score += 10

        # 4. New Country (Location Anomaly): +20
        triggered_rules.append(RuleContribution(
            rule_id="RULE_04_NEW_COUNTRY",
            label="Geographic Location Anomaly",
            description="Login origin differs from historical employee baseline countries.",
            points=20,
            triggered=log.location_anomaly,
            icon="Globe"
        ))
        if log.location_anomaly:
            rules_score += 20

        # 5. Sensitive Database Access: +20
        triggered_rules.append(RuleContribution(
            rule_id="RULE_05_SENSITIVE_DB_ACCESS",
            label="Sensitive Database Interacted",
            description="Access request sent to high-risk databases containing client PII.",
            points=20,
            triggered=log.sensitive_db_accessed,
            icon="Database"
        ))
        if log.sensitive_db_accessed:
            rules_score += 20

        # 6. Mass Download: +25 (e.g. > 5 files or > 100MB)
        is_mass_download = log.files_downloaded > 50 or log.download_size_mb > 500.0
        triggered_rules.append(RuleContribution(
            rule_id="RULE_06_MASS_DOWNLOAD",
            label="Mass File Exfiltration Risk",
            description="Download volume exceeds standard baseline threshold limits (>50 files / >500MB).",
            points=25,
            triggered=is_mass_download,
            icon="DownloadCloud"
        ))
        if is_mass_download:
            rules_score += 25

        # 7. Privilege Escalation: +30
        triggered_rules.append(RuleContribution(
            rule_id="RULE_07_PRIVILEGE_ESCALATION",
            label="Privilege Escalation Request",
            description="Execution of admin commands or elevation permission hooks occurred.",
            points=30,
            triggered=log.privilege_escalation,
            icon="Key"
        ))
        if log.privilege_escalation:
            rules_score += 30

        # 8. USB Connected: +10
        triggered_rules.append(RuleContribution(
            rule_id="RULE_08_USB_CONNECTED",
            label="USB Peripheral Connection",
            description="Removable flash storage drive connected during active secure session.",
            points=10,
            triggered=log.usb_connected,
            icon="HardDrive"
        ))
        if log.usb_connected:
            rules_score += 10

        # 9. Previous Alerts: +15
        has_previous_alerts = log.historical_risk_score >= 50.0
        triggered_rules.append(RuleContribution(
            rule_id="RULE_09_PREVIOUS_ALERTS",
            label="Prior Alert Escalation Baseline",
            description="Employee has multiple active unresolved threat flags in log logs.",
            points=15,
            triggered=has_previous_alerts,
            icon="AlertCircle"
        ))
        if has_previous_alerts:
            rules_score += 15

        # Combine Isolation Forest and business rules
        # IF score is normalised [0, 1]. Let's assign it up to 40 points.
        # Rules can contribute up to 60 points of risk rating.
        if_contribution = min(40.0, anomaly_res.normalized_score * 40.0)
        rules_contribution = min(60.0, float(rules_score))
        
        final_score = min(100.0, if_contribution + rules_contribution)
        
        # Determine risk level
        if final_score <= 20:
            risk_level = "safe"
            risk_label = "Safe Session Profile"
            risk_color = "#10B981" # Green
        elif final_score <= 40:
            risk_level = "low_risk"
            risk_label = "Low Active Threat Risk"
            risk_color = "#3B82F6" # Blue
        elif final_score <= 60:
            risk_level = "medium_risk"
            risk_label = "Elevated Insider Risk"
            risk_color = "#F59E0B" # Amber/Gold
        elif final_score <= 80:
            risk_level = "high_risk"
            risk_label = "High Alert Risk State"
            risk_color = "#EF4444" # Orange-Red
        else:
            risk_level = "critical"
            risk_label = "Critical Insider Threat Alert"
            risk_color = "#7F1D1D" # Dark Crimson Red

        # Determine Access Enforcement Decisions
        if final_score <= 20:
            decision = "allow"
            decision_label = "Allow Access"
            decision_color = "#10B981"
            restrictions = []
            notifications = []
            create_incident = False
            rec_actions = ["Continue monitoring active session."]
        elif final_score <= 40:
            decision = "require_mfa"
            decision_label = "Require Step-up MFA Challenge"
            decision_color = "#3B82F6"
            restrictions = ["Enforce SMS/Authenticator challenge verification."]
            notifications = ["MFA challenge requested for user."]
            create_incident = False
            rec_actions = ["Prompt employee for hardware token challenge."]
        elif final_score <= 60:
            decision = "restrict_downloads"
            decision_label = "Restrict Sensitive File Downloads"
            decision_color = "#F59E0B"
            restrictions = ["Block downloads of files > 5MB", "Disable copy-paste in sensitive DB tools"]
            notifications = ["Flagged unusual downloads volume."]
            create_incident = False
            rec_actions = ["Initiate DLP (Data Loss Prevention) active checks."]
        elif final_score <= 80:
            decision = "read_only"
            decision_label = "Force Read-Only Session Isolation"
            decision_color = "#EF4444"
            restrictions = ["Disable write permissions in databases", "Deny file sharing and printing"]
            notifications = ["Enterprise security notified of suspicious activity."]
            create_incident = True
            incident_severity = "high"
            rec_actions = ["Assign incident ticket to SOC analyst queue immediately."]
        else:
            decision = "block"
            decision_label = "Revoke Tokens & Lock Active Session"
            decision_color = "#7F1D1D"
            restrictions = ["Disable SAML login ticket", "Enforce total account lock out", "Quarantine device from subnet"]
            notifications = ["Enterprise Security Response Team Pager triggered."]
            create_incident = True
            incident_severity = "critical"
            rec_actions = [
                "Suspend Microsoft Entra/Okta credential tokens.",
                "Revoke active device VPN certificates.",
                "Send incident data details to CISO office dashboard."
            ]

        risk_res = RiskEngineResult(
            risk_score=final_score,
            risk_level=risk_level,
            risk_label=risk_label,
            risk_color=risk_color,
            if_contribution=if_contribution,
            rules_contribution=rules_contribution,
            triggered_rules=triggered_rules,
            anomaly_result=anomaly_res
        )

        decision_res = AccessDecision(
            decision=decision,
            decision_label=decision_label,
            decision_color=decision_color,
            restrictions=restrictions,
            notifications=notifications,
            create_incident=create_incident,
            incident_severity=incident_severity if create_incident else None,
            recommended_actions=rec_actions
        )

        return risk_res, decision_res
