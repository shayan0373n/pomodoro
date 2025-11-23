import React from 'react';

interface TimerDisplayProps {
    seconds: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds }) => {
    const formatTime = (totalSeconds: number) => {
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

    return (
        <div className="font-black text-8xl md:text-9xl lg:text-[10rem] tracking-tight text-gray-100 tabular-nums leading-none">
            {formatTime(Math.floor(seconds))}
        </div>
    );
};

export default TimerDisplay;