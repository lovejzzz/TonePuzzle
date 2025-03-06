class SequencePuzzle {
    constructor() {
        this.majorLevel = 1; // Major level (1-12)
        this.minorLevel = 1; // Minor level (1-3)
        this.isEarTrainingMode = false;
        this.audioReplaysLeft = 3;
        this.currentSequence = [];
        this.userSequence = [];
        this.startNote = null;
        this.originalSequence = [];
        this.isPlaying = false; // Track if sequence is currently playing
        this.feedbackMessage = null; // For showing feedback messages
        this.playbackSpeed = 500; // Default playback speed in ms
        this.availableNotes = this.getAvailableNotes(); // All notes available on the keyboard
        this.hasStartedSequence = false; // Track if user has started entering a sequence
        this.emptyNoteBoxes = []; // Store references to empty note boxes for ear training mode
        this.sequenceLengthByLevel = this.getSequenceLengthByLevel(); // Map major level to sequence length
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.originalSequenceElement = document.getElementById('original-sequence');
        this.userSequenceElement = document.getElementById('user-sequence');
        this.scoreElement = document.getElementById('score');
        this.startButton = document.getElementById('start-game');
        this.modeSwitch = document.getElementById('mode-switch');
        this.replaySequenceButton = document.getElementById('replay-sequence');
        this.playUserSequenceButton = document.getElementById('play-user-sequence');
        this.submitSequenceButton = document.getElementById('submit-sequence');
        
        // Update score element to show level instead
        this.scoreElement.innerHTML = '<span id="level-display">1-1</span>';
        this.levelDisplayElement = document.getElementById('level-display');
        
        // Initially hide the submit button until the user has entered enough notes
        this.submitSequenceButton.style.display = 'none';
        
        // Create container for empty note boxes in ear training mode
        this.emptyBoxesContainer = document.createElement('div');
        this.emptyBoxesContainer.className = 'empty-boxes-container';
        this.originalSequenceElement.parentNode.insertBefore(this.emptyBoxesContainer, this.originalSequenceElement);
        
        // Create feedback message element
        this.feedbackElement = document.createElement('div');
        this.feedbackElement.className = 'feedback-message';
        document.querySelector('.game-area').appendChild(this.feedbackElement);
        
        // Create next button (initially hidden)
        this.nextButton = document.createElement('button');
        this.nextButton.id = 'next-button';
        this.nextButton.className = 'next-button';
        this.nextButton.textContent = 'Next';
        this.nextButton.style.display = 'none';
        this.nextButton.addEventListener('click', () => this.generateNewSequence());
        document.querySelector('.game-area').appendChild(this.nextButton);
        
        // Hide the replay audio button as it's no longer needed
        const replayAudioButton = document.getElementById('replay-audio');
        if (replayAudioButton) {
            replayAudioButton.style.display = 'none';
        }
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        
        // Mode toggle switch
        this.modeSwitch.addEventListener('change', () => this.toggleMode());
        
        // Replay button for original sequence
        this.replaySequenceButton.addEventListener('click', () => this.playOriginalSequence());
        
        // Play user sequence button
        this.playUserSequenceButton.addEventListener('click', () => this.playUserSequence());
        
        // Submit sequence button
        this.submitSequenceButton.addEventListener('click', () => this.checkSequence());
        
        // Set up note played callback with logging
        window.piano.setNotePlayedCallback((note) => {
            console.log(`[GAME] Note received from piano: '${note}'`);
            // Check if the note contains 'x' characters at this point
            if (note.includes('x')) {
                console.warn(`[GAME] 'x' detected in note from piano: '${note}'`);
            }
            this.handleNotePlayed(note);
        });
        
        // Add click event listener to user sequence for note deletion
        this.userSequenceElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('note') && e.target.classList.contains('user-note')) {
                this.deleteNote(e.target);
            }
        });
    }

    startGame() {
        // Change button text to "Restart" and add restart class for styling
        this.startButton.textContent = "Restart";
        this.startButton.classList.add('restart');
        
        // Reset the game state
        this.majorLevel = 1;
        this.minorLevel = 1;
        this.updateLevelDisplay();
        this.generateNewSequence();
        this.startButton.disabled = false;
        this.hasStartedSequence = false;
        
        // Hide the submit button when starting a new game
        this.submitSequenceButton.style.display = 'none';
        
        // Clear any previous starting note indicators
        this.clearStartingNoteIndicator();
        
        // Apply the current game mode display
        this.toggleMode();
        
        // Make sure to highlight the starting note in both modes
        this.highlightStartingNote();
        
        // Auto-play the sequence
        setTimeout(() => {
            this.playOriginalSequence();
        }, 500);
    }

    // Get sequence length based on major level
    getSequenceLengthByLevel() {
        // Map major level to sequence length
        // Starting with 2 notes at level 1, increasing by 1 note per major level
        const sequenceLengthMap = {};
        for (let i = 1; i <= 12; i++) {
            sequenceLengthMap[i] = Math.min(i + 1, 13); // Level 1 = 2 notes, Level 2 = 3 notes, etc., max 13 notes
        }
        return sequenceLengthMap;
    }
    
    generateNewSequence() {
        // Hide next button if it's visible
        this.nextButton.style.display = 'none';
        this.hideFeedback();
        this.hasStartedSequence = false;
        
        // Remove any previous starting note indicator
        this.clearStartingNoteIndicator();
        
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        
        // Choose a single octave for the original sequence
        const originalOctave = Math.random() < 0.5 ? 3 : 4;
        
        // Get the number of notes for the current level
        const sequenceLength = this.sequenceLengthByLevel[this.majorLevel];
        
        // No longer showing level notification at the beginning of each level
        // Just update the level display at the top
        
        // Generate original sequence with no repeated notes, all within the same octave
        this.originalSequence = [];
        const usedNotes = new Set(); // Track used notes to avoid repetition
        
        for (let i = 0; i < sequenceLength; i++) {
            let note;
            let attempts = 0;
            
            do {
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                note = `${randomNote}${originalOctave}`;
                attempts++;
                
                // If we've tried too many times, reset the used notes to avoid infinite loop
                if (attempts > 20) {
                    usedNotes.clear();
                    if (this.originalSequence.length > 0) {
                        usedNotes.add(this.originalSequence[this.originalSequence.length - 1]);
                    }
                }
            } while (usedNotes.has(note));
            
            this.originalSequence.push(note);
            usedNotes.add(note); // Mark this note as used
        }

        // Generate a valid starting note that ensures the transposed sequence fits within the two octaves
        if (!this.findValidStartingNote()) {
            // If no valid starting note was found, regenerate the sequence
            console.warn("No valid starting note found for the current sequence. Regenerating sequence...");
            this.generateNewSequence();
            return;
        }

        this.userSequence = [];
        this.displaySequence();
        this.audioReplaysLeft = 3;
        
        // Add a visual indicator for the starting note on the keyboard
        this.highlightStartingNote();
        
        // Reset playback speed to default
        this.playbackSpeed = 500;
        
        // Auto-play the sequence when generating a new one
        setTimeout(() => {
            if (this.isEarTrainingMode) {
                this.playOriginalSequence();
            } else {
                this.playOriginalSequence();
            }
        }, 500);
    }
    
    // Get all available notes on the keyboard
    getAvailableNotes() {
        const availableNotes = [];
        const keyElements = document.querySelectorAll('.piano-key');
        
        keyElements.forEach(key => {
            if (key.dataset.note) {
                availableNotes.push(key.dataset.note);
            }
        });
        
        return availableNotes;
    }

    // Find a valid starting note that ensures the transposed sequence fits within the available notes
    findValidStartingNote() {
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const validStartNotes = [];
        
        // Calculate the intervals from the first note to each note in the sequence
        const intervals = this.originalSequence.map(note => {
            const noteName = note.slice(0, -1);
            const noteIndex = notes.indexOf(noteName);
            
            const firstNoteName = this.originalSequence[0].slice(0, -1);
            const firstNoteIndex = notes.indexOf(firstNoteName);
            
            return noteIndex - firstNoteIndex;
        });
        
        // Check each possible starting note
        this.availableNotes.forEach(startNote => {
            // Skip if it's the same as the first note of the original sequence
            if (startNote === this.originalSequence[0]) {
                return;
            }
            
            const startNoteName = startNote.slice(0, -1);
            const startNoteOctave = parseInt(startNote.slice(-1));
            const startNoteIndex = notes.indexOf(startNoteName.replace('#', ''));
            
            // Check if all transposed notes would be within our available notes
            let allNotesAvailable = true;
            
            for (let i = 0; i < intervals.length; i++) {
                const interval = intervals[i];
                let transposedNoteIndex = startNoteIndex + interval;
                let transposedOctave = startNoteOctave;
                
                // Adjust for octave changes
                while (transposedNoteIndex >= notes.length) {
                    transposedNoteIndex -= notes.length;
                    transposedOctave++;
                }
                while (transposedNoteIndex < 0) {
                    transposedNoteIndex += notes.length;
                    transposedOctave--;
                }
                
                // Check if the transposed note is outside our octave range
                if (transposedOctave < 3 || transposedOctave > 4) {
                    allNotesAvailable = false;
                    break;
                }
                
                // Check if the note exists on our keyboard
                const transposedNoteName = notes[transposedNoteIndex];
                const transposedNote = `${transposedNoteName}${transposedOctave}`;
                const sharpTransposedNote = `${transposedNoteName}#${transposedOctave}`;
                
                // Check if either the natural or sharp version of the note is available
                if (!this.availableNotes.includes(transposedNote) && 
                    !this.availableNotes.includes(sharpTransposedNote)) {
                    allNotesAvailable = false;
                    break;
                }
            }
            
            if (allNotesAvailable) {
                validStartNotes.push(startNote);
            }
        });
        
        // Choose a random valid starting note
        if (validStartNotes.length > 0) {
            this.startNote = validStartNotes[Math.floor(Math.random() * validStartNotes.length)];
            return true;
        }
        
        return false;
    }

    displaySequence() {
        this.originalSequenceElement.innerHTML = '';
        this.userSequenceElement.innerHTML = '';
        
        if (!this.isEarTrainingMode) {
            this.originalSequence.forEach(note => {
                const noteElement = this.createNoteElement(note);
                
                // Make original sequence notes clickable
                noteElement.classList.add('clickable');
                noteElement.addEventListener('click', () => {
                    if (!this.isPlaying) {
                        this.playNoteWithVisualFeedback(note);
                    }
                });
                
                this.originalSequenceElement.appendChild(noteElement);
            });
        }

        // Display starting note - always show it regardless of mode
        const startNoteElement = this.createNoteElement(this.startNote, true);
        startNoteElement.classList.add('start-note');
        this.userSequenceElement.appendChild(startNoteElement);
    }

    createNoteElement(note, isUserNote = false) {
        const noteElement = document.createElement('div');
        
        // Ensure we have a clean note by trimming any whitespace
        const cleanNote = note.trim();
        
        // Log the note being processed
        console.log(`Creating note element for: '${cleanNote}'`);
        
        // Extract note name and octave from the clean note
        let noteName = cleanNote.slice(0, -1);
        const octave = cleanNote.slice(-1);
        
        let displayName = noteName;
        
        // Only apply enharmonic spelling for original sequence notes, not user notes
        if (!isUserNote && noteName.includes('#')) {
            // Convert sharp to flat of the next note
            const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(noteName);
            const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
            
            // Randomly choose between sharp and flat notation (50% chance each)
            if (Math.random() < 0.5) {
                displayName = flatNotes[noteIndex];
            }
        }
        
        noteElement.className = `note note-${noteName[0]}`;
        noteElement.dataset.note = noteName + octave; // Store the clean note name
        
        // Only add the enharmonic indicator class to original sequence notes, not user notes
        if (!isUserNote && noteName.includes('#')) {
            noteElement.classList.add('with-enharmonic-indicator');
        }
        
        // Create a container for the note text that will be used for all notes
        const noteTextSpan = document.createElement('span');
        noteTextSpan.classList.add('note-text');
        noteTextSpan.textContent = displayName + octave;
        
        // For original sequence notes, add the text directly to the note element
        if (!isUserNote) {
            noteElement.appendChild(noteTextSpan);
        }
        // For user notes, the text will be added to the note-body element later
        
        if (isUserNote) {
            noteElement.classList.add('user-note');
            
            // Make user notes clickable for playback
            noteElement.classList.add('clickable');
            
            // Create a note body element that will handle the click for playback
            const noteBody = document.createElement('div');
            noteBody.classList.add('note-body');
            noteBody.addEventListener('click', () => {
                if (!this.isPlaying) {
                    this.playNoteWithVisualFeedback(cleanNote);
                }
            });
            
            // Move the note text into the note body
            noteBody.appendChild(noteTextSpan);
            noteElement.appendChild(noteBody);
            
            // Add delete functionality only for user-added notes (not the starting note)
            if (this.userSequence.length > 1 || cleanNote !== this.startNote) {
                // Create the delete button as a separate element
                const deleteBtn = document.createElement('span');
                deleteBtn.classList.add('delete-note');
                deleteBtn.innerHTML = '×'; // Unicode multiplication symbol (U+00D7)
                deleteBtn.setAttribute('aria-label', 'Delete note');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteNote(noteElement);
                });
                noteElement.appendChild(deleteBtn);
            }
        }
        
        return noteElement;
    }

    handleNotePlayed(note) {
        // Don't proceed if we're currently playing a sequence
        if (this.isPlaying) {
            return;
        }
        
        // Log the note received for debugging
        console.log(`[GAME] handleNotePlayed received: '${note}'`);
        
        // Get the expected number of notes for the current level
        const expectedNoteCount = this.sequenceLengthByLevel[this.majorLevel];
        
        // Ensure we have a clean note by trimming any whitespace
        // We no longer need to remove 'x' characters as they're handled at the source
        const cleanNote = note.trim();
        
        // Log the processed note for debugging
        console.log(`[GAME] Note processed: '${cleanNote}'`);
        
        // Check if the note is within the available octaves (3 and 4)
        const noteOctave = parseInt(cleanNote.slice(-1));
        if (noteOctave < 3 || noteOctave > 5) { // Updated to include C5
            console.warn(`Note ${cleanNote} is outside the available octave range`);
            return; // Ignore notes outside the available range
        }
        
        // Don't add the starting note to the sequence when clicked
        if (cleanNote === this.startNote) {
            console.log(`[GAME] Starting note ${cleanNote} clicked - not adding to sequence`);
            // Play the note but don't add it to the sequence
            this.playNoteWithVisualFeedback(cleanNote);
            return;
        }
        
        // If we already have 3 notes (plus the start note = 4 total), don't add more
        // No longer automatically checking the sequence - user must click submit
        if (this.userSequence.length >= 3) {
            return;
        }
        
        // If this is the first note the user is playing after the starting note
        if (!this.hasStartedSequence) {
            // Clear the user sequence display but keep the starting note
            const startNoteElement = this.userSequenceElement.querySelector('.start-note');
            this.userSequenceElement.innerHTML = '';
            if (startNoteElement) {
                this.userSequenceElement.appendChild(startNoteElement);
            }
            
            // Mark that the user has started entering their sequence
            this.hasStartedSequence = true;
            this.userSequence = []; // Reset user sequence
        }
        
        // Add the CLEAN note to the user sequence
        this.userSequence.push(cleanNote);
        
        // Create and add the note element to the user sequence display
        const noteElement = this.createNoteElement(cleanNote, true); // Pass true to indicate this is a user note
        this.userSequenceElement.appendChild(noteElement);
        
        // Show the submit button only when the user has entered the correct number of notes for the current level
        // Expected sequence length minus 1 (starting note)
        const expectedInputCount = this.sequenceLengthByLevel[this.majorLevel] - 1;
        if (this.userSequence.length === expectedInputCount) {
            this.submitSequenceButton.style.display = 'block';
        } else {
            this.submitSequenceButton.style.display = 'none';
        }
    }
    
    // Delete a note from the user sequence
    deleteNote(noteElement) {
        // Don't allow deletion during playback or if it's the start note
        if (this.isPlaying || noteElement.classList.contains('start-note')) {
            return;
        }
        
        // Find the index of the note in the user sequence
        const noteIndex = Array.from(this.userSequenceElement.children).indexOf(noteElement);
        
        // If it's a user-added note (not the start note)
        if (noteIndex > 0 || (noteIndex === 0 && !noteElement.classList.contains('start-note'))) {
            // Remove from the DOM
            noteElement.remove();
            
            // Remove from the array (adjust index if there's a start note)
            const startNoteOffset = this.userSequenceElement.querySelector('.start-note') ? 1 : 0;
            this.userSequence.splice(noteIndex - startNoteOffset, 1);
            
            // Hide the submit button if we no longer have enough notes
            if (this.userSequence.length < 3) {
                this.submitSequenceButton.style.display = 'none';
            }
        }
    }

    checkSequence() {
        // Get the expected number of notes for the current level (minus the starting note)
        const expectedNoteCount = this.sequenceLengthByLevel[this.majorLevel] - 1;
        
        // Check if user has entered the correct number of notes
        if (this.userSequence.length !== expectedNoteCount) {
            return;
        }

        // Calculate the expected sequence based on the intervals of the original sequence
        const expectedSequence = this.calculateExpectedSequence();

        // Create a complete sequence including the starting note for logging purposes
        // Ensure the start note is clean
        const cleanStartNote = this.startNote.trim();
        
        // Create a clean user sequence array
        const cleanUserSequence = this.userSequence.map(note => note.trim());
        const completeUserSequence = [cleanStartNote, ...cleanUserSequence];
        
        // Display the complete sequence for feedback
        console.log("Complete user sequence:", completeUserSequence);
        console.log("Expected sequence with starting note:", [cleanStartNote, ...expectedSequence]);

        // Compare the user's sequence with the expected sequence
        const isCorrect = cleanUserSequence.length === expectedSequence.length &&
            cleanUserSequence.every((note, index) => {
                // Compare note names (ignoring octave for edge cases)
                const userNoteName = note.slice(0, -1);
                const expectedNoteName = expectedSequence[index].slice(0, -1);
                
                console.log(`Comparing user note ${userNoteName} with expected note ${expectedNoteName}`);
                
                // Handle enharmonic equivalents (e.g., C# = Db)
                return this.areEnharmonicEquivalents(userNoteName, expectedNoteName);
            });

        console.log("Sequence is correct:", isCorrect);

        if (isCorrect) {
            // Increase minor level first
            this.minorLevel += 1;
            
            // If minor level exceeds 3, increase major level and reset minor level
            if (this.minorLevel > 3) {
                this.majorLevel += 1;
                this.minorLevel = 1;
            }
            
            // Check if player has won the game (completed level 12-3)
            if (this.majorLevel > 12 || (this.majorLevel === 12 && this.minorLevel > 3)) {
                this.showFeedback("Congratulations! You've completed all levels!", "success");
                this.majorLevel = 12;
                this.minorLevel = 3;
                
                // Show play again button
                setTimeout(() => {
                    this.nextButton.textContent = "Play Again";
                    this.nextButton.style.display = 'block';
                    this.nextButton.onclick = () => this.startGame();
                    
                    // Position the next button below the feedback message
                    const feedbackRect = this.feedbackElement.getBoundingClientRect();
                    this.nextButton.style.top = (feedbackRect.bottom + 10) + 'px';
                }, 1000);
                
                return;
            }
            
            // Update level display
            this.updateLevelDisplay();
            
            // Show success message
            const completedMajor = this.minorLevel === 1 ? this.majorLevel - 1 : this.majorLevel;
            const completedMinor = this.minorLevel === 1 ? 3 : this.minorLevel - 1;
            
            // Get the sequence length for the next level
            const nextSequenceLength = this.sequenceLengthByLevel[this.majorLevel];
            const prevSequenceLength = this.minorLevel === 1 ? this.sequenceLengthByLevel[this.majorLevel - 1] : nextSequenceLength;
            
            // Check if we're moving to a new sequence length
            const isNewSequenceLength = nextSequenceLength > prevSequenceLength;
            
            // Show appropriate feedback message
            if (isNewSequenceLength && this.minorLevel === 1 && this.majorLevel > 1) {
                this.showFeedback(`Level ${completedMajor} completed!`, "success");
                // Change button text to indicate adding a note when completing a major level
                this.nextButton.textContent = 'Add one note!';
            } else {
                this.showFeedback(`Level ${completedMajor}-${completedMinor} completed!`, "success");
                // Use standard Next text for minor level completions
                this.nextButton.textContent = 'Next';
            }
            
            // Speed up playback for the demonstration
            this.playbackSpeed = 250; // Twice as fast
            
            // Play both sequences back-to-back
            setTimeout(() => {
                this.playBothSequences().then(() => {
                    // Show the next button instead of automatically generating a new sequence
                    this.nextButton.style.display = 'block';
                    
                    // Position the next button below the feedback message
                    const feedbackRect = this.feedbackElement.getBoundingClientRect();
                    this.nextButton.style.top = (feedbackRect.bottom + 10) + 'px';
                });
            }, 1000);
        } else {
            // Game over - reset to level 1-1
            this.majorLevel = 1;
            this.minorLevel = 1;
            this.updateLevelDisplay();
            this.showFeedback("Game Over! Starting over from level 1-1", "error");
            
            setTimeout(() => {
                this.userSequence = [];
                this.hasStartedSequence = false;
                this.displaySequence();
                this.hideFeedback();
            }, 2000);
        }
    }
    
    // Calculate the expected sequence based on the intervals of the original sequence
    calculateExpectedSequence() {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // We need to calculate the expected sequence without the starting note first
        const expectedSequence = [];
        
        // Calculate the intervals between consecutive notes in the original sequence
        for (let i = 1; i < this.originalSequence.length; i++) {
            const prevOriginalNote = this.originalSequence[i-1];
            const currentOriginalNote = this.originalSequence[i];
            
            // Calculate the interval (in semitones)
            const semitoneInterval = this.getSemitoneInterval(prevOriginalNote, currentOriginalNote);
            
            // For the first note, apply the interval to the starting note
            if (i === 1) {
                const startNoteName = this.startNote.slice(0, -1);
                const startOctave = parseInt(this.startNote.slice(-1));
                
                // Find the index of the starting note in the chromatic scale
                let startNoteIndex = notes.indexOf(startNoteName);
                if (startNoteIndex === -1) {
                    // Handle enharmonic equivalents (e.g., Db -> C#)
                    startNoteIndex = notes.indexOf(this.getEnharmonicEquivalent(startNoteName));
                }
                
                // Calculate the new note index
                let newNoteIndex = startNoteIndex + semitoneInterval;
                let newOctave = startOctave;
                
                // Handle octave changes
                while (newNoteIndex >= notes.length) {
                    newNoteIndex -= notes.length;
                    newOctave++;
                }
                while (newNoteIndex < 0) {
                    newNoteIndex += notes.length;
                    newOctave--;
                }
                
                // Create the new note
                const newNote = `${notes[newNoteIndex]}${newOctave}`;
                expectedSequence.push(newNote);
            } else {
                // For subsequent notes, apply the interval to the previous note in the expected sequence
                const prevExpectedNote = expectedSequence[i-2]; // i-2 because we're not including the starting note in expectedSequence
                const prevExpectedNoteName = prevExpectedNote.slice(0, -1);
                const prevExpectedOctave = parseInt(prevExpectedNote.slice(-1));
                
                // Find the index of the previous note in the chromatic scale
                let prevNoteIndex = notes.indexOf(prevExpectedNoteName);
                if (prevNoteIndex === -1) {
                    // Handle enharmonic equivalents (e.g., Db -> C#)
                    prevNoteIndex = notes.indexOf(this.getEnharmonicEquivalent(prevExpectedNoteName));
                }
                
                // Calculate the new note index
                let newNoteIndex = prevNoteIndex + semitoneInterval;
                let newOctave = prevExpectedOctave;
                
                // Handle octave changes
                while (newNoteIndex >= notes.length) {
                    newNoteIndex -= notes.length;
                    newOctave++;
                }
                while (newNoteIndex < 0) {
                    newNoteIndex += notes.length;
                    newOctave--;
                }
                
                // Create the new note
                const newNote = `${notes[newNoteIndex]}${newOctave}`;
                expectedSequence.push(newNote);
            }
        }
        
        // Log the expected sequence for debugging
        console.log("Original sequence:", this.originalSequence);
        console.log("Starting note:", this.startNote);
        console.log("Expected sequence (without starting note):", expectedSequence);
        
        return expectedSequence;
    }
    
    // Calculate the interval in semitones between two notes
    getSemitoneInterval(note1, note2) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        const note1Name = note1.slice(0, -1);
        const note2Name = note2.slice(0, -1);
        const note1Octave = parseInt(note1.slice(-1));
        const note2Octave = parseInt(note2.slice(-1));
        
        let note1Index = notes.indexOf(note1Name);
        let note2Index = notes.indexOf(note2Name);
        
        // Calculate the semitone difference
        let semitones = note2Index - note1Index;
        
        // Add octave difference (12 semitones per octave)
        semitones += (note2Octave - note1Octave) * 12;
        
        return semitones;
    }
    
    // Check if two note names are enharmonic equivalents
    areEnharmonicEquivalents(note1, note2) {
        // Clean up note names by removing any 'x' characters
        note1 = note1.replace(/x/g, '');
        note2 = note2.replace(/x/g, '');
        
        // If the notes are exactly the same, they're equivalent
        if (note1 === note2) return true;
        
        // Define enharmonic equivalents
        const enharmonics = {
            'C#': 'Db', 'Db': 'C#',
            'D#': 'Eb', 'Eb': 'D#',
            'F#': 'Gb', 'Gb': 'F#',
            'G#': 'Ab', 'Ab': 'G#',
            'A#': 'Bb', 'Bb': 'A#'
        };
        
        // Check if one note is the enharmonic equivalent of the other
        return enharmonics[note1] === note2 || enharmonics[note2] === note1;
    }
    
    // Get the enharmonic equivalent of a note name
    getEnharmonicEquivalent(noteName) {
        // Clean up note name by removing any 'x' characters
        noteName = noteName.replace(/x/g, '');
        
        const enharmonics = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
            'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
        };
        
        return enharmonics[noteName] || noteName;
    }

    updateLevelDisplay() {
        this.levelDisplayElement.textContent = `${this.majorLevel}-${this.minorLevel}`;
    }

    toggleMode() {
        this.isEarTrainingMode = this.modeSwitch.checked;
        
        if (this.isEarTrainingMode) {
            // Enable dark theme for Ear Mode
            document.body.classList.add('dark-theme');
            
            this.originalSequenceElement.style.display = 'none';
            this.emptyBoxesContainer.style.display = 'flex';
            // Create empty note boxes for ear training mode
            this.createEmptyNoteBoxes();
            // Make sure to display the starting note in ear training mode too
            this.displaySequence();
            
            // Only auto-play when switching to ear training mode if the next button is not visible
            // This prevents auto-playing after level completion when the next button is shown
            if (this.originalSequence.length > 0 && this.nextButton.style.display !== 'block') {
                this.playOriginalSequence();
            }
        } else {
            // Disable dark theme for Visual Mode
            document.body.classList.remove('dark-theme');
            
            this.originalSequenceElement.style.display = 'flex';
            this.emptyBoxesContainer.style.display = 'none';
            this.displaySequence();
        }
    }

    // Create empty note boxes for ear training mode
    createEmptyNoteBoxes() {
        // Clear any existing empty boxes
        this.emptyBoxesContainer.innerHTML = '';
        this.emptyNoteBoxes = [];
        
        // Create 4 empty note boxes
        for (let i = 0; i < 4; i++) {
            const emptyBox = document.createElement('div');
            emptyBox.className = 'empty-note-box';
            this.emptyBoxesContainer.appendChild(emptyBox);
            this.emptyNoteBoxes.push(emptyBox);
        }
    }
    
    // Play only the original sequence (without the start note)
    async playOriginalSequence() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        // Play sequence
        for (let i = 0; i < this.originalSequence.length; i++) {
            const note = this.originalSequence[i];
            
            // In ear training mode, blink the corresponding empty box
            if (this.isEarTrainingMode && this.emptyNoteBoxes.length > i) {
                this.emptyNoteBoxes[i].classList.add('blinking');
                await this.playNote(note, false); // Don't show key press in ear training mode
                this.emptyNoteBoxes[i].classList.remove('blinking');
            } else {
                await this.playNote(note);
            }
        }
        
        // In ear training mode, make sure to highlight the starting note
        if (this.isEarTrainingMode) {
            this.highlightStartingNote();
        }
        
        this.isPlaying = false;
    }
    
    // Play a single note with visual feedback on the piano
    async playNoteWithVisualFeedback(note) {
        const cleanNote = note.trim();
        console.log(`Playing single note with feedback: '${cleanNote}'`);
        
        // Find the key element for this note
        const keyElements = Array.from(document.querySelectorAll('.piano-key'));
        const keyElement = keyElements.find(key => key.dataset.note === cleanNote);
        
        if (keyElement) {
            // Add playing class for visual feedback
            keyElement.classList.add('playing', 'active');
            
            // Play the note
            window.piano.playNote(cleanNote);
            
            // Remove the visual feedback after a short delay
            setTimeout(() => {
                window.piano.stopNote(cleanNote);
                keyElement.classList.remove('playing', 'active');
            }, 300); // Shorter duration for single note playback
        }
    }
    
    // Play only the user sequence
    async playUserSequence() {
        if (this.isPlaying || this.userSequence.length === 0) return;
        this.isPlaying = true;
        
        console.log('Playing user sequence with start note:', this.startNote, this.userSequence);
        
        // First play the starting note if it exists
        if (this.startNote) {
            const cleanStartNote = this.startNote.trim();
            await this.playNote(cleanStartNote);
        }
        
        // Then play the user sequence
        for (const note of this.userSequence) {
            const cleanNote = note.trim();
            console.log(`Playing user note: '${cleanNote}'`);
            await this.playNote(cleanNote);
        }
        
        this.isPlaying = false;
    }
    
    // Play both the original sequence and the user's sequence back-to-back
    async playBothSequences() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        console.log('Playing original sequence:', this.originalSequence);
        // First play the original sequence
        for (const note of this.originalSequence) {
            // Ensure the note is clean
            const cleanOriginalNote = note.trim();
            await this.playNote(cleanOriginalNote);
        }
        
        // No pause between sequences - removed the delay for seamless playback
        
        console.log('Playing user sequence with start note:', this.startNote, this.userSequence);
        // Then play the complete user sequence including the starting note
        const cleanStartNote = this.startNote.trim();
        await this.playNote(cleanStartNote);
        
        // Then play the rest of the user's sequence
        for (const note of this.userSequence) {
            // Ensure the note is clean
            const cleanNote = note.trim();
            console.log(`Playing user note: '${cleanNote}'`);
            await this.playNote(cleanNote);
        }
        
        this.isPlaying = false;
    }

    async playNote(note, showKeyPress = true) {
        // Ensure the note is clean by trimming any whitespace
        const cleanNote = note.trim();
        console.log(`Playing note: '${cleanNote}'`);
        note = cleanNote; // Replace the original note with the clean version
        return new Promise(resolve => {
            // Find the key element for this note
            const keyElements = Array.from(document.querySelectorAll('.piano-key'));
            const keyElement = keyElements.find(key => key.dataset.note === note);
            
            if (keyElement) {
                // Add playing class for visual feedback only if not in ear training mode or if explicitly requested
                if (showKeyPress) {
                    keyElement.classList.add('playing', 'active');
                }
                
                // Play the note
                window.piano.playNote(note);
                
                // Add a delay between notes
                setTimeout(() => {
                    // Stop the note after the delay to prevent overlap
                    window.piano.stopNote(note);
                    if (showKeyPress) {
                        keyElement.classList.remove('playing', 'active');
                    }
                    resolve();
                }, this.playbackSpeed);
            } else {
                console.warn(`Key element for note ${note} not found`);
                resolve();
            }
        });
    }

    showFeedback(message, type) {
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = `feedback-message ${type}`;
        this.feedbackElement.style.display = 'block';
    }
    
    hideFeedback() {
        this.feedbackElement.style.display = 'none';
    }

    // Add a visual indicator to the starting note on the keyboard
    highlightStartingNote() {
        // Find the key element for the starting note
        const keyElements = Array.from(document.querySelectorAll('.piano-key'));
        const startKeyElement = keyElements.find(key => key.dataset.note === this.startNote);
        
        if (startKeyElement) {
            // Add a class to indicate this is the starting note
            startKeyElement.classList.add('starting-note');
        }
    }
    
    // Remove the starting note indicator from all keys
    clearStartingNoteIndicator() {
        const keyElements = document.querySelectorAll('.piano-key');
        keyElements.forEach(key => {
            key.classList.remove('starting-note');
        });
    }
}

// Initialize game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SequencePuzzle();
}); 