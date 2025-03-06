# Tone Puzzle - Music Training Game

A web-based music training game that helps users practice melodic pattern recognition and transposition skills through an intuitive, visually appealing interface.

## Features

- **Synthesized Rhodes Piano**: Uses the Web Audio API to create realistic Rhodes electric piano sounds without requiring audio samples.
- **Visual and Ear Modes**: Practice both reading and hearing melodic patterns with mode-specific interface optimizations.
- **Dark Theme**: Enhanced Ear Mode with a dark theme for better focus and reduced eye strain.
- **Sequence Transposition**: Learn to transpose melodic patterns to different starting notes.
- **Adjustable Piano Volume**: Control the volume/intensity of the piano sounds.
- **MIDI Keyboard Support**: Connect a MIDI keyboard to play notes and input answers.
- **Computer Keyboard Support**: Use your computer keyboard as a piano (Z-M for lower octave, Q-U for upper octave).
- **Progressive Level System**: Gradually increasing difficulty with sequence lengths from 2 to 13 notes across 12 major levels.
- **Responsive Design**: Works on desktop and mobile devices.
- **Intuitive UI/UX**: Carefully designed interface with consistent styling and smooth transitions.

## How to Play

1. Click the "Start Game" button to begin.
2. Use the toggle switch in the header to select between Visual Mode and Ear Mode.
3. In Visual Mode, you'll see the original sequence displayed at the top.
4. In Ear Mode (dark theme), you'll hear the sequence instead of seeing it.
5. Play the sequence on the piano, transposed to start from the highlighted starting note.
6. You can use the on-screen piano, a MIDI keyboard, or your computer keyboard to input notes.
7. You can replay the sequence up to 3 times in Ear Mode using the replay buttons.
8. Submit your answer to receive feedback and progress through the levels.
9. The game features a progressive level system with increasing difficulty.

## Level System

- The game features 12 major levels (1-12), each with 3 minor levels (1-3).
- Each major level increases the sequence length by one note.
- Level 1 starts with 2 notes and progresses up to 13 notes at Level 12.
- Complete all three minor levels to advance to the next major level.
- When completing a major level, the "Add one note!" button indicates progression to a longer sequence.
- The current level is displayed at the top of the screen.
- Complete Level 12-3 to win the game!

## Technical Details

The piano sounds are generated using the Web Audio API with the following characteristics:
- Multiple sine wave oscillators to create harmonics
- ADSR envelope (Attack, Decay, Sustain, Release) for realistic sound shaping
- Noise component for the characteristic Rhodes attack sound
- Adjustable velocity for dynamic expression

## Running the Game

Simply serve the files using any web server. For example:

```
python -m http.server 8080
```

Then access the game at http://localhost:8080

## UI/UX Features

- **Dual Mode Interface**: Seamlessly switch between Visual and Ear modes with a toggle in the header.
- **Dark Theme**: Automatic dark theme activation in Ear Mode for enhanced focus.
- **Consistent Color Scheme**: Coordinated color palette across both modes.
- **Visual Feedback**: Clear highlighting of starting notes and level completion.
- **Responsive Controls**: Intuitive button placement and interactive elements.
- **Smooth Transitions**: Elegant transitions between modes and game states.
- **Accessible Piano Interface**: Clearly labeled keys with mode-specific styling.
- **Score Tracking**: Prominently displayed score in the header.
- **Immediate Feedback**: Visual cues for correct and incorrect answers.

## Recent Updates

### Input Enhancements (March 2025)

- **MIDI Keyboard Support**: Added support for MIDI keyboards to play notes and input answers.
- **Computer Keyboard Support**: Implemented computer keyboard controls for playing the piano.
- **MIDI Status Indicator**: Added a status indicator that shows when a MIDI keyboard is connected.
- **Dynamic Velocity**: MIDI keyboard velocity is used to control note volume for expressive playing.

### UI/UX Enhancements (March 2025)

- **Improved Header Layout**: Relocated the mode toggle switch to the header between the Start Game button and Score display for better accessibility and workflow.
- **Consistent Sizing**: Standardized the size and styling of header elements (Start Game button, Mode Toggle, and Score display) for visual harmony.
- **Dark Theme Refinements**: Enhanced dark theme with consistent color schemes and improved visual feedback.
- **Note Visibility**: Optimized note label display in dark mode for better readability.
- **Interactive Elements**: Improved styling of buttons and controls with consistent hover effects and transitions.
- **Feedback System**: Enhanced visual feedback for level completion and correct/incorrect answers.

## Troubleshooting

If you're experiencing issues with audio playback:
1. Make sure your browser supports the Web Audio API.
2. Check that your device's audio is not muted.
3. Check the browser console for any error messages related to audio generation. 