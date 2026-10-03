import { type ReactNode } from 'react';

interface ToolPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function ToolPage({ title, description, children }: ToolPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">{title}</h1>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>
      {children}
    </div>
  );
}
