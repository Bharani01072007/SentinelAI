"""
SentinelAI AI Engine — Synthetic Training Data Generator

Generates realistic employee activity logs for training the Isolation Forest model.
Produces both normal (baseline) and anomalous (insider threat) activity patterns
to give the model a representative view of the feature space.

NO external data sources required — everything is generated locally.
"""

from __future__ import annotations

import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Tuple

# Reproducibility seed
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)


# ─────────────────────────────────────────────────────────────
# DOMAIN CONSTANTS
# ─────────────────────────────────────────────────────────────

DEPARTMENTS = [
    "Engineering", "Finance", "IT Infrastructure", "Security",
    "AI Research", "Legal & Compliance", "IT Security", "HR", "Operations"
]

ROLES = [
    "Software Engineer", "Database Admin", "Finance Director", "Network Engineer",
    "Cloud Architect", "Security Analyst", "ML Engineer", "Compliance Officer",
    "System Administrator", "DevOps Engineer", "CISO", "IT Manager"
]

BROWSERS = ["Chrome", "Firefox", "Edge", "Safari"]
OPERATING_SYSTEMS = ["Windows 11", "Windows 10", "macOS", "Ubuntu", "Fedora"]
LOCATIONS = [
    "New York, US", "London, UK", "Toronto, CA", "Chicago, US",
    "Berlin, DE", "Sydney, AU", "Tokyo, JP", "Hong Kong, HK"
]

ANOMALOUS_LOCATIONS = [
    "Singapore (Unusual)", "Romania (VPN)", "Mexico City (VPN)",
    "Unknown Location", "Moscow, RU", "Pyongyang, KP"
]


# ─────────────────────────────────────────────────────────────
# FEATURE NAMES (must match FeatureExtractor)
# ─────────────────────────────────────────────────────────────

FEATURE_NAMES = [
    "login_time",
    "logout_time",
    "session_duration_minutes",
    "login_frequency_7d",
    "failed_login_attempts",
    "device_known",
    "vpn_used",
    "location_anomaly",
    "database_accessed",
    "sensitive_db_accessed",
    "server_accessed",
    "sensitive_files_accessed",
    "files_downloaded",
    "download_size_mb",
    "usb_connected",
    "password_changed",
    "privilege_escalation",
    "permission_modified",
    "privilege_level",
    "login_hour_deviation",       # |login_time - historical_avg_login_hour|
    "download_deviation",         # files_downloaded / max(historical_avg_downloads, 1)
    "historical_risk_score",
    "department_encoded",
    "role_encoded",
    "browser_encoded",
    "os_encoded",
]


def _encode(value: str, choices: list) -> int:
    """Simple ordinal encoding for categorical features."""
    try:
        return choices.index(value)
    except ValueError:
        return len(choices)  # Unknown → last bucket


