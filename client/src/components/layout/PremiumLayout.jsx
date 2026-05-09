import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function PremiumLayout({ children, sidebarOpen, setSidebarOpen }) {
  return (
    <div className="min-h-screen bg-bg text-text overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -320,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-80 lg:relative lg:z-0 lg:translate-x-0"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line/50 bg-bg/80 backdrop-blur-md px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-panel/50 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <h1 className="text-lg font-bold">Orion</h1>
          <div className="w-10" />
        </div>

        {/* Content area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

import { AnimatePresence } from 'framer-motion';
