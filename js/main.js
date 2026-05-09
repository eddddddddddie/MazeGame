import { COLOR_OPTIONS, DEFAULT_APPEARANCE, drawCharacterPreview } from './character.js';
import { startLevel, stopGame, setupInput, TOTAL_LEVELS } from './game.js';

let appearance = { ...DEFAULT_APPEARANCE };
let currentLevel = 1;
let totalScore = 0;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function initCustomization() {
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');

    for (const [category, colors] of Object.entries(COLOR_OPTIONS)) {
        const container = document.querySelector(`[data-category="${category}"]`);
        for (const color of colors) {
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.style.backgroundColor = color.value;
            swatch.title = color.name;
            if (appearance[category] === color.value) swatch.classList.add('selected');

            swatch.addEventListener('click', () => {
                appearance[category] = color.value;
                container.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
                swatch.classList.add('selected');
                updatePreview();
            });
            container.appendChild(swatch);
        }
    }

    function updatePreview() {
        drawCharacterPreview(previewCtx, previewCanvas.width, previewCanvas.height, appearance);
    }
    updatePreview();
}

function beginLevel() {
    showScreen('game-screen');
    document.getElementById('hud-score').textContent = `Score: ${totalScore}`;
    const canvas = document.getElementById('game-canvas');
    startLevel(currentLevel, appearance, canvas, onLevelComplete);
}

function onLevelComplete(results) {
    totalScore += results.levelScore;

    const mins = Math.floor(results.elapsed / 60);
    const secs = Math.floor(results.elapsed % 60);

    document.getElementById('level-stats').innerHTML = `
        <div class="stat-row"><span class="stat-label">Time</span><span class="stat-value">${mins}:${secs.toString().padStart(2, '0')}</span></div>
        <div class="stat-row"><span class="stat-label">Stars</span><span class="stat-value">${results.starsCollected} / ${results.totalStars}</span></div>
        <div class="stat-row"><span class="stat-label">Completion Bonus</span><span class="stat-value">${results.completionBonus.toLocaleString()}</span></div>
        <div class="stat-row"><span class="stat-label">Time Bonus</span><span class="stat-value">${results.timeScore.toLocaleString()}</span></div>
        <div class="stat-row"><span class="stat-label">Star Bonus</span><span class="stat-value">${results.starScore.toLocaleString()}</span></div>
        <div class="stat-row total"><span class="stat-label">Level Score</span><span class="stat-value">${results.levelScore.toLocaleString()}</span></div>
        <div class="stat-row total"><span class="stat-label">Total Score</span><span class="stat-value">${totalScore.toLocaleString()}</span></div>
    `;

    currentLevel++;

    if (currentLevel > TOTAL_LEVELS) {
        document.getElementById('final-stats').innerHTML = `
            <div class="stat-row total"><span class="stat-label">Final Score</span><span class="stat-value">${totalScore.toLocaleString()}</span></div>
        `;
        showScreen('game-complete-screen');
    } else {
        document.getElementById('next-level-btn').textContent = `NEXT LEVEL (${currentLevel}/${TOTAL_LEVELS})`;
        showScreen('level-complete-screen');
    }
}

function init() {
    setupInput();
    initCustomization();

    document.getElementById('play-btn').addEventListener('click', () => {
        showScreen('customize-screen');
    });

    document.getElementById('start-btn').addEventListener('click', () => {
        currentLevel = 1;
        totalScore = 0;
        beginLevel();
    });

    document.getElementById('next-level-btn').addEventListener('click', () => {
        beginLevel();
    });

    document.getElementById('replay-btn').addEventListener('click', () => {
        stopGame();
        currentLevel = 1;
        totalScore = 0;
        showScreen('customize-screen');
    });
}

init();
