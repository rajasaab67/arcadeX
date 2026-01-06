export class GridManager {
    constructor(container) {
        this.container = container;
        this.content = document.createElement('div');
        this.content.className = 'grid-content';
        this.container.appendChild(this.content);

        this.baseSize = 180; // Width of the octagon
        // Mathematical constant: 1 + sqrt(2) approx 2.414
        // s = width / (1 + sqrt(2))
        this.s = this.baseSize / (1 + Math.to_1_414); // wait, to_1_414 is not real.
        this.s = this.baseSize / (1 + Math.sqrt(2));

        this.games = [];
    }

    initialize(games) {
        this.games = games;
        this.render();
        this.attachHoverListeners();
    }

    // Helper to calculate geometry
    getGeometry() {
        const OCTAGON_SIZE = this.baseSize;
        const S = OCTAGON_SIZE / (1 + Math.sqrt(2)); // Side length of the octagon
        const RHOMBUS_BOUNDING_BOX = S * Math.sqrt(2); // Width/Height of the 45deg rotated square gap

        return { OCTAGON_SIZE, RHOMBUS_BOUNDING_BOX };
    }

    calculateGridDimensions() {
        // We need to fill the screen plus some buffer
        const width = window.innerWidth;
        const height = window.innerHeight;

        const { OCTAGON_SIZE } = this.getGeometry();

        const cols = Math.ceil(width / OCTAGON_SIZE) + 1;
        const rows = Math.ceil(height / OCTAGON_SIZE) + 1;

        return { cols, rows };
    }

    render() {
        this.content.innerHTML = '';
        const { cols, rows } = this.calculateGridDimensions();
        const { OCTAGON_SIZE, RHOMBUS_BOUNDING_BOX } = this.getGeometry();

        let gameIndex = 0;

        // Render Octagons (Main Grid)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Main Octagons
                const x = c * OCTAGON_SIZE;
                const y = r * OCTAGON_SIZE;

                // Get game data (looping if we run out)
                const game = this.games[gameIndex % this.games.length];
                gameIndex++;

                this.createOctagon(x, y, OCTAGON_SIZE, game);

                // Render Rhombus at the bottom-right corner of this octagon
                // Use a check to avoid rendering outside visible bounds excessively, 
                // but for seamless inputs we just render all intersections.
                // Intersection is at (x + size/2 + size/2, y + size/2 + size/2) ?
                // No, intersection is at the corner.
                // Octagon center is at (x + size/2, y + size/2).
                // Corner is at (x + size, y + size).
                // The Rhombus center should be at (x + size, y + size).
                // Top-Left of Rhombus = Center - RhombusSize/2.

                if (r < rows - 1 && c < cols - 1) {
                    this.createRhombus(
                        x + OCTAGON_SIZE - (RHOMBUS_BOUNDING_BOX / 2),
                        y + OCTAGON_SIZE - (RHOMBUS_BOUNDING_BOX / 2),
                        RHOMBUS_BOUNDING_BOX
                    );
                }
            }
        }
    }

    createOctagon(x, y, size, game) {
        const el = document.createElement('div');
        el.className = 'octagon';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        // Content
        const img = document.createElement('img');
        img.src = game.image;
        img.className = 'octagon-image';
        img.draggable = false;
        el.appendChild(img);

        // Add hover data
        el.dataset.title = game.title;

        this.content.appendChild(el);
    }

    createRhombus(x, y, size) {
        const el = document.createElement('div');
        el.className = 'rhombus';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        // Optional: Mini game indicator?
        // User said "Small rhombuses = arcade / mini games"
        // For now just visual style

        this.content.appendChild(el);
    }

    attachHoverListeners() {
        // Event delegation for performance
        // But we need mouseenter/leave which don't bubble well for this specific "dim others" boolean logic
        // actually they don't bubble. 'mouseover' bubbles.
        // Let's stick to individual listeners or use mouseover/out on container.

        // Using MouseOver/Out on container to toggle class
        // This handles the "hovering gap" issue naturally. 
        // If we are over an octagon -> add has-hover
        // If we are over a rhombus -> remove has-hover? 
        // User: "Rhombuses... Acts as secondary... Optional subtle glow"
        // "Other octagons and rhombuses: Slightly blur... dim" when hovering an octagon.

        this.content.addEventListener('mouseover', (e) => {
            const target = e.target.closest('.octagon');
            if (target) {
                this.content.classList.add('has-hover');
            } else {
                // If we moved to gap or rhombus, remove effect?
                // Logic: If I hover a rhombus, do I want the octagons to be dim?
                // "When cursor hovers over an octagon... Other octagons and rhombuses: Slightly blur".
                // Passively, if I hover a rhombus, nothing is specified to scale up.
                // So if I'm not over an octagon, I should probably remove the has-hover state so everything returns to normal.
                this.content.classList.remove('has-hover');
            }
        });

        this.content.addEventListener('mouseout', (e) => {
            // If we leave the container, remove
            if (!this.content.contains(e.relatedTarget)) {
                this.content.classList.remove('has-hover');
            }
        });
    }

    handleResize() {
        // Debounce could be added here
        this.render();
    }
}
