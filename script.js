// Game Variables
let score = 0;
let bestScore = parseInt(localStorage.getItem('ColorRush_BestScore')) || 0;
let level = 1;
let timeLimit = 5; // seconds
let timeLeft = 5;
let correctColor = "";
const colorList = ["Red", "Blue", "Green", "Yellow"];
let soundEnabled = true;
let musicEnabled = true;
let gameActive = false;
let gameTimer = null;
let delayTimer = null;

// DOM Elements
const screens = {
    splash: document.getElementById('splash-screen'),
    menu: document.getElementById('main-menu'),
    game: document.getElementById('game-screen'),
    gameOver: document.getElementById('game-over-screen')
};

const labels = {
    score: document.getElementById('Label8'),
    bestScore: document.getElementById('Label9'),
    level: document.getElementById('Label7'),
    instruction: document.getElementById('Label10'),
    status: document.getElementById('Label11'),
    targetColor: document.getElementById('target-color-text'),
    finalScore: document.getElementById('final-score'),
    finalBest: document.getElementById('final-best')
};

const buttons = {
    play: document.getElementById('Button6'),
    playAgain: document.getElementById('Button11'),
    colorBtns: {
        Red: document.getElementById('Button7'),
        Blue: document.getElementById('Button8'),
        Green: document.getElementById('Button9'),
        Yellow: document.getElementById('Button10')
    }
};

const toggles = {
    music: document.getElementById('music-toggle'),
    sound: document.getElementById('sound-toggle'),
    gameMusic: document.getElementById('game-music-toggle'),
    gameSound: document.getElementById('game-sound-toggle')
};

const progressBar = document.getElementById('timer-bar');

const audio = {
    music: document.getElementById('audio-music'),
    correct: document.getElementById('audio-correct'),
    wrong: document.getElementById('audio-wrong')
};

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    // Show splash for 2 seconds
    setTimeout(() => {
        showScreen('menu');
        labels.bestScore.textContent = bestScore;
    }, 2000);

    // Event Listeners
    buttons.play.addEventListener('click', startGame);
    buttons.playAgain.addEventListener('click', startGame);

    Object.keys(buttons.colorBtns).forEach(color => {
        buttons.colorBtns[color].addEventListener('click', () => handleTap(color));
    });

    toggles.music.addEventListener('change', (e) => syncMusic(e.target.checked));
    toggles.gameMusic.addEventListener('change', (e) => syncMusic(e.target.checked));
    
    toggles.sound.addEventListener('change', (e) => syncSound(e.target.checked));
    toggles.gameSound.addEventListener('change', (e) => syncSound(e.target.checked));
});


function syncMusic(enabled) {
    musicEnabled = enabled;
    toggles.music.checked = enabled;
    toggles.gameMusic.checked = enabled;
    if (gameActive && musicEnabled) audio.music.play();
    else audio.music.pause();
}

function syncSound(enabled) {
    soundEnabled = enabled;
    toggles.sound.checked = enabled;
    toggles.gameSound.checked = enabled;
}


// Screen Management
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Game Logic
function startGame() {
    clearTimeout(gameTimer);
    clearTimeout(delayTimer);

    
    score = 0;

    level = 1;
    updateDifficulty();
    timeLeft = timeLimit;
    gameActive = true;
    
    labels.score.textContent = score;
    labels.level.textContent = level;
    labels.status.textContent = "";
    
    showScreen('game');
    pickRandomColor();
    startTimer();
    
    if (musicEnabled) {
        audio.music.currentTime = 0;
        audio.music.play();
    }

    enableColorButtons(true);
}

function pickRandomColor() {
    const randomIndex = Math.floor(Math.random() * colorList.length);
    correctColor = colorList[randomIndex];
    labels.targetColor.textContent = correctColor;
    labels.targetColor.style.color = getHexForColor(correctColor);
}

