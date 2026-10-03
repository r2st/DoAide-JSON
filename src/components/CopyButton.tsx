import { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        copied
          ? 'bg-success/20 text-success'
          : 'bg-accent/20 text-accent-hover hover:bg-accent/30'
      } ${className}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
