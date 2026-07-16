"""
SentinelAI AI Engine — Feature Extractor

Transforms raw ActivityLog objects into normalized numerical feature vectors
suitable for the Isolation Forest and any future ML models.

Design:
- Stateless transformation (encoding rules are fixed constants)
- StandardScaler fit on training data, then reused for inference
- All feature names declared as constants to ensure consistency
"""

from __future__ import annotations

import logging
from typing import List, Tuple

import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib

from data.schemas import ActivityLog, FeatureVector
from data.data_generator import DEPARTMENTS, ROLES, BROWSERS, OPERATING_SYSTEMS, FEATURE_NAMES

logger = logging.getLogger("sentinelai.feature_extractor")


def _encode(value: str, choices: list) -> int:
    """Ordinal encode a categorical value. Unknown values → last bucket."""
    try:
        return choices.index(value)
    except ValueError:
        return len(choices)


class FeatureExtractor:
    """
    Converts ActivityLog → normalised feature vector.

    Usage:
        extractor = FeatureExtractor()
        extractor.fit(training_df)          # fit scaler on training data
        fv = extractor.transform(log)       # transform a single log
    """

    FEATURE_NAMES: List[str] = FEATURE_NAMES

    def __init__(self) -> None:
        self._scaler: StandardScaler = StandardScaler()
        self._fitted: bool = False

    # ──────────────────────────────────────────────
    # Fit / Persist
    # ──────────────────────────────────────────────

    def fit(self, X: np.ndarray) -> "FeatureExtractor":
        """Fit the StandardScaler on a training feature matrix."""
        self._scaler.fit(X)
        self._fitted = True
        logger.info(f"[FeatureExtractor] Scaler fitted on {X.shape[0]:,} samples.")
        return self

    def save(self, path: str) -> None:
        joblib.dump(self._scaler, path)
        logger.info(f"[FeatureExtractor] Scaler saved → {path}")

    def load(self, path: str) -> "FeatureExtractor":
        self._scaler = joblib.load(path)
        self._fitted = True
        logger.info(f"[FeatureExtractor] Scaler loaded from {path}")
        return self

    # ──────────────────────────────────────────────
    # Raw feature extraction (no normalisation)
    # ──────────────────────────────────────────────

    def extract_raw(self, log: ActivityLog) -> List[float]:
        """Extract the ordered raw feature vector from an ActivityLog."""
        hist_avg_dl = max(log.historical_avg_downloads, 1.0)
        login_hour_dev = abs(log.login_time - log.historical_avg_login_hour)
        dl_deviation = log.files_downloaded / hist_avg_dl

        return [
            log.login_time,
            log.logout_time,
            log.session_duration_minutes,
            float(log.login_frequency_7d),
            float(log.failed_login_attempts),
            float(int(log.device_known)),
            float(int(log.vpn_used)),
            float(int(log.location_anomaly)),
            float(int(log.database_accessed)),
            float(int(log.sensitive_db_accessed)),
            float(int(log.server_accessed)),
            float(log.sensitive_files_accessed),
            float(log.files_downloaded),
            log.download_size_mb,
            float(int(log.usb_connected)),
            float(int(log.password_changed)),
            float(int(log.privilege_escalation)),
            float(int(log.permission_modified)),
            float(log.privilege_level),
            login_hour_dev,
            dl_deviation,
            log.historical_risk_score,
            float(_encode(log.department, DEPARTMENTS)),
            float(_encode(log.role, ROLES)),
            float(_encode(log.browser, BROWSERS)),
            float(_encode(log.operating_system, OPERATING_SYSTEMS)),
        ]

    # ──────────────────────────────────────────────
    # Full transform pipeline
    # ──────────────────────────────────────────────

    def transform(self, log: ActivityLog) -> FeatureVector:
        """
        Extract raw features + normalise → return FeatureVector.
        Requires the scaler to have been fitted first.
        """
        if not self._fitted:
            raise RuntimeError(
                "FeatureExtractor has not been fitted. Call .fit() or .load() first."
            )

        raw = self.extract_raw(log)
        raw_arr = np.array(raw, dtype=np.float64).reshape(1, -1)
        normalized = self._scaler.transform(raw_arr)[0].tolist()

        return FeatureVector(
            employee_id=log.employee_id,
            raw_features=raw,
            feature_names=self.FEATURE_NAMES,
            normalized_features=normalized,
        )

    def transform_batch(self, logs: list[ActivityLog]) -> Tuple[List[FeatureVector], np.ndarray]:
        """
        Transform a list of ActivityLogs.
        Returns (feature_vectors, matrix) where matrix is (N × F).
        """
        vectors = [self.transform(log) for log in logs]
        matrix = np.array([v.normalized_features for v in vectors], dtype=np.float64)
        return vectors, matrix

    def transform_raw_matrix(self, X_raw: np.ndarray) -> np.ndarray:
        """Normalise a pre-built raw feature matrix (used during training)."""
        return self._scaler.transform(X_raw)
