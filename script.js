let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; 
let gameOver = false;

const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

function updateStatus() {
  if (gameOver) {
    if (statusText.textContent === 'Empate!') {
      statusText.style.color = 'Chocolate';
    } else {
      statusText.style.color = 'green';
    }
  } else {
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
    
    if (currentPlayer === 'X') {
      statusText.style.color = 'DarkBlue';
    } else {
      statusText.style.color = 'red';
    }
  }
}

function checkWinner() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameOver = true;
      statusText.textContent = `Jogador ${currentPlayer} venceu!`;
      return true;
    }
  }

  if (!board.includes('')) {
    gameOver = true;
    statusText.textContent = 'Empate!';
    return true;
  }

  return false;
}

function cellClick(e) {
  const index = e.target.getAttribute('data-index');

  if (board[index] || gameOver) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (checkWinner()) {
    updateStatus();
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  gameOver = false;
  currentPlayer = 'X';
  cells.forEach(cell => cell.textContent = '');
  updateStatus();
}

cells.forEach(cell => cell.addEventListener('click', cellClick));

resetBtn.addEventListener('click', resetGame);

updateStatus();
