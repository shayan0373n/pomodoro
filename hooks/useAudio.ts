import { useCallback } from 'react';

export const useAudio = () => {
    const playSound = useCallback((type: 'success' | 'alert') => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            
            if (type === 'success') {
                // Happy Chime (C major arpeggio)
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                const now = ctx.currentTime;
                
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    
                    gain.gain.setValueAtTime(0.1, now + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    osc.start(now + i * 0.1);
                    osc.stop(now + i * 0.1 + 0.3);
                });
            } else {
                // Alert Beep (Double beep)
                const now = ctx.currentTime;
                [0, 0.2].forEach(offset => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.type = 'square'; // harsher sound for alert
                    osc.frequency.value = 880; // A5
                    
                    gain.gain.setValueAtTime(0.1, now + offset);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    osc.start(now + offset);
                    osc.stop(now + offset + 0.1);
                });
            }
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }, []);

    const initAudio = useCallback(() => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            ctx.resume();
        }
    }, []);

    return { playSound, initAudio };
};
