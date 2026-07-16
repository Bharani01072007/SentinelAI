"""
SentinelAI AI Engine — Anomaly Detector

Wraps Scikit-Learn's IsolationForest to perform unsupervised anomaly detection
on normalized employee activity feature vectors.

Outputs:
- Raw Isolation Forest decision function score (-0.5 to 0.5)
- Normalized anomaly score (0 to 1, where 1 is highly anomalous)
- Prediction ("normal" or "anomaly")
- Prediction confidence (percentage based on distance from decision threshold)
"""

from __future__ import annotations
import os
import logging
from typing import Tuple, Dict, Any
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

from data.schemas import AnomalyResult, FeatureVector

logger = logging.getLogger("sentinelai.anomaly_detector")

class AnomalyDetector:
    """
    Handles Isolation Forest model training, serialization, and evaluation.
    """
    def __init__(self, contamination: float = 0.05, n_estimators: int = 200) -> None:
        self.contamination = contamination
        self.n_estimators = n_estimators
        self._model: IsolationForest | None = None
        self._fitted = False

    def fit(self, X_normalized: np.ndarray) -> "AnomalyDetector":
        """
        Train the Isolation Forest model on normalized historical logs.
        """
        logger.info(f"[AnomalyDetector] Training Isolation Forest (n_estimators={self.n_estimators}, contamination={self.contamination})...")
        self._model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            random_state=42,
            n_jobs=-1
        )
        self._model.fit(X_normalized)
        self._fitted = True
        logger.info("[AnomalyDetector] Isolation Forest training completed successfully.")
        return self

    def save(self, path: str) -> None:
        """Serialize the trained Isolation Forest model to disk."""
        if not self._fitted or self._model is None:
            raise RuntimeError("Cannot save model: Model has not been trained yet.")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self._model, path)
        logger.info(f"[AnomalyDetector] Model saved to {path}")

    def load(self, path: str) -> "AnomalyDetector":
        """Load a serialized Isolation Forest model from disk."""
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model file not found at {path}")
        self._model = joblib.load(path)
        self._fitted = True
        logger.info(f"[AnomalyDetector] Model loaded successfully from {path}")
        return self

    def predict(self, feature_vector: FeatureVector) -> AnomalyResult:
        """
        Evaluate a single feature vector and predict if it is anomalous.
        """
        if not self._fitted or self._model is None:
            raise RuntimeError("Model is not trained or loaded.")

        x = np.array(feature_vector.normalized_features).reshape(1, -1)

        # Get raw decision score
        raw_score = float(self._model.decision_function(x)[0])
        pred_label = int(self._model.predict(x)[0]) # 1 = inlier, -1 = outlier

        # Map to human-friendly prediction: "normal" or "anomaly"
        prediction = "anomaly" if pred_label == -1 else "normal"

        # Map typical raw_score [-0.5, 0.5] to [1.0, 0.0] for normalized anomaly score
        normalized_score = float(np.clip(0.5 - raw_score * 2.0, 0.0, 1.0))

        # Calculate confidence score (50% to 100%)
        distance_from_boundary = abs(raw_score)
        confidence = float(np.clip(distance_from_boundary * 250.0 + 50.0, 50.0, 100.0))

        return AnomalyResult(
            anomaly_score=raw_score,
            normalized_score=normalized_score,
            prediction=prediction,
            confidence=confidence
        )

    def predict_batch(self, matrix_normalized: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Batch prediction helper. Returns arrays of raw scores and predictions (-1/1).
        """
        if not self._fitted or self._model is None:
            raise RuntimeError("Model is not trained or loaded.")
        scores = self._model.decision_function(matrix_normalized)
        predictions = self._model.predict(matrix_normalized)
        return scores, predictions
