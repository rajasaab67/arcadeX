import { GridManager } from './grid.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-grid-container');
    const gridManager = new GridManager(container);

    // Mock Data
    const mainGames = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        title: `Game ${i + 1}`,
        image: `https://picsum.photos/seed/${i * 123}/400/400` // Placeholder images
    }));

    gridManager.initialize(mainGames);
    
    // Handle Window Resize
    window.addEventListener('resize', () => {
        gridManager.handleResize();
    });
});
