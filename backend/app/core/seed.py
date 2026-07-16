import logging
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.department import Department
from app.models.role import Role
from app.models.behaviour_profile import BehaviourProfile
from app.models.risk_score import RiskScore
from app.models.alert import Alert
from app.models.incident import Incident
from app.core.security import get_password_hash

logger = logging.getLogger("sentinelai.seed")

def seed_db(db: Session):
    logger.info("Running database seeding...")

    # 1. Seed Departments
    departments_data = [
        {"name": "IT Infrastructure", "description": "Core IT systems and databases"},
        {"name": "Finance", "description": "Financial operations and records"},
        {"name": "Engineering", "description": "Product engineering and infrastructure"},
        {"name": "Security", "description": "Enterprise physical and digital security operations"},
        {"name": "AI Research", "description": "Artificial intelligence research and modeling"},
        {"name": "Legal & Compliance", "description": "Corporate governance and regulatory compliance"},
        {"name": "IT Security", "description": "Information security and access controls Operations"},
        {"name": "HR", "description": "Human resources and personnel"},
        {"name": "Operations", "description": "Business operations"},
        {"name": "Retail Banking", "description": "Retail banking operations"}
    ]
    
    depts = {}
    for d_info in departments_data:
        dept = db.query(Department).filter(Department.name == d_info["name"]).first()
        if not dept:
            dept = Department(name=d_info["name"], description=d_info["description"])
            db.add(dept)
            db.flush()
        depts[d_info["name"]] = dept

    # 2. Seed Roles
    roles_data = [
        {"name": "Senior Database Admin", "description": "Senior DBA privilege"},
        {"name": "Finance Director", "description": "Financial director privilege"},
        {"name": "Cloud Architect", "description": "Cloud systems architect privilege"},
        {"name": "CISO", "description": "Chief Information Security Officer"},
        {"name": "ML Engineer", "description": "Machine learning developer"},
        {"name": "Network Engineer", "description": "Network administrator"},
        {"name": "Compliance Officer", "description": "Corporate compliance officer"},
        {"name": "Privileged Access Admin", "description": "PAM system administrator"},
        {"name": "Employee", "description": "Standard corporate role"},
        {"name": "Admin", "description": "Administrator role"},
        {"name": "Analyst", "description": "Security operations analyst"}
    ]

    roles = {}
    for r_info in roles_data:
        role = db.query(Role).filter(Role.name == r_info["name"]).first()
        if not role:
            role = Role(name=r_info["name"], description=r_info["description"])
            db.add(role)
            db.flush()
        roles[r_info["name"]] = role

    # 3. Seed Employees
    employees_data = [
        {
            "employee_id": "emp-001",
            "name": "Alexandra Chen",
            "email": "a.chen@sentinel.corp",
            "role": "Senior Database Admin",
            "department": "IT Infrastructure",
            "risk_score": 87.0,
            "risk_level": "critical",
            "avatar": "AC",
            "location": "Singapore (Unusual)",
            "device": "Unknown Device"
        },
        {
            "employee_id": "emp-002",
            "name": "Marcus Reyes",
            "email": "m.reyes@sentinel.corp",
            "role": "Finance Director",
            "department": "Finance",
            "risk_score": 64.0,
            "risk_level": "suspicious",
            "avatar": "MR",
            "location": "New York, US",
            "device": "MacBook Pro"
        },
        {
            "employee_id": "emp-003",
            "name": "Sarah Williams",
            "email": "s.williams@sentinel.corp",
            "role": "Cloud Architect",
            "department": "Engineering",
            "risk_score": 38.0,
            "risk_level": "monitor",
            "avatar": "SW",
            "location": "London, UK",
            "device": "ThinkPad X1"
        },
        {
            "employee_id": "emp-004",
            "name": "James Thornton",
            "email": "j.thornton@sentinel.corp",
            "role": "CISO",
            "department": "Security",
            "risk_score": 12.0,
            "risk_level": "safe",
            "avatar": "JT",
            "location": "Chicago, US",
            "device": "Dell XPS"
        },
        {
            "employee_id": "emp-005",
            "name": "Priya Sharma",
            "email": "p.sharma@sentinel.corp",
            "role": "ML Engineer",
            "department": "AI Research",
            "risk_score": 71.0,
            "risk_level": "suspicious",
            "avatar": "PS",
            "location": "Bangalore, IN",
            "device": "MacBook Pro"
        },
        {
            "employee_id": "emp-006",
            "name": "David Kowalski",
            "email": "d.kowalski@sentinel.corp",
            "role": "Network Engineer",
            "department": "IT Infrastructure",
            "risk_score": 19.0,
            "risk_level": "safe",
            "avatar": "DK",
            "location": "Warsaw, PL",
            "device": "HP EliteBook"
        },
        {
            "employee_id": "emp-007",
            "name": "Emma Liu",
            "email": "e.liu@sentinel.corp",
            "role": "Compliance Officer",
            "department": "Legal & Compliance",
            "risk_score": 8.0,
            "risk_level": "safe",
            "avatar": "EL",
            "location": "Hong Kong, HK",
            "device": "MacBook Air"
        },
        {
            "employee_id": "emp-008",
            "name": "Robert Vasquez",
            "email": "r.vasquez@sentinel.corp",
            "role": "Privileged Access Admin",
            "department": "IT Security",
            "risk_score": 93.0,
            "risk_level": "critical",
            "avatar": "RV",
            "location": "Mexico City (VPN)",
            "device": "Unknown Device"
        }
    ]

    hashed_pwd = get_password_hash("SentinelAI123!")
    
    for emp_info in employees_data:
        emp = db.query(Employee).filter(Employee.employee_id == emp_info["employee_id"]).first()
        
        dept = depts.get(emp_info["department"])
        role = roles.get(emp_info["role"])
        
        if not emp:
            emp = Employee(
                employee_id=emp_info["employee_id"],
                name=emp_info["name"],
                email=emp_info["email"],
                hashed_password=hashed_pwd,
                department_id=dept.id if dept else None,
                role_id=role.id if role else None,
                is_active=True
            )
            db.add(emp)
            db.flush()
        else:
            # Update to match real name/details
            emp.name = emp_info["name"]
            emp.email = emp_info["email"]
            if dept:
                emp.department_id = dept.id
            if role:
                emp.role_id = role.id
            db.flush()

        # Seed behavior baseline profile if not exists
        profile = db.query(BehaviourProfile).filter(BehaviourProfile.employee_id == emp.id).first()
        if not profile:
            profile = BehaviourProfile(
                employee_id=emp.id,
                avg_login_hour=9.0 if "001" not in emp.employee_id else 3.0,
                avg_downloads=15.0 if "008" not in emp.employee_id else 2500.0,
                avg_session_duration=480.0,
                common_locations=[emp_info["location"]],
                common_devices=[emp_info["device"]]
            )
            db.add(profile)

        # Seed Risk Score
        risk = db.query(RiskScore).filter(RiskScore.employee_id == emp.id).order_by(RiskScore.calculated_at.desc()).first()
        if not risk or abs(risk.score - emp_info["risk_score"]) > 0.1:
            risk = RiskScore(
                employee_id=emp.id,
                score=emp_info["risk_score"],
                anomaly_score=emp_info["risk_score"] / 100.0,
                risk_level=emp_info["risk_level"]
            )
            db.add(risk)

    db.commit()

    # 4. Seed Alerts & Incidents
    # Get employees maps
    emp_map = {e.employee_id: e for e in db.query(Employee).all()}

    alerts_to_seed = [
        {
            "badge": "emp-001",
            "title": "Geographic Login Anomaly",
            "description": "Login from unrecognized device in Singapore at 02:34 AM",
            "risk_score": 87.0,
            "severity": "critical",
            "status": "open"
        },
        {
            "badge": "emp-001",
            "title": "PII Database Access Anomaly",
            "description": "Accessed Customer PII database — 340 records queried",
            "risk_score": 82.0,
            "severity": "critical",
            "status": "open"
        },
        {
            "badge": "emp-008",
            "title": "Mass Exfiltration Threat",
            "description": "Mass download detected — 2.3GB of sensitive files exported via VPN",
            "risk_score": 93.0,
            "severity": "critical",
            "status": "open"
        },
        {
            "badge": "emp-002",
            "title": "Privilege Escalation Alert",
            "description": "Privilege escalation attempt — Admin rights requested",
            "risk_score": 64.0,
            "severity": "high",
            "status": "open"
        },
        {
            "badge": "emp-005",
            "title": "Geographic Access Anomaly",
            "description": "VPN connection from unusual country (Romania)",
            "risk_score": 71.0,
            "severity": "high",
            "status": "open"
        }
    ]

    for a_info in alerts_to_seed:
        emp = emp_map.get(a_info["badge"])
        if emp:
            existing = db.query(Alert).filter(Alert.employee_id == emp.id, Alert.title == a_info["title"]).first()
            if not existing:
                alert = Alert(
                    employee_id=emp.id,
                    title=a_info["title"],
                    description=a_info["description"],
                    risk_score=a_info["risk_score"],
                    severity=a_info["severity"],
                    status=a_info["status"]
                )
                db.add(alert)
                db.flush()
                
                # If critical, add an incident case as well
                if a_info["severity"] == "critical":
                    inc_existing = db.query(Incident).filter(Incident.employee_id == emp.id, Incident.title.contains(emp.name)).first()
                    if not inc_existing:
                        incident = Incident(
                            employee_id=emp.id,
                            alert_id=alert.id,
                            title=f"Investigate Incident: {emp.name} ({emp.employee_id})",
                            description=f"Critical incident ticket initialized. {a_info['description']}",
                            severity=a_info["severity"],
                            status="open"
                        )
                        db.add(incident)

    db.commit()
    logger.info("Database seeding completed successfully.")
