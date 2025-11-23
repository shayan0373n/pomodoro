
import React, { useEffect, useState } from 'react';
import GiftIcon from './icons/GiftIcon';
import TrophyIcon from './icons/TrophyIcon';

interface NotificationProps {
    message: string;
    type: 'gift' | 'super' | 'info';
    onClose: () => void;
}

const icons = {
    gift: <GiftIcon className="w-6 h-6 text-sky-300" />,
    super: <TrophyIcon className="w-6 h-6 text-amber-300" />,
    info: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const borderColors = {
    gift: 'border-sky-500',
    super: 'border-amber-500',
    info: 'border-blue-500'
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out transition
        }, 4700);

        return () => clearTimeout(timer);
    }, [onClose]);
    
    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    }

    return (
        <div 
            className={`fixed top-5 right-5 w-11/12 max-w-sm p-4 rounded-lg shadow-2xl shadow-black/50 bg-gray-800 border-l-4 ${borderColors[type]} flex items-center gap-4 z-50 transition-all duration-300 ease-in-out ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <div className="flex-grow text-gray-200">
                {message}
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Notification;
