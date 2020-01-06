const canvas = new Cathanvas('root', {width: 500, height: 500});
const game = new Game(canvas);

// SNAKE
const snake = new Snake(canvas, game);
game.createObject(snake);

const pill = new Pill(canvas, game, snake);
game.createObject(pill);

game.startGame();
// ------------

// TETRIS
// ------------