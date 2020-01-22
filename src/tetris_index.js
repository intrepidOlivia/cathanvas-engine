// TETRIS
const canvas = new Cathanvas('root', {width: 500, height: window.innerHeight});
const game = new Game(canvas);
const tetris = new Tetris(game);
tetris.spawnTetromino();
game.createObject(tetris);
game.startGame();

// ------------