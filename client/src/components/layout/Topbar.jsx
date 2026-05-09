import { Menu, MoonStar, PanelTopOpen, Search, SunMedium } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

export default function Topbar({ darkMode, onToggleTheme, onMenuClick, search, onSearchChange, user, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Button variant="ghost" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-glow">
            <PanelTopOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-muted">Orion Tasks</p>
            <h1 className="text-lg font-bold text-text">AI Productivity OS</h1>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search tasks, notes, tags, commands..." className="pl-10" />
          </div>
        </div>

        <Badge tone={darkMode ? 'blue' : 'neutral'}>{darkMode ? 'Dark' : 'Light'} Mode</Badge>
        <Button variant="secondary" onClick={onToggleTheme} aria-label="Toggle theme">
          {darkMode ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
        <div className="hidden items-center gap-3 sm:flex">
          {user ? <span className="text-sm font-medium text-muted">{user.name}</span> : null}
          {user ? <Button variant="ghost" onClick={onLogout}>Logout</Button> : null}
        </div>
      </div>
    </header>
  );
}
