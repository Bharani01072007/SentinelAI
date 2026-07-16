import numpy as np
import joblib
import os
import logging
from sklearn.ensemble import IsolationForest
from typing import Tuple

logger = logging.getLogger("sentinelai.ai.isolation_forest")

class IsolationForestModel:
    """Wrapper around scikit-learn's Isolation Forest algorithm for insider threat detection."""
    
    def __init__(self, contamination: float = 0.05, n_estimators: int = 200):
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.model = IsolationForest(
            contamination=self.contamination,
            n_estimators=self.n_estimators,
            random_state=42,
            n_jobs=-1
        )
        self.is_fitted = False

    def fit(self, X: np.ndarray) -> None:
        """Fit Isolation Forest model to training feature matrix."""
        logger.info(f"Fitting Isolation Forest on matrix of shape {X.shape}...")
        self.model.fit(X)
        self.is_fitted = True

    def predict(self, x: np.ndarray) -> Tuple[float, float, str]:
        """
        Evaluate a single 1D feature vector.
        Returns:
            anomaly_score: float (normalised to 0-1 range where 1 is highly anomalous)
            confidence: float (percentage confidence of prediction)
            prediction: str ("anomaly" or "normal")
        """
        if not self.is_fitted:
            # Fallback if model not trained
            return 0.1, 95.0, "normal"
            
        x_reshaped = x.reshape(1, -1)
        
        # decision_function returns negative values for anomalies, positive for normal
        raw_score = float(self.model.decision_function(x_reshaped)[0])
        # predict returns -1 for anomaly and 1 for normal
        pred_label = int(self.model.predict(x_reshaped)[0])
        
        # Normalise raw_score from [-0.5, 0.5] range to [0, 1] range
        # Lower decision score = more anomalous. Let's invert it:
        normalized_score = float(1.0 / (1.0 + np.exp(raw_score * 8.0)))
        
        prediction = "anomaly" if pred_label == -1 else "normal"
        confidence = float(min(100.0, max(50.0, (0.5 - abs(raw_score)) * 200.0))) if prediction == "anomaly" else float(min(100.0, max(50.0, (raw_score + 0.5) * 100.0)))
        
        return normalized_score, confidence, prediction

    def save(self, file_path: str) -> None:
        """Serialize model state to disk."""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        joblib.dump({
            "model": self.model,
            "contamination": self.contamination,
            "n_estimators": self.n_estimators,
            "is_fitted": self.is_fitted
        }, file_path)
        logger.info(f"Model serialized and saved to {file_path}")

    def load(self, file_path: str) -> None:
        """Load serialized model state from disk."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Model weight file not found at {file_path}")
            
        data = joblib.load(file_path)
        self.model = data["model"]
        self.contamination = data["contamination"]
        self.n_estimators = data["n_estimators"]
        self.is_fitted = data["is_fitted"]
        logger.info(f"Model loaded successfully from {file_path}")
        
    def train_default_baseline(self) -> None:
        """Trains on dummy dataset if no pre-fit weights exist."""
        # Generate 1000 standard synthetic feature vectors (20 features)
        np.random.seed(42)
        X_normal = np.random.normal(loc=0.5, scale=0.1, size=(950, 20))
        X_anomalous = np.random.uniform(low=0.0, high=1.0, size=(50, 20))
        X = np.vstack([X_normal, X_anomalous])
        self.fit(X)
