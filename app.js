/**
 * Shoot the Unicorn Game
 * Copyright © 2025 Ahmad Alkashef (alkashef@gmail.com)
 * All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - PERSONAL USE ONLY
 * This software is the exclusive property of Ahmad Alkashef.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 * 
 * Licensed exclusively to: Ahmad Alkashef
 * Contact: alkashef@gmail.com
 */

// Centralized config and defaults
import { GAME_CONFIG_DEFAULTS, createDefaultGameConfig } from './src/core/config.js';

// Storage is handled via src/services/storage.js

// Game statistics variables
let gameStats = {
    totalHits: 0,
    totalMisses: 0,
    totalTargetsPenalized: 0, // For miss penalty tracking
    gameSessionStats: [] // Array to store individual game sessions
};

// Reset configuration to defaults
function resetConfigToDefaults() {
    gameConfig = createDefaultGameConfig();
    
    // Delete the cookie and update UI
    storageDeleteConfig();
    settingsUpdateSettingsUI(gameConfig);
    updatePlayerNameDisplay();
    
    console.log('Configuration reset to defaults');
}

// Game state
let canvas, ctx;
let gameObjects = [];
let score = 0;
let lastSpawnTime = Date.now();
let gameConfig = createDefaultGameConfig();
let targetImages = [];
let friendlyImages = [];
let sounds = {};

let gameStarted = false;
let gameStartTime = 0;
let totalPausedTime = 0;
let pauseStartTime = 0;
let lastTimestamp;
let engine;
let __pendingTestStart = false;
let __pendingTestConfig = null;

// Current game session tracking
let currentGameHits = 0;
let currentGameMisses = 0;
let currentGameClicks = 0;
let currentGameTargetsPenalized = 0;
let currentGameEndReason = '';

// Caption system
import { addWordToCaption, clearCaption } from './src/ui/caption.js';
import {
  calculateRateRank,
  calculateScoreRank,
  calculateAccuracyRank
} from './src/services/stats.js';
import { renderFrame } from './src/render/draw.js';
import { UI, initUIRefs } from './src/ui/dom.js';
import { initCanvas, getRightPanelWidth } from './src/ui/canvas.js';
import { setScoreDisplay, setTimerText, setPlayerNameDisplay, resetScoreboard } from './src/ui/scoreboard.js';
import { imageFiles as IMAGE_MANIFEST, soundFiles as SOUND_MANIFEST } from './src/services/assetManifest.js';
import { loadImages } from './src/services/assets.js';
import { loadSounds as loadAudioMap, playSound as playAudio } from './src/services/audio.js';
import { showGameOver, hideGameOver } from './src/ui/overlay.js';
import { loadConfig as storageLoadConfig, saveConfig as storageSaveConfig, deleteConfig as storageDeleteConfig, loadStats as storageLoadStats, saveStats as storageSaveStats, deleteStats as storageDeleteStats, addSession as storageAddSession } from './src/services/storage.js';
import { createGameEngine } from './src/systems/engine.js';
import { updateSettingsUI as settingsUpdateSettingsUI, bindSettingsControls, openSettings, closeSettings } from './src/ui/settings.js';
import { openScores, closeScores, renderScoresDashboard } from './src/ui/scores.js';
import { initAbout, openAbout, closeAbout } from './src/ui/about.js';

// REMOVE these two lines from app.js; they now live in the module:
// let captionWords = [];
// let captionElement = null;

// Settings UI is now handled by src/ui/settings.js

