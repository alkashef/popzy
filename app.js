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
    DEFAULT_PLAYER_NAME: 'player 1',
    DEFAULT_TARGET_WORDS: '2 4 6 8 10',
    DEFAULT_FRIENDLY_WORDS: '1 3 5 7 9',
    DEFAULT_TARGET_COLOR: '#ff4444',
    DEFAULT_FRIENDLY_COLOR: '#4444ff',
    DEFAULT_FRIENDLY_MODE: 'both', // 'images', 'words', 'both'
    DEFAULT_SIZE_VARIATION: 0.3, // 30% size variation around average
    DEFAULT_MISS_PENALTY_ENABLED: false, // Enable penalty for missed targets
    DEFAULT_TIME_LIMIT_ENABLED: false, // Enable time limit for game end
    DEFAULT_TIME_LIMIT: 120, // Time limit in seconds (2 minutes)
    DEFAULT_SCORE_LIMIT_ENABLED: false, // Enable score limit for game end
    DEFAULT_SCORE_LIMIT: 50, // Score limit for game end
    // Object properties
    BASE_SPEED: 100, // pixels per second
    SPAWN_MARGIN: 50, // pixels from edge
    // Asset paths
    ASSETS: {
        TARGET_FOLDER: 'assets/target/',
        FRIENDLY_FOLDER: 'assets/friendly/',
        SOUNDS_FOLDER: 'assets/sounds/'
    }
};

// Cookie utility functions for saving/loading game configuration
const CONFIG_COOKIE_NAME = 'shootTheUnicornConfig';
const CONFIG_COOKIE_EXPIRY_DAYS = 365; // Cookie expires in 1 year

// Game statistics tracking
const STATS_COOKIE_NAME = 'shootTheUnicornGameStats';
const STATS_COOKIE_EXPIRY_DAYS = 365; // Cookie expires in 1 year

// Game statistics variables
let gameStats = {
    totalHits: 0,
    totalMisses: 0,
    totalTargetsPenalized: 0, // For miss penalty tracking
    gameSessionStats: [] // Array to store individual game sessions
};

function saveConfigToCookie() {
    try {
        const configToSave = JSON.stringify(gameConfig);
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (CONFIG_COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
        const expires = "expires=" + expiryDate.toUTCString();
        document.cookie = `${CONFIG_COOKIE_NAME}=${configToSave};${expires};path=/`;
        console.log('Game configuration saved to cookie');
    } catch (error) {
        console.warn('Failed to save configuration to cookie:', error);
    }
}

function loadConfigFromCookie() {
    try {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            let c = cookie.trim();
            if (c.indexOf(CONFIG_COOKIE_NAME + '=') === 0) {
                const configJson = c.substring(CONFIG_COOKIE_NAME.length + 1);
                const savedConfig = JSON.parse(configJson);
                
                // Merge saved config with current gameConfig, preserving any new default values
                for (const key in savedConfig) {
                    if (gameConfig.hasOwnProperty(key)) {
                        gameConfig[key] = savedConfig[key];
                    }
                }
                
                console.log('Game configuration loaded from cookie');
                return true;
            }
        }
    } catch (error) {
        console.warn('Failed to load configuration from cookie:', error);
    }
    return false;
}

