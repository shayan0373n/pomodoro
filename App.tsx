import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Components
import TimerDisplay from './components/TimerDisplay';
import RestTimerDisplay from './components/RestTimerDisplay';
import PomodoroStats from './components/PomodoroStats';
import GiftStore from './components/GiftStore';
import Notification from './components/Notification';

// Icons
import PlayIcon from './components/icons/PlayIcon';
import PauseIcon from './components/icons/PauseIcon';
import GiftIcon from './components/icons/GiftIcon';
import ResetIcon from './components/icons/ResetIcon';
import ReturnIcon from './components/icons/ReturnIcon';

const POMODORO_DURATION_SECONDS = 25 * 60;

const FACTS = [
    "Aragorn broke his two toes kicking a helmet in The Two Towers",
    "Dumbledore is an Old English word for 'bumblebee'",
    "the Shire was inspired by the rural English countryside near Birmingham",
    "Harry Potter and J.K. Rowling share the same birthday, July 31st",
    "Gandalf is a Maia, a spirit older than the world itself",
    "Tom Felton auditioned for Harry and Ron before getting the role of Draco",
    "Sean Connery turned down the role of Gandalf because he didn't understand the script",
    "Voldemort was 71 years old when he was finally defeated",
    "Christopher Lee (Saruman) was the only cast member to have met J.R.R. Tolkien",
    "the Dementors in Harry Potter were created to symbolize depression",
    "Legolas's eyes change color in the movies because Orlando Bloom's contacts irritated him",
    "Nicolas Flamel was a real historical figure who died in 1418",
    "it took 14 different cameras to capture the motion of the Snitch",
    "Gollum was played by Andy Serkis using motion capture technology",
    "the actor who played Mad-Eye Moody is the father of the actor who played Bill Weasley",
    "Ian McKellen based Gandalf's accent on Tolkien's own speaking voice",
    "J.K. Rowling wrote the Hogwarts house names on an airplane vomit bag",
    "Viggo Mortensen bought the horse he rode in Lord of the Rings after filming ended",
    "Daniel Radcliffe went through 160 pairs of glasses during the filming of the series",
    "John Rhys-Davies (Gimli) is actually taller than the actors playing the hobbits",
    "the Battle of Helm's Deep took four months to film and was shot at night",
    "Professor Trelawney's prediction about the first to rise dying actually came true for Dumbledore",
    "the leaves on the Tree of Lorien were individually painted by hand",
    "Rupert Grint got the role of Ron Weasley by rapping about why he wanted it",
    "the Dead Marshes were inspired by J.R.R. Tolkien's experiences in WWI",
    "Emma Watson's hamster died during filming and the set decorators made a tiny coffin for it",
    "the script for Order of the Phoenix was found in a pub before the book was released",
    "over 19,000 costumes were made for the Lord of the Rings trilogy",
    "the driver of the Knight Bus is named Ernie Prang, and prang is British slang for a crash",
    "Elijah Wood sent in his audition tape dressed as a hobbit in the woods",
    "the phrase 'I open at the close' appears on the Snitch and refers to death",
    "Bill Weasley and Mad-Eye Moody are father and son in real life",
    "the sound of the Nazgul's screech was made by scraping a plastic cup on concrete",
    "Fred and George Weasley were born on April Fool's Day",
    "Sauron is never actually seen in physical form in the books, only as a presence",
    "the potions Harry drinks in the movies were actually soup",
    "Orlando Bloom landed the role of Legolas two days before graduating drama school",
    "Hermione's Patronus is an otter, which is J.K. Rowling's favorite animal",
    "Samwise Gamgee's daughter Elanor was played by Sean Astin's real daughter",
    "the moving staircases in Hogwarts were actually just one staircase moved by hydraulics",
    "Merry and Pippin's fireworks dragon was actually a CGI effect, but the actors' reactions were real surprise",
    "Molly Weasley's boggart changes to the corpse of whoever she is most worried about",
    "Shelob's design was based on a funnel-web spider",
    "Arthur Weasley was originally going to die in Order of the Phoenix",
    "the Grey Havens scene was shot three times because Sean Astin forgot to wear his vest",
    "Remus Lupin's name hints at his identity: Remus was raised by a wolf, and Lupin means wolf-like"
];

