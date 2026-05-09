export const COLOR_OPTIONS = {
    hair: [
        { name: 'Black', value: '#1a1a2e' },
        { name: 'Brown', value: '#6b4423' },
        { name: 'Blonde', value: '#f0c75e' },
        { name: 'Red', value: '#c0392b' },
        { name: 'Blue', value: '#2980b9' },
        { name: 'Green', value: '#27ae60' },
        { name: 'Purple', value: '#8e44ad' },
        { name: 'Pink', value: '#e91e8b' }
    ],
    shirt: [
        { name: 'Red', value: '#e74c3c' },
        { name: 'Blue', value: '#3498db' },
        { name: 'Green', value: '#2ecc71' },
        { name: 'Yellow', value: '#f1c40f' },
        { name: 'White', value: '#ecf0f1' },
        { name: 'Dark', value: '#2c3e50' },
        { name: 'Purple', value: '#9b59b6' },
        { name: 'Orange', value: '#e67e22' }
    ],
    pants: [
        { name: 'Jeans', value: '#2c5f8a' },
        { name: 'Black', value: '#1a1a2e' },
        { name: 'Khaki', value: '#c9a96e' },
        { name: 'Grey', value: '#7f8c8d' },
        { name: 'Brown', value: '#6b4423' },
        { name: 'Green', value: '#27ae60' }
    ],
    shoes: [
        { name: 'Black', value: '#1a1a2e' },
        { name: 'Brown', value: '#8b5e3c' },
        { name: 'White', value: '#ecf0f1' },
        { name: 'Red', value: '#e74c3c' },
        { name: 'Blue', value: '#3498db' }
    ]
};

export const DEFAULT_APPEARANCE = {
    hair: COLOR_OPTIONS.hair[1].value,
    shirt: COLOR_OPTIONS.shirt[0].value,
    pants: COLOR_OPTIONS.pants[0].value,
    shoes: COLOR_OPTIONS.shoes[0].value
};

// Draw a top-down character with customizable colors.
// (cx, cy) is the center, size is the total height.
export function drawCharacter(ctx, cx, cy, size, appearance) {
    const s = size;
    const x = cx - s / 2;
    const y = cy - s / 2;
    const headR = s * 0.18;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx + 1, y + s * 0.95, s * 0.28, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoes
    ctx.fillStyle = appearance.shoes;
    ctx.fillRect(x + s * 0.18, y + s * 0.83, s * 0.18, s * 0.13);
    ctx.fillRect(x + s * 0.64, y + s * 0.83, s * 0.18, s * 0.13);

    // Pants
    ctx.fillStyle = appearance.pants;
    ctx.fillRect(x + s * 0.17, y + s * 0.60, s * 0.20, s * 0.25);
    ctx.fillRect(x + s * 0.63, y + s * 0.60, s * 0.20, s * 0.25);

    // Shirt
    ctx.fillStyle = appearance.shirt;
    const bx = x + s * 0.22;
    const by = y + s * 0.32;
    const bw = s * 0.56;
    const bh = s * 0.30;
    const br = s * 0.06;
    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.lineTo(bx + bw - br, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx, by + br);
    ctx.quadraticCurveTo(bx, by, bx + br, by);
    ctx.fill();

    // Head
    ctx.fillStyle = '#deb887';
    ctx.beginPath();
    ctx.arc(cx, y + s * 0.20, headR, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = appearance.hair;
    ctx.beginPath();
    ctx.arc(cx, y + s * 0.17, headR * 1.12, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - headR * 1.12, y + s * 0.10, headR * 2.24, s * 0.07);

    // Eyes (only when big enough to see)
    if (s > 20) {
        ctx.fillStyle = '#1a1a2e';
        const ew = Math.max(1, s * 0.04);
        ctx.fillRect(cx - s * 0.08, y + s * 0.20, ew, ew);
        ctx.fillRect(cx + s * 0.04, y + s * 0.20, ew, ew);
    }
}

export function drawCharacterPreview(ctx, width, height, appearance) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#141428';
    ctx.fillRect(0, 0, width, height);

    const size = Math.min(width, height) * 0.7;
    drawCharacter(ctx, width / 2, height / 2 + 4, size, appearance);
}
