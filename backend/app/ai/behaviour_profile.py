from typing import List
import numpy as np
from datetime import datetime
from app.models.employee_log import EmployeeLog

class BehaviourProfileCalculator:
    """Aggregates historical session logs to establish behavior baselines for employees."""
    
    def calculate_baseline(self, logs: List[EmployeeLog]) -> dict:
        """
        Parses multiple EmployeeLog records and compiles baseline features.
        """
        if not logs:
            return {
                "avg_login_hour": 9.0,
                "avg_downloads": 10.0,
                "avg_session_duration": 480.0,
                "common_locations": ["US"],
                "common_devices": ["Workstation-Corp"]
            }

        login_hours = [log.login_time for log in logs]
        downloads = [log.files_downloaded for log in logs]
        durations = [log.session_duration_minutes for log in logs]
        
        # Calculate averages safely
        avg_hour = float(np.mean(login_hours))
        avg_dl = float(np.mean(downloads))
        avg_dur = float(np.mean(durations))

        # Compile unique locations and devices
        unique_locations = list(set([log.login_location for log in logs if log.login_location]))
        unique_devices = list(set([log.device_id for log in logs if log.device_id]))

        return {
            "avg_login_hour": avg_hour,
            "avg_downloads": avg_dl,
            "avg_session_duration": avg_dur,
            "common_locations": unique_locations,
            "common_devices": unique_devices
        }
