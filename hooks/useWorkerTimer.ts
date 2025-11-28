import { useEffect, useRef, useCallback } from 'react';
import TimerWorker from '../workers/timer.worker?worker';

interface UseWorkerTimerOptions {
    isRunning: boolean;
    onTick: () => void;
}

/**
 * A hook that uses a Web Worker to provide accurate timer ticks,
 * immune to browser throttling when the tab is in the background.
 */
export function useWorkerTimer({ isRunning, onTick }: UseWorkerTimerOptions): void {
    const workerRef = useRef<Worker | null>(null);
    const onTickRef = useRef(onTick);

    // Keep the callback ref updated
    useEffect(() => {
        onTickRef.current = onTick;
    }, [onTick]);

    useEffect(() => {
        // Create worker on mount
        workerRef.current = new TimerWorker();

        workerRef.current.onmessage = (e: MessageEvent) => {
            if (e.data === 'tick') {
                onTickRef.current();
            }
        };

        return () => {
            // Cleanup worker on unmount
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!workerRef.current) return;

        if (isRunning) {
            workerRef.current.postMessage('start');
        } else {
            workerRef.current.postMessage('stop');
        }
    }, [isRunning]);
}
