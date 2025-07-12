// Game constants and configuration
const GAME_CONFIG = {
    // Default settings
    DEFAULT_SPEED: 1.0,
    DEFAULT_RANDOMNESS: 0.5,
    DEFAULT_SPAWN_RATE: 60, // objects per minute
    DEFAULT_TARGETS_ENABLED: true,
    DEFAULT_FRIENDLIES_ENABLED: true,
    DEFAULT_OBJECT_SIZE: 20,
    DEFAULT_RATIO: 0.5, // 0 = all friendlies, 1 = all targets
    DEFAULT_PLAYER_NAME: '',
    DEFAULT_TARGET_WORDS: '2 4 6 8 10',
    DEFAULT_FRIENDLY_WORDS: '1 3 5 7 9',
    DEFAULT_TARGET_COLOR: '#ff4444',
    DEFAULT_FRIENDLY_COLOR: '#4444ff',
    // Object properties
    BASE_SPEED: 100, // pixels per second
    SPAWN_MARGIN: 50, // pixels from edge
    // Asset paths
    ASSETS: {
        TARGET_FOLDER: 'assets/target/',
        FRIENDLY_FOLDER: 'assets/friendly/'
    }
};

// Game state
let canvas, ctx;
let gameObjects = [];
let score = 0;
let lastSpawnTime = Date.now();
let gameConfig = {
    speed: GAME_CONFIG.DEFAULT_SPEED,
    randomness: GAME_CONFIG.DEFAULT_RANDOMNESS,
    spawnRate: GAME_CONFIG.DEFAULT_SPAWN_RATE,
    targetsEnabled: GAME_CONFIG.DEFAULT_TARGETS_ENABLED,
    friendliesEnabled: GAME_CONFIG.DEFAULT_FRIENDLIES_ENABLED,
    objectSize: GAME_CONFIG.DEFAULT_OBJECT_SIZE,
    ratio: GAME_CONFIG.DEFAULT_RATIO,
    playerName: GAME_CONFIG.DEFAULT_PLAYER_NAME,
    targetWords: GAME_CONFIG.DEFAULT_TARGET_WORDS,
    friendlyWords: GAME_CONFIG.DEFAULT_FRIENDLY_WORDS,
    targetColor: GAME_CONFIG.DEFAULT_TARGET_COLOR,
    friendlyColor: GAME_CONFIG.DEFAULT_FRIENDLY_COLOR
};
let targetImages = [];
let friendlyImages = [];

let gameStarted = false;
let gameStartTime = 0;
let totalPausedTime = 0;
let pauseStartTime = 0;
let lastTimestamp;

// Update UI to match current settings
function updateSettingsUI() {
    // Update all UI elements to match current gameConfig values
    document.getElementById('speed').value = gameConfig.speed;
    document.getElementById('speed-value').textContent = `${gameConfig.speed.toFixed(1)}x`;
    
    document.getElementById('randomness').value = gameConfig.randomness;
    document.getElementById('randomness-value').textContent = gameConfig.randomness.toFixed(1);
    
    document.getElementById('spawnRate').value = gameConfig.spawnRate;
    document.getElementById('spawnRate-value').textContent = gameConfig.spawnRate;
    
    document.getElementById('object-size').value = gameConfig.objectSize;
    document.getElementById('object-size-value').textContent = gameConfig.objectSize;
    
    document.getElementById('ratio').value = gameConfig.ratio;
    document.getElementById('ratio-value').textContent = gameConfig.ratio.toFixed(2);
    
    document.getElementById('player-name').value = gameConfig.playerName || '';
    document.getElementById('target-words').value = gameConfig.targetWords || '';
    document.getElementById('friendly-words').value = gameConfig.friendlyWords || '';
    
    // Set color picker values
    document.getElementById('target-color').value = gameConfig.targetColor;
    document.getElementById('friendly-color').value = gameConfig.friendlyColor;
    
    updatePlayerNameDisplay();
}

// Initialize the game
async function init() {
    console.log('Initializing game...');
    
    setupCanvas();
    await loadAssets();
    
    updateSettingsUI();
    setupEventListeners();
    
    // Start the game loop (but don't spawn objects until play is pressed)
    gameLoop();
    
    console.log('Game initialization complete');
}

// Setup canvas and context
function setupCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size to viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Make sure canvas doesn't block click events when the game is not started
    if (canvas && !gameStarted) {
        canvas.style.pointerEvents = 'none';
    }
}