// Initialize the game
async function init() {
    console.log('Initializing game...');
    
    // Load saved configuration from cookie before setting up UI
    const savedConfig = storageLoadConfig();
    if (savedConfig) {
        Object.keys(savedConfig).forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(gameConfig, k)) {
                gameConfig[k] = savedConfig[k];
            }
        });
        console.log('Game configuration loaded from storage');
    }
    // Apply any pending test overrides after storage load (so tests win)
    if (__pendingTestConfig) {
        Object.assign(gameConfig, __pendingTestConfig);
    }
    
    // Load saved statistics from cookie
    gameStats = storageLoadStats();
    
    // Initialize cached DOM references once before wiring UI
    initUIRefs();
    ({ canvas, ctx } = initCanvas());
    await loadAssets();

    // Caption system lazily initializes on first use

    // Initialize game engine
    engine = createGameEngine({
        canvas,
        ctx,
        gameConfig,
        renderFrame,
        assets: { friendlyImages },
        hooks: {
            onScoreChange: (newScore) => {
                score = newScore;
                setScoreDisplay(score);
            },
            onTimerUpdate: (text) => {
                setTimerText(text);
            },
            onAddCaptionWord: (word) => {
                addWordToCaption(word, gameConfig);
            },
            onPlaySound: (key) => playSound(key),
            onStop: (reason, session) => {
                currentGameEndReason = reason;
                gameStats = storageAddSession(gameStats, session);
                showGameOver({
                    playerName: gameConfig.playerName || 'player 1',
                    score: session.score,
                    message: getEndReasonMessage(reason),
                    reasonText: getEndReasonText(reason),
                    session,
                });
                gameStarted = false;
                gamePaused = false;
                updatePlayerNameDisplay();
                const pauseButton = UI?.el?.pauseButton || document.getElementById('pause-button');
                if (pauseButton) pauseButton.title = 'Pause';
            }
        }
    });

    settingsUpdateSettingsUI(gameConfig);
    initAbout();
    bindSettingsControls(gameConfig);
    setupEventListeners();
    // Draw idle background once
    renderFrame(ctx, canvas, gameConfig, [], false);
    // honor pending test start
    if (__pendingTestStart) {
        __pendingTestStart = false;
        startGame();
    }
    
    console.log('Game initialization complete');
}

// Canvas setup moved to src/ui/canvas.js

// Caption system functions are provided by src/ui/caption.js
// (addWordToCaption, clearCaption)

// Load game assets
async function loadAssets() {
    console.log('Loading assets...');
    
    try {
        // Load images via service and manifest
        const { target, friendly } = await loadImages(
            {
                baseTargetPath: GAME_CONFIG_DEFAULTS.ASSETS.TARGET_FOLDER,
                baseFriendlyPath: GAME_CONFIG_DEFAULTS.ASSETS.FRIENDLY_FOLDER,
            },
            { target: IMAGE_MANIFEST.target, friendly: IMAGE_MANIFEST.friendly }
        );
        targetImages = target;
        friendlyImages = friendly;
        console.log(`Loaded images -> target: ${targetImages.length}, friendly: ${friendlyImages.length}`);

        // Load sounds via audio service and manifest
    sounds = await loadAudioMap(GAME_CONFIG_DEFAULTS.ASSETS.SOUNDS_FOLDER, SOUND_MANIFEST);
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

// Play sound helper that delegates to audio service
function playSound(soundKey) {
    playAudio(sounds, soundKey);
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Play button click
    const playButton = (UI && UI.el && UI.el.playButton) || document.getElementById('play-button');
    if (playButton) {
        playButton.addEventListener('click', function(event) {
            console.log('Play button clicked!');
            startGame();
        });
    } else {
        console.error('Play button not found!');
    }

    // Pause button
    const pauseButton = (UI && UI.el && UI.el.pauseButton) || document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.addEventListener('click', pauseGame);
    }
    
    // Stop button
    const stopButton = (UI && UI.el && UI.el.stopButton) || document.getElementById('stop-button');
    if (stopButton) {
        stopButton.addEventListener('click', () => stopGame('stop_button'));
    }

    // Settings button - opens modal and pauses game
    const settingsButton = (UI && UI.el && UI.el.settingsButton) || document.getElementById('settings-button');
    if (settingsButton) {
        settingsButton.addEventListener('click', openSettingsModal);
    }

    // Settings OK button
    const settingsOkButton = (UI && UI.el && UI.el.settingsOkButton) || document.getElementById('settings-ok-button');
    if (settingsOkButton) {
        settingsOkButton.addEventListener('click', closeSettingsModal);
    }

    // Close settings modal when clicking outside
    const settingsModal = (UI && UI.el && UI.el.settingsModal) || document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('click', function(event) {
            if (event.target === settingsModal) {
                closeSettingsModal();
            }
        });
    }

    // Game Over OK button
    const gameOverOkButton = (UI && UI.el && UI.el.gameOverOkButton) || document.getElementById('game-over-ok-button');
    if (gameOverOkButton) {
        gameOverOkButton.addEventListener('click', dismissGameOverOverlay);
    }
    // Mouse click for shooting (only when game is started)
    canvas.addEventListener('click', handleClick);



    // Reset settings button
    const resetSettingsButton = (UI && UI.el && UI.el.resetSettingsButton) || document.getElementById('reset-settings-button');
    if (resetSettingsButton) {
        resetSettingsButton.addEventListener('click', resetConfigToDefaults);
    }

    // Scores button - opens modal and pauses game
    const scoresButton = (UI && UI.el && UI.el.scoresButton) || document.getElementById('scores-button');
    if (scoresButton) {
        scoresButton.addEventListener('click', openScoresModal);
    }

    // Scores OK button
    const scoresOkButton = (UI && UI.el && UI.el.scoresOkButton) || document.getElementById('scores-ok-button');
    if (scoresOkButton) {
        scoresOkButton.addEventListener('click', closeScoresModal);
    }

    // Close scores modal when clicking outside
    const scoresModal = (UI && UI.el && UI.el.scoresModal) || document.getElementById('scores-modal');
    if (scoresModal) {
        scoresModal.addEventListener('click', function(event) {
            if (event.target === scoresModal) {
                closeScoresModal();
            }
        });
    }

    // About button - opens modal
    const aboutButton = (UI && UI.el && UI.el.aboutButton) || document.getElementById('about-button');
    if (aboutButton) {
        aboutButton.addEventListener('click', openAboutModal);
    }

    // About OK button
    const aboutOkButton = (UI && UI.el && UI.el.aboutOkButton) || document.getElementById('close-about');
    if (aboutOkButton) {
        aboutOkButton.addEventListener('click', closeAboutModal);
    }

    // Close about modal when clicking outside
    // Click-outside handler moved to initAbout()

    console.log('All event listeners set up');
}