function deleteConfigCookie() {
    try {
        document.cookie = `${CONFIG_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        console.log('Game configuration cookie deleted');
    } catch (error) {
        console.warn('Failed to delete configuration cookie:', error);
    }
}

// Game statistics cookie functions
function saveStatsToCookie() {
    try {
        const statsToSave = JSON.stringify(gameStats);
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (STATS_COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
        const expires = "expires=" + expiryDate.toUTCString();
        document.cookie = `${STATS_COOKIE_NAME}=${statsToSave};${expires};path=/`;
        console.log('Game statistics saved to cookie');
    } catch (error) {
        console.warn('Failed to save statistics to cookie:', error);
    }
}

function loadStatsFromCookie() {
    try {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            let c = cookie.trim();
            if (c.indexOf(STATS_COOKIE_NAME + '=') === 0) {
                const statsJson = c.substring(STATS_COOKIE_NAME.length + 1);
                const savedStats = JSON.parse(statsJson);
                
                // Merge saved stats with current gameStats, preserving structure
                gameStats = {
                    totalHits: savedStats.totalHits || 0,
                    totalMisses: savedStats.totalMisses || 0,
                    totalTargetsPenalized: savedStats.totalTargetsPenalized || 0,
                    gameSessionStats: savedStats.gameSessionStats || []
                };
                
                console.log('Game statistics loaded from cookie');
                return true;
            }
        }
    } catch (error) {
        console.warn('Failed to load statistics from cookie:', error);
    }
    return false;
}

function deleteStatsCookie() {
    try {
        document.cookie = `${STATS_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        console.log('Game statistics cookie deleted');
    } catch (error) {
        console.warn('Failed to delete statistics cookie:', error);
    }
}

// Reset configuration to defaults
function resetConfigToDefaults() {
    gameConfig = {
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
        friendlyColor: GAME_CONFIG.DEFAULT_FRIENDLY_COLOR,
        friendlyMode: GAME_CONFIG.DEFAULT_FRIENDLY_MODE,
        sizeVariation: GAME_CONFIG.DEFAULT_SIZE_VARIATION,
        missPenaltyEnabled: GAME_CONFIG.DEFAULT_MISS_PENALTY_ENABLED,
        timeLimitEnabled: GAME_CONFIG.DEFAULT_TIME_LIMIT_ENABLED,
        timeLimit: GAME_CONFIG.DEFAULT_TIME_LIMIT,
        scoreLimitEnabled: GAME_CONFIG.DEFAULT_SCORE_LIMIT_ENABLED,
        scoreLimit: GAME_CONFIG.DEFAULT_SCORE_LIMIT
    };
    
    // Delete the cookie and update UI
    deleteConfigCookie();
    updateSettingsUI();
    updatePlayerNameDisplay();
    
    console.log('Configuration reset to defaults');
}

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
    friendlyColor: GAME_CONFIG.DEFAULT_FRIENDLY_COLOR,
    friendlyMode: GAME_CONFIG.DEFAULT_FRIENDLY_MODE,
    sizeVariation: GAME_CONFIG.DEFAULT_SIZE_VARIATION,
    missPenaltyEnabled: GAME_CONFIG.DEFAULT_MISS_PENALTY_ENABLED,
    timeLimitEnabled: GAME_CONFIG.DEFAULT_TIME_LIMIT_ENABLED,
    timeLimit: GAME_CONFIG.DEFAULT_TIME_LIMIT,
    scoreLimitEnabled: GAME_CONFIG.DEFAULT_SCORE_LIMIT_ENABLED,
    scoreLimit: GAME_CONFIG.DEFAULT_SCORE_LIMIT
};
let targetImages = [];
let friendlyImages = [];
let sounds = {};

let gameStarted = false;
let gameStartTime = 0;
let totalPausedTime = 0;
let pauseStartTime = 0;
let lastTimestamp;

