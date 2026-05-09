// Maze generation using recursive backtracker (iterative DFS)

export function generateMaze(width, height) {
    const cells = [];
    for (let y = 0; y < height; y++) {
        cells[y] = [];
        for (let x = 0; x < width; x++) {
            cells[y][x] = {
                x, y,
                walls: { top: true, right: true, bottom: true, left: true },
                visited: false
            };
        }
    }

    const stack = [];
    cells[0][0].visited = true;
    stack.push(cells[0][0]);

    const dirs = [
        { dx: 0, dy: -1, wall: 'top', opposite: 'bottom' },
        { dx: 1, dy: 0, wall: 'right', opposite: 'left' },
        { dx: 0, dy: 1, wall: 'bottom', opposite: 'top' },
        { dx: -1, dy: 0, wall: 'left', opposite: 'right' }
    ];

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];

        for (const dir of dirs) {
            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && !cells[ny][nx].visited) {
                neighbors.push({ cell: cells[ny][nx], dir });
            }
        }

        if (neighbors.length === 0) {
            stack.pop();
        } else {
            const { cell: next, dir } = neighbors[Math.floor(Math.random() * neighbors.length)];
            current.walls[dir.wall] = false;
            next.walls[dir.opposite] = false;
            next.visited = true;
            stack.push(next);
        }
    }

    return cells;
}

// Convert cell-based maze to expanded boolean grid for collision detection.
// Each maze cell becomes a passage tile at (2x+1, 2y+1).
// Walls and intersections fill even-numbered positions.
export function toExpandedGrid(cells, width, height) {
    const gw = 2 * width + 1;
    const gh = 2 * height + 1;
    const grid = [];

    for (let y = 0; y < gh; y++) {
        grid[y] = new Uint8Array(gw); // all 0 = wall
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            grid[2 * y + 1][2 * x + 1] = 1; // cell center open

            if (!cells[y][x].walls.right && x < width - 1) {
                grid[2 * y + 1][2 * x + 2] = 1;
            }
            if (!cells[y][x].walls.bottom && y < height - 1) {
                grid[2 * y + 2][2 * x + 1] = 1;
            }
        }
    }

    return grid;
}

// Place stars at random maze cell positions (not start or end)
export function placeStars(width, height, count) {
    const available = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x === 0 && y === 0) continue;
            if (x === width - 1 && y === height - 1) continue;
            available.push({ x, y });
        }
    }

    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }

    return available.slice(0, Math.min(count, available.length)).map(pos => ({
        ...pos,
        collected: false
    }));
}