// Settings modal functionality
let wasGameRunningBeforeSettings = false;
let wasGameRunningBeforeScores = false;

function openSettingsModal() {
    console.log('Opening settings modal');
    
    // Remember if game was running before opening settings
    wasGameRunningBeforeSettings = gameStarted && !gamePaused;
    
    // Pause the game if it's running
    if (gameStarted && !gamePaused) {
        pauseGame();
    }
    
    // Show settings modal via UI module
    openSettings();
}

function closeSettingsModal() {
    console.log('Closing settings modal');
    
    // Hide settings modal via UI module
    closeSettings();
    
    // Resume game if it was running before settings were opened
    if (wasGameRunningBeforeSettings && gameStarted && gamePaused) {
        resumeGame(); // Use the new resumeGame function instead of pauseGame
    }
    
    wasGameRunningBeforeSettings = false;
}

// Scores modal functionality
function openScoresModal() {
    console.log('Opening scores modal');
    
    // Remember if game was running before opening scores
    wasGameRunningBeforeScores = gameStarted && !gamePaused;
    
    // Pause the game if it's running
    if (gameStarted && !gamePaused) {
        pauseGame();
    }
    
    // Populate and open scores modal via UI module
    openScores(gameStats, getEndReasonText);
}

function closeScoresModal() {
    console.log('Closing scores modal');
    // Hide scores modal via UI module
    closeScores();
    
    // Resume game if it was running before scores were opened
    if (wasGameRunningBeforeScores && gameStarted && gamePaused) {
        resumeGame();
    }
    
    wasGameRunningBeforeScores = false;
}

// About modal functions
function openAboutModal() {
    console.log('Opening about modal');
    
    // Show about modal via UI module
    openAbout();
}

function closeAboutModal() {
    console.log('Closing about modal');
    
    // Hide about modal via UI module
    closeAbout();
}

// Dismiss game over overlay and return to main game view
function dismissGameOverOverlay() {
    console.log('Dismissing game over overlay');
    // Hide the game over overlay via UI module
    hideGameOver();
    
    // Reset game state to initial state (not started)
    gameStarted = false;
    gamePaused = false;
    gameObjects = [];
    score = 0;
    updateScoreDisplay();
    setTimerText('00:00');
    updatePlayerNameDisplay();
    
    // Reset pause button to initial state (always shows pause icon)
    const pauseButton = UI?.el?.pauseButton || document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.title = 'Pause';
    }
    
    // Message cleared by hideGameOver()
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
    
    // Play game start sound
    playSound('gameStart');
    
    // Hide the game over overlay if visible
    hideGameOver();
    console.log('Game over overlay hidden');

    // Reset state displayed
    score = 0;
    currentGameEndReason = '';
    
    // Clear caption when starting new game
    clearCaption(gameConfig);
    
    setScoreDisplay(score);
    setTimerText('00:00');
    updatePlayerNameDisplay();

    // Ensure canvas is properly sized (account for left panel)
    const rightPanelWidth = getRightPanelWidth();
    canvas.width = window.innerWidth - rightPanelWidth;
    canvas.height = window.innerHeight;

    // Start engine loop
    engine?.start();

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
    gamePaused = true;
    engine?.pause();
    
    console.log('Game paused');
}

