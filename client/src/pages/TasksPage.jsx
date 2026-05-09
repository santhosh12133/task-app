import { useDeferredValue, useMemo } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import TaskCard from '../components/tasks/TaskCard';
import TaskComposer from '../components/tasks/TaskComposer';

export default function TasksPage({
  tasks,
  filters,
  setFilters,
  onCreateTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  onReorderTasks,
  onOpenEditor,
  onTaskAI,
}) {
  const deferredSearch = useDeferredValue(filters.search);
  const visible = useMemo(() => {
    return tasks.filter((task) => {
      const query = deferredSearch.toLowerCase();
      const matchesQuery = !query || [task.title, task.description, task.category, ...(task.tags || [])].join(' ').toLowerCase().includes(query);
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      return matchesQuery && matchesPriority && matchesStatus;
    });
  }, [deferredSearch, filters.priority, filters.status, tasks]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg to-bg/95 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-text">
              Your Tasks
            </h1>
            <p className="mt-2 text-lg text-muted">
              Manage, prioritize, and complete your work with AI-powered insights
            </p>
          </div>
        </motion.div>

        {/* Task Composer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <TaskComposer
            onSubmit={async (values) => {
              await onCreateTask(values);
              setFilters((state) => ({ ...state, search: '' }));
            }}
            onParse={(parsed) => onOpenEditor?.(parsed)}
          />
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <Card glass>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                <input
                  aria-label="Search tasks"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-panel/50 border border-accent/10 text-text placeholder-muted/50 focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                  placeholder="Search by title, description, or tags..."
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((state) => ({ ...state, search: event.target.value }))
                  }
                />
              </div>

              {/* Filters Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
                    <Filter className="inline h-3.5 w-3.5 mr-1" />
                    Priority
                  </label>
                  <select
                    aria-label="Filter by priority"
                    className="w-full px-4 py-2.5 rounded-lg bg-panel/50 border border-accent/10 text-text focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                    value={filters.priority}
                    onChange={(event) =>
                      setFilters((state) => ({ ...state, priority: event.target.value }))
                    }
                  >
                    <option value="all">All priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
                    <SlidersHorizontal className="inline h-3.5 w-3.5 mr-1" />
                    Status
                  </label>
                  <select
                    aria-label="Filter by status"
                    className="w-full px-4 py-2.5 rounded-lg bg-panel/50 border border-accent/10 text-text focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((state) => ({ ...state, status: event.target.value }))
                    }
                  >
                    <option value="all">All status</option>
                    <option value="todo">Todo</option>
                    <option value="in progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* Active filters display */}
              {(filters.priority !== 'all' || filters.status !== 'all' || filters.search) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {filters.search && (
                    <Badge tone="blue">Search: {filters.search}</Badge>
                  )}
                  {filters.priority !== 'all' && (
                    <Badge tone="warning">Priority: {filters.priority}</Badge>
                  )}
                  {filters.status !== 'all' && (
                    <Badge tone="neutral">Status: {filters.status}</Badge>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Task Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-muted">
              <span className="font-semibold text-text">{visible.length}</span> task{visible.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {tasks.length > 0 && (
            <div className="flex gap-2">
              <Badge tone="neutral">Drag to reorder</Badge>
            </div>
          )}
        </motion.div>

        {/* Tasks List */}
        {visible.length > 0 ? (
          <DragDropContext onDragEnd={onReorderTasks}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <motion.div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {visible.map((task, index) => (
                    <motion.div key={task._id} variants={itemVariants}>
                      <TaskCard
                        task={task}
                        index={index}
                        onToggle={onToggleTask}
                        onEdit={onUpdateTask}
                        onDelete={onDeleteTask}
                        onQuickAction={onTaskAI}
                      />
                    </motion.div>
                  ))}
                  {provided.placeholder}
                </motion.div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="rounded-full bg-accent/10 p-4 mb-4">
              <Filter className="h-8 w-8 text-accent/50" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">No tasks found</h3>
            <p className="text-muted text-center max-w-sm">
              {filters.search || filters.priority !== 'all' || filters.status !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Create your first task to get started'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