// Load game assets
async function loadAssets() {
    console.log('Loading assets...');
    
    try {
        // Load target images
        targetImages = await loadImagesFromFolder(GAME_CONFIG.ASSETS.TARGET_FOLDER);
        console.log(`Loaded ${targetImages.length} target images`);
        
        // Load friendly images
        friendlyImages = await loadImagesFromFolder(GAME_CONFIG.ASSETS.FRIENDLY_FOLDER);
        console.log(`Loaded ${friendlyImages.length} friendly images`);
        
        console.log('Assets loaded successfully');
    } catch (error) {
        console.warn('Some assets failed to load, using fallbacks:', error);
        // Continue with fallback rendering
    }
    
        // Always ensure both object types are enabled
    gameConfig.targetsEnabled = true;
    gameConfig.friendliesEnabled = true;
    
    console.log('Asset loading complete. Game config:', gameConfig);
}

// Load images from folder helper
async function loadImagesFromFolder(folderPath) {
    const images = [];
    
    try {
        // For friendly folder, load actual images
        if (folderPath === GAME_CONFIG.ASSETS.FRIENDLY_FOLDER) {
            const imagePath = folderPath + 'unicorn_256.png';
            const image = await loadImage(imagePath);
            images.push(image);
            console.log(`Loaded image from ${imagePath}`);
        } else {
            // For other folders, we'll still use fallback circles for now
            console.log(`Using fallback circles for ${folderPath}`);
        }
    } catch (error) {
        console.warn('Failed to load images from folder:', error);
    }
    
    return images;
}