def generate_normal_log(employee_id: str | None = None) -> dict:
    """
    Generate a single normal (baseline) activity log.
    Normal employees:
    - Log in during business hours (07:00–18:00)
    - Use known devices
    - Access resources within their scope
    - Have low download volumes
    """
    dept = random.choice(DEPARTMENTS)
    role = random.choice(ROLES)
    login_hour = np.random.normal(loc=9.0, scale=1.5)
    login_hour = float(np.clip(login_hour, 6, 18))
    session_hours = np.random.exponential(scale=4.0)
    session_hours = float(np.clip(session_hours, 0.5, 10))
    logout_hour = float(np.clip(login_hour + session_hours, 6, 23))
    hist_login = login_hour + np.random.normal(0, 0.5)

    files_dl = int(np.random.poisson(lam=8))
    dl_size = float(np.random.exponential(scale=50))

    return {
        "employee_id": employee_id or f"emp-{random.randint(1000, 9999)}",
        "department": dept,
        "role": role,
        "privilege_level": random.randint(1, 3),
        "login_time": login_hour,
        "logout_time": logout_hour,
        "session_duration_minutes": session_hours * 60,
        "login_frequency_7d": int(np.random.normal(loc=5, scale=1)),
        "failed_login_attempts": int(np.random.poisson(lam=0.1)),
        "device_id": f"DEV-{random.randint(1000, 5000)}",
        "device_known": True,
        "browser": random.choice(BROWSERS),
        "operating_system": random.choice(OPERATING_SYSTEMS),
        "ip_address": f"192.168.{random.randint(1,10)}.{random.randint(1,254)}",
        "vpn_used": random.random() < 0.05,
        "login_location": random.choice(LOCATIONS),
        "location_anomaly": False,
        "database_accessed": random.random() < 0.3,
        "sensitive_db_accessed": random.random() < 0.05,
        "server_accessed": random.random() < 0.4,
        "sensitive_files_accessed": int(np.random.poisson(lam=0.5)),
        "files_downloaded": files_dl,
        "download_size_mb": dl_size,
        "usb_connected": False,
        "password_changed": random.random() < 0.01,
        "privilege_escalation": False,
        "permission_modified": False,
        "historical_avg_login_hour": hist_login,
        "historical_avg_downloads": float(np.random.normal(loc=8, scale=2)),
        "historical_risk_score": float(np.random.normal(loc=12, scale=5)),
    }


def generate_anomalous_log(employee_id: str | None = None, pattern: str = "random") -> dict:
    """
    Generate a single anomalous (insider threat) activity log.
    Patterns:
    - 'data_exfil'  : mass download + sensitive access
    - 'midnight'    : off-hours login + unknown device
    - 'privilege'   : privilege escalation + permission changes
    - 'account_takeover': many failed logins + new country
    - 'random'      : random combination
    """
    patterns = ["data_exfil", "midnight", "privilege", "account_takeover"]
    if pattern == "random":
        pattern = random.choice(patterns)

    dept = random.choice(DEPARTMENTS)
    role = random.choice(ROLES)

    # Start from a normal log and layer on anomalies
    log = generate_normal_log(employee_id)
    log["historical_risk_score"] = float(np.random.normal(loc=35, scale=15))

    if pattern == "data_exfil":
        log["login_time"] = float(np.random.uniform(2, 5))           # 2–5 AM
        log["device_known"] = False
        log["vpn_used"] = True
        log["location_anomaly"] = True
        log["login_location"] = random.choice(ANOMALOUS_LOCATIONS)
        log["sensitive_db_accessed"] = True
        log["database_accessed"] = True
        log["sensitive_files_accessed"] = int(np.random.uniform(50, 300))
        log["files_downloaded"] = int(np.random.uniform(500, 3000))
        log["download_size_mb"] = float(np.random.uniform(500, 3000))
        log["usb_connected"] = random.random() < 0.6
        log["historical_avg_downloads"] = 8.0
        log["historical_avg_login_hour"] = 9.0

    elif pattern == "midnight":
        log["login_time"] = float(np.random.uniform(0, 4))
        log["device_known"] = random.random() < 0.3
        log["vpn_used"] = True
        log["failed_login_attempts"] = int(np.random.uniform(2, 8))
        log["location_anomaly"] = random.random() < 0.7
        log["login_location"] = random.choice(ANOMALOUS_LOCATIONS) if log["location_anomaly"] else log["login_location"]
        log["historical_avg_login_hour"] = 9.0
        log["server_accessed"] = True
        log["sensitive_files_accessed"] = int(np.random.uniform(5, 40))

    elif pattern == "privilege":
        log["privilege_escalation"] = True
        log["permission_modified"] = True
        log["password_changed"] = random.random() < 0.5
        log["server_accessed"] = True
        log["database_accessed"] = True
        log["sensitive_db_accessed"] = random.random() < 0.7
        log["privilege_level"] = random.randint(4, 5)
        log["login_time"] = float(np.random.uniform(20, 23))     # Late evening
        log["historical_avg_login_hour"] = 9.0
        log["files_downloaded"] = int(np.random.uniform(50, 200))
        log["download_size_mb"] = float(np.random.uniform(100, 800))

    elif pattern == "account_takeover":
        log["failed_login_attempts"] = int(np.random.uniform(5, 15))
        log["device_known"] = False
        log["location_anomaly"] = True
        log["login_location"] = random.choice(ANOMALOUS_LOCATIONS)
        log["vpn_used"] = True
        log["login_time"] = float(np.random.uniform(1, 5))
        log["historical_avg_login_hour"] = 9.0
        log["sensitive_db_accessed"] = True
        log["database_accessed"] = True
        log["sensitive_files_accessed"] = int(np.random.uniform(20, 100))

    return log


