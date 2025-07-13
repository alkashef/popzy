# Browser Shooter Game

A simple HTML5 canvas-based shooter game where you click to shoot targets and avoid friendlies.

## Features

- **Single-player shooter gameplay** with HTML5 Canvas
- **Dynamic object spawning** from screen edges
- **Two object types**: Targets (+1 point) and Friendlies (-1 point)
- **Real-time settings panel** with adjustable:
  - Game speed (0.5x - 3x)
  - Path randomness (0-1)
  - Spawn rate (10-120 objects/minute)
  - Object type toggles
  - Miss penalty (optional -1 point for targets that escape)
- **Live scoreboard** display
- **Image-based objects** using assets from target/ and friendly/ folders
- **Responsive design** that works on different screen sizes

## How to Run

### Option 1: Using npm (recommended)
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:8080
   ```

### Option 2: Using Python (if npm is not available)
1. **Start a simple HTTP server**:
   ```bash
   # Python 3
   python -m http.server 8080
   
   # Python 2
   python -m SimpleHTTPServer 8080
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:8080
   ```

### Option 3: Direct file opening
You can also open `index.html` directly in your browser, but some features may not work due to CORS restrictions.

## How to Play

- **Click** on objects to shoot them
- **Red circles** are targets (+1 point)
- **Blue circles** are friendlies (-1 point)
- **Settings panel** (top-right) allows you to customize gameplay
- **Score** is displayed in the top-left corner

## Game Controls

- **Left Mouse Click**: Shoot at objects
- **Settings Panel**: Adjust game parameters in real-time

## Asset Requirements

The game expects the following assets in the `assets/` folder:
- `target/` folder - Contains PNG images for target objects
- `friendly/` folder - Contains PNG images for friendly objects

The game will randomly select images from each folder for variety. If no images are found, the game will use colored circles as fallbacks.

## Technical Details

- **Pure vanilla JavaScript** with ES6 modules
- **No external libraries** for gameplay
- **Responsive canvas** that adapts to viewport size
- **60 FPS game loop** using requestAnimationFrame
- **Collision detection** using circle hit-testing
- **Image-based rendering** with fallback to colored circles
- **Real-time settings** that apply instantly

## File Structure

```
silly-game/
├── index.html          # Main HTML file
├── style.css           # Game styling
├── app.js              # Game logic
├── package.json        # Project configuration
├── README.md           # This file
└── assets/             # Game assets
    ├── target/         # Target images folder
    └── friendly/       # Friendly images folder
```

Enjoy the game! 