function getHexForColor(colorName) {
    const colors = {
        Red: '#ff5252',
        Blue: '#2196f3',
        Green: '#4caf50',
        Yellow: '#ffeb3b'
    };
    return colors[colorName];
}

function startTimer() {
    clearTimeout(gameTimer); // Use clearTimeout since we are switching to setTimeout
    updateProgressBar();
    
    if (!gameActive) return;

    gameTimer = setTimeout(function tick() {
        if (!gameActive) return;
        
        timeLeft -= 0.1;
        updateProgressBar();
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            updateProgressBar();
            handleGameOver("⏰ Time Over");
        } else {
            gameTimer = setTimeout(tick, 100);
        }
    }, 100);
}



function updateProgressBar() {
    const percentage = (timeLeft / timeLimit) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // Color feedback for timer
    if (percentage > 50) progressBar.style.backgroundColor = '#03dac6';
    else if (percentage > 25) progressBar.style.backgroundColor = '#ffeb3b';
    else progressBar.style.backgroundColor = '#cf6679';
}

function handleTap(tappedColor) {
    if (!gameActive) return;

    if (tappedColor === correctColor) {
        handleCorrectTap();
    } else {
        handleGameOver("❌ Game Over");
    }
}

function handleCorrectTap() {
    clearTimeout(gameTimer);

    
    if (soundEnabled) {
        audio.correct.currentTime = 0;
        audio.correct.play();
    }

    score++;
    labels.score.textContent = score;
    updateDifficulty();
    
    // Update Best Score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('ColorRush_BestScore', bestScore);
    }

    labels.status.textContent = "✔ Correct";
    labels.status.style.color = "#4caf50";
    
    enableColorButtons(false);
    shuffleButtons(); // Shuffle after every correct tap

    // Delay before next color
    clearTimeout(delayTimer);
    delayTimer = setTimeout(() => {
        labels.status.textContent = "";
        timeLeft = timeLimit;
        pickRandomColor();
        enableColorButtons(true);
        startTimer();
    }, 400); 
}

function shuffleButtons() {
    const gridRows = document.querySelectorAll('.grid-row');
    const allButtons = Array.from(document.querySelectorAll('.color-btn'));
    
    // Fisher-Yates Shuffle
    for (let i = allButtons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allButtons[i], allButtons[j]] = [allButtons[j], allButtons[i]];
    }

    // Re-append to rows
    gridRows[0].innerHTML = '';
    gridRows[1].innerHTML = '';
    
    gridRows[0].appendChild(allButtons[0]);
    gridRows[0].appendChild(allButtons[1]);
    gridRows[1].appendChild(allButtons[2]);
    gridRows[1].appendChild(allButtons[3]);
}


function handleGameOver(msg) {
    gameActive = false;
    clearTimeout(gameTimer);
    clearTimeout(delayTimer);

    
    if (soundEnabled) {
        audio.wrong.currentTime = 0;
        audio.wrong.play();
    }
    
    audio.music.pause();
    
    // Vibration (if supported)
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }

    // Shake effect
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 400);

    labels.status.textContent = msg;
    labels.status.style.color = "#cf6679";
    
    enableColorButtons(false);

    setTimeout(() => {
        labels.finalScore.textContent = score;
        labels.finalBest.textContent = bestScore;
        showScreen('gameOver');
    }, 1000);
}

function updateDifficulty() {
    if (score >= 20) {
        level = 5;
        timeLimit = 1;
    } else if (score >= 15) {
        level = 4;
        timeLimit = 2;
    } else if (score >= 10) {
        level = 3;
        timeLimit = 3;
    } else if (score >= 8) {
        level = 2;
        timeLimit = 4;
    } else {
        level = 1;
        timeLimit = 5;
    }
    labels.level.textContent = level;
}

function enableColorButtons(enabled) {
    Object.values(buttons.colorBtns).forEach(btn => {
        btn.disabled = !enabled;
        btn.style.opacity = enabled ? "1" : "0.6";
    });
}
