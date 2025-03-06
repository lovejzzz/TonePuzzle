# Sequence Puzzle - Music Training Game

A web-based music training game that helps users practice melodic pattern recognition and transposition skills.

## Features

- **Synthesized Rhodes Piano**: Uses the Web Audio API to create realistic Rhodes electric piano sounds without requiring audio samples.
- **Visual and Ear Training Modes**: Practice both reading and hearing melodic patterns.
- **Sequence Transposition**: Learn to transpose melodic patterns to different starting notes.
- **Adjustable Piano Volume**: Control the volume/intensity of the piano sounds.
- **Responsive Design**: Works on desktop and mobile devices.

## How to Play

1. Click the "Start Game" button to begin.
2. In Visual Mode, you'll see the original sequence displayed at the top.
3. Play the sequence on the piano, transposed to start from the given starting note.
4. In Ear Training Mode, you'll hear the sequence instead of seeing it.
5. You can replay the sequence up to 3 times in Ear Training Mode.
6. Score points for correct sequences and lose points for incorrect ones.

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

## Game Features

- Visual and Ear Training modes
- Score tracking
- Sequence transposition practice
- Realistic piano interface
- Immediate feedback on performance

## Troubleshooting

If you're experiencing issues with audio playback:
1. Make sure your browser supports the Web Audio API.
2. Check that your device's audio is not muted.
3. Check the browser console for any error messages related to audio generation. 