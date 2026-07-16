import { useState, useEffect, useCallback } from 'react';
import aiEngine, { AnalysisResponse, ModelStatusResponse, LiveThreatEvent, ActivityLogInput } from '../services/aiEngine';

export function useAIEngine() {
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [liveThreats, setLiveThreats] = useState<LiveThreatEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const status = await aiEngine.getModelStatus();
      setModelStatus(status);
    } catch (e: any) {
      console.warn('AI Engine Status Check failed:', e.message);
    }
  }, []);

  // Fetch live threat events
  const fetchLiveThreats = useCallback(async () => {
    try {
      const threats = await aiEngine.getLiveThreats();
      setLiveThreats(threats);
    } catch (e: any) {
      console.warn('AI Engine Live Threats fetch failed:', e.message);
    }
  }, []);

  // Queue retraining
  const triggerRetrain = async (contamination: number, nEstimators: number) => {
    setLoading(true);
    setError(null);
    try {
      await aiEngine.retrainModel(contamination, nEstimators);
      // Wait a moment and fetch status
      setTimeout(fetchStatus, 2000);
    } catch (e: any) {
      setError(e.message || 'Failed to retrain model');
    } finally {
      setLoading(false);
    }
  };

  // Perform single employee analysis
  const analyzeEmployee = async (employeeId: string): Promise<AnalysisResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiEngine.getEmployeeRisk(employeeId);
      return res;
    } catch (e: any) {
      setError(e.message || 'Failed to analyze employee');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch status on mount and set up threat polling
  useEffect(() => {
    fetchStatus();
    fetchLiveThreats();

    const interval = setInterval(() => {
      fetchLiveThreats();
      fetchStatus();
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [fetchStatus, fetchLiveThreats]);

  return {
    modelStatus,
    liveThreats,
    loading,
    error,
    refreshStatus: fetchStatus,
    refreshThreats: fetchLiveThreats,
    triggerRetrain,
    analyzeEmployee,
  };
}
