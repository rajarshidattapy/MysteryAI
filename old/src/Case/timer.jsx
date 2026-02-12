import React, { useState, useEffect } from 'react';
import { Pause, Play } from 'lucide-react';

const Timer = ({ onTimePause, onTimeResume, onTimerEnd }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [wasRunning, setWasRunning] = useState(true);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Handle Parent Logic sync
  useEffect(() => {
    if (wasRunning !== isRunning) {
      if (isRunning) {
        onTimeResume?.();
      } else {
        onTimePause?.();
      }
    }
    setWasRunning(isRunning);
  }, [isRunning, onTimePause, onTimeResume, wasRunning]);

  const togglePause = () => {
    setIsRunning(prev => !prev);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className={`font-mono text-sm tracking-widest ${
          time > 1800 ? 'text-red-400 animate-pulse' : 'text-purple-100'
        }`}
      >
        {formatTime(time)}
      </div>
      
      <button
        onClick={togglePause}
        className="p-1 rounded hover:bg-white/10 text-purple-300 hover:text-white transition-colors focus:outline-none"
        title={isRunning ? "Pause Investigation" : "Resume"}
      >
        {isRunning ? (
            <Pause className="w-3 h-3 fill-current" />
        ) : (
            <Play className="w-3 h-3 fill-current" />
        )}
      </button>
    </div>
  );
};

export default Timer;