def logs_to_feature_matrix(logs: list[dict]) -> pd.DataFrame:
    """
    Convert raw activity logs into a normalised feature DataFrame
    suitable for training the Isolation Forest.

    Returns a DataFrame with FEATURE_NAMES columns only (no metadata).
    """
    rows = []
    for log in logs:
        login_hour_dev = abs(log["login_time"] - log.get("historical_avg_login_hour", 9.0))
        hist_avg_dl = max(log.get("historical_avg_downloads", 10.0), 1.0)
        dl_deviation = log["files_downloaded"] / hist_avg_dl

        row = {
            "login_time": log["login_time"],
            "logout_time": log["logout_time"],
            "session_duration_minutes": log["session_duration_minutes"],
            "login_frequency_7d": log["login_frequency_7d"],
            "failed_login_attempts": log["failed_login_attempts"],
            "device_known": int(log["device_known"]),
            "vpn_used": int(log["vpn_used"]),
            "location_anomaly": int(log["location_anomaly"]),
            "database_accessed": int(log["database_accessed"]),
            "sensitive_db_accessed": int(log["sensitive_db_accessed"]),
            "server_accessed": int(log["server_accessed"]),
            "sensitive_files_accessed": log["sensitive_files_accessed"],
            "files_downloaded": log["files_downloaded"],
            "download_size_mb": log["download_size_mb"],
            "usb_connected": int(log["usb_connected"]),
            "password_changed": int(log["password_changed"]),
            "privilege_escalation": int(log["privilege_escalation"]),
            "permission_modified": int(log["permission_modified"]),
            "privilege_level": log["privilege_level"],
            "login_hour_deviation": login_hour_dev,
            "download_deviation": dl_deviation,
            "historical_risk_score": log.get("historical_risk_score", 10.0),
            "department_encoded": _encode(log["department"], DEPARTMENTS),
            "role_encoded": _encode(log["role"], ROLES),
            "browser_encoded": _encode(log["browser"], BROWSERS),
            "os_encoded": _encode(log["operating_system"], OPERATING_SYSTEMS),
        }
        rows.append(row)

    df = pd.DataFrame(rows, columns=FEATURE_NAMES)
    return df


def generate_training_dataset(
    n_normal: int = 10_000,
    n_anomalous: int = 500,
) -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Generate the full training dataset.

    Returns:
        X  : Feature matrix (n_normal + n_anomalous, n_features)
        y  : Labels (0=normal, 1=anomaly) — not used by IF but
             kept for future XGBoost training
    """
    print(f"[DataGenerator] Generating {n_normal:,} normal logs...")
    normal_logs = [generate_normal_log() for _ in range(n_normal)]

    print(f"[DataGenerator] Generating {n_anomalous:,} anomalous logs...")
    anomalous_logs = [generate_anomalous_log() for _ in range(n_anomalous)]

    all_logs = normal_logs + anomalous_logs
    labels = np.array([0] * n_normal + [1] * n_anomalous)

    X = logs_to_feature_matrix(all_logs)

    print(f"[DataGenerator] Dataset ready: {X.shape[0]:,} samples × {X.shape[1]} features")
    return X, labels


if __name__ == "__main__":
    X, y = generate_training_dataset(n_normal=500, n_anomalous=25)
    print(X.describe())
