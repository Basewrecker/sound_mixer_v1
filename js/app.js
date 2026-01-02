import {
    sounds,
    defaultPresets
} from "./soundData.js";
import {
    SoundManager
} from "./soundManager.js";
import {
    UI
} from "./ui.js";

class AmbientMixer {
    constructor() {
        console.log("Initializing state...");
        this.soundManager = new SoundManager();
        this.ui = new UI();
        this.presetManager = null;
        this.timer = null;
        this.currentSoundState = {};
        this.isInitialized = false;
        this.masterVolume = 100;
    }

    init() {
        try {
            this.ui.init();
            this.ui.renderSoundCards(sounds);
            this.setupEventListeners();
            this.loadAllSounds();
            sounds.forEach((sound) => {
                this.currentSoundState[sound.id] = 0;
            });
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
        });

        document.addEventListener('input', (event) => {
            if (event.target.classList.contains('volume-slider')) {
                const soundID = event.target.dataset.sound;
                const volume = parseInt(event.target.value);
                this.setSoundVolume(soundID, volume);
            }
        });

        const masterVolumeSlider = document.getElementById('mastervolume');
        if (masterVolumeSlider) {
            masterVolumeSlider.addEventListener('input', (event) => {
                const volume = parseInt(event.target.value);
                this.setMasterVolume(volume);
            })
        }
        
        if (this.ui.playPauseButton) {
            this.ui.playPauseButton.addEventListener('click', () => {
                this.toggleAllSounds();
            })
        }
        
         if (this.ui.resetButton) {
            this.ui.resetButton.addEventListener('click', () => {
                this.resetAll();
            })
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

    async toggleSound(soundId) {
        const audio = this.soundManager.audioElements.get(soundId);

        if (!audio) {
            console.log(`sound ${soundId} not found`);
            return false;
        }

        let volume = 0;

        if (audio.paused) {
            const audio = document.querySelector(`[data-sound="${soundId}"]`);
            const slider = document.querySelector('.volume-slider');
            if (volume === 0) {
                volume = 50;
                this.ui.updateVolumeDisplay(soundId, volume);
            }
        }

        if (audio.paused) {
            this.soundManager.setVolume(soundId, volume);
            await this.soundManager.playSound(soundId);
            this.ui.updateSoundPlayButton(soundId, true);
        } else {
            this.soundManager.pauseSound(soundId);
            this.ui.updateSoundPlayButton(soundId, false);
        }
        
        this.updateMainPlayButtonState();
    }
    
    //toggle all sounds
    toggleAllSounds() {
        if (this.soundManager.isPlaying) {
            this.soundManager.pauseAll();
            this.ui.updateMainPlayButton(false);
            sounds.forEach((sound) => {
                this.ui.updateSoundPlayButton(sound.id, false);
            })
        } else {
            for (const [soundId, audio] of this.soundManager.audioElements) {
                const card = document.querySelector(`[data-sound="${soundId}"]`);
                const slider = card.querySelector('.volume-slider');
                
                if (slider) {
                    let volume = parseInt(slider.value)
                    
                    if (volume === 0) {
                        volume = 50;
                        slider.value = 50;
                        this.ui.updateVolumeDisplay(soundId, volume);
                    }
                    
                    this.currentSoundState[soundId] = volume;
                    
                    const effectiveVolume = (volume * this.masterVolume) / 100;
                    audio.volume = effectiveVolume / 100;
                    this.ui.updateSoundPlayButton(soundId, true);
                }
            }
            
            this.soundManager.playAll();
            this.ui.updateMainPlayButton(true);
        }
    }

    setSoundVolume(soundId, volume) {
        this.currentSoundState[soundId] = volume; // stores all the volumes as  a key and obj 
        console.log(this.currentSoundState);
        const effectiveVolume = (volume * this.masterVolume) / 100;
        const audio = this.soundManager.audioElements.get(soundId);
        if (audio) {
            audio.volume = effectiveVolume / 100;
        }
        this.ui.updateVolumeDisplay(soundId, volume);
        this.updateMainPlayButtonState();
    }

    setMasterVolume(volume) {
        this.masterVolume = volume;
        const masterVolumeValue = document.getElementById('masterVolumeValue');
        if (masterVolumeValue) {
            masterVolumeValue.textContent = `${volume}%`;
        }

        this.applyMasterVolumeToAll();
    }

    applyMasterVolumeToAll() {
        for (const [soundId, audio] of this.soundManager.audioElements) {
            if (!audio.paused) {
                const card = document.querySelector(`[data-sound="${soundId}"]`);
                const slider = card.querySelector('.volume-slider');

                if (slider) {
                    const individualVolume = parseInt(slider.value);
                    const effectiveVolume = (individualVolume * this.masterVolume) / 100;
                    audio.volume = effectiveVolume / 100;
                }
            }
        }
    }
                
                
    updateMainPlayButtonState() {
        let anySoundsPlaying = false;
        for (const [soundId, audio] of this.soundManager.audioElements) {
            if (!audio.paused) {
                anySoundsPlaying = true;
                break;
            }
        }
        
        this.soundManager.isPlaying = anySoundsPlaying;
        this.ui.updateMainPlayButton(anySoundsPlaying);
    }
    
    resetAll() {
        this.soundManager.stopAll();
        this.masterVolume = 100;
        this.ui.resetUI();
    }
}

// Initialize app for dom

document.addEventListener('DOMContentLoaded', () => {
    const app = new AmbientMixer();
    app.init();
})
