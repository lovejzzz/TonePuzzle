class Piano {
    constructor() {
        this.pianoKeys = document.querySelectorAll('.piano-key');
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.activeNotes = new Map(); // Track currently playing notes
        this.velocity = 0.7; // Default velocity (0-1 range)
        this.onNotePlayed = null; // Callback for when a note is played
        
        // Rhodes piano characteristics - adjusted for purer sound
        this.settings = {
            attack: 0.005,  // Faster attack
            decay: 0.2,     // Shorter decay
            sustain: 0.8,   // Higher sustain level
            release: 0.4,   // Shorter release to avoid "shashi" sound
            harmonics: [
                { number: 1, gain: 1.0 },    // Fundamental
                { number: 2, gain: 0.5 },    // Octave (reduced slightly)
                { number: 3, gain: 0.15 },   // Fifth (reduced slightly)
                { number: 4, gain: 0.08 },   // Second octave (reduced slightly)
                { number: 5, gain: 0.04 },   // Third + major third (reduced slightly)
                { number: 6, gain: 0.02 }    // Second fifth (reduced slightly)
            ]
        };
        
        this.setupEventListeners();
    }
    
    // Convert note name (e.g., "C4") to frequency in Hz
    noteToFrequency(note) {
        // Ensure we have a clean note string
        const cleanNote = typeof note === 'string' ? note.trim() : note;
        
        // Log the note being converted to frequency
        console.log(`[PIANO] Converting note to frequency: '${cleanNote}'`);
        
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteName = cleanNote.slice(0, -1);
        const octave = parseInt(cleanNote.slice(-1));
        
        // Log the parsed note components
        console.log(`[PIANO] Parsed note name: '${noteName}', octave: ${octave}`);
        
        // Find the note index (0-11)
        const noteIndex = notes.indexOf(noteName);
        if (noteIndex === -1) {
            console.warn(`[PIANO] Invalid note name: '${noteName}'`);
            return null;
        }
        
        // Calculate frequency using the formula: f = 440 * 2^((n-69)/12)
        // where n is the MIDI note number
        const midiNote = noteIndex + 12 * (octave + 1);
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
    
    // Set the velocity for piano sounds (0-1, where 0 is softest and 1 is loudest)
    setVelocity(velocity) {
        if (velocity >= 0 && velocity <= 1) {
            this.velocity = velocity;
            console.log(`Piano velocity set to ${this.velocity}`);
        } else {
            console.warn(`Invalid velocity: ${velocity}. Must be between 0 and 1.`);
        }
    }
    
    // Create a Rhodes-like piano tone
    createRhodesTone(frequency, velocity = this.velocity) {
        // Create audio nodes
        const output = this.audioContext.createGain();
        output.gain.value = 0;
        output.connect(this.audioContext.destination);
        
        // Create oscillators for each harmonic
        const oscillators = this.settings.harmonics.map(harmonic => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = frequency * harmonic.number;
            
            // Create gain node for this harmonic
            const gain = this.audioContext.createGain();
            gain.gain.value = harmonic.gain * velocity;
            
            // Connect oscillator to its gain node, then to output
            osc.connect(gain);
            gain.connect(output);
            
            return { oscillator: osc, gain: gain };
        });
        
        // Add a very subtle noise just for the initial attack (reduced significantly)
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.value = 0.01 * velocity; // Reduced from 0.05 to 0.01
        
        const noise = this.audioContext.createBufferSource();
        const bufferSize = this.audioContext.sampleRate * 0.05; // Reduced from 0.1 to 0.05 (50ms of noise)
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Fill the buffer with noise - using a smoother noise profile
        for (let i = 0; i < bufferSize; i++) {
            // Apply an envelope to the noise to make it fade out quickly
            const envelope = 1 - (i / bufferSize);
            data[i] = (Math.random() * 2 - 1) * envelope * envelope;
        }
        
        noise.buffer = buffer;
        noise.connect(noiseGain);
        noiseGain.connect(output);
        
        // Apply ADSR envelope with smoother curves
        const now = this.audioContext.currentTime;
        output.gain.setValueAtTime(0, now);
        
        // Smoother attack curve
        output.gain.linearRampToValueAtTime(velocity, now + this.settings.attack);
        
        // Smoother decay curve
        output.gain.setTargetAtTime(
            velocity * this.settings.sustain, 
            now + this.settings.attack, 
            this.settings.decay / 3
        );
        
        // Start all oscillators and noise
        oscillators.forEach(osc => osc.oscillator.start());
        noise.start();
        
        return {
            output: output,
            oscillators: oscillators,
            noise: noise,
            start: now,
            stop: (releaseTime = this.settings.release) => {
                const stopTime = this.audioContext.currentTime;
                
                // Smoother release curve
                output.gain.cancelScheduledValues(stopTime);
                output.gain.setValueAtTime(output.gain.value, stopTime);
                output.gain.setTargetAtTime(0, stopTime, releaseTime / 3);
                
                // Stop oscillators after release
                setTimeout(() => {
                    oscillators.forEach(osc => {
                        try {
                            osc.oscillator.stop();
                        } catch (e) {
                            // Ignore errors if oscillator is already stopped
                        }
                    });
                    
                    try {
                        noise.stop();
                    } catch (e) {
                        // Ignore errors if noise is already stopped
                    }
                }, releaseTime * 1000 + 50); // Added small buffer to ensure complete fade-out
            }
        };
    }
    
    setupEventListeners() {
        // Log all piano key data-note attributes for inspection
        console.log('=== PIANO KEY DATA-NOTE ATTRIBUTES ===');
        this.pianoKeys.forEach(key => {
            console.log(`Key ID: ${key.id}, data-note: '${key.dataset.note}'`);
            
            // Check if there are any 'x' characters in the data-note attribute
            if (key.dataset.note && key.dataset.note.includes('x')) {
                console.warn(`WARNING: Key ${key.id} has 'x' in its data-note attribute: '${key.dataset.note}'`);
            }
            
            key.addEventListener('mousedown', () => this.handleKeyPress(key));
            key.addEventListener('mouseup', () => this.handleKeyRelease(key));
            key.addEventListener('mouseleave', () => this.handleKeyRelease(key));

            // Touch events for mobile devices
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleKeyPress(key);
            });
            key.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleKeyRelease(key);
            });
        });
        
        // Set up velocity slider
        const velocitySlider = document.getElementById('velocity-slider');
        const velocityValue = document.getElementById('velocity-value');
        
        if (velocitySlider && velocityValue) {
            // Update slider to use 0-1 range
            velocitySlider.min = 0;
            velocitySlider.max = 1;
            velocitySlider.step = 0.05;
            velocitySlider.value = this.velocity;
            velocityValue.textContent = this.velocity;
            
            velocitySlider.addEventListener('input', () => {
                const value = parseFloat(velocitySlider.value);
                velocityValue.textContent = value.toFixed(2);
                this.setVelocity(value);
            });
        }
    }
    
    handleKeyPress(key) {
        if (!key.classList.contains('active')) {
            key.classList.add('active');
            
            // Get the note directly from the dataset - ensure it's a clean value
            // This is the root source of the note data
            const noteValue = key.dataset.note;
            
            // Log the raw note data for debugging
            console.log(`[PIANO] Key pressed: ${key.id}, data-note: '${noteValue}'`);
            
            // Play the note with the clean value
            this.playNote(noteValue);
            
            // Pass the clean note to the callback
            this.onNotePlayed && this.onNotePlayed(noteValue);
        }
    }
    
    handleKeyRelease(key) {
        if (key.classList.contains('active')) {
            key.classList.remove('active');
            const note = key.dataset.note;
            this.stopNote(note);
        }
    }
    
    playNote(note) {
        // Ensure we have a clean note string
        const cleanNote = typeof note === 'string' ? note.trim() : note;
        
        // Log the note being played
        console.log(`[PIANO] Playing note: '${cleanNote}'`);
        
        // Stop the note if it's already playing
        if (this.activeNotes.has(cleanNote)) {
            this.stopNote(cleanNote);
        }
        
        // Convert note to frequency
        const frequency = this.noteToFrequency(cleanNote);
        if (!frequency) {
            console.warn(`[PIANO] Invalid note: '${cleanNote}'`);
            return false;
        }
        
        // Create and store the tone
        const tone = this.createRhodesTone(frequency);
        this.activeNotes.set(cleanNote, tone);
        
        return true;
    }
    
    stopNote(note) {
        // Ensure we have a clean note string
        const cleanNote = typeof note === 'string' ? note.trim() : note;
        
        if (this.activeNotes.has(cleanNote)) {
            const tone = this.activeNotes.get(cleanNote);
            tone.stop();
            this.activeNotes.delete(cleanNote);
        }
    }
    
    setNotePlayedCallback(callback) {
        this.onNotePlayed = callback;
    }
}

// Initialize piano when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.piano = new Piano();
}); 