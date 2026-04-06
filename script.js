const COLS = 7;
const ROWS = 6;
let board = [];
let currentPlayer = 1;
let scores = { 1: 0, 2: 0 };
let moveHistory = [];

const boardEl = document.getElementById('board');
const turnIndicator = document.getElementById('turnIndicator');
const restartBtn = document.getElementById('restartBtn');
const undoBtn = document.getElementById('undoBtn');
const themeToggle = document.getElementById('themeToggle');
const scoreRedEl = document.getElementById('scoreRed');
const scoreYellowEl = document.getElementById('scoreYellow');
const bgMusic = document.getElementById('bgMusic');
const dropSound = document.getElementById('dropSound');
const winSound = document.getElementById('winSound');

createBoard();
renderBoard();

document.body.addEventListener('click', () => {
  if (bgMusic.paused) bgMusic.play();
});

restartBtn.addEventListener('click', restartGame);
undoBtn.addEventListener('click', undoMove);
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

function createBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  moveHistory = [];
}

function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.col = c;
      if (board[r][c]) {
        const disc = document.createElement('div');
        disc.classList.add('disc', 'drop');
        disc.style.background = board[r][c] === 1 ? 'red' : 'yellow';
        cell.appendChild(disc);
      }
      cell.addEventListener('click', () => handleClick(c));
      boardEl.appendChild(cell);
    }
  }
}

function handleClick(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = currentPlayer;
      moveHistory.push({ row: r, col, player: currentPlayer });
      dropSound.currentTime = 0;
      dropSound.play();
      renderBoard();
      if (checkWin(r, col)) return endGame(false);
      if (checkDraw()) return endGame(true);
      switchPlayer();
      return;
    }
  }
}

function undoMove() {
  if (!moveHistory.length) return;
  const last = moveHistory.pop();
  board[last.row][last.col] = 0;
  currentPlayer = last.player;
  turnIndicator.textContent = `Player ${currentPlayer}'s turn (${currentPlayer === 1 ? '🔴' : '🟡'})`;
  renderBoard();
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  turnIndicator.textContent = `Player ${currentPlayer}'s turn (${currentPlayer === 1 ? '🔴' : '🟡'})`;
}

function checkWin(r, c) {
  return (
    countDir(r, c, 0, 1) + countDir(r, c, 0, -1) > 2 ||
    countDir(r, c, 1, 0) + countDir(r, c, -1, 0) > 2 ||
    countDir(r, c, 1, 1) + countDir(r, c, -1, -1) > 2 ||
    countDir(r, c, 1, -1) + countDir(r, c, -1, 1) > 2
  );
}

function countDir(r, c, dr, dc) {
  let count = 0;
  let rr = r + dr;
  let cc = c + dc;
  while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr][cc] === currentPlayer) {
    count++;
    rr += dr;
    cc += dc;
  }
  return count;
}

function checkDraw() {
  return board.flat().every(cell => cell);
}

function endGame(draw) {
  if (!draw) {
    winSound.currentTime = 0;
    winSound.play();
    scores[currentPlayer]++;
    updateScores();
    showWinner(`Player ${currentPlayer} (${currentPlayer === 1 ? '🔴' : '🟡'})`);
  } else {
    alert("It's a draw!");
    restartGame();
  }
}

function updateScores() {
  scoreRedEl.textContent = scores[1];
  scoreYellowEl.textContent = scores[2];
}

function restartGame() {
  createBoard();
  currentPlayer = 1;
  turnIndicator.textContent = `Player 1's turn (🔴)`;
  renderBoard();
}

// 🎇 Confetti poppers & winner overlay
function showWinner(playerName) {
  const winnerTextEl = document.getElementById("winner-text");
  const winMessageEl = document.getElementById("win-message");

  winnerTextEl.textContent = `${playerName} wins!`;
  winMessageEl.style.display = "flex";

  confetti({
    particleCount: 250,
    spread: 100,
    origin: { y: 0.6 }
  });

  setTimeout(() => {
    winMessageEl.style.display = "none";
    restartGame();
  }, 5000);
}
