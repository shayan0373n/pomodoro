import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: {
        pomodoroDuration: number;
        shortRestReward: number;
        longRestReward: number;
    };
    onSave: (newSettings: { pomodoroDuration: number; shortRestReward: number; longRestReward: number }) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
    // Use strings for local state to allow flexible typing (e.g. clearing input)
    const [localSettings, setLocalSettings] = useState({
        pomodoroDuration: settings.pomodoroDuration.toString(),
        shortRestReward: settings.shortRestReward.toString(),
        longRestReward: settings.longRestReward.toString()
    });

    useEffect(() => {
        if (isOpen) {
            setLocalSettings({
                pomodoroDuration: settings.pomodoroDuration.toString(),
                shortRestReward: settings.shortRestReward.toString(),
                longRestReward: settings.longRestReward.toString()
            });
        }
    }, [settings, isOpen]);

    if (!isOpen) return null;

    const handleChange = (key: keyof typeof localSettings, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        const pomodoroDuration = parseInt(localSettings.pomodoroDuration, 10);
        const shortRestReward = parseInt(localSettings.shortRestReward, 10);
        const longRestReward = parseInt(localSettings.longRestReward, 10);

        // Validate
        if (isNaN(pomodoroDuration) || pomodoroDuration <= 0 ||
            isNaN(shortRestReward) || shortRestReward <= 0 ||
            isNaN(longRestReward) || longRestReward <= 0) {
            alert("Please enter valid positive numbers for all settings.");
            return;
        }

        onSave({
            pomodoroDuration,
            shortRestReward,
            longRestReward
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/50">
                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Pomodoro Duration (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={localSettings.pomodoroDuration}
                            onChange={(e) => handleChange('pomodoroDuration', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Changing this will apply to the next Pomodoro.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Short Rest Reward (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={localSettings.shortRestReward}
                            onChange={(e) => handleChange('shortRestReward', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Long Rest Reward (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={localSettings.longRestReward}
                            onChange={(e) => handleChange('longRestReward', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Awarded every 4th Pomodoro.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
