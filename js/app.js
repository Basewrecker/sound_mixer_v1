import {sounds, defaultPresets} from "./soundData.js";
import {SoundManager} from "./soundManager.js";
import {UI} from "./ui.js";

class AmbientMixer {
    constructor() {
        console.log("Initializing state...");
        this.soundManager = new SoundManager();
        this.ui = new UI();
        this.presetManager = null;
        this.timer = null;
        this.currentSoundState = {};
        this.isInitialized = false;
    }
    
    init() {
        try {
            this.ui.init();
            this.ui.renderSoundCards(sounds);
            this.setupEventListeners();
            this.loadAllSounds();
            this.isInitialized = true;
        } catch (error) {
            console.error("failed to initialize app", error);
        }
    }
    
    setupEventListeners() {
        document.addEventListener('click', async (event) => {
            if (event.target.closest('.play-btn')) {
                const soundID = event.target.closest('.play-btn').dataset.sound;
                await this.toggleSound(soundID);
            }
        })
    }
    
    loadAllSounds() {
        sounds.forEach((sound) => {
            const audioUrl = `audio/${sound.file}`;
            const success = this.soundManager.loadSound(sound.id, audioUrl);
            if (!success) {
                console.warn(`couldn't load file ${sound.name} from ${audio.url}`);
            }
        })
    }
    
    async toggleSound(soundID) {
        const audio = this.soundManager.audioElements.get(soundID);
        
        if (!audio) {
            console.log(`sound ${soundID} not found`);
            return false;
        }
        
        if (audio.paused) {
            this.soundManager.setVolume(soundID, 50);
            await this.soundManager.playSound(soundID);
            this.ui.updateSoundPlayButton(soundID, true);
        } else {
            this.soundManager.pauseSound(soundID);
            this.ui.updateSoundPlayButton(soundID, false);
        }
    }
}

// Initialize app for dom

document.addEventListener('DOMContentLoaded', () => {
    const app = new AmbientMixer();
    app.init();
})