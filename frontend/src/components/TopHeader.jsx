import { Bell, Search } from "lucide-react";

export default function TopHeader({ section, onSearch, onNotifications, unreadCount }) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted">Workspace → {section}</p>
        <h1 className="text-3xl font-extrabold">{section}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onSearch} className="glass flex w-80 items-center gap-3 rounded-2xl px-4 py-3 text-muted">
          <Search size={18} />
          Search anything...
          <span className="ml-auto rounded-lg bg-white/10 px-2 py-1 font-mono text-xs">CMD K</span>
        </button>

        <button onClick={onNotifications} className="glass relative rounded-2xl p-3">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet text-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}