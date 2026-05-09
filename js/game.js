import { generateMaze, toExpandedGrid, placeStars } from './maze.js';
import { drawCharacter } from './character.js';

const LEVELS = [
    { width: 5,  height: 5,  stars: 3,  timeBonus: 60 },
    { width: 7,  height: 7,  stars: 5,  timeBonus: 90 },
    { width: 9,  height: 9,  stars: 7,  timeBonus: 120 },
    { width: 11, height: 11, stars: 9,  timeBonus: 150 },
    { width: 13, height: 13, stars: 11, timeBonus: 180 },
    { width: 15, height: 15, stars: 13, timeBonus: 210 },
    { width: 17, height: 17, stars: 15, timeBonus: 240 },
    { width: 19, height: 19, stars: 17, timeBonus: 270 },
    { width: 21, height: 21, stars: 19, timeBonus: 300 },
    { width: 25, height: 25, stars: 21, timeBonus: 360 }
];

export const TOTAL_LEVELS = LEVELS.length;

let state = null;
let keys = {};
let animFrameId = null;

export function startLevel(levelNum, appearance, canvas, onComplete) {
    const level = LEVELS[levelNum - 1];
    const ctx = canvas.getContext('2d');

    const gridW = 2 * level.width + 1;
    const gridH = 2 * level.height + 1;
    const maxSize = Math.min(600, window.innerWidth - 40, window.innerHeight - 180);
    const tileSize = Math.floor(maxSize / Math.max(gridW, gridH));
    const canvasW = tileSize * gridW;
    const canvasH = tileSize * gridH;

    canvas.width = canvasW;
    canvas.height = canvasH;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';

    const cells = generateMaze(level.width, level.height);
    const grid = toExpandedGrid(cells, level.width, level.height);
    const stars = placeStars(level.width, level.height, level.stars);

    state = {
        ctx, canvas, level, levelNum,
        grid, gridW, gridH, tileSize,
        stars, appearance, onComplete,
        playerX: 1.5 * tileSize,
        playerY: 1.5 * tileSize,
        playerRadius: tileSize * 0.25,
        endGX: 2 * level.width - 1,
        endGY: 2 * level.height - 1,
        elapsed: 0,
        starsCollected: 0,
        running: true,
        lastTime: null,
        pulse: 0
    };

    keys = {};
    if (animFrameId) cancelAnimationFrame(animFrameId);
    state.lastTime = performance.now();
    animFrameId = requestAnimationFrame(gameLoop);
}

export function stopGame() {
    if (state) state.running = false;
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
}

export function setupInput() {
    window.addEventListener('keydown', e => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) {
            e.preventDefault();
            keys[e.key] = true;
        }
    });
    window.addEventListener('keyup', e => {
        keys[e.key] = false;
    });
}

function gameLoop(timestamp) {
    if (!state || !state.running) return;
    const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
    state.lastTime = timestamp;
    update(dt);
    render();
    animFrameId = requestAnimationFrame(gameLoop);
}

function update(dt) {
    state.elapsed += dt;
    state.pulse += dt;

    const speed = Math.max(160, state.tileSize * 5.5);
    let dx = 0, dy = 0;

    if (keys.ArrowLeft  || keys.a) dx -= 1;
    if (keys.ArrowRight || keys.d) dx += 1;
    if (keys.ArrowUp    || keys.w) dy -= 1;
    if (keys.ArrowDown  || keys.s) dy += 1;

    if (dx !== 0 && dy !== 0) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
    }

    const moveX = dx * speed * dt;
    const moveY = dy * speed * dt;

    if (moveX !== 0 && !collidesWithWall(state.playerX + moveX, state.playerY)) {
        state.playerX += moveX;
    }
    if (moveY !== 0 && !collidesWithWall(state.playerX, state.playerY + moveY)) {
        state.playerY += moveY;
    }

    // Star collection
    const ts = state.tileSize;
    for (const star of state.stars) {
        if (star.collected) continue;
        const sx = (2 * star.x + 1.5) * ts;
        const sy = (2 * star.y + 1.5) * ts;
        if (Math.hypot(state.playerX - sx, state.playerY - sy) < ts * 0.6) {
            star.collected = true;
            state.starsCollected++;
        }
    }

    // End check
    const endPX = (state.endGX + 0.5) * ts;
    const endPY = (state.endGY + 0.5) * ts;
    if (Math.hypot(state.playerX - endPX, state.playerY - endPY) < ts * 0.5) {
        state.running = false;
        cancelAnimationFrame(animFrameId);
        animFrameId = null;

        const timeRemaining = Math.max(0, state.level.timeBonus - state.elapsed);
        const timeScore = Math.round(timeRemaining * 10 * state.levelNum);
        const starScore = state.starsCollected * 100 * state.levelNum;
        const completionBonus = 200 * state.levelNum;

        state.onComplete({
            elapsed: state.elapsed,
            starsCollected: state.starsCollected,
            totalStars: state.stars.length,
            timeScore,
            starScore,
            completionBonus,
            levelScore: timeScore + starScore + completionBonus
        });
    }

    updateHUD();
}

