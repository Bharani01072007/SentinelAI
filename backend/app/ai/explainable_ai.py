import logging
from typing import List, Tuple
from app.schemas.log import ExplainabilityReport, ExplainabilityFactor, RiskEngineResult, ActivityLogInput

logger = logging.getLogger("sentinelai.ai.explainable_ai")

class ExplainabilityEngine:
    """Explains how risk ratings were calculated for analysts."""
    
    def generate_report(self, risk_res: RiskEngineResult, log: ActivityLogInput) -> ExplainabilityReport:
        """
        Builds explainability factors from rules and ML anomaly features.
        """
        top_factors: List[ExplainabilityFactor] = []
        score = risk_res.risk_score
        
        # Calculate behavioral deviation percentage
        base_dl = max(1.0, log.historical_avg_downloads)
        current_dl = float(log.files_downloaded)
        deviation = float(abs(current_dl - base_dl) / base_dl * 100.0)

        # Inspect triggered rules to build explainability factors
        for rule in risk_res.triggered_rules:
            if rule.triggered:
                # Map rule points to impact percentage
                impact_percent = float(min(100.0, (rule.points / max(1.0, score)) * 100.0))
                
                # Determine factor severity
                if rule.points >= 25:
                    severity = "critical"
                    color = "#EF4444"
                elif rule.points >= 20:
                    severity = "high"
                    color = "#F59E0B"
                elif rule.points >= 15:
                    severity = "medium"
                    color = "#3B82F6"
                else:
                    severity = "low"
                    color = "#10B981"

                top_factors.append(ExplainabilityFactor(
                    factor_id=rule.rule_id,
                    label=rule.label,
                    description=rule.description,
                    impact=impact_percent,
                    severity=severity,
                    icon=rule.icon,
                    color=color
                ))

        # Add ML anomaly factor if anomalous
        if risk_res.anomaly_result.prediction == "anomaly":
            if_impact = float(min(100.0, (risk_res.if_contribution / max(1.0, score)) * 100.0))
            top_factors.append(ExplainabilityFactor(
                factor_id="ML_ISOLATION_FOREST_ANOMALY",
                label="Machine Learning Anomaly Detection",
                description="Isolation Forest flagged this session as highly divergent from typical network baselines (confidence: {:.1f}%).".format(risk_res.anomaly_result.confidence),
                impact=if_impact,
                severity="high",
                icon="Cpu",
                color="#7C3AED"
            ))

        # Sort factors by impact (highest impact first)
        top_factors.sort(key=lambda f: f.impact, reverse=True)

        # Limit to top 5 factors
        top_factors = top_factors[:5]

        # Generate summary text
        if score <= 20:
            summary = "Activity baseline is normal. Standard banking actions verified."
        elif score <= 40:
            summary = "Slight deviation. Enforced security validation (MFA) to match baseline profile."
        elif score <= 60:
            summary = "Medium threat warning. Restricted actions applied to secure financial data assets."
        elif score <= 80:
            summary = "High risk activity profile: detected geographic and credential access anomalies."
        else:
            summary = "Critical alert: confirmed indicators of insider exfiltration pattern. Session locked."

        note = "Calculated using local Isolation Forest model (v1.0.0) combined with dynamic policy checks."

        return ExplainabilityReport(
            summary=summary,
            top_factors=top_factors,
            behaviour_deviation=deviation,
            confidence_note=note
        )