// Current game session tracking
let currentGameHits = 0;
let currentGameMisses = 0;
let currentGameTargetsPenalized = 0;

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
    
    document.getElementById('size-variation').value = gameConfig.sizeVariation;
    document.getElementById('size-variation-value').textContent = gameConfig.sizeVariation.toFixed(1);
    
    document.getElementById('ratio').value = gameConfig.ratio;
    document.getElementById('ratio-value').textContent = gameConfig.ratio.toFixed(2);
    
    document.getElementById('player-name').value = gameConfig.playerName || '';
    document.getElementById('target-words').value = gameConfig.targetWords || '';
    document.getElementById('friendly-words').value = gameConfig.friendlyWords || '';
    
    // Set color picker values
    document.getElementById('target-color').value = gameConfig.targetColor;
    document.getElementById('friendly-color').value = gameConfig.friendlyColor;
    
    // Set friendly mode
    document.getElementById('friendly-mode').value = gameConfig.friendlyMode;
    
    // Set miss penalty checkbox
    const missPenaltyCheckbox = document.getElementById('miss-penalty-enabled');
    if (missPenaltyCheckbox) {
        missPenaltyCheckbox.checked = gameConfig.missPenaltyEnabled;
    }
    
    // Set time limit settings
    const timeLimitEnabledCheckbox = document.getElementById('time-limit-enabled');
    if (timeLimitEnabledCheckbox) {
        timeLimitEnabledCheckbox.checked = gameConfig.timeLimitEnabled;
    }
    
    const timeLimitInput = document.getElementById('time-limit');
    const timeLimitValue = document.getElementById('time-limit-value');
    if (timeLimitInput && timeLimitValue) {
        timeLimitInput.value = gameConfig.timeLimit;
        timeLimitValue.textContent = `${Math.floor(gameConfig.timeLimit / 60)}:${(gameConfig.timeLimit % 60).toString().padStart(2, '0')}`;
    }
    
    // Set score limit settings
    const scoreLimitEnabledCheckbox = document.getElementById('score-limit-enabled');
    if (scoreLimitEnabledCheckbox) {
        scoreLimitEnabledCheckbox.checked = gameConfig.scoreLimitEnabled;
    }
    
    const scoreLimitInput = document.getElementById('score-limit');
    const scoreLimitValue = document.getElementById('score-limit-value');
    if (scoreLimitInput && scoreLimitValue) {
        scoreLimitInput.value = gameConfig.scoreLimit;
        scoreLimitValue.textContent = gameConfig.scoreLimit;
    }
    
    updatePlayerNameDisplay();
}

