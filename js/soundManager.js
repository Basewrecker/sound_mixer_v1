export class SoundManager {
    constructor() {
        this.audioElements = new Map();
        this.isPlaying = false;
    }
    
    loadSound(soundID, filePath) {
        try {
            const audio = new Audio();
            audio.src = filePath;
            audio.loop = true;
            audio.preload = 'metadata';
            this.audioElements.set(soundID,audio);
            return true;
        } catch (error) {
            console.error(`failed to load sound ${soundID}`);
            return false;
        }
    }
    
    async playSound(soundID) {
        const audio = this.audioElements.get(soundID);
        if (audio) {
            try {
                await audio.play();
                console.log(`playing sound ${soundID}`);
                return true;
            } catch (error) {
                console.error(`failed to play ${soundID}`, error);
                return false;
            }
        }
    }
    
    pauseSound(soundID) {
        const audio = this.audioElements.get(soundID);
        
        if (audio && !audio.paused) {
            audio.pause();
            console.log(`paused: ${soundID}`);
        }
    }
    
    setVolume (soundID, volume) {
        const audio = this.audioElements.get(soundID);
        
        if (!audio) {
            console.error(`Sound ${soundID} not found`);
            return false;
        }
        
        audio.volume = volume / 100;
        console.log(`volume for ${soundID}: ${volume}`);
        return true;
    }
    
    playAll() {
        for (const [soundId, audio] of this.audioElements) {
            if (audio.paused) {
                audio.play();
            }
            
        this.isPlaying = true;
            
        }
    }
    
    pauseAll() {
        for (const [soundId, audio] of this.audioElements) {
            if (!audio.paused) {
                audio.pause();
            }
            
        this.isPlaying = false;
        }
    }
    
    stopAll() {
        for (const [soundId, audio] of this.audioElements) {
            if (!audio.paused) {
                audio.pause();
            }
            audio.currentTime = 0;
        }
        this.isPlaying = false;
    }
}