// Helper to send browser notifications
const sendBrowserNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
        try {
            new Notification(title, { body, icon: '/vite.svg' });
        } catch (e) {
            console.error("Notification failed", e);
        }
    }
};

// Helper to play sound
const playSound = (type: 'success' | 'alert') => {
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
};

// Helper to calculate consistent initial state
// Syncs 'pomodorosCompleted' with 'totalSeconds' immediately to prevent ghost gifts on load
const getInitialState = () => {
    if (typeof window === 'undefined') return {
        pomodoros: 0,
        seconds: 0,
        isRunning: false,
        restMinutes: 0
    };

    const savedAccumulated = parseInt(localStorage.getItem('pomodoroAccumulatedSeconds') || '0', 10);
    const savedStartTime = parseInt(localStorage.getItem('pomodoroStartTime') || '0', 10);
    const wasRunning = localStorage.getItem('pomodoroIsRunning') === 'true';
    const storedPomodoros = parseInt(localStorage.getItem('pomodorosCompleted') || '0', 10);
    const storedRest = parseInt(localStorage.getItem('availableRestMinutes') || '0', 10);

    let totalSeconds = savedAccumulated;
    if (wasRunning && savedStartTime > 0) {
        const elapsedSinceStart = Math.floor((Date.now() - savedStartTime) / 1000);
        totalSeconds += elapsedSinceStart;
    }

    // Ensure we don't have negative time
    if (totalSeconds < 0) totalSeconds = 0;

    // Check if totalSeconds implies more pomodoros than we have stored.
    // If so, we initialize state to the higher value.
    // This prevents the useEffect loop from seeing a discrepancy on mount and triggering "catch-up" gifts when the user just refreshes.
    const derivedPomodoros = Math.floor(totalSeconds / POMODORO_DURATION_SECONDS);
    const initialPomodoros = Math.max(storedPomodoros, derivedPomodoros);

    return {
        pomodoros: initialPomodoros,
        seconds: totalSeconds,
        isRunning: wasRunning,
        restMinutes: storedRest
    };
};

