export class UI {
    constructor() {
        this.soundCardsContainer = null;
        this.masterVolumeSlider = null;
        this.masterVolumeValue = null;
        this.playPauseButton = null;
        this.resetButton = null;
        this.modal = null;
        this.customPresetsContainer = null;
        this.timerDisplay = null;
        this.timerSelect = null;
        this.themeToggle = null;
    }

    init() {
        this.soundCardsContainer = document.querySelector('.grid');
        this.masterVolumeSlider = document.querySelector('#masterVolume');
        this.masterVolumeValue = document.querySelector('#masterVolumeValue');
        this.playPauseButton = document.querySelector('#playPauseAll');
        this.resetButton = document.querySelector('#resetAll');
        this.modal = document.querySelector('#savePresetModal');
        this.customPresetsContainer = document.querySelector('#customPresets');
        this.timerDisplay = document.querySelector('#timerDisplay');
        this.timerSelect = document.querySelector('#timerSelect');
        this.themeToggle = document.querySelector('#themeToggle');
    }

    createSoundCard(sound) {
        const card = document.createElement('div');
        card.className = 'sound-card bg-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden transition-all duration-300';
        card.dataset.sound = sound.id;
        card.innerHTML = `  <div class="flex flex-col h-full">
    <!-- Sound Icon and Name -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div
          class="sound-icon-wrapper w-12 h-12 rounded-full bg-gradient-to-br ${sound.color} flex items-center justify-center">
          <i class="fas ${sound.icon} text-white text-xl"></i>
        </div>

        <div>
          <h3 class="font-semibold text-lg">${sound.name}</h3>
          <p class="text-xs opacity-70">${sound.description}</p>
        </div>
      </div>

      <button
        type="button"
        class="play-btn w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
        data-sound="${sound.id}">
        <i class="fas fa-play text-sm"></i>
      </button>
    </div>
  </div>


   <!-- Volume Control -->
   <div class="flex-1 flex flex-col justify-center">
     <div class="flex items-center space-x-3">
       <i class="fas fa-volume-low opacity-50"></i>

       <input
      type="range"
      class="volume-slider flex-1"
      min="0"
      max="100"
      value="0"
      data-sound="${sound.id}"
        />

    <span class="volume-value text-sm w-8 text-right">0</span>
  </div>

  <!-- Volume Bar Visualization -->
  <div class="volume-bar mt-3">
    <div class="volume-bar-fill" style="width: 0%"></div>
  </div>
  </div>
`;
        
        return card;
    }
    
    createCustomPresetButton(name, presetId) {
        const button = document.createElement('button');
        button.className = 'custom-preset-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 relative group';
        button.dataset.preset = presetId;
        button.innerHTML = `
  <i class="fas fa-star mr-2 text-yellow-400"></i>
  ${name}
  <button
    type="button"
    class="delete-preset absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    data-preset="${presetId}">
    <i class="fas fa-times text-xs text-white"></i>
  </button>
`;
        return button;

    }
    
    renderSoundCards(sounds) {
        this.soundCardsContainer.innerHTML = '';
        sounds.forEach((sound) => {
            const card = this.createSoundCard(sound);
            this.soundCardsContainer.appendChild(card);
        })
    }
    
    updateSoundPlayButton(soundID, isPlaying) {
        const card = document.querySelector(`[data-sound="${soundID}"]`);
        
        if (card) {
            const playBtn = card.querySelector('.play-btn');
            const icon = playBtn.querySelector('i');
            
            if (isPlaying) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                card.classList.add('playing');
            } else {
                icon.classList.add('fa-play');
                icon.classList.remove('fa-pause');
                card.classList.remove('playing');
            }
        }
    }
    
    updateVolumeDisplay(soundId, volume) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        
        if (card) {
            const volumeValue = card.querySelector('.volume-value');
            if (volumeValue) {
                volumeValue.textContent = volume;
            }
            
            const volumeBarFill = card.querySelector('.volume-bar-fill');
            if (volumeBarFill) {
                volumeBarFill.style.width = `${volume}%`;
            }
            
            const slider = card.querySelector('.volume-slider');
            if (slider) {
                slider.value = volume;
            }
        }
    }
    
    updateMainPlayButton(isPlaying) {
        const icon = this.playPauseButton.querySelector('i');
        
        if (isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            const playAllText = document.querySelector('.play-all');
            playAllText.textContent = 'Pause All';
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            const playAllText = document.querySelector('.play-all');
            playAllText.textContent = 'Play All';
        }
    }
    
    resetUI() {
        const sliders = document.querySelectorAll('.volume-slider');
        sliders.forEach((slider) => {
            slider.value = 0;
            const soundId = slider.dataset.sound;
            this.updateVolumeDisplay(soundId, 0);
        })
        
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach((btn) => {
            const icon = btn.querySelector('i');
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        })
        
        const cards = document.querySelectorAll('.sound-card');
        cards.forEach((card) => {
            card.classList.remove('fa-playing');
        });
        
        this.updateMainPlayButton(false);
        if (this.masterVolumeSlider) {
            this.masterVolumeSlider.value = 50;
        }
        if (this.masterVolumeValue) {
            this.masterVolumeValue.textContent = '50';
        }
    }
    
    showModal() {
        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');
        document.getElementById('presetName').focus();
    }
    
    hideModal() {
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
        document.getElementById('presetName').value = '';
    }
    
    addCustomPreset(name, presetId) {
        const button = this.createCustomPresetButton(name, presetId);
        this.customPresetsContainer.appendChild(button);
    }
    
    renderCustomPresets(customPresets) {
        if (!this.customPresetsContainer) return;
        
        this.customPresetsContainer.innerHTML = '';
        
        Object.entries(customPresets).forEach(([presetId, preset]) => {
            this.addCustomPreset(preset.name, presetId);
        });
    }
    
    updateTimerDisplay(timeString) {
        if (this.timerDisplay) {
            this.timerDisplay.textContent = timeString;
            this.timerDisplay.classList.remove('hidden');
        }
    }
    
    hideTimerDisplay() {
        if (this.timerDisplay) {
            this.timerDisplay.classList.add('hidden');
        }
    }
    
    updateThemeIcon(isLightTheme) {
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.classList.remove(isLightTheme ? 'fa-moon' : 'fa-sun');
                icon.classList.add(isLightTheme ? 'fa-sun' : 'fa-moon');
            }
        }
    }
    
    removeCustomPreset(presetId) {
        if (this.customPresetsContainer) {
            const button = this.customPresetsContainer.querySelector(`[data-preset="${presetId}"]`);
            if (button) {
                button.remove();
            }
        }
    }
}




    
    
    
