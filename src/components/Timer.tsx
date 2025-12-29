import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TimerProps {
  startTime: number;
  totalSeconds: number;
  onTimeUp: () => void;
}

const Timer = ({ startTime, totalSeconds, onTimeUp }: TimerProps) => {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(0, totalSeconds - elapsed);
      setRemaining(left);

      if (left === 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, totalSeconds, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining < 300; // Less than 5 minutes
  const isCritical = remaining < 60; // Less than 1 minute

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-semibold transition-all duration-300 ${
        isCritical
          ? "bg-destructive/10 text-destructive animate-pulse"
          : isLow
          ? "bg-warning/10 text-warning"
          : "bg-muted text-foreground"
      }`}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};

export default Timer;
