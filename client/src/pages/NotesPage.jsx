import { motion } from 'framer-motion';
import { Sparkles, FileText, Plus } from 'lucide-react';
import NotesPanel from '../components/notes/NotesPanel';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function NotesPage({ notes, onCreateNote, onUpdateNote, onDeleteNote }) {
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
      {/* Header Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Knowledge Base</p>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-text mt-1">
              Notes & Ideas
            </h1>
          </div>
        </div>
        <p className="text-muted text-lg mt-4">Capture, organize, and preserve your thoughts with markdown-ready notes</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid gap-4 mb-8 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Total Notes', value: notes.length },
          { label: 'Recent', value: notes.length > 0 ? 'Just now' : 'None yet' },
          { label: 'Status', value: 'Active' },
          { label: 'Sync', value: 'Enabled' },
        ].map((stat, i) => (
          <Card key={i} glass className="p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-black text-text mt-2">{stat.value}</p>
          </Card>
        ))}
      </motion.div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Notes Editor */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card glass>
            <NotesPanel notes={notes} onCreate={onCreateNote} onUpdate={onUpdateNote} onDelete={onDeleteNote} />
          </Card>
        </motion.div>

        {/* Sidebar with quick actions */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Quick Actions */}
          <Card glass className="p-6">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Note
              </Button>
              <button className="w-full py-3 px-4 rounded-xl border border-accent/20 text-text font-medium hover:bg-accent/5 transition-colors duration-200">
                Export All
              </button>
              <button className="w-full py-3 px-4 rounded-xl border border-accent/20 text-text font-medium hover:bg-accent/5 transition-colors duration-200">
                Search Notes
              </button>
            </div>
          </Card>

          {/* Info Card */}
          <Card glass className="p-6">
            <h4 className="text-sm font-bold text-text mb-3">📝 Pro Tips</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Use markdown for rich formatting</li>
              <li>• Tag notes for better organization</li>
              <li>• Search across all notes instantly</li>
              <li>• Sync across all your devices</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
