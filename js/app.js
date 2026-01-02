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
import {
    PresetManager
} from "./presetManager.js";
import {
    Timer
} from "./timer.js";

class AmbientMixer {
    constructor() {
        console.log("Initializing state...");
        this.soundManager = new SoundManager();
        this.ui = new UI();
        this.presetManager = new PresetManager();
        this.timer = new Timer();
        this.currentSoundState = {};
        this.isInitialized = false;
        this.masterVolume = 50;
        this.isLightTheme = localStorage.getItem('theme') === 'light';
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
            this.loadCustomPresets();
            this.applyTheme();
            this.setMasterVolume(parseInt(this.ui.masterVolumeSlider?.value || 50));
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
            
            if (event.target.closest('.preset-btn')) {
                const presetKey = event.target.closest('.preset-btn').dataset.preset;
                await this.loadPreset(presetKey);
                const playAllText = document.querySelector('.play-all');
                playAllText.textContent = 'Pause All';
            }
            
            if (event.target.closest('.delete-preset')) {
                event.stopPropagation();
                const presetId = event.target.closest('.delete-preset').dataset.preset;
                this.deleteCustomPreset(presetId);
                return;
            }
            
            if (event.target.closest('.custom-preset-btn')) {
                const presetKey = event.target.closest('.custom-preset-btn').dataset.preset;
                await this.loadCustomPreset(presetKey);
                const playAllText = document.querySelector('.play-all');
                playAllText.textContent = 'Pause All';
            }
            
//            if (event.target.closest('.preset-btn')) {
//                await this.loadPreset(presetKey);
//                const playAllText = document.querySelector('.play-all');
//                playAllText.textContent = 'Play All';
//            }
            
            if (event.target.closest('#playPauseAll')) {
                const playAllText = document.querySelector('.play-all');
                const icon = document.getElementsByClassName('fa-play');
                playAllText.textContent = 'Play All';
            }
        });
        


        document.addEventListener('input', (event) => {
            if (event.target.classList.contains('volume-slider')) {
                const soundID = event.target.dataset.sound;
                const volume = parseInt(event.target.value);
                this.setSoundVolume(soundID, volume);
            }
        });

        const masterVolumeSlider = document.getElementById('masterVolume');
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
        
        const saveButton = document.getElementById('savePreset');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.showSavePresetModal();
            })
        }
        
        const confirmSaveButton = document.getElementById('confirmSave');
        if (confirmSaveButton) {
            confirmSaveButton.addEventListener('click', () => {
                this.saveCurrentPreset();
            })
        }
        
        
        const cancelSaveButton = document.getElementById('cancelSave');
        if (cancelSaveButton) {
            cancelSaveButton.addEventListener('click', () => {
                this.ui.hideModal();
            })
        }
        
        if (this.ui.modal) {
            this.ui.modal.addEventListener('click', (event) => {
                if (event.target === this.ui.modal) {
                    this.ui.hideModal();
                }
            })
        }
        
        if (this.ui.timerSelect) {
            this.ui.timerSelect.addEventListener('change', (event) => {
                const minutes = parseInt(event.target.value);
                this.handleTimerChange(minutes);
            })
        }
        
        if (this.ui.themeToggle) {
            this.ui.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            })
        }
    }

    loadAllSounds() {
        sounds.forEach((sound) => {
            const audioUrl = `audio/${sound.file}`;
            const success = this.soundManager.loadSound(sound.id, audioUrl);
            if (!success) {
                console.warn(`couldn't load file ${sound.name} from ${audioUrl}`);
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
            const card = document.querySelector(`[data-sound="${soundId}"]`);
            const slider = card ? card.querySelector('.volume-slider') : null;
            if (slider) {
                volume = parseInt(slider.value);
                if (volume === 0) {
                    volume = 50;
                    this.ui.updateVolumeDisplay(soundId, volume);
                }
            } else {
                volume = 50;
                this.ui.updateVolumeDisplay(soundId, volume);
            }
            
            this.currentSoundState[soundId] = volume;
        }

        if (audio.paused) {
            this.soundManager.setVolume(soundId, volume);
            await this.soundManager.playSound(soundId);
            this.ui.updateSoundPlayButton(soundId, true);
        } else {
            this.soundManager.pauseSound(soundId);
            this.ui.updateSoundPlayButton(soundId, false);
            this.currentSoundState[soundId] = 0;
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
        this.masterVolume = 50;
        this.setMasterVolume(50);
        sounds.forEach((sound) => {
            this.currentSoundState[sound.id] = 0;
        })
        this.ui.resetUI();
    }
    
    //load a config 
    loadPreset(presetKey) {
        const preset = defaultPresets[presetKey];
        if (!preset) {
            console.error(`preset ${presetKey} not found`);
            return false;
        } 
        
        this.soundManager.stopAll();
        sounds.forEach((sound) => {
            this.currentSoundState[sound.id] = 0;
            this.ui.updateVolumeDisplay(sound.id, 0);
            this.ui.updateSoundPlayButton(sound.id, false);
        });
        
        for (const [soundId, volume] of Object.entries(preset.sounds)) {
            this.currentSoundState[soundId] = volume;
            this.ui.updateVolumeDisplay(soundId, volume);
            const effectiveVolume = (volume * this.masterVolume) / 100;
            const audio = this.soundManager.audioElements.get(soundId);
            if (audio) {
                audio.volume = effectiveVolume / 100;
                
                audio.play();
                this.ui.updateSoundPlayButton(soundId, true);
            }
        }
        
        this.soundManager.isPlaying = true;
        this.ui.updateMainPlayButton(true);
    }
    
    loadCustomPreset(presetId) {
        const preset = this.presetManager.getPreset(presetId);
        if (!preset) {
            console.error(`custom preset ${presetId} not found`);
            return false;
        }
        
        this.soundManager.stopAll();
        sounds.forEach((sound) => {
            this.currentSoundState[sound.id] = 0;
            this.ui.updateVolumeDisplay(sound.id, 0);
            this.ui.updateSoundPlayButton(sound.id, false);
        });
        
        for (const [soundId, volume] of Object.entries(preset.sounds)) {
            this.currentSoundState[soundId] = volume;
            this.ui.updateVolumeDisplay(soundId, volume);
            const effectiveVolume = (volume * this.masterVolume) / 100;
            const audio = this.soundManager.audioElements.get(soundId);
            if (audio) {
                audio.volume = effectiveVolume / 100;
                audio.play();
                this.ui.updateSoundPlayButton(soundId, true);
            }
        }
        
        this.soundManager.isPlaying = true;
        this.ui.updateMainPlayButton(true);
    }
    
    loadCustomPresets() {
        const customPresets = this.presetManager.getAllCustomPresets();
        this.ui.renderCustomPresets(customPresets);
    }
    
    deleteCustomPreset(presetId) {
        if (confirm('Are you sure you want to delete this preset?')) {
            const success = this.presetManager.deletePreset(presetId);
            if (success) {
                this.ui.removeCustomPreset(presetId);
            }
        }
    }
    
    handleTimerChange(minutes) {
        this.timer.stop();
        this.ui.hideTimerDisplay();
        
        if (minutes > 0) {
            this.timer.start(minutes, (remaining) => {
                const timeString = this.timer.formatTime(remaining);
                this.ui.updateTimerDisplay(timeString);
            }, () => {
                this.soundManager.stopAll();
                this.ui.updateMainPlayButton(false);
                sounds.forEach((sound) => {
                    this.ui.updateSoundPlayButton(sound.id, false);
                });
                this.ui.hideTimerDisplay();
                if (this.ui.timerSelect) {
                    this.ui.timerSelect.value = '0';
                }
                alert('Timer finished! All sounds have been stopped.');
            });
        }
    }
    
    toggleTheme() {
        this.isLightTheme = !this.isLightTheme;
        localStorage.setItem('theme', this.isLightTheme ? 'light' : 'dark');
        this.applyTheme();
    }
    
    applyTheme() {
        const body = document.body;
        if (this.isLightTheme) {
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
        }
        this.ui.updateThemeIcon(this.isLightTheme);
    }
    
    showSavePresetModal() {
        const hasActiveSounds = Object.values(this.currentSoundState).some(v => v > 0);
        if (!hasActiveSounds) {
            alert('No sounds found');
            return false;
        }
        
        this.ui.showModal();
    }
    
    saveCurrentPreset() {
        const nameInput = document.getElementById('presetName');
        const name = nameInput.value.trim();
        if (!name) {
            alert('Please enter a preset name');
            return false;
        }
        
        if (this.presetManager.presetNameExists(name)) {
            alert(`A preset with the same name (${name}) already exists`);
            return false;
        }
        
        const presetId = this.presetManager.savePreset(name, this.currentSoundState);
        this.ui.addCustomPreset(name, presetId);
        this.ui.hideModal();
    }
}

// Initialize app for dom

document.addEventListener('DOMContentLoaded', () => {
    const app = new AmbientMixer();
    app.init();
})
