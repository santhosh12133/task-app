import { motion } from 'framer-motion';
import { Rocket, Crown, CheckCircle2, CalendarClock, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function DashboardPage({ 
  dashboard, 
  tasks, 
  onTaskToggle, 
  onTaskEdit, 
  onTaskDelete, 
  onTaskAI, 
  onOpenTasks, 
  onOpenAssistant 
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg to-bg/95 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Hero Card */}
          <motion.div variants={itemVariants}>
            <Card glass className="relative overflow-hidden border-accent/10">
              <div className="relative space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent">Welcome back</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-display font-black text-text tracking-tight leading-tight">
                    Drive your day with
                    <span className="block text-accent">AI momentum</span>
                  </h1>
                  <p className="mt-4 text-lg leading-relaxed text-muted max-w-lg">
                    Natural language tasks, intelligent prioritization, and elegant execution.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button onClick={onOpenTasks}>Open tasks</Button>
                  <Button variant="secondary" onClick={onOpenAssistant}>Generate schedule</Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Card glass className="border-accent/10 bg-panel/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted uppercase tracking-wide">Completion</p>
                        <p className="mt-2 text-2xl font-black text-text">{dashboard?.summary?.completionRate ?? 0}%</p>
                      </div>
                      <Rocket className="h-6 w-6 text-accent opacity-60" />
                    </div>
                  </Card>

                  <Card glass className="border-accent/10 bg-panel/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted uppercase tracking-wide">Priority</p>
                        <p className="mt-2 text-2xl font-black text-text">{dashboard?.summary?.highPriority ?? 0}</p>
                      </div>
                      <Crown className="h-6 w-6 text-warning opacity-60" />
                    </div>
                  </Card>

                  <Card glass className="border-accent/10 bg-panel/40 col-span-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-text">Today's focus</p>
                        <p className="mt-1 text-xs text-muted">Deep work • Quick wins • Review</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tasks Section */}
          <motion.div variants={itemVariants}>
            <Card glass className="border-accent/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Tasks</p>
                  <h3 className="mt-2 text-2xl font-display font-black text-text">Active momentum</h3>
                </div>
                <Sparkles className="h-5 w-5 text-accent" />
              </div>

              <div className="space-y-3">
                {tasks && tasks.length > 0 ? (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task._id} className="rounded-lg border border-accent/5 bg-panel/50 p-3 hover:bg-panel/60 transition-colors">
                      <p className="font-semibold text-sm text-text">{task.title}</p>
                      {task.description && <p className="mt-1 text-xs text-muted">{task.description}</p>}
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-accent/10 bg-panel/30 p-6 text-center">
                    <p className="text-sm text-muted">Create your first task to get started</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Upcoming */}
          <motion.div variants={itemVariants}>
            <Card glass className="border-accent/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Upcoming</p>
                  <h3 className="mt-2 text-2xl font-display font-black text-text">Priority list</h3>
                </div>
                <CalendarClock className="h-5 w-5 text-accent" />
              </div>

              <div className="space-y-2">
                {tasks && tasks.length > 0 ? (
                  tasks.slice(0, 4).map((task) => (
                    <div key={task._id} className="rounded-lg border border-accent/5 bg-panel/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-text truncate">{task.title}</p>
                        <Badge className="text-xs">Soon</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-xs text-muted">No upcoming tasks</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
