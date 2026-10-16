import './style.css';
import { Game } from './game.js';

const canvas = document.querySelector('#game-canvas');

try {
  const game = new Game(canvas);
  game.start();
} catch (error) {
  console.error('Unable to initialize Memory Maze:', error);
  document.querySelector('#error-message').textContent =
    error instanceof Error ? error.message : 'The 3D game could not be initialized.';
  document.querySelector('#error-screen').classList.remove('hidden');
}
