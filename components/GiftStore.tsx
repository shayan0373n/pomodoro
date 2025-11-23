import React from 'react';
import GiftIcon from './icons/GiftIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import ResetIcon from './icons/ResetIcon';

interface GiftStoreProps {
    minutes: number;
    onAddRestMinutes: (minutes: number) => void;
    onRemoveRestMinutes: (minutes: number) => void;
    onResetRestMinutes: () => void;
}

const GiftStore: React.FC<GiftStoreProps> = ({ minutes, onAddRestMinutes, onRemoveRestMinutes, onResetRestMinutes }) => {
    const minutesColor = minutes < 0 ? 'text-rose-400' : 'text-sky-400';

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg shadow-black/20 h-full">
            <div className="flex items-center gap-3 mb-2">
              <GiftIcon className="w-8 h-8 text-sky-400"/>
              <span className={`text-5xl font-bold tabular-nums ${minutesColor}`}>{minutes}</span>
            </div>
            <p className="text-gray-400">Minutes in Gift Store</p>
            
            <div className="mt-6 pt-4 border-t border-gray-700 w-full flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onResetRestMinutes}
                        disabled={minutes === 0}
                        className="bg-amber-500 text-white rounded-md p-2 hover:bg-amber-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                        aria-label="Reset gift store minutes"
                    >
                        <ResetIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onRemoveRestMinutes(5)}
                        className="bg-gray-600 text-white rounded-md p-2 hover:bg-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                        aria-label="Remove 5 minutes"
                    >
                        <MinusIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onAddRestMinutes(5)}
                        className="bg-gray-600 text-white rounded-md p-2 hover:bg-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                        aria-label="Add 5 minutes"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GiftStore;