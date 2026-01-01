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
            this.loadAllSounds();
            this.isInitialized = true;
        } catch (error) {
            console.error("failed to initialize app", error);
        }
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
}

// Initialize app for dom

document.addEventListener('DOMContentLoaded', () => {
    const app = new AmbientMixer();
    app.init();
})