// Load single image helper
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Play button click
    const playButton = document.getElementById('play-button');
    if (playButton) {
        // Use a more explicit event handler to debug any issues
        playButton.addEventListener('click', function(event) {
            console.log('Play button clicked!');
            startGame();
        });
        // Also add event listeners for mouseover to verify button is interactive
        playButton.addEventListener('mouseover', function() {
            console.log('Play button mouseover');
        });
    } else {
        console.error('Play button not found!');
    }

    // Pause button
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.addEventListener('click', pauseGame);
    }
    // Stop button
    const stopButton = document.getElementById('stop-button');
    if (stopButton) {
        stopButton.addEventListener('click', stopGame);
    }

    // Mouse click for shooting (only when game is started)
    canvas.addEventListener('click', handleClick);

    // Settings controls
    document.getElementById('speed').addEventListener('input', updateSpeed);
    document.getElementById('randomness').addEventListener('input', updateRandomness);
    document.getElementById('spawnRate').addEventListener('input', updateSpawnRate);

    // Object size
    document.getElementById('object-size').addEventListener('input', updateObjectSize);
    // Ratio
    document.getElementById('ratio').addEventListener('input', updateRatio);
    // Player name
    document.getElementById('player-name').addEventListener('input', updatePlayerName);
    // Target words
    document.getElementById('target-words').addEventListener('input', updateTargetWords);
    // Friendly words
    document.getElementById('friendly-words').addEventListener('input', updateFriendlyWords);

    // Background image selector
    document.getElementById('background-image').addEventListener('change', updateBackgroundImage);

    // Color pickers
    document.getElementById('target-color').addEventListener('input', updateTargetColor);
    document.getElementById('friendly-color').addEventListener('input', updateFriendlyColor);
    
    // Initialize color presets
    setupColorPresets();

    console.log('All event listeners set up');
}
// Background image logic
let backgroundImage = null;
function updateBackgroundImage(event) {
    const file = event.target.files[0];
    if (!file) {
        backgroundImage = null;
        document.body.style.backgroundImage = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        backgroundImage = new window.Image();
        backgroundImage.src = e.target.result;
        // Set as body background for visual effect
        document.body.style.backgroundImage = `url('${e.target.result}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center';
    };
    reader.readAsDataURL(file);
}

// Start the game
function startGame() {
    console.log('startGame() called');

    // Check if DOM elements exist
    const overlayCheck = document.getElementById('play-overlay');
    const gameOverOverlayCheck = document.getElementById('game-over-overlay');
    console.log('DOM check:', {
        overlay: overlayCheck ? 'found' : 'missing',
        gameOverOverlay: gameOverOverlayCheck ? 'found' : 'missing',
        canvas: canvas ? 'found' : 'missing'
    });

    gameStarted = true;
    gamePaused = false;
    gameStartTime = Date.now();
    totalPausedTime = 0;
    pauseStartTime = 0;
    
    // Hide the play overlay
    const overlay = document.getElementById('play-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        console.log('Play overlay hidden');
    } else {
        console.error('Play overlay element not found!');
    }
    
    // Hide the game over overlay
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) {
        gameOverOverlay.classList.add('hidden');
        console.log('Game over overlay hidden');
    }

    // Reset game state
    gameObjects = [];
    score = 0;
    lastSpawnTime = 0; // Reset to 0 to force immediate spawn
    updateScoreDisplay();
    updateTimer();
    updatePlayerNameDisplay();

    // Ensure canvas is properly sized
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Enable pointer events on the canvas now that the game is starting
    if (canvas) {
        canvas.style.pointerEvents = 'auto';
    }

    // Start the game loop if not already running
    lastTimestamp = undefined;
    requestAnimationFrame(gameLoop);

    console.log('Game started!', {
        gameStarted,
        gamePaused,
        canvasSize: `${canvas.width}x${canvas.height}`
    });
}

let gamePaused = false;
function pauseGame() {
    if (!gameStarted) return;
    
    if (!gamePaused) {
        // Pausing the game
        pauseStartTime = Date.now();
    } else {
        // Resuming the game - add the pause duration to totalPausedTime
        totalPausedTime += (Date.now() - pauseStartTime);
    }
    
    gamePaused = !gamePaused;
    
    // Update pause button to show correct icon
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        if (gamePaused) {
            pauseButton.innerHTML = '▶️'; // Play icon
            pauseButton.title = 'Resume';
        } else {
            pauseButton.innerHTML = '⏸️'; // Pause icon
            pauseButton.title = 'Pause';
            lastTimestamp = undefined;
            requestAnimationFrame(gameLoop);
        }
    }
}

// Game loop function is defined further down
function stopGame() {
    if (!gameStarted) return;
    
    // Calculate game duration (accounting for paused time)
    const endTime = Date.now();
    const pauseTimeToAdd = gamePaused ? (endTime - pauseStartTime) : 0;
    const durationMs = endTime - gameStartTime - totalPausedTime - pauseTimeToAdd;
    const duration = formatDuration(durationMs);
    const player = gameConfig.playerName || 'Anonymous';

    // Show game over in the middle of the screen
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalPlayerName = document.getElementById('final-player-name');
    const finalScore = document.getElementById('final-score');
    
    if (gameOverOverlay) {
        gameOverOverlay.classList.remove('hidden');
        if (finalPlayerName) finalPlayerName.textContent = `Player: ${player}`;
        if (finalScore) finalScore.textContent = `Score: ${score}`;
    }

    gameStarted = false;
    gamePaused = false;
    gameObjects = [];
    updateScoreDisplay();
    updateTimer();
    updatePlayerNameDisplay();
    
    // Reset pause button if needed
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.innerHTML = '⏸️';
        pauseButton.title = 'Pause';
    }
    
    // Show play button overlay
    const overlay = document.getElementById('play-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Spawn a new game object
function spawnObject() {
    if (!gameStarted || gamePaused) {
        // Don't spawn objects until game is started and not paused
        return;
    }

    const now = Date.now();
    const spawnInterval = (60 / gameConfig.spawnRate) * 1000; // Convert to milliseconds

    if (now - lastSpawnTime < spawnInterval) {
        return;
    }

    // Determine object type using ratio
    // Both object types are always enabled now, so we just use the ratio
    const type = Math.random() < gameConfig.ratio ? 'target' : 'friendly';

    // Determine spawn edge (0: top, 1: right, 2: bottom, 3: left)
    const edge = Math.floor(Math.random() * 4);

    // Calculate spawn position
    let x, y;
    const margin = GAME_CONFIG.SPAWN_MARGIN;

    switch (edge) {
        case 0: // top
            x = Math.random() * canvas.width;
            y = -gameConfig.objectSize;
            break;
        case 1: // right
            x = canvas.width + gameConfig.objectSize;
            y = Math.random() * canvas.height;
            break;
        case 2: // bottom
            x = Math.random() * canvas.width;
            y = canvas.height + gameConfig.objectSize;
            break;
        case 3: // left
            x = -gameConfig.objectSize;
            y = Math.random() * canvas.height;
            break;
    }

    // Calculate velocity with randomness
    const baseSpeed = GAME_CONFIG.BASE_SPEED * gameConfig.speed;
    const randomness = gameConfig.randomness;

    // Target position (opposite side of screen)
    const targetX = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * randomness;
    const targetY = canvas.height / 2 + (Math.random() - 0.5) * canvas.height * randomness;

    // Calculate direction vector
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize and apply speed
    const vx = (dx / distance) * baseSpeed;
    const vy = (dy / distance) * baseSpeed;

    // Create object
    const object = {
        x, y, vx, vy, type, radius: gameConfig.objectSize,
        points: type === 'target' ? 1 : -1
    };

    // For targets, add a random word from the target words list
    if (type === 'target' && gameConfig.targetWords) {
        const words = gameConfig.targetWords.trim().split(/\s+/);
        if (words.length > 0 && words[0] !== '') {
            const randomIndex = Math.floor(Math.random() * words.length);
            object.word = words[randomIndex];
        }
    }
    
    // For friendlies, randomly choose between image or word
    if (type === 'friendly') {
        const useFriendlyImage = friendlyImages.length > 0 && Math.random() < 0.5;
        
        if (useFriendlyImage) {
            // Use an image for this friendly object
            object.image = friendlyImages[Math.floor(Math.random() * friendlyImages.length)];
            object.isFriendlyImage = true;  // Flag to identify image-based friendlies
        } else if (gameConfig.friendlyWords) {
            // Use a word for this friendly object
            const words = gameConfig.friendlyWords.trim().split(/\s+/);
            if (words.length > 0 && words[0] !== '') {
                const randomIndex = Math.floor(Math.random() * words.length);
                object.word = words[randomIndex];
            }
        }
    }

    gameObjects.push(object);
    lastSpawnTime = now;
}

// Handle mouse click (shooting)
function handleClick(event) {
    if (!gameStarted) return; // Don't handle clicks until game is started

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check collision with objects (back to front for proper hit detection)
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const object = gameObjects[i];
        const distance = Math.sqrt(
            Math.pow(clickX - object.x, 2) + Math.pow(clickY - object.y, 2)
        );

        if (distance <= object.radius) {
            // Hit! Handle based on object type
            gameObjects.splice(i, 1);
            
            // Game over if a friendly image is hit
            if (object.isFriendlyImage) {
                // Show game over message with "Don't shoot the unicorn!" message
                stopGame();
                const gameOverMsg = document.querySelector('.game-over-message');
                if (gameOverMsg) {
                    gameOverMsg.textContent = "Don't shoot the friendly images!";
                }
                return;
            } else {
                // Otherwise update score based on object points
                score += object.points;
                updateScoreDisplay();
                
                // End game if score < 0
                if (score < 0) {
                    stopGame();
                }
            }
            break;
        }
    }
}



// Update score display
function updateScoreDisplay() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Update timer display
function updateTimer() {
    if (!gameStarted) {
        document.getElementById('timer').textContent = '00:00';
        return;
    }
    
    let elapsed;
    if (gamePaused) {
        // If game is paused, use the time when pause started minus total previous paused time
        elapsed = pauseStartTime - gameStartTime - totalPausedTime;
    } else {
        // If game is running, use current time minus start time minus total paused time
        elapsed = Date.now() - gameStartTime - totalPausedTime;
    }
    
    const minutes = Math.floor(elapsed / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = timeString;
    
    // Debug timer less frequently
    if (seconds % 15 === 0 && seconds > 0 && minutes % 2 === 0) {
        console.log('Timer update:', { elapsed, timeString });
    }
}

// Update game objects
function updateObjects(deltaTime) {
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const object = gameObjects[i];
        
        // Update position
        object.x += object.vx * (deltaTime / 1000);
        object.y += object.vy * (deltaTime / 1000);
        
        // Remove if off screen
        const margin = GAME_CONFIG.OBJECT_RADIUS * 2;
        if (object.x < -margin || object.x > canvas.width + margin ||
            object.y < -margin || object.y > canvas.height + margin) {
            gameObjects.splice(i, 1);
        }
    }
}

// Draw background pattern
function drawBackground() {
    // Create a subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw game objects
function drawObjects() {
    gameObjects.forEach(object => {
        ctx.save();

        // Use the image stored in the object if available
        if (object.image) {
            const size = object.radius * 2;
            ctx.drawImage(object.image, object.x - object.radius, object.y - object.radius, size, size);
        } else {
            // Fallback to colored circles
            if (object.type === 'target') {
                ctx.fillStyle = gameConfig.targetColor;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
            } else {
                ctx.fillStyle = gameConfig.friendlyColor;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
            }

            ctx.beginPath();
            ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Draw word if available (either target word or friendly word)
            if (object.word) {
                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${Math.max(14, object.radius * 0.8)}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(object.word, object.x, object.y);
            }
        }

        ctx.restore();
    });
}
// Update player name display
function updatePlayerNameDisplay() {
    const el = document.getElementById('player-name-display');
    if (el) {
        el.textContent = gameConfig.playerName ? `Player: ${gameConfig.playerName}` : '';
    }
}

function updateObjectSize(event) {
    gameConfig.objectSize = parseInt(event.target.value);
    document.getElementById('object-size-value').textContent = gameConfig.objectSize;
}

function updateRatio(event) {
    gameConfig.ratio = parseFloat(event.target.value);
    document.getElementById('ratio-value').textContent = gameConfig.ratio.toFixed(2);
}

function updatePlayerName(event) {
    gameConfig.playerName = event.target.value;
    updatePlayerNameDisplay();
}

function updateTargetWords(event) {
    gameConfig.targetWords = event.target.value;
}

function updateFriendlyWords(event) {
    gameConfig.friendlyWords = event.target.value;
}

// Color picker functions
function updateTargetColor(event) {
    gameConfig.targetColor = event.target.value;
}

function updateFriendlyColor(event) {
    gameConfig.friendlyColor = event.target.value;
}

// Setup color presets
function setupColorPresets() {
    const colors = [
        '#ff0000', // Red
        '#ff8800', // Orange
        '#ffff00', // Yellow
        '#88ff00', // Lime
        '#00ff00', // Green
        '#00ffff', // Cyan
        '#0088ff', // Light Blue
        '#0000ff', // Blue
        '#8800ff', // Purple
        '#ff00ff', // Magenta
        '#ff0088', // Pink
        '#888888'  // Gray
    ];
    
    // Setup target color presets
    const targetPresets = document.getElementById('target-color-presets');
    const friendlyPresets = document.getElementById('friendly-color-presets');
    
    if (targetPresets && friendlyPresets) {
        colors.forEach(color => {
            // Create target preset
            const targetPreset = document.createElement('div');
            targetPreset.className = 'color-preset';
            targetPreset.style.backgroundColor = color;
            targetPreset.addEventListener('click', () => {
                gameConfig.targetColor = color;
                document.getElementById('target-color').value = color;
            });
            targetPresets.appendChild(targetPreset);
            
            // Create friendly preset
            const friendlyPreset = document.createElement('div');
            friendlyPreset.className = 'color-preset';
            friendlyPreset.style.backgroundColor = color;
            friendlyPreset.addEventListener('click', () => {
                gameConfig.friendlyColor = color;
                document.getElementById('friendly-color').value = color;
            });
            friendlyPresets.appendChild(friendlyPreset);
        });
    }
}

// Main game loop
function gameLoop(timestamp) {
    // If game is paused, don't proceed with the game loop
    if (gamePaused) {
        return requestAnimationFrame(gameLoop);
    }
    
    const deltaTime = timestamp - (lastTimestamp || timestamp);
    lastTimestamp = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background pattern when game hasn't started
    if (!gameStarted) {
        drawBackground();
        // We still want the animation frame to continue even if game isn't started
        return requestAnimationFrame(gameLoop);
    }
    
    // Spawn objects
    spawnObject();
    
    // Update objects
    updateObjects(deltaTime);
    
    // Draw objects
    drawObjects();
    
    // Update timer
    updateTimer();
    
    // Debug: Log game state but much less frequently
    if (Math.floor(timestamp / 1000) % 5 === 0 && Math.floor((timestamp - 50) / 1000) % 5 !== 0) {
        console.log('Game state:', { 
            gameStarted, 
            objectCount: gameObjects.length, 
            score
        });
    }
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Settings update functions
function updateSpeed(event) {
    gameConfig.speed = parseFloat(event.target.value);
    document.getElementById('speed-value').textContent = `${gameConfig.speed.toFixed(1)}x`;
}

function updateRandomness(event) {
    gameConfig.randomness = parseFloat(event.target.value);
    document.getElementById('randomness-value').textContent = gameConfig.randomness.toFixed(1);
}

function updateSpawnRate(event) {
    gameConfig.spawnRate = parseInt(event.target.value);
    document.getElementById('spawnRate-value').textContent = gameConfig.spawnRate;
}

// We've removed the updateObjectTypes function since we no longer have object type checkboxes

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    // Add a small delay to ensure all elements are properly loaded
    setTimeout(function() {
        init();
    }, 100);
});