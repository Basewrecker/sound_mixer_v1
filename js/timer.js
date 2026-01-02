export class Timer {
    constructor() {
        this.timerInterval = null;
        this.endTime = null;
        this.isRunning = false;
    }
    
    start(minutes, onTick, onComplete) {
        if (this.isRunning) {
            this.stop();
        }
        
        if (minutes <= 0) {
            return;
        }
        
        this.endTime = Date.now() + (minutes * 60 * 1000);
        this.isRunning = true;
        
        this.timerInterval = setInterval(() => {
            const remaining = this.endTime - Date.now();
            
            if (remaining <= 0) {
                this.stop();
                if (onComplete) {
                    onComplete();
                }
                return;
            }
            
            if (onTick) {
                onTick(remaining);
            }
        }, 1000);
        
        // Initial tick
        if (onTick) {
            onTick(this.endTime - Date.now());
        }
    }
    
    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isRunning = false;
        this.endTime = null;
    }
    
    getRemainingTime() {
        if (!this.isRunning || !this.endTime) {
            return 0;
        }
        return Math.max(0, this.endTime - Date.now());
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

