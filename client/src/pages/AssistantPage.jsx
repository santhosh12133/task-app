import { motion } from 'framer-motion';
import { Sparkles, Clock, Download, Zap, Brain } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AiAssistant from '../components/assistant/AiAssistant';

export default function AssistantPage({ onGenerate, onAsk, onPrioritize, schedule }) {
  function exportSchedule() {
    const payload = JSON.stringify(schedule, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'orion-schedule.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
            <Brain className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Artificial Intelligence</p>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-text mt-1">
              AI Assistant
            </h1>
          </div>
        </div>
        <p className="text-muted text-lg mt-4">Natural language task creation, intelligent prioritization, and schedule generation powered by OpenAI</p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Assistant Chat - takes up 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card glass>
            <AiAssistant onGenerate={onGenerate} onAsk={onAsk} onPrioritize={onPrioritize} />
          </Card>
        </motion.div>

        {/* Sidebar - Daily Schedule */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Suggested Schedule */}
          <Card glass>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-xl font-black text-text">Daily Flow</h3>
              </div>
              <p className="text-sm text-muted">AI-suggested schedule</p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2 max-h-96 overflow-y-auto"
            >
              {(schedule.length ? schedule : [
                { title: 'Build deep work blocks', duration: 45, category: 'planning', hour: 9 },
              ]).map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group rounded-xl border border-accent/10 bg-panelLight/30 p-4 hover:border-accent/20 hover:bg-panelLight/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text line-clamp-2">{item.title}</p>
                      <p className="mt-2 text-xs text-muted">
                        <span className="inline-block px-2 py-1 rounded-lg bg-accent/10 text-accent font-medium mr-2">
                          {item.category}
                        </span>
                        <span className="inline-block">
                          {item.duration || 30} mins
                        </span>
                      </p>
                    </div>
                    <div className="flex-shrink-0 rounded-lg bg-accent/10 px-3 py-2 text-sm font-bold text-accent whitespace-nowrap">
                      {String(item.hour).padStart(2, '0')}:00
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.button
              variants={itemVariants}
              onClick={exportSchedule}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent font-semibold transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              Export Schedule
            </motion.button>
          </Card>

          {/* AI Capabilities */}
          <Card glass>
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Capabilities
            </h3>
            <div className="space-y-3">
              {[
                { icon: Zap, label: 'Task Generation', desc: 'Create tasks from natural language' },
                { icon: Brain, label: 'Prioritization', desc: 'AI-powered task ranking' },
                { icon: Clock, label: 'Scheduling', desc: 'Generate daily schedules' },
              ].map((cap, i) => (
                <div key={i} className="p-3 rounded-lg bg-panelLight/50 border border-accent/10">
                  <div className="flex items-center gap-2 mb-1">
                    <cap.icon className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-sm text-text">{cap.label}</p>
                  </div>
                  <p className="text-xs text-muted">{cap.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Tips */}
          <Card glass>
            <h4 className="text-sm font-bold text-text mb-3">💡 Pro Tips</h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>• Use natural language for faster task creation</li>
              <li>• Ask the AI to prioritize your task list</li>
              <li>• Generate schedules for optimal productivity</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
