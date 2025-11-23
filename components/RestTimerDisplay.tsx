import React from 'react';

interface RestTimerDisplayProps {
  secondsRemaining: number;
}

const RestTimerDisplay: React.FC<RestTimerDisplayProps> = ({ secondsRemaining }) => {
    const isOvertime = secondsRemaining < 0;
    const absSeconds = Math.abs(secondsRemaining);

    const formatTime = (totalSeconds: number): string => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        const parts = [
            hours > 0 ? hours.toString().padStart(2, '0') : null,
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].filter(Boolean);

        return parts.join(':');
    };

    // Style Configuration
    const textColor = isOvertime ? 'text-rose-400' : 'text-sky-300';

    return (
        <div className={`font-black text-8xl md:text-9xl lg:text-[10rem] tracking-tight ${textColor} tabular-nums leading-none transition-colors duration-300`}>
            {isOvertime && <span className="opacity-75 mr-2">-</span>}
            {formatTime(absSeconds)}
        </div>
    );
};

export default RestTimerDisplay;