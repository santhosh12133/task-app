import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchDashboardOverview } from '../services/dashboardService';
import { fetchDailySchedule } from '../services/aiService';
import { fetchNotes } from '../services/noteService';
import { fetchTasks } from '../services/taskService';
import { useAuth } from './AuthContext';
import { getErrorMessage } from '../utils/error';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setTasks([]);
      setNotes([]);
      setDashboard(null);
      setSchedule([]);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [tasksData, notesData, dashboardData, scheduleData] = await Promise.all([
        fetchTasks(),
        fetchNotes(),
        fetchDashboardOverview(),
        fetchDailySchedule(),
      ]);
      setTasks(tasksData);
      setNotes(notesData);
      setDashboard(dashboardData);
      setSchedule(scheduleData);
      setError('');
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load your workspace right now.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      tasks,
      setTasks,
      notes,
      setNotes,
      dashboard,
      setDashboard,
      schedule,
      setSchedule,
      loading,
      error,
      refresh,
    }),
    [dashboard, error, loading, notes, schedule, tasks]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
