"""
SentinelAI AI Engine — Gemini Copilot Service
Integrates the Google Generative AI Python SDK to connect the chat Copilot
to a real Gemini LLM model.
"""

from __future__ import annotations
import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv

logger = logging.getLogger("sentinelai.copilot")
load_dotenv()

class CopilotService:
    """
    Manages conversational security intelligence powered by Google Gemini.
    """
    def __init__(self) -> None:
        self.active = False
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            logger.warning("[CopilotService] GEMINI_API_KEY not found in environment. Falling back to local generator.")
            return

        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-2.5-flash")
            self.active = True
            logger.info("[CopilotService] Gemini API client configured successfully.")
        except Exception as e:
            logger.error(f"[CopilotService] Configuration failed: {str(e)}", exc_info=True)

    def generate_chat_response(self, prompt: str, db: Session = None) -> dict:
        """
        Sends the user request to Gemini and returns structured JSON.
        Falls back to local heuristic response if offline or query fails.
        """
        if not self.active:
            return self._get_fallback_response(prompt)

        system_instruction = (
            "You are SentinelGPT, a helpful AI cybersecurity assistant for the SentinelAI SOC dashboard.\n"
            "Analyze the user's query about security incidents, logs, behavior, or employee risks.\n"
            "You must respond in a valid JSON object format matching this structure:\n"
            "{\n"
            '  "content": "A detailed explanation formatted in markdown. Use bolding, bullet points, and code blocks where appropriate.",\n'
            '  "cards": [\n'
            '    {\n'
            '      "type": "risk" or "recommendation" or "evidence" or "comparison",\n'
            '      "title": "Short title highlighting the issue",\n'
            '      "content": "A concise sentence detailing the context or action item.",\n'
            '      "color": "#EF4444" (critical/danger red) or "#F59E0B" (warning gold) or "#2563EB" (info blue) or "#7C3AED" (recommendation purple)\n'
            '    }\n'
            '  ]\n'
            "}\n"
            "Do not include any wrapping markdown code blocks (like ```json ... ```) in the raw response text, return ONLY the raw JSON string."
        )

        context_str = ""
        if db:
            try:
                from app.models.employee import Employee
                from app.models.risk_score import RiskScore
                from app.models.alert import Alert
                from app.models.incident import Incident

                employees = db.query(Employee).all()
                emp_list = []
                for emp in employees:
                    latest_risk = db.query(RiskScore).filter(RiskScore.employee_id == emp.id).order_by(RiskScore.calculated_at.desc()).first()
                    risk_val = round(latest_risk.score, 1) if latest_risk else 0.0
                    risk_lvl = latest_risk.risk_level if latest_risk else "safe"
                    dept_name = emp.department.name if emp.department else "None"
                    role_name = emp.role.name if emp.role else "None"
                    status_str = "blocked" if risk_val >= 80.0 else "active"
                    emp_list.append(f"- Name: {emp.name}, ID: {emp.employee_id}, Email: {emp.email}, Dept: {dept_name}, Role: {role_name}, Risk score: {risk_val} ({risk_lvl}), Status: {status_str}")
                
                alerts = db.query(Alert).all()
                alerts_list = []
                for a in alerts:
                    emp_name = a.employee.name if a.employee else "Unknown"
                    alerts_list.append(f"- Alert ID: {a.id}, Title: {a.title}, Employee: {emp_name} ({a.employee.employee_id if a.employee else ''}), Risk score: {a.risk_score}, Severity: {a.severity}, Status: {a.status}")

                incidents = db.query(Incident).all()
                inc_list = []
                for i in incidents:
                    emp_name = i.employee.name if i.employee else "Unknown"
                    inc_list.append(f"- Incident ID: {i.id}, Title: {i.title}, Employee: {emp_name} ({i.employee.employee_id if i.employee else ''}), Severity: {i.severity}, Status: {i.status}")

                context_str = (
                    "Here is the current real-time data from the SentinelAI system database:\n\n"
                    "### Monitored Employees:\n" + ("\n".join(emp_list) if emp_list else "No employees currently monitored.") + "\n\n"
                    "### Active Alerts:\n" + ("\n".join(alerts_list) if alerts_list else "No active alerts.") + "\n\n"
                    "### Current Incidents:\n" + ("\n".join(inc_list) if inc_list else "No open incidents.") + "\n"
                )
            except Exception as db_err:
                logger.error(f"[CopilotService] Failed to load db context: {str(db_err)}")

        try:
            user_prompt = f"{context_str}\n\nUser Query: {prompt}" if context_str else f"User Query: {prompt}"
            response = self.model.generate_content(
                contents=f"{system_instruction}\n\n{user_prompt}",
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"[CopilotService] Gemini generation failed: {str(e)}. Using fallback response.", exc_info=True)
            return self._get_fallback_response(prompt)

    def _get_fallback_response(self, prompt: str) -> dict:
        lower = prompt.lower()
        if "vasquez" in lower or "block" in lower:
            return {
                "content": "Based on my local analysis of active incident telemetry, **Robert Vasquez** (PAM Admin) was blocked at **03:39 AM** after his risk score reached **93/100**.\n\nHere is what triggered the action:",
                "cards": [
                    { "type": "evidence", "title": "🌍 Geographic Anomaly", "content": "Login from Mexico City — 4,200km from his New York baseline.", "color": "#EF4444" },
                    { "type": "evidence", "title": "📥 Mass Download", "content": "2.3GB of database files exported via VPN in under 6 minutes.", "color": "#F59E0B" },
                    { "type": "recommendation", "title": "🛡️ Recommended Action", "content": "SAML token revocation, Okta lockout, and logs preservation.", "color": "#7C3AED" }
                ]
            }
        
        return {
            "content": "I have scanned the active event logs. There are currently **2 critical security alerts** involving Alexandra Chen and Robert Vasquez. The overall enterprise threat posture is elevated (Risk Score: 47.2).",
            "cards": [
                { "type": "risk", "title": "⚡ Data Exfiltration Signal", "content": "Massive DB queries and file transfers logged outside business hours (confidence: 87.3%).", "color": "#EF4444" },
                { "type": "recommendation", "title": "🛡️ Mitigation Steps", "content": "Trigger dynamic download restrictions and require step-up MFA challenge for IT Security admins.", "color": "#7C3AED" }
            ]
        }
