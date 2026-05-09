import { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useAppState } from './context/AppStateContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import TaskModal from './components/modals/TaskModal';
import { createTask, deleteTask, reorderTasks, toggleTask, updateTask } from './services/taskService';
import { createNote, deleteNote, updateNote } from './services/noteService';
import { generateTaskPlan, prioritizeTasks, askAssistant } from './services/aiService';
import { getErrorMessage } from './utils/error';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function parseDraftFromAi(parsed) {
  const candidate = parsed?.structuredText || '';
  const firstLine = candidate.split('\n').find(Boolean) || 'New task';
  return {
    title: firstLine.replace(/^title[:\-\s]*/i, '').trim(),
    description: candidate,
    status: 'todo',
    priority: 'medium',
    category: 'general',
    dueDate: '',
    recurring: '',
    tags: '',
  };
}

export default function App() {
  const { isAuthenticated, loading: authLoading, user, signIn, signUp, signInWithGoogle, forgotPassword, logout, updateProfile } = useAuth();
  const { tasks, setTasks, notes, setNotes, dashboard, schedule, loading, error, refresh } = useAppState();
  const [activeTab, setActiveTab] = useLocalStorage('orion-active-tab', 'dashboard');
  const [darkMode, setDarkMode] = useLocalStorage('orion-dark-mode', true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editorTask, setEditorTask] = useState(null);
  const [notice, setNotice] = useState('');
  const [filters, setFilters] = useState({ search: '', priority: 'all', status: 'all' });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timeout);
  }, [notice]);

  function showNotice(message) {
    setNotice(message);
  }

  function showActionError(error, fallback) {
    showNotice(getErrorMessage(error, fallback));
  }

  async function handleSaveTask(values) {
    try {
      const payload = {
        ...values,
        dueDate: values.dueDate || null,
        tags: values.tags || [],
      };

      if (editorTask?._id) {
        const updated = await updateTask(editorTask._id, payload);
        setTasks((state) => state.map((item) => (item._id === updated._id ? updated : item)));
        showNotice('Task updated');
      } else {
        const created = await createTask(payload);
        setTasks((state) => [created, ...state]);
        showNotice('Task created');
      }

      setEditorTask(null);
      await refresh();
      return true;
    } catch (error) {
      showActionError(error, 'Unable to save the task.');
      return false;
    }
  }

  async function handleTaskToggle(task) {
    try {
      const nextTask = await toggleTask(task._id);
      setTasks((state) => state.map((item) => (item._id === nextTask._id ? nextTask : item)));
      await refresh();
    } catch (error) {
      showActionError(error, 'Unable to update the task status.');
    }
  }

  async function handleTaskDelete(task) {
    try {
      await deleteTask(task._id);
      setTasks((state) => state.filter((item) => item._id !== task._id));
      showNotice('Task deleted');
      await refresh();
    } catch (error) {
      showActionError(error, 'Unable to delete the task.');
    }
  }

  async function handleTaskCreate(values) {
    try {
      const created = await createTask(values);
      setTasks((state) => [created, ...state]);
      showNotice('Task created');
      await refresh();
      return true;
    } catch (error) {
      showActionError(error, 'Unable to create the task.');
      return false;
    }
  }

  async function handleTaskReorder(result) {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTasks(reordered);
    try {
      await reorderTasks(reordered.map((task) => task._id));
    } catch (error) {
      setTasks(tasks);
      showActionError(error, 'Unable to reorder tasks right now.');
    }
  }

  async function handleTaskAi(task) {
    try {
      const response = await askAssistant(`Give one short productivity improvement for task: ${task.title}`, { task });
      showNotice(response);
    } catch (error) {
      showActionError(error, 'Unable to generate a task suggestion right now.');
    }
  }

  async function handleAiGenerate(prompt) {
    try {
      const result = await generateTaskPlan(prompt);
      if (result.suggestions?.length) {
        showNotice('AI suggestions generated');
      }
      return result;
    } catch (error) {
      showActionError(error, 'Unable to generate AI suggestions right now.');
      return { suggestions: [] };
    }
  }

  async function handleAiAsk(prompt) {
    try {
      return await askAssistant(prompt, { tasks, dashboard });
    } catch (error) {
      showActionError(error, 'Unable to reach the assistant right now.');
      return '';
    }
  }

  async function handleAiPrioritize() {
    try {
      const result = await prioritizeTasks(tasks);
      showNotice(result.recommendations?.[0] || 'Prioritization updated');
      return result.recommendations?.join(' • ') || 'Prioritization updated';
    } catch (error) {
      showActionError(error, 'Unable to prioritize tasks right now.');
      return '';
    }
  }

  async function handleNoteCreate(payload) {
    try {
      const note = await createNote(payload);
      setNotes((state) => [note, ...state]);
      showNotice('Note saved');
      return note;
    } catch (error) {
      showActionError(error, 'Unable to save the note.');
      return null;
    }
  }

  async function handleNoteUpdate(noteId, payload) {
    try {
      const updated = await updateNote(noteId, payload);
      setNotes((state) => state.map((item) => (item._id === updated._id ? updated : item)));
      showNotice('Note updated');
      return updated;
    } catch (error) {
      showActionError(error, 'Unable to update the note.');
      return null;
    }
  }

  async function handleNoteDelete(note) {
    try {
      await deleteNote(note._id);
      setNotes((state) => state.filter((item) => item._id !== note._id));
      showNotice('Note deleted');
    } catch (error) {
      showActionError(error, 'Unable to delete the note.');
    }
  }

  async function handleProfileSave(payload) {
    try {
      await updateProfile(payload);
      showNotice('Profile updated');
      return true;
    } catch (error) {
      showActionError(error, 'Unable to save the profile.');
      return false;
    }
  }

  async function handleGoogleLogin(payload) {
    try {
      if (payload && payload.idToken) {
        await signInWithGoogle({ idToken: payload.idToken });
        showNotice('Signed in with Google');
        return;
      }

      const name = window.prompt('Enter Google display name', user?.name || 'Google User') || 'Google User';
      const email = window.prompt('Enter Google email', user?.email || '') || '';
      if (!email) return;

      await signInWithGoogle({ name, email, picture: '' });
      showNotice('Google account connected');
    } catch (error) {
      showActionError(error, 'Google sign-in could not be completed.');
    }
  }

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center bg-bg text-text">Loading Orion...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="grid min-h-screen place-items-center bg-bg text-text">Loading authentication...</div>}>
        <AuthPage
          loading={authLoading}
          onSignIn={async (payload) => {
            try {
              await signIn(payload);
              showNotice('Signed in successfully');
            } catch (error) {
              showActionError(error, 'Unable to sign in.');
            }
          }}
          onSignUp={async (payload) => {
            try {
              await signUp(payload);
              showNotice('Account created successfully');
            } catch (error) {
              showActionError(error, 'Unable to create your account.');
            }
          }}
          onGoogleLogin={handleGoogleLogin}
          onForgotPassword={async (email) => {
            if (!email) {
              showNotice('Enter your email first');
              return;
            }

            try {
              const response = await forgotPassword({ email });
              showNotice(response.message || 'Password reset link generated');
            } catch (error) {
              showActionError(error, 'Unable to start password reset.');
            }
          }}
        />
      </Suspense>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <TasksPage
            tasks={tasks}
            filters={filters}
            setFilters={setFilters}
            onCreateTask={handleTaskCreate}
            onUpdateTask={(task) => setEditorTask(task)}
            onToggleTask={handleTaskToggle}
            onDeleteTask={handleTaskDelete}
            onReorderTasks={handleTaskReorder}
            onOpenEditor={(draft) => setEditorTask(draft?.title ? draft : null)}
            onTaskAI={handleTaskAi}
          />
        );
      case 'ai':
        return <AssistantPage onGenerate={handleAiGenerate} onAsk={handleAiAsk} onPrioritize={handleAiPrioritize} schedule={schedule || []} />;
      case 'calendar':
        return <CalendarPage tasks={tasks} />;
      case 'notes':
        return <NotesPage notes={notes} onCreateNote={handleNoteCreate} onUpdateNote={handleNoteUpdate} onDeleteNote={handleNoteDelete} />;
      case 'settings':
        return <SettingsPage user={user} onSaveProfile={handleProfileSave} onLogout={logout} darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />;
      default:
        return (
          <DashboardPage
            dashboard={dashboard}
            tasks={tasks}
            loading={loading}
            onTaskToggle={handleTaskToggle}
            onTaskEdit={(task) => setEditorTask(task)}
            onTaskDelete={handleTaskDelete}
            onTaskAI={handleTaskAi}
            onOpenTasks={() => setActiveTab('tasks')}
            onOpenAssistant={() => setActiveTab('ai')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <Topbar
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
        onMenuClick={() => setSidebarOpen(true)}
        search={filters.search}
        onSearchChange={(value) => setFilters((state) => ({ ...state, search: value }))}
        user={user}
        onLogout={logout}
      />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar active={activeTab} onChange={setActiveTab} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 space-y-6 pb-24">
          {error ? (
            <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}
          <Suspense fallback={<div className="grid min-h-[40vh] place-items-center rounded-[28px] border border-white/10 bg-panel/75 text-sm text-muted shadow-glass">Loading workspace...</div>}>
            {renderPage()}
          </Suspense>
        </main>
      </div>

      {editorTask ? (
        <TaskModal
          task={editorTask.title ? editorTask : parseDraftFromAi(editorTask)}
          onClose={() => setEditorTask(null)}
          onSave={handleSaveTask}
        />
      ) : null}

      <AnimatePresence>
        {notice ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-70 -translate-x-1/2 rounded-full border border-white/10 bg-panel/90 px-5 py-3 text-sm font-semibold text-text shadow-glass backdrop-blur-xl"
          >
            {notice}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {sidebarOpen ? <button className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} /> : null}
    </div>
  );
}