const App: React.FC = () => {
    // Use a single state initializer to guarantee consistency across all variables
    const [initialValues] = useState(getInitialState);

    const [pomodorosCompleted, setPomodorosCompleted] = useState<number>(initialValues.pomodoros);
    const [availableRestMinutes, setAvailableRestMinutes] = useState<number>(initialValues.restMinutes);
    const [isRunning, setIsRunning] = useState<boolean>(initialValues.isRunning);
    const [totalSeconds, setTotalSeconds] = useState<number>(initialValues.seconds);
    
    const [isResting, setIsResting] = useState<boolean>(false);
    const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
    
    const [notification, setNotification] = useState<{ message: string; type: 'gift' | 'super' | 'info' } | null>(null);
    
    // Trivia Fact State
    const [currentFact, setCurrentFact] = useState<string>(() => FACTS[Math.floor(Math.random() * FACTS.length)]);

    // Refs
    const prevPomodorosRef = useRef<number>(pomodorosCompleted);
    // Track manual updates to prevent them from triggering gifts
    const manualUpdatesPending = useRef<number>(0);

    // --- Callbacks ---
    const showNotification = useCallback((message: string, type: 'gift' | 'super' | 'info') => {
        setNotification({ message, type });
    }, []);

    const handleCloseNotification = useCallback(() => {
        setNotification(null);
    }, []);

    // Request Notification Permission on Mount
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Change fact when starting a rest
    const rotateFact = useCallback(() => {
        setCurrentFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
    }, []);

    // --- Persistence: Sync State on Visibility Change ---
    const syncStateFromStorage = useCallback(() => {
        if (localStorage.getItem('pomodoroIsRunning') !== 'true') return;
        const accumulatedSecondsOnStart = parseInt(localStorage.getItem('pomodoroAccumulatedSeconds') || '0', 10);
        const startTime = parseInt(localStorage.getItem('pomodoroStartTime') || '0', 10);
        if (startTime === 0) return;
        const elapsedSinceStart = Math.floor((Date.now() - startTime) / 1000);
        setTotalSeconds(accumulatedSecondsOnStart + elapsedSinceStart);
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isRunning) {
                syncStateFromStorage();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isRunning, syncStateFromStorage]);

    // --- Gift Logic ---
    useEffect(() => {
        const previousPomodoros = prevPomodorosRef.current;
        localStorage.setItem('pomodorosCompleted', pomodorosCompleted.toString());

        // Only trigger gifts if we have actively increased the count
        if (pomodorosCompleted > previousPomodoros) {
            const totalDiff = pomodorosCompleted - previousPomodoros;
            // Deduct any manual updates from the "giftable" count
            const manualCount = Math.min(totalDiff, manualUpdatesPending.current);
            const giftableCount = totalDiff - manualCount;
            
            // Decrement the pending counter
            manualUpdatesPending.current = Math.max(0, manualUpdatesPending.current - manualCount);

            if (giftableCount > 0) {
                let newRestMinutes = 0;
                let superGifts = 0;
                let normalGifts = 0;

                const startCalc = previousPomodoros + manualCount;
                
                for (let i = 1; i <= giftableCount; i++) {
                    const currentPomodoroNumber = startCalc + i;
                    if (currentPomodoroNumber > 0 && currentPomodoroNumber % 4 === 0) {
                        newRestMinutes += 15;
                        superGifts++;
                    } else {
                        newRestMinutes += 5;
                        normalGifts++;
                    }
                }
                
                if (newRestMinutes > 0) {
                    setAvailableRestMinutes(prev => {
                        const updatedRest = prev + newRestMinutes;
                        localStorage.setItem('availableRestMinutes', updatedRest.toString());
                        return updatedRest;
                    });
                    
                    if (superGifts > 0) {
                        showNotification(
                            superGifts > 0 && normalGifts > 0 
                                ? `Gifts! You've earned ${newRestMinutes} minutes of rest.` 
                                : `Super Gift! You've earned ${newRestMinutes} minutes of rest.`, 
                            'super'
                        );
                    } else {
                        showNotification(`Gift! You've earned ${newRestMinutes} minutes of rest.`, 'gift');
                    }

                    // Send Browser Notification & Sound
                    sendBrowserNotification(
                        "Pomodoro Completed!", 
                        `You've earned ${newRestMinutes} minutes of rest.`
                    );
                    playSound('success');
                }
            }
        }
        prevPomodorosRef.current = pomodorosCompleted;
    }, [pomodorosCompleted, showNotification]);

    // --- Timer Logic ---
    // Update pomodoros based on time
    useEffect(() => {
        const completedNow = Math.floor(totalSeconds / POMODORO_DURATION_SECONDS);
        if (completedNow > pomodorosCompleted) {
            setPomodorosCompleted(completedNow);
        }
    }, [totalSeconds, pomodorosCompleted]);

    // Main Tick
    useEffect(() => {
        if (!isRunning) return;
        const timerInterval = setInterval(() => setTotalSeconds(prev => prev + 1), 1000);
        return () => clearInterval(timerInterval);
    }, [isRunning]);

    // Rest Tick
    useEffect(() => {
        if (!isResting) return;
        const restInterval = setInterval(() => setRestSecondsRemaining(prev => prev - 1), 1000);
        return () => clearInterval(restInterval);
    }, [isResting]);

    // Browser Notification for Rest Finished
    useEffect(() => {
        if (isResting && restSecondsRemaining === 0) {
            sendBrowserNotification("Rest Finished!", "Time to get back to focus.");
            playSound('alert');
        }
    }, [isResting, restSecondsRemaining]);

    // --- Handlers ---
    const handleStartResume = useCallback(() => {
        localStorage.setItem('pomodoroAccumulatedSeconds', totalSeconds.toString());
        localStorage.setItem('pomodoroStartTime', Date.now().toString());
        localStorage.setItem('pomodoroIsRunning', 'true');
        setIsRunning(true);
        
        // Initialize Audio Context on user interaction to unlock autoplay policies
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            ctx.resume();
        }
    }, [totalSeconds]);

    const handlePause = useCallback(() => {
        // Sync before pausing
        const completedNow = Math.floor(totalSeconds / POMODORO_DURATION_SECONDS);
        setPomodorosCompleted(current => Math.max(current, completedNow));

        localStorage.setItem('pomodoroAccumulatedSeconds', totalSeconds.toString());
        localStorage.setItem('pomodoroIsRunning', 'false');
        localStorage.removeItem('pomodoroStartTime');
        
        setIsRunning(false);
    }, [totalSeconds]);
    
    const handleResetTimer = useCallback(() => {
        setTotalSeconds(0);
        localStorage.setItem('pomodoroAccumulatedSeconds', '0');
        localStorage.removeItem('pomodoroStartTime');
        showNotification('Timer progress has been reset.', 'info');
    }, [showNotification]);

    const handleResetPomodoros = useCallback(() => {
        // Resetting pomodoros should also reset the timer progress for the current incomplete pomodoro
        const newTotalSeconds = totalSeconds % POMODORO_DURATION_SECONDS;
        setTotalSeconds(newTotalSeconds);
        
        setPomodorosCompleted(0);
        manualUpdatesPending.current = 0; // Clear any pending manual flags

        // CRITICAL: If running, re-anchor the start time so refresh doesn't revert state
        if (isRunning) {
             localStorage.setItem('pomodoroAccumulatedSeconds', newTotalSeconds.toString());
             localStorage.setItem('pomodoroStartTime', Date.now().toString());
        } else {
             localStorage.setItem('pomodoroAccumulatedSeconds', newTotalSeconds.toString());
        }
        
        showNotification('Pomodoros completed have been reset.', 'info');
    }, [showNotification, totalSeconds, isRunning]);

    const handleResetRestMinutes = useCallback(() => {
        setAvailableRestMinutes(0);
        localStorage.setItem('availableRestMinutes', '0');
        showNotification('Gift store minutes have been reset.', 'info');
    }, [showNotification]);

    const handleUseRest = useCallback(() => {
        if (isResting) return;
        rotateFact();

        if (isRunning) {
            handlePause();
        }
        setIsResting(true);

        if (availableRestMinutes > 0) {
            setRestSecondsRemaining(availableRestMinutes * 60);
            setAvailableRestMinutes(0);
            localStorage.setItem('availableRestMinutes', '0');
        } else {
            const BORROW_MINUTES = 5;
            setRestSecondsRemaining(BORROW_MINUTES * 60);
            setAvailableRestMinutes(prev => {
                const newTotal = prev - BORROW_MINUTES;
                localStorage.setItem('availableRestMinutes', newTotal.toString());
                return newTotal;
            });
            showNotification(`You've borrowed ${BORROW_MINUTES} minutes. Earn Pomodoros to pay it back!`, 'info');
        }
        
        // Initialize Audio Context on user interaction
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            ctx.resume();
        }
    }, [availableRestMinutes, isResting, isRunning, handlePause, showNotification, rotateFact]);
    
    const handlePauseRest = useCallback(() => {
        let adjustmentMinutes = 0;

        if (restSecondsRemaining > 0) {
            adjustmentMinutes = Math.ceil(restSecondsRemaining / 60);
        } else {
            adjustmentMinutes = Math.floor(restSecondsRemaining / 60);
        }
        
        if (adjustmentMinutes !== 0) {
            setAvailableRestMinutes(prev => {
                const newTotal = prev + adjustmentMinutes;
                localStorage.setItem('availableRestMinutes', newTotal.toString());
                return newTotal;
            });
            
            if (adjustmentMinutes > 0) {
                showNotification(`${adjustmentMinutes} minute(s) of rest returned to your gift store.`, 'info');
            } else {
                showNotification(`${Math.abs(adjustmentMinutes)} minute(s) borrowed from your gift store.`, 'info');
            }
        }
        
        setIsResting(false);
        setRestSecondsRemaining(0);
    }, [restSecondsRemaining, showNotification]);

    // Manual Controls
    const handleAddPomodoro = useCallback(() => {
        manualUpdatesPending.current += 1; // Flag this as a manual update
        setPomodorosCompleted(prev => prev + 1);
        
        // Calculate new total and update state
        const newTotal = totalSeconds + POMODORO_DURATION_SECONDS;
        setTotalSeconds(newTotal);

        // CRITICAL: Re-anchor storage if running so refresh doesn't lose the added time
        if (isRunning) {
             localStorage.setItem('pomodoroAccumulatedSeconds', newTotal.toString());
             localStorage.setItem('pomodoroStartTime', Date.now().toString());
        } else {
             localStorage.setItem('pomodoroAccumulatedSeconds', newTotal.toString());
        }

        showNotification('1 pomodoro added.', 'info');
    }, [showNotification, isRunning, totalSeconds]);

    const handleRemovePomodoro = useCallback(() => {
        setPomodorosCompleted(prev => {
            if (prev > 0) {
                showNotification('1 pomodoro removed.', 'info');
                // Update total seconds
                const newSeconds = Math.max(0, totalSeconds - POMODORO_DURATION_SECONDS);
                setTotalSeconds(newSeconds);

                // CRITICAL: Re-anchor storage if running
                if (isRunning) {
                    localStorage.setItem('pomodoroAccumulatedSeconds', newSeconds.toString());
                    localStorage.setItem('pomodoroStartTime', Date.now().toString());
                } else {
                    localStorage.setItem('pomodoroAccumulatedSeconds', newSeconds.toString());
                }
                return prev - 1;
            }
            return prev;
        });
    }, [showNotification, isRunning, totalSeconds]);

    const handleAddRestMinutes = useCallback((minutes: number) => {
        if (minutes > 0) {
            setAvailableRestMinutes(prev => {
                const newTotal = prev + minutes;
                localStorage.setItem('availableRestMinutes', newTotal.toString());
                return newTotal;
            });
            showNotification(`${minutes} minute(s) added to your gift store.`, 'info');
        }
    }, [showNotification]);

    const handleRemoveRestMinutes = useCallback((minutes: number) => {
        if (minutes > 0) {
            setAvailableRestMinutes(prev => {
                const newTotal = prev - minutes;
                localStorage.setItem('availableRestMinutes', newTotal.toString());
                if (prev >= minutes) {
                     showNotification(`${minutes} minute(s) removed from your gift store.`, 'info');
                }
                return newTotal;
            });
        }
    }, [showNotification]);

    // --- Computed Values ---
    const currentPomodoroProgress = useMemo(() => {
        const secondsIntoCurrentPomodoro = totalSeconds % POMODORO_DURATION_SECONDS;
        return (secondsIntoCurrentPomodoro / POMODORO_DURATION_SECONDS) * 100;
    }, [totalSeconds]);

    const secondsRemainingInPomodoro = useMemo(() => {
        if (totalSeconds === 0) return POMODORO_DURATION_SECONDS;
        const secondsIntoCurrentPomodoro = totalSeconds % POMODORO_DURATION_SECONDS;
        if (secondsIntoCurrentPomodoro === 0 && totalSeconds > 0) return POMODORO_DURATION_SECONDS;
        return POMODORO_DURATION_SECONDS - secondsIntoCurrentPomodoro;
    }, [totalSeconds]);
    
    const cardStyle = useMemo(() => {
        if (isResting) {
            if (restSecondsRemaining < 0) return 'bg-rose-900/30 border-rose-500/50';
            return 'bg-sky-900/30 border-sky-500/50';
        }
        if (isRunning) {
            return 'bg-emerald-900/30 border-emerald-500/50';
        }
        // Paused / Not Running
        return 'bg-rose-900/30 border-rose-500/50';
    }, [isResting, isRunning, restSecondsRemaining]);

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleCloseNotification}
                />
            )}

            <main className="w-full max-w-2xl mx-auto flex flex-col items-center text-center">
                <header className="mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500">
                        Continuous Pomodoro
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">The timer never stops. Your focus is eternal.</p>
                </header>

                {/* Unified Display Card */}
                <div className={`relative border rounded-2xl w-full mb-6 shadow-2xl shadow-black/20 flex flex-col transition-colors duration-500 overflow-hidden ${cardStyle}`}>
                    {/* Reset Button Positioned Absolute over the slots */}
                    {!isRunning && !isResting && totalSeconds > 0 && (
                        <div className="absolute top-3 right-3 z-20">
                            <button
                                onClick={handleResetTimer}
                                className="text-gray-500 hover:text-rose-400 transition-colors p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                aria-label="Reset timer progress"
                                title="Reset Timer Progress"
                            >
                                <ResetIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Slot 1: Top Header (Fixed Height) */}
                    <div className="h-12 flex items-end justify-center pb-2 px-4 w-full z-10">
                        {isResting ? (
                             <p className="text-sm font-medium text-gray-400 uppercase tracking-wider animate-fade-in">Did you know?</p>
                        ) : (
                             <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Time Remaining</p>
                        )}
                    </div>

                    {/* Slot 2: Middle Digits (Flexible Height, Always Centered) */}
                    <div className="flex-grow flex items-center justify-center w-full px-4">
                        {isResting ? (
                            <RestTimerDisplay secondsRemaining={restSecondsRemaining} />
                        ) : (
                            <TimerDisplay seconds={secondsRemainingInPomodoro} />
                        )}
                    </div>

                    {/* Slot 3: Bottom Footer (Fixed Height) */}
                    {/* Reduced height to h-24 and padding to pb-6 to close gap */}
                    <div className="h-24 w-full px-6 flex flex-col justify-end pb-6 z-10">
                        {isResting ? (
                            <div className="w-full flex flex-col items-center animate-fade-in">
                                <p className={`text-lg md:text-xl font-serif italic text-indigo-200/90 text-center leading-snug max-w-lg ${restSecondsRemaining < 0 ? 'opacity-50' : ''}`}>
                                    "{currentFact}"
                                </p>
                                {restSecondsRemaining < 0 && (
                                     <p className="text-rose-400 font-bold text-xs mt-2 tracking-widest uppercase animate-pulse">Borrowing Time</p>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-rose-500 to-fuchsia-500 h-2 rounded-full transition-all duration-1000 ease-linear" 
                                        style={{ width: `${currentPomodoroProgress}%` }}
                                    ></div>
                                </div>
                                <div className="flex w-full justify-center">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Progress to next gift</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Unified Controls Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
                    {isResting ? (
                         <button
                            onClick={handlePauseRest}
                            className="col-span-1 sm:col-span-2 w-full bg-gray-600 text-white rounded-full p-3 hover:bg-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-3 shadow-lg"
                            aria-label="End rest and return to timer"
                        >
                            <ReturnIcon className="w-5 h-5" />
                            <span className="text-lg font-bold">End Rest</span>
                        </button>
                    ) : (
                        <>
                            {!isRunning ? (
                                <button
                                    onClick={handleStartResume}
                                    className="w-full bg-emerald-500 text-white rounded-full p-3 hover:bg-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20"
                                    aria-label={totalSeconds > 0 ? 'Resume timer' : 'Start timer'}
                                >
                                    <PlayIcon className="w-5 h-5" />
                                    <span className="text-lg font-bold">{totalSeconds > 0 ? 'Resume' : 'Start'}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handlePause}
                                    className="w-full bg-rose-500 text-white rounded-full p-3 hover:bg-rose-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-3 shadow-lg shadow-rose-900/20"
                                    aria-label="Pause timer"
                                >
                                    <PauseIcon className="w-5 h-5" />
                                    <span className="text-lg font-bold">Pause</span>
                                </button>
                            )}
                            
                            <button
                                onClick={handleUseRest}
                                disabled={isResting}
                                className="w-full bg-sky-500 text-white rounded-full p-3 hover:bg-sky-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:text-gray-400 flex items-center justify-center gap-3 shadow-lg shadow-sky-900/20"
                                aria-label={availableRestMinutes > 0 ? "Use available rest time" : "Borrow 5 minutes of rest"}
                            >
                                <GiftIcon className="w-5 h-5"/>
                                <span className="text-lg font-bold">{availableRestMinutes > 0 ? 'Use Rest' : 'Borrow Rest'}</span>
                            </button>
                        </>
                    )}
                </div>
                
                {/* Stats & Stores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <PomodoroStats 
                    count={pomodorosCompleted}
                    onAdd={handleAddPomodoro}
                    onRemove={handleRemovePomodoro}
                    onReset={handleResetPomodoros}
                  />

                  <GiftStore
                      minutes={availableRestMinutes}
                      onAddRestMinutes={handleAddRestMinutes}
                      onRemoveRestMinutes={handleRemoveRestMinutes}
                      onResetRestMinutes={handleResetRestMinutes}
                  />
                </div>
            </main>
        </div>
    );
};

export default App;