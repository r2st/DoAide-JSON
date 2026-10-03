import { Link } from 'react-router-dom';
import { tools } from '../utils/tools';

const categoryLabels = {
  json: 'JSON Tools',
  encoding: 'Encoding & Decoding',
  dev: 'Developer Utilities',
};

export default function Home() {
  const categories = ['json', 'encoding', 'dev'] as const;

  return (
    <div className="min-h-screen">
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-text-primary">DoAide</span>{' '}
            <span className="italic text-gold">JSON</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-2">
            Free Developer Tools — No Login Required
          </p>
          <p className="text-text-muted text-sm mb-10">
            All processing happens in your browser. Nothing is sent to any server.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/formatter"
              className="px-6 py-3 bg-accent text-white rounded-lg font-medium no-underline hover:bg-accent-hover transition-colors"
            >
              Format JSON
            </Link>
            <Link
              to="/diff"
              className="px-6 py-3 bg-bg-tertiary text-text-primary rounded-lg font-medium no-underline hover:bg-border transition-colors"
            >
              Compare JSON
            </Link>
            <Link
              to="/jwt"
              className="px-6 py-3 bg-bg-tertiary text-text-primary rounded-lg font-medium no-underline hover:bg-border transition-colors"
            >
              Decode JWT
            </Link>
          </div>
        </div>
      </section>

      {categories.map((cat) => (
        <section key={cat} className="px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-text-secondary mb-4 px-1">
              {categoryLabels[cat]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools
                .filter((t) => t.category === cat)
                .map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="group p-5 bg-bg-secondary border border-border rounded-xl no-underline hover:border-accent/50 hover:bg-bg-tertiary/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl w-10 h-10 flex items-center justify-center bg-bg-tertiary rounded-lg text-gold shrink-0 font-mono">
                        {tool.icon}
                      </span>
                      <div>
                        <h3 className="text-text-primary font-semibold group-hover:text-accent-hover transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-text-muted text-sm mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      ))}

      <footer className="bg-bg-secondary border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-lg font-bold text-text-primary">DoAide</span>
            <span className="text-lg font-bold italic text-gold">JSON</span>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Free developer tools. No login. No tracking.
          </p>
          <p className="text-text-muted text-xs">
            All processing happens client-side in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
