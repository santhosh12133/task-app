import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatDate } from '../utils/date';

export default function CalendarPage({ tasks = [] }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });

  const upcomingTasks = tasks
    .filter((task) => task.dueDate)
    .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate))
    .slice(0, 8);

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
      transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
    },
  };

  const dayVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-bg via-bg to-panelAlt/20 p-4 sm:p-6 lg:p-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Planning</p>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-text mt-1">
              Calendar & Schedule
            </h1>
          </div>
        </div>
        <p className="text-muted text-lg mt-4">Visualize your upcoming tasks and manage deadlines with precision</p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Calendar Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card glass>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-accent" />
                  </div>
                  <h2 className="text-2xl font-black text-text">Next 7 Days</h2>
                </div>
                <Badge tone="blue">Synced</Badge>
              </div>
              <p className="text-sm text-muted">Your tasks organized by day</p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
            >
              {days.map((day) => {
                const dayTasks = tasks.filter((task) => task.dueDate && new Date(task.dueDate).toDateString() === day.toDateString());
                const isToday = new Date().toDateString() === day.toDateString();

                return (
                  <motion.div
                    key={day.toISOString()}
                    variants={dayVariants}
                    whileHover="hover"
                    className={`rounded-2xl border p-4 transition-all duration-200 ${
                      isToday
                        ? 'border-accent/30 bg-accent/10 shadow-lg shadow-accent/20'
                        : 'border-accent/10 bg-panelLight/30 hover:border-accent/20'
                    }`}
                  >
                    <p className="font-bold text-text text-center">
                      {day.toLocaleDateString(undefined, { weekday: 'short' })}
                    </p>
                    <p className={`mt-1 text-xs text-center font-semibold ${isToday ? 'text-accent' : 'text-muted'}`}>
                      {day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                    <div className="mt-3 space-y-2 min-h-[40px]">
                      {dayTasks.length > 0 ? (
                        dayTasks.slice(0, 2).map((task) => (
                          <motion.div
                            key={task._id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-lg bg-accent/20 px-2 py-1.5 text-xs font-medium text-accent line-clamp-1"
                            title={task.title}
                          >
                            {task.title}
                          </motion.div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-accent/20 py-2 text-center">
                          <p className="text-xs text-muted">Clear</p>
                        </div>
                      )}
                      {dayTasks.length > 2 && (
                        <p className="text-xs text-accent/60 text-center font-medium">+{dayTasks.length - 2} more</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </Card>
        </motion.div>

        {/* Sidebar - Upcoming Tasks */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Deadline Radar */}
          <Card glass>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-xl font-black text-text">Deadline Radar</h3>
              </div>
              <p className="text-sm text-muted">Upcoming due dates</p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2 max-h-96 overflow-y-auto"
            >
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <motion.div
                    key={task._id}
                    variants={itemVariants}
                    className="group rounded-xl border border-accent/10 bg-panelLight/30 p-3 hover:border-accent/20 hover:bg-panelLight/50 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle2 className="h-4 w-4 text-accent/60 group-hover:text-accent transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text line-clamp-2">{task.title}</p>
                        <p className="text-xs text-accent mt-1 font-medium">
                          {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-accent/20 bg-panelLight/20 p-4 text-center">
                  <Calendar className="h-8 w-8 text-muted/30 mx-auto mb-2" />
                  <p className="text-sm text-muted">No upcoming tasks</p>
                  <p className="text-xs text-muted/60 mt-1">Create tasks with due dates to see them here</p>
                </div>
              )}
            </motion.div>
          </Card>

          {/* Quick Stats */}
          <Card glass>
            <h3 className="text-lg font-bold text-text mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-panelLight/50">
                <p className="text-xs text-muted font-semibold">Tasks This Week</p>
                <p className="text-2xl font-black text-accent">{upcomingTasks.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-panelLight/50">
                <p className="text-xs text-muted font-semibold">Completion Rate</p>
                <p className="text-2xl font-black text-text">0%</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
