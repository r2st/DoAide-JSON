import { Link, Outlet, useLocation } from 'react-router-dom';
import { tools } from '../utils/tools';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-bg-secondary border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-xl font-bold text-text-primary">DoAide</span>
            <span className="text-xl font-bold italic text-gold">JSON</span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {tools.slice(0, 6).map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                className={`px-3 py-1.5 rounded-md text-sm no-underline transition-colors ${
                  location.pathname === tool.path
                    ? 'bg-accent/20 text-accent-hover'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                {tool.name.replace('JSON ', '').replace('JSON', '')}
              </Link>
            ))}
            <div className="relative group">
              <button className="px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary">
                More ▾
              </button>
              <div className="absolute right-0 top-full mt-1 bg-bg-secondary border border-border rounded-lg shadow-xl py-2 w-56 hidden group-hover:block">
                {tools.slice(6).map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className={`block px-4 py-2 text-sm no-underline ${
                      location.pathname === tool.path
                        ? 'bg-accent/20 text-accent-hover'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                    }`}
                  >
                    <span className="mr-2">{tool.icon}</span>
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-border bg-bg-secondary px-4 py-2 max-h-[70vh] overflow-y-auto">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm no-underline ${
                  location.pathname === tool.path
                    ? 'bg-accent/20 text-accent-hover'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="mr-2">{tool.icon}</span>
                {tool.name}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {!isHome && (
        <footer className="bg-bg-secondary border-t border-border py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <span className="text-sm font-bold text-text-primary">DoAide</span>
              <span className="text-sm font-bold italic text-gold">JSON</span>
            </Link>
            <p className="text-text-muted text-sm">
              Free developer tools. No login. No tracking. All processing happens in your browser.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