function collidesWithWall(px, py) {
    const r = state.playerRadius;
    const ts = state.tileSize;
    const corners = [
        [px - r, py - r],
        [px + r, py - r],
        [px - r, py + r],
        [px + r, py + r]
    ];
    for (const [cx, cy] of corners) {
        const gx = Math.floor(cx / ts);
        const gy = Math.floor(cy / ts);
        if (gx < 0 || gy < 0 || gx >= state.gridW || gy >= state.gridH) return true;
        if (state.grid[gy][gx] === 0) return true;
    }
    return false;
}

function updateHUD() {
    const mins = Math.floor(state.elapsed / 60);
    const secs = Math.floor(state.elapsed % 60);
    document.getElementById('hud-level').textContent = `Level ${state.levelNum}`;
    document.getElementById('hud-time').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('hud-stars').textContent = `\u2605 ${state.starsCollected}/${state.stars.length}`;
}

// ── Rendering ──────────────────────────────────────────────

function render() {
    const { ctx, canvas, grid, gridW, gridH, tileSize: ts,
            stars, playerX, playerY, appearance, endGX, endGY, pulse } = state;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Maze tiles
    for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
            const px = x * ts;
            const py = y * ts;
            if (grid[y][x] === 1) {
                ctx.fillStyle = '#d5c8b8';
                ctx.fillRect(px, py, ts, ts);
            } else {
                ctx.fillStyle = '#1e2a3a';
                ctx.fillRect(px, py, ts, ts);
                if (ts > 6) {
                    ctx.fillStyle = '#253545';
                    ctx.fillRect(px, py, ts, 1);
                    ctx.fillRect(px, py, 1, ts);
                }
            }
        }
    }

    // Start marker
    ctx.fillStyle = 'rgba(46, 204, 113, 0.35)';
    ctx.fillRect(ts, ts, ts, ts);
    if (ts > 10) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
        ctx.font = `bold ${Math.max(8, ts * 0.45)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', 1.5 * ts, 1.5 * ts);
    }

    // End marker (pulsing)
    const ep = 0.3 + 0.15 * Math.sin(pulse * 3);
    ctx.fillStyle = `rgba(231, 76, 60, ${ep})`;
    ctx.fillRect(endGX * ts, endGY * ts, ts, ts);
    if (ts > 10) {
        ctx.fillStyle = 'rgba(231, 76, 60, 0.85)';
        ctx.font = `bold ${Math.max(8, ts * 0.45)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', (endGX + 0.5) * ts, (endGY + 0.5) * ts);
    }

    // Stars
    for (const star of stars) {
        if (star.collected) continue;
        const sx = (2 * star.x + 1.5) * ts;
        const sy = (2 * star.y + 1.5) * ts;
        const r = ts * 0.3 + ts * 0.04 * Math.sin(pulse * 4);
        drawStarShape(ctx, sx, sy, r, r * 0.45);
    }

    // Character
    drawCharacter(ctx, playerX, playerY, ts * 0.85, appearance);
}

function drawStarShape(ctx, cx, cy, outerR, innerR) {
    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = outerR * 1.5;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const oa = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const ia = oa + Math.PI / 5;
        if (i === 0) ctx.moveTo(cx + outerR * Math.cos(oa), cy + outerR * Math.sin(oa));
        else         ctx.lineTo(cx + outerR * Math.cos(oa), cy + outerR * Math.sin(oa));
        ctx.lineTo(cx + innerR * Math.cos(ia), cy + innerR * Math.sin(ia));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}