// Initialize the game
async function init() {
    console.log('Initializing game...');
    
    // Load saved configuration from cookie before setting up UI
    loadConfigFromCookie();
    
    // Load saved statistics from cookie
    loadStatsFromCookie();
    
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
    
    // Set canvas size to viewport minus right panel
    function resizeCanvas() {
        const rightPanelWidth = 200; // Match CSS right panel width
        canvas.width = window.innerWidth - rightPanelWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Canvas should always allow pointer events since game controls are in right panel
    canvas.style.pointerEvents = 'auto';
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
        
        // Load sounds
        sounds = await loadSounds();
        console.log('Loaded sounds:', Object.keys(sounds));
        
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
        // For friendly folder, load all available images
        if (folderPath === GAME_CONFIG.ASSETS.FRIENDLY_FOLDER) {
            const imageNames = ['unicorn_02.png', 'unicorn_03.png', 'unicorn_256.png'];
            
            for (const imageName of imageNames) {
                try {
                    const imagePath = folderPath + imageName;
                    const image = await loadImage(imagePath);
                    images.push(image);
                    console.log(`Loaded image from ${imagePath}`);
                } catch (error) {
                    console.warn(`Failed to load ${imageName}:`, error);
                }
            }
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

// Load sounds helper
async function loadSounds() {
    const soundFiles = {
        gameStart: 'game-start.mp3',
        gameOver: 'game-over.mp3',
        oww: 'oww.mp3',
        cymbal: 'cymbal.mp3',
        snare: 'snare.mp3'
    };
    
    const loadedSounds = {};
    
    for (const [key, filename] of Object.entries(soundFiles)) {
        try {
            const audio = new Audio(`${GAME_CONFIG.ASSETS.SOUNDS_FOLDER}${filename}`);
            audio.preload = 'auto';
            loadedSounds[key] = audio;
            console.log(`Loaded sound: ${key} (${filename})`);
        } catch (error) {
            console.warn(`Failed to load sound: ${key} (${filename})`, error);
        }
    }
    
    return loadedSounds;
}

// Play sound helper
function playSound(soundKey) {
    if (sounds[soundKey]) {
        try {
            sounds[soundKey].currentTime = 0; // Reset to beginning
            sounds[soundKey].play().catch(error => {
                console.warn(`Failed to play sound: ${soundKey}`, error);
            });
        } catch (error) {
            console.warn(`Error playing sound: ${soundKey}`, error);
        }
    } else {
        console.warn(`Sound not found: ${soundKey}`);
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Play button click
    const playButton = document.getElementById('play-button');
    if (playButton) {
        playButton.addEventListener('click', function(event) {
            console.log('Play button clicked!');
            startGame();
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

    // Settings button - opens modal and pauses game
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
        settingsButton.addEventListener('click', openSettingsModal);
    }

    // Settings OK button
    const settingsOkButton = document.getElementById('settings-ok-button');
    if (settingsOkButton) {
        settingsOkButton.addEventListener('click', closeSettingsModal);
    }

    // Close settings modal when clicking outside
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('click', function(event) {
            if (event.target === settingsModal) {
                closeSettingsModal();
            }
        });
    }

    // Game Over OK button
    const gameOverOkButton = document.getElementById('game-over-ok-button');
    if (gameOverOkButton) {
        gameOverOkButton.addEventListener('click', dismissGameOverOverlay);
    }
    // Mouse click for shooting (only when game is started)
    canvas.addEventListener('click', handleClick);

    // Settings controls
    document.getElementById('speed').addEventListener('input', updateSpeed);
    document.getElementById('randomness').addEventListener('input', updateRandomness);
    document.getElementById('spawnRate').addEventListener('input', updateSpawnRate);

    // Object size
    document.getElementById('object-size').addEventListener('input', updateObjectSize);
    // Size variation
    document.getElementById('size-variation').addEventListener('input', updateSizeVariation);
    // Ratio
    document.getElementById('ratio').addEventListener('input', updateRatio);
    // Player name
    document.getElementById('player-name').addEventListener('input', updatePlayerName);
    // Target words
    document.getElementById('target-words').addEventListener('input', updateTargetWords);
    // Friendly words
    document.getElementById('friendly-words').addEventListener('input', updateFriendlyWords);
    
    // Friendly mode
    document.getElementById('friendly-mode').addEventListener('change', updateFriendlyMode);

    // Miss penalty enabled
    const missPenaltyCheckbox = document.getElementById('miss-penalty-enabled');
    if (missPenaltyCheckbox) {
        missPenaltyCheckbox.addEventListener('change', updateMissPenaltyEnabled);
    }

    // Time limit settings
    const timeLimitEnabledCheckbox = document.getElementById('time-limit-enabled');
    if (timeLimitEnabledCheckbox) {
        timeLimitEnabledCheckbox.addEventListener('change', updateTimeLimitEnabled);
    }
    
    const timeLimitInput = document.getElementById('time-limit');
    if (timeLimitInput) {
        timeLimitInput.addEventListener('input', updateTimeLimit);
    }

    // Score limit settings
    const scoreLimitEnabledCheckbox = document.getElementById('score-limit-enabled');
    if (scoreLimitEnabledCheckbox) {
        scoreLimitEnabledCheckbox.addEventListener('change', updateScoreLimitEnabled);
    }
    
    const scoreLimitInput = document.getElementById('score-limit');
    if (scoreLimitInput) {
        scoreLimitInput.addEventListener('input', updateScoreLimit);
    }

    // Background image selector
    document.getElementById('background-image').addEventListener('change', updateBackgroundImage);

    // Color pickers
    document.getElementById('target-color').addEventListener('input', updateTargetColor);
    document.getElementById('friendly-color').addEventListener('input', updateFriendlyColor);
    
    // Initialize color presets
    setupColorPresets();

    // Reset settings button
    const resetSettingsButton = document.getElementById('reset-settings-button');
    if (resetSettingsButton) {
        resetSettingsButton.addEventListener('click', resetConfigToDefaults);
    }

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

// Settings modal functionality
let wasGameRunningBeforeSettings = false;

function openSettingsModal() {
    console.log('Opening settings modal');
    
    // Remember if game was running before opening settings
    wasGameRunningBeforeSettings = gameStarted && !gamePaused;
    
    // Pause the game if it's running
    if (gameStarted && !gamePaused) {
        pauseGame();
    }
    
    // Show settings modal
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.classList.remove('hidden');
    }
}

function closeSettingsModal() {
    console.log('Closing settings modal');
    
    // Hide settings modal
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.classList.add('hidden');
    }
    
    // Resume game if it was running before settings were opened
    if (wasGameRunningBeforeSettings && gameStarted && gamePaused) {
        resumeGame(); // Use the new resumeGame function instead of pauseGame
    }
    
    wasGameRunningBeforeSettings = false;
}

// Dismiss game over overlay and return to main game view
function dismissGameOverOverlay() {
    console.log('Dismissing game over overlay');
    
    // Hide the game over overlay
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) {
        gameOverOverlay.classList.add('hidden');
    }
    
    // Reset game state to initial state (not started)
    gameStarted = false;
    gamePaused = false;
    gameObjects = [];
    score = 0;
    updateScoreDisplay();
    updateTimer();
    updatePlayerNameDisplay();
    
    // Reset pause button to initial state (always shows pause icon)
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.title = 'Pause';
    }
    
    // Clear any game over message
    const gameOverMsg = document.querySelector('.game-over-message');
    if (gameOverMsg) {
        gameOverMsg.textContent = '';
    }
}

// Start the game
function startGame() {
    console.log('startGame() called');

    if (gameStarted && gamePaused) {
        // If game was paused, just resume it
        resumeGame();
        return;
    }
    
    // Starting a new game
    gameStarted = true;
    gamePaused = false;
    gameStartTime = Date.now();
    totalPausedTime = 0;
    pauseStartTime = 0;
    
    // Play game start sound
    playSound('gameStart');
    
    // Hide the game over overlay if visible
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) {
        gameOverOverlay.classList.add('hidden');
        console.log('Game over overlay hidden');
    }

    // Reset game state
    gameObjects = [];
    score = 0;
    lastSpawnTime = 0; // Reset to 0 to force immediate spawn
    
    // Reset current game session tracking
    currentGameHits = 0;
    currentGameMisses = 0;
    currentGameTargetsPenalized = 0;
    
    updateScoreDisplay();
    updateTimer();
    updatePlayerNameDisplay();

    // Ensure canvas is properly sized (account for left panel)
    const leftPanelWidth = 200;
    canvas.width = window.innerWidth - leftPanelWidth;
    canvas.height = window.innerHeight;

    // Start the game loop if not already running
    lastTimestamp = undefined;
    requestAnimationFrame(gameLoop);

    // Play the game start sound
    playSound('gameStart');

    console.log('Game started!', {
        gameStarted,
        gamePaused,
        canvasSize: `${canvas.width}x${canvas.height}`
    });
}

let gamePaused = false;

function pauseGame() {
    if (!gameStarted || gamePaused) return; // Only pause if game is running
    
    // Pausing the game
    pauseStartTime = Date.now();
    gamePaused = true;
    
    console.log('Game paused');
}

function resumeGame() {
    if (!gameStarted || !gamePaused) return; // Only resume if game is paused
    
    // Resuming the game - add the pause duration to totalPausedTime
    totalPausedTime += (Date.now() - pauseStartTime);
    gamePaused = false;
    
    // Restart the game loop
    lastTimestamp = undefined;
    requestAnimationFrame(gameLoop);
    
    console.log('Game resumed');
}

// Game loop function is defined further down
function stopGame() {
    if (!gameStarted) return;
    
    // Play game over sound
    playSound('gameOver');
    
    // Calculate game duration (accounting for paused time)
    const endTime = Date.now();
    const pauseTimeToAdd = gamePaused ? (endTime - pauseStartTime) : 0;
    const durationMs = endTime - gameStartTime - totalPausedTime - pauseTimeToAdd;
    const durationSeconds = Math.floor(durationMs / 1000);
    const durationMinutes = durationSeconds / 60;
    
    // Calculate average hit rate per minute
    // Formula: (hits - penalties/misses) per minute
    const effectiveHits = currentGameHits - currentGameTargetsPenalized;
    const averageHitRate = durationMinutes > 0 ? effectiveHits / durationMinutes : 0;
    
    // Create game session record
    const gameSession = {
        gameEndTime: new Date().toISOString(),
        playerName: gameConfig.playerName || 'player 1',
        score: score,
        gameDurationSeconds: durationSeconds,
        averageHitRate: Math.round(averageHitRate * 100) / 100, // Round to 2 decimal places
        hits: currentGameHits,
        misses: currentGameMisses,
        targetsPenalized: currentGameTargetsPenalized
    };
    
    // Add to game statistics
    gameStats.totalHits += currentGameHits;
    gameStats.totalMisses += currentGameMisses;
    gameStats.totalTargetsPenalized += currentGameTargetsPenalized;
    gameStats.gameSessionStats.push(gameSession);
    
    // Keep only the last 50 game sessions to prevent cookie from getting too large
    if (gameStats.gameSessionStats.length > 50) {
        gameStats.gameSessionStats = gameStats.gameSessionStats.slice(-50);
    }
    
    // Save statistics to cookie
    saveStatsToCookie();
    
    console.log('Game session statistics:', gameSession);
    
    const duration = formatDuration(durationMs);
    const player = gameConfig.playerName || 'Anonymous';

    // Show game over in the middle of the screen
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalPlayerName = document.getElementById('final-player-name');
    const finalScore = document.getElementById('final-score');
    
    if (gameOverOverlay) {
        gameOverOverlay.classList.remove('hidden');
        if (finalPlayerName) finalPlayerName.textContent = gameConfig.playerName || 'player 1';
        if (finalScore) finalScore.textContent = `Score: ${score}`;
    }

    gameStarted = false;
    gamePaused = false;
    gameObjects = [];
    updateScoreDisplay();
    updateTimer();
    updatePlayerNameDisplay();
    
    // Reset pause button to initial state (no need to change it since it always shows pause icon)
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.title = 'Pause';
    }
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
    let startX, startY;
    const margin = GAME_CONFIG.SPAWN_MARGIN;

    switch (edge) {
        case 0: // top
            startX = Math.random() * canvas.width;
            startY = -gameConfig.objectSize;
            break;
        case 1: // right
            startX = canvas.width + gameConfig.objectSize;
            startY = Math.random() * canvas.height;
            break;
        case 2: // bottom
            startX = Math.random() * canvas.width;
            startY = canvas.height + gameConfig.objectSize;
            break;
        case 3: // left
            startX = -gameConfig.objectSize;
            startY = Math.random() * canvas.height;
            break;
    }

    // Calculate object size with variation around the average
    const sizeVariation = gameConfig.sizeVariation || 0.3;
    const minSize = gameConfig.objectSize * (1 - sizeVariation);
    const maxSize = gameConfig.objectSize * (1 + sizeVariation);
    const objectRadius = minSize + Math.random() * (maxSize - minSize);

    // Calculate movement path - straight line only
    const baseSpeed = GAME_CONFIG.BASE_SPEED * gameConfig.speed;
    const randomness = gameConfig.randomness;

    // Target position (opposite side of screen with randomness)
    const targetX = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * randomness;
    const targetY = canvas.height / 2 + (Math.random() - 0.5) * canvas.height * randomness;

    // Calculate direction vector
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize and apply speed
    const vx = (dx / distance) * baseSpeed;
    const vy = (dy / distance) * baseSpeed;

    const object = {
        x: startX, 
        y: startY, 
        vx, 
        vy, 
        type, 
        radius: objectRadius,
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
    
    // For friendlies, handle display mode based on settings
    if (type === 'friendly') {
        const mode = gameConfig.friendlyMode;
        
        if (mode === 'images' && friendlyImages.length > 0) {
            // Images only mode
            object.image = friendlyImages[Math.floor(Math.random() * friendlyImages.length)];
            object.isFriendlyImage = true;
        } else if (mode === 'words' && gameConfig.friendlyWords) {
            // Words only mode
            const words = gameConfig.friendlyWords.trim().split(/\s+/);
            if (words.length > 0 && words[0] !== '') {
                const randomIndex = Math.floor(Math.random() * words.length);
                object.word = words[randomIndex];
            }
        } else if (mode === 'both') {
            // Both images and words mode - randomly choose
            const useImage = friendlyImages.length > 0 && Math.random() < 0.5;
            
            if (useImage) {
                object.image = friendlyImages[Math.floor(Math.random() * friendlyImages.length)];
                object.isFriendlyImage = true;
            } else if (gameConfig.friendlyWords) {
                const words = gameConfig.friendlyWords.trim().split(/\s+/);
                if (words.length > 0 && words[0] !== '') {
                    const randomIndex = Math.floor(Math.random() * words.length);
                    object.word = words[randomIndex];
                }
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

    let hitSomething = false;
    
    // Check collision with objects (back to front for proper hit detection)
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const object = gameObjects[i];
        const distance = Math.sqrt(
            Math.pow(clickX - object.x, 2) + Math.pow(clickY - object.y, 2)
        );

        if (distance <= object.radius) {
            // Hit! Handle based on object type
            gameObjects.splice(i, 1);
            hitSomething = true;
            
            // Track hit for statistics
            currentGameHits++;
            
            // Game over if a friendly image is hit
            if (object.isFriendlyImage) {
                // Play oww sound for friendly image hit
                playSound('oww');
                
                // Show game over message with "Don't shoot the unicorn!" message
                stopGame();
                const gameOverMsg = document.querySelector('.game-over-message');
                if (gameOverMsg) {
                    gameOverMsg.textContent = "Don't shoot the friendly images!";
                }
                return;
            } else {
                // Play appropriate sound based on object type
                if (object.type === 'target') {
                    playSound('snare');
                } else if (object.type === 'friendly' && object.word) {
                    // Friendly word hit
                    playSound('cymbal');
                }
                
                // Update score based on object points
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
    
    // Track miss if no object was hit
    if (!hitSomething) {
        currentGameMisses++;
    }
}



// Update score display
function updateScoreDisplay() {
    const scoreNumberElement = document.querySelector('.score-number');
    if (scoreNumberElement) {
        scoreNumberElement.textContent = score;
    }
    
    // Check score limit
    if (gameConfig.scoreLimitEnabled && gameStarted && score >= gameConfig.scoreLimit) {
        stopGame();
        const gameOverMsg = document.querySelector('.game-over-message');
        if (gameOverMsg) {
            gameOverMsg.textContent = `Congratulations! You reached the target score of ${gameConfig.scoreLimit}!`;
        }
    }
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
    
    // Check time limit
    if (gameConfig.timeLimitEnabled && !gamePaused) {
        const elapsedSeconds = Math.floor(elapsed / 1000);
        if (elapsedSeconds >= gameConfig.timeLimit) {
            stopGame();
            const gameOverMsg = document.querySelector('.game-over-message');
            if (gameOverMsg) {
                gameOverMsg.textContent = `Time's up! You played for ${Math.floor(gameConfig.timeLimit / 60)} minutes.`;
            }
            return;
        }
    }
    
    // Debug timer less frequently
    if (seconds % 15 === 0 && seconds > 0 && minutes % 2 === 0) {
        console.log('Timer update:', { elapsed, timeString });
    }
}

// Update game objects
function updateObjects(deltaTime) {
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const object = gameObjects[i];
        
        // Update position - straight line movement only
        object.x += object.vx * (deltaTime / 1000);
        object.y += object.vy * (deltaTime / 1000);
        
        // Remove if off screen
        const margin = gameConfig.objectSize * 2;
        const shouldRemove = object.x < -margin || object.x > canvas.width + margin ||
                           object.y < -margin || object.y > canvas.height + margin;
        
        if (shouldRemove) {
            // Apply miss penalty if enabled and it's a target
            if (gameConfig.missPenaltyEnabled && object.type === 'target') {
                score -= 1; // Subtract 1 point for missed target
                currentGameTargetsPenalized++; // Track penalized targets
                updateScoreDisplay();
                console.log('Target missed! Score reduced by 1');
                
                // End game if score goes negative
                if (score < 0) {
                    stopGame();
                    const gameOverMsg = document.querySelector('.game-over-message');
                    if (gameOverMsg) {
                        gameOverMsg.textContent = "Score went negative! Try to hit more targets.";
                    }
                    return;
                }
            }
            
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
        el.textContent = gameConfig.playerName || 'player 1';
    }
}

function updateObjectSize(event) {
    gameConfig.objectSize = parseInt(event.target.value);
    document.getElementById('object-size-value').textContent = gameConfig.objectSize;
    saveConfigToCookie();
}

function updateSizeVariation(event) {
    gameConfig.sizeVariation = parseFloat(event.target.value);
    document.getElementById('size-variation-value').textContent = gameConfig.sizeVariation.toFixed(1);
    saveConfigToCookie();
}

function updateRatio(event) {
    gameConfig.ratio = parseFloat(event.target.value);
    document.getElementById('ratio-value').textContent = gameConfig.ratio.toFixed(2);
    saveConfigToCookie();
}

function updatePlayerName(event) {
    gameConfig.playerName = event.target.value;
    updatePlayerNameDisplay();
    saveConfigToCookie();
}

function updateTargetWords(event) {
    gameConfig.targetWords = event.target.value;
    saveConfigToCookie();
}

function updateFriendlyWords(event) {
    gameConfig.friendlyWords = event.target.value;
    saveConfigToCookie();
}

function updateFriendlyMode(event) {
    gameConfig.friendlyMode = event.target.value;
    console.log('Friendly mode updated to:', gameConfig.friendlyMode);
    saveConfigToCookie();
}

function updateMissPenaltyEnabled(event) {
    gameConfig.missPenaltyEnabled = event.target.checked;
    console.log('Miss penalty enabled:', gameConfig.missPenaltyEnabled);
    saveConfigToCookie();
}

function updateTimeLimitEnabled(event) {
    gameConfig.timeLimitEnabled = event.target.checked;
    console.log('Time limit enabled:', gameConfig.timeLimitEnabled);
    saveConfigToCookie();
}

function updateTimeLimit(event) {
    gameConfig.timeLimit = parseInt(event.target.value);
    const minutes = Math.floor(gameConfig.timeLimit / 60);
    const seconds = gameConfig.timeLimit % 60;
    document.getElementById('time-limit-value').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    console.log('Time limit updated:', gameConfig.timeLimit);
    saveConfigToCookie();
}

function updateScoreLimitEnabled(event) {
    gameConfig.scoreLimitEnabled = event.target.checked;
    console.log('Score limit enabled:', gameConfig.scoreLimitEnabled);
    saveConfigToCookie();
}

function updateScoreLimit(event) {
    gameConfig.scoreLimit = parseInt(event.target.value);
    document.getElementById('score-limit-value').textContent = gameConfig.scoreLimit;
    console.log('Score limit updated:', gameConfig.scoreLimit);
    saveConfigToCookie();
}

// Color picker functions
function updateTargetColor(event) {
    gameConfig.targetColor = event.target.value;
    saveConfigToCookie();
}

function updateFriendlyColor(event) {
    gameConfig.friendlyColor = event.target.value;
    saveConfigToCookie();
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
    saveConfigToCookie();
}

function updateRandomness(event) {
    gameConfig.randomness = parseFloat(event.target.value);
    document.getElementById('randomness-value').textContent = gameConfig.randomness.toFixed(1);
    saveConfigToCookie();
}

function updateSpawnRate(event) {
    gameConfig.spawnRate = parseInt(event.target.value);
    document.getElementById('spawnRate-value').textContent = gameConfig.spawnRate;
    saveConfigToCookie();
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