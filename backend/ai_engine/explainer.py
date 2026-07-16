"""
SentinelAI AI Engine — Explainable AI (XAI) Module

Decodes the final risk score and anomaly detection details into human-readable,
actionable insights for security analysts in the SOC.
Calculates percentage contribution of each triggered factor, maps severity levels,
and computes behavioural deviation percentages.
"""

from __future__ import annotations
import logging
from typing import List
from data.schemas import RiskEngineResult, ExplainabilityReport, ExplainabilityFactor

logger = logging.getLogger("sentinelai.explainer")

class Explainer:
    """
    Generates explainability reports detailing why a user was marked as high-risk.
    """
    def generate_report(self, risk_result: RiskEngineResult) -> ExplainabilityReport:
        top_factors: List[ExplainabilityFactor] = []
        
        # Determine total contributions to calculate percentages
        total_points = risk_result.if_contribution + sum(
            r.points for r in risk_result.triggered_rules if r.triggered
        )
        
        # Handle zero division edge case
        if total_points == 0:
            total_points = 1.0

        # Add Isolation Forest factor if its normalized score is significant
        if risk_result.if_contribution > 5.0:
            impact_percent = (risk_result.if_contribution / total_points) * 100.0
            top_factors.append(ExplainabilityFactor(
                factor_id="ml_anomaly",
                label="ML Anomaly Profile Triggered",
                description=f"Behavior deviates significantly from baseline profile. Unsupervised anomaly model confidence is {risk_result.anomaly_result.confidence:.1f}%.",
                impact=impact_percent,
                severity="critical" if risk_result.if_contribution > 30.0 else "high" if risk_result.if_contribution > 20.0 else "medium",
                icon="🧠",
                color="#7C3AED" # Purple
            ))

        # Add triggered business rules
        for rule in risk_result.triggered_rules:
            if rule.triggered:
                impact_percent = (rule.points / total_points) * 100.0
                
                # Map point values to severity strings
                if rule.points >= 25:
                    sev = "critical"
                    color = "#EF4444"
                elif rule.points >= 20:
                    sev = "high"
                    color = "#F59E0B"
                elif rule.points >= 15:
                    sev = "medium"
                    color = "#2563EB"
                else:
                    sev = "low"
                    color = "#10B981"

                top_factors.append(ExplainabilityFactor(
                    factor_id=rule.rule_id,
                    label=rule.label,
                    description=rule.description,
                    impact=impact_percent,
                    severity=sev,
                    icon=rule.icon,
                    color=color
                ))

        # Sort factors by impact percentage descending
        top_factors.sort(key=lambda x: x.impact, reverse=True)

        # Build human-readable summary
        active_factors_count = len(top_factors)
        if active_factors_count == 0:
            summary = "No anomalous factors detected. Behavior aligns with normal patterns."
        elif risk_result.risk_score >= 80:
            summary = f"CRITICAL INSIDER THREAT DETECTED. User behavior exhibits multiple high-severity anomalies, including {', '.join(f.label for f in top_factors[:2])}."
        elif risk_result.risk_score >= 40:
            summary = f"Suspicious activity pattern observed. Main contributors: {', '.join(f.label for f in top_factors[:2])}."
        else:
            summary = f"Minor deviation detected. Main contributor: {top_factors[0].label}."

        # Calculate a behavioral deviation metric
        # Isolation Forest normalized score combined with rules points can scale deviation
        base_deviation = risk_result.anomaly_result.normalized_score * 100.0
        rules_deviation = (risk_result.rules_contribution / 60.0) * 100.0
        behaviour_deviation = max(base_deviation, rules_deviation)

        confidence_note = f"Analysis generated with {risk_result.anomaly_result.confidence:.1f}% AI confidence using local Isolation Forest model."

        return ExplainabilityReport(
            summary=summary,
            top_factors=top_factors,
            behaviour_deviation=behaviour_deviation,
            confidence_note=confidence_note
        )
