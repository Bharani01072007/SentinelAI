import numpy as np
from typing import List, Dict, Any
from app.schemas.log import ActivityLogInput

class FeatureEngineer:
    """Handles extracting and preparing numerical feature vectors for the ML model."""
    
    FEATURE_NAMES = [
        "login_time",
        "logout_time",
        "session_duration_minutes",
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
        "privilege_escalation",
        "password_changed",
        "permission_modified",
        "historical_avg_login_hour",
        "historical_avg_downloads",
        "historical_risk_score"
    ]

    def extract_features(self, log: ActivityLogInput) -> np.ndarray:
        """Converts Pydantic ActivityLogInput into a normalized 1D numpy array."""
        vector = [
            float(log.login_time),
            float(log.logout_time),
            float(log.session_duration_minutes),
            float(log.failed_login_attempts),
            1.0 if log.device_known else 0.0,
            1.0 if log.vpn_used else 0.0,
            1.0 if log.location_anomaly else 0.0,
            1.0 if log.database_accessed else 0.0,
            1.0 if log.sensitive_db_accessed else 0.0,
            1.0 if log.server_accessed else 0.0,
            float(log.sensitive_files_accessed),
            float(log.files_downloaded),
            float(log.download_size_mb),
            1.0 if log.usb_connected else 0.0,
            1.0 if log.privilege_escalation else 0.0,
            1.0 if log.password_changed else 0.0,
            1.0 if log.permission_modified else 0.0,
            float(log.historical_avg_login_hour),
            float(log.historical_avg_downloads),
            float(log.historical_risk_score)
        ]
        return np.array(vector, dtype=np.float32)

    def extract_batch(self, logs: List[ActivityLogInput]) -> np.ndarray:
        """Converts a batch of logs into a 2D numpy array [n_samples, n_features]."""
        return np.array([self.extract_features(log) for log in logs], dtype=np.float32)