function resumeGame() {
    if (!gameStarted || !gamePaused) return; // Only resume if game is paused
    
    // Resuming the game
    gamePaused = false;
    engine?.resume();
    
    console.log('Game resumed');
}

// Game loop function is defined further down
function stopGame(endReason = 'manual') {
    if (!gameStarted) return;
    playSound('gameOver');
    engine?.stop(endReason);
}

function getEndReasonText(reason) {
    switch (reason) {
        case 'friendly_shot':
            return 'Friendly picture shot';
        case 'score_negative':
            return 'Score dropped below 0';
        case 'time_limit':
            return 'Time limit reached';
        case 'score_limit':
            return 'Score limit for game end';
        case 'stop_button':
            return 'Game stopped manually';
        case 'manual':
            return 'Game stopped manually';
        default:
            return 'Unknown reason';
    }
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Spawn a new game object

// Handle mouse click (shooting)
function handleClick(event) {
    if (!gameStarted) return; // Don't handle clicks until game is started
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    engine?.handlePointer(clickX, clickY);
}



// Update score display
function updateScoreDisplay() {
    setScoreDisplay(score);
}

// Update timer display
function updateTimer() {
    // Engine drives timer updates; here we only reset to 00:00 when idle.
    if (!gameStarted) {
    setTimerText('00:00');
        return;
    }
}

// Update game objects

// Draw background and objects are now provided by src/render/draw.js

// Update player name display
function updatePlayerNameDisplay() {
    setPlayerNameDisplay(gameConfig.playerName || 'player 1');
}
 

// Main game loop
// game loop and update functions are handled by engine

// Settings update functions
// Settings change handlers moved to src/ui/settings.js

// We've removed the updateObjectTypes function since we no longer have object type checkboxes

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    // Add a small delay to ensure all elements are properly loaded
    setTimeout(function() {
        init();
    }, 100);
});

// Scores rendering has been moved to src/ui/scores.js

// calculateRateRank, calculateScoreRank, calculateAccuracyRank are imported from ./src/services/stats.js

// About tab switching moved to src/ui/about.js and exposed globally for inline onclick

function getEndReasonMessage(reason) {
    switch (reason) {
        case 'friendly_shot':
            return "Don't shoot the friendly images!";
        case 'score_negative':
            return 'Score went negative! Try to hit more targets.';
        case 'time_limit': {
            const mins = Math.floor((gameConfig.timeLimit || 0) / 60);
            return mins > 0
                ? `Time's up! You played for ${mins} minute${mins === 1 ? '' : 's'}.`
                : "Time's up!";
        }
        case 'score_limit':
            return `Congratulations! You reached the target score of ${gameConfig.scoreLimit}!`;
        case 'stop_button':
            return 'Game stopped.';
        case 'manual':
            return 'Game stopped.';
        default:
            return 'Game over.';
    }
}

// Lightweight test hook for E2E reliability (no-op in normal use)
// Allows tests to set config quickly and introspect state without relying on hidden UI controls.
try {
    if (typeof window !== 'undefined') {
        window.__shootTest = {
            setTimeLimit(seconds) {
                try {
                    gameConfig.timeLimitEnabled = true;
                    gameConfig.timeLimit = Number(seconds) || 0;
                    __pendingTestConfig = { timeLimitEnabled: true, timeLimit: Number(seconds) || 0 };
                    if (engine) engine.setConfig({ timeLimitEnabled: true, timeLimit: Number(seconds) || 0 });
                } catch (_) {}
            },
            start() {
                try {
                    if (engine) startGame();
                    else __pendingTestStart = true;
                } catch (_) {}
            },
            getState() {
                return {
                    gameStarted,
                    gamePaused,
                    score,
                    endReason: currentGameEndReason,
                };
            },
        };
    }
} catch (_) { /* ignore */ }