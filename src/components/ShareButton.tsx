import { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';

interface ShareButtonProps {
  getUrl: () => string;
}

export default function ShareButton({ getUrl }: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const url = getUrl();
    const ok = await copyToClipboard(url);
    if (ok) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        shared
          ? 'bg-success/20 text-success'
          : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-border'
      }`}
    >
      {shared ? 'Link Copied!' : '🔗 Share'}
    </button>
  );
}
