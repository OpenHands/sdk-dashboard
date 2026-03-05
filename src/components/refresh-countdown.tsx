'use client';

import { useState, useEffect } from 'react';

interface RefreshCountdownProps {
  lastUpdated: string;
  refreshInterval: number; // in seconds
}

export function RefreshCountdown({ lastUpdated, refreshInterval }: RefreshCountdownProps) {
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(refreshInterval);

  useEffect(() => {
    // Calculate initial time remaining
    const lastUpdateTime = new Date(lastUpdated).getTime();
    const nextRefreshTime = lastUpdateTime + refreshInterval * 1000;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((nextRefreshTime - now) / 1000));
    setSecondsUntilRefresh(remaining);

    const interval = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          // Trigger page refresh when countdown reaches 0
          window.location.reload();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated, refreshInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span>
        Updated: {new Date(lastUpdated).toLocaleTimeString()}
      </span>
      <span className="text-xs bg-muted px-2 py-1 rounded-full">
        ↻ {formatTime(secondsUntilRefresh)}
      </span>
    </div>
  );
}
