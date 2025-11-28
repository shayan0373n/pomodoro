let intervalId: number | null = null;

self.onmessage = (e: MessageEvent<'start' | 'stop'>) => {
    if (e.data === 'start') {
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
        intervalId = self.setInterval(() => {
            self.postMessage('tick');
        }, 1000);
    } else if (e.data === 'stop') {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
};
