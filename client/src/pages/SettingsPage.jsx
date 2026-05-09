import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Shield, Bell, Zap, LogOut, Save } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FieldError from '../components/ui/FieldError';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';

export default function SettingsPage({ user, onSaveProfile, onLogout, darkMode, onToggleTheme }) {
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setBio(user?.bio || '');
  }, [user?.bio, user?.name]);

  async function handleSave() {
    if (!name.trim()) {
      setError('Your name is required.');
      return;
    }

    setSaving(true);
    setError('');
    const success = await onSaveProfile({ name: name.trim(), bio: bio.trim() });
    setSaving(false);

    if (!success) {
      setError('Profile changes could not be saved.');
    }
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
            <Settings className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Configuration</p>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-text mt-1">
              Settings & Preferences
            </h1>
          </div>
        </div>
        <p className="text-muted text-lg mt-4">Customize your workspace and manage account preferences</p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card glass>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-accent" />
                </div>
                <h2 className="text-2xl font-black text-text">Profile Information</h2>
              </div>
              <p className="text-sm text-muted">Update your personal information and preferences</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-text uppercase tracking-wide mb-2 block">
                  Full Name
                </label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text uppercase tracking-wide mb-2 block">
                  Bio / Headline
                </label>
                <Textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full"
                  rows={4}
                />
              </div>

              <FieldError message={error} />

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </Card>

          {/* Preferences Card */}
          <Card glass>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-accent" />
                </div>
                <h2 className="text-2xl font-black text-text">Preferences</h2>
              </div>
              <p className="text-sm text-muted">Customize your experience</p>
            </div>

            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-panelLight/50 border border-accent/10">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-accent" />
                  ) : (
                    <Sun className="h-5 w-5 text-accent" />
                  )}
                  <div>
                    <p className="font-medium text-text">Theme</p>
                    <p className="text-xs text-muted">{darkMode ? 'Dark mode' : 'Light mode'}</p>
                  </div>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="px-4 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-medium text-sm transition-colors"
                >
                  Toggle
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-panelLight/50 border border-accent/10">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium text-text">Notifications</p>
                    <p className="text-xs text-muted">Email & push alerts</p>
                  </div>
                </div>
                <div className="w-12 h-6 rounded-full bg-accent/30 flex items-center">
                  <div className="w-5 h-5 rounded-full bg-accent ml-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Stats Card */}
          <Card glass>
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Your Stats
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-panelLight/50">
                <p className="text-xs text-muted font-semibold">Streak</p>
                <p className="text-2xl font-black text-text">{user?.streak ?? 0}</p>
                <p className="text-xs text-muted mt-1">days in a row</p>
              </div>
              <div className="p-3 rounded-lg bg-panelLight/50">
                <p className="text-xs text-muted font-semibold">Experience</p>
                <p className="text-2xl font-black text-accent">{user?.xp ?? 0}</p>
                <p className="text-xs text-muted mt-1">total XP earned</p>
              </div>
            </div>
          </Card>

          {/* Security Card */}
          <Card glass>
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Security
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 rounded-lg bg-panelLight/50 hover:bg-panelLight/70 text-left text-text font-medium transition-colors text-sm">
                Change Password
              </button>
              <button className="w-full p-3 rounded-lg bg-panelLight/50 hover:bg-panelLight/70 text-left text-text font-medium transition-colors text-sm">
                Two-Factor Auth
              </button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card glass className="border-danger/20">
            <h3 className="text-lg font-bold text-danger mb-4">Danger Zone</h3>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger font-semibold transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
