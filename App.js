import { useEffect, useMemo, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import PomodoroTimer from './components/PomodoroTimer';
import { loadState, saveState, uid } from './utils/storage';
import { DEFAULT_TIMER_SETTINGS, SEED_TASKS } from './utils/constants';
import { getDueStatus, startOfDay } from './utils/dateHelpers';

function App() {
  const [tasks, setTasks] = useState(() => loadState('tasks', SEED_TASKS));
  const [sessions, setSessions] = useState(() => loadState('sessions', []));
  const [timerSettings, setTimerSettings] = useState(() =>
    loadState('timerSettings', DEFAULT_TIMER_SETTINGS)
  );
  const [theme, setTheme] = useState(() => loadState('theme', 'light'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [bannerDismissedFor, setBannerDismissedFor] = useState(null);

  useEffect(() => saveState('tasks', tasks), [tasks]);
  useEffect(() => saveState('sessions', sessions), [sessions]);
  useEffect(() => saveState('timerSettings', timerSettings), [timerSettings]);
  useEffect(() => saveState('theme', theme), [theme]);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const subjects = useMemo(() => {
    const set = new Set(tasks.map((t) => t.subject).filter(Boolean));
    return Array.from(set).sort();
  }, [tasks]);

  const streak = useMemo(() => computeStreak(sessions), [sessions]);

  const urgentTasks = useMemo(
    () =>
      tasks.filter(
        (t) => !t.completed && ['overdue', 'today'].includes(getDueStatus(t.dueDate, false))
      ),
    [tasks]
  );

  function addTask(payload) {
    setTasks((prev) => [
      ...prev,
      {
        id: uid(),
        completed: false,
        completedPomodoros: 0,
        createdAt: Date.now(),
        ...payload,
      },
    ]);
  }

  function updateTask(id, payload) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...payload } : t)));
  }

  function toggleTask(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  }

  function sendToTimer(taskId) {
    setActiveTaskId(taskId);
    setActiveTab('timer');
  }

  function handleSessionComplete({ minutes, taskId, type }) {
    const todayIso = new Date().toISOString().slice(0, 10);
    setSessions((prev) => [...prev, { id: uid(), date: todayIso, minutes, taskId, type }]);
    if (type === 'focus' && taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
        )
      );
    }
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const showBanner = urgentTasks.length > 0 && bannerDismissedFor !== todayKey;

  return (
    <div className="app-shell">
      <Sidebar
        active={activeTab}
        onNavigate={setActiveTab}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        streak={streak}
      />

      <main className="main-panel">
        {showBanner && (
          <div className="reminder-banner">
            <span>
              <strong>{urgentTasks.length}</strong> task{urgentTasks.length > 1 ? 's' : ''} due today or
              overdue — {urgentTasks.slice(0, 2).map((t) => t.title).join(', ')}
              {urgentTasks.length > 2 ? ', …' : ''}
            </span>
            <div className="reminder-actions">
              <button className="link-btn" onClick={() => setActiveTab('tasks')}>
                Review
              </button>
              <button className="icon-btn" onClick={() => setBannerDismissedFor(todayKey)}>
                ✕
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            subjects={subjects}
            sessions={sessions}
            streak={streak}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onGoToTasks={() => setActiveTab('tasks')}
            onGoToTimer={() => setActiveTab('timer')}
            onSendToTimer={sendToTimer}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManager
            tasks={tasks}
            subjects={subjects}
            onAdd={addTask}
            onUpdate={updateTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onSendToTimer={sendToTimer}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        )}

        {activeTab === 'timer' && (
          <PomodoroTimer
            tasks={tasks}
            activeTaskId={activeTaskId}
            onSelectTask={setActiveTaskId}
            onSessionComplete={handleSessionComplete}
            settings={timerSettings}
            onSettingsChange={setTimerSettings}
          />
        )}
      </main>
    </div>
  );
}

// A day counts toward the streak if it has at least one completed focus
// session. The streak walks backward from today (or yesterday, so a
// student mid-session at 12:01am doesn't lose their streak) until a
// day with no sessions breaks the chain.
function computeStreak(sessions) {
  const focusDays = new Set(
    sessions.filter((s) => s.type === 'focus').map((s) => s.date)
  );
  if (focusDays.size === 0) return 0;

  let cursor = startOfDay(new Date());
  const todayIso = cursor.toISOString().slice(0, 10);
  if (!focusDays.has(todayIso)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (focusDays.has(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default App;
