import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔹 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCvs1MtZtTrGIKXBDjQ-ihZlZiSm0F3DYU",
  authDomain: "jogo-da-velha-af636.firebaseapp.com",
  databaseURL: "https://jogo-da-velha-af636-default-rtdb.firebaseio.com",
  projectId: "jogo-da-velha-af636",
  storageBucket: "jogo-da-velha-af636.firebasestorage.app",
  messagingSenderId: "383498110542",
  appId: "1:383498110542:web:6e2046fa66df624649251f",
  measurementId: "G-8D3PT0CX28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Room fixed
const room = "room1";

// Game variables
let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;

// ⚡ Mode configuration
let mode = "local"; // "local" or "online"
let localPlayer = null; // player in online mode

// 🔹 Score
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const modeSelect = document.getElementById("modeSelect");

// Update scoreboard on screen
function updateScoreboard() {
  document.getElementById("scoreX").textContent = scoreX;
  document.getElementById("scoreO").textContent = scoreO;
  document.getElementById("scoreDraw").textContent = scoreDraw;
}

// 🔹 Update status on screen
function updateStatus() {
  if (gameOver) {
    statusText.style.color = "Chocolate";
    if (statusText.textContent.includes("venceu")) {
      statusText.style.color = "green";
    }
  } else {
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
    statusText.style.color = currentPlayer === "X" ? "DarkBlue" : "red";
  }
}


// 🔹 Check winner
function checkWinner() {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameOver = true;
      statusText.textContent = `Jogador ${board[a]} Ganhou!`;

      // Update score
      if (board[a] === "X") scoreX++;
      else scoreO++;
      updateScoreboard();
      saveState();

      return true;
    }
  }

  if (!board.includes("")) {
    gameOver = true;
    statusText.textContent = "Draw!";
    scoreDraw++;
    updateScoreboard();
    saveState();
    return true;
  }

  return false;
}

// 🔹 Save game state in Firebase (only online mode)
function saveState() {
  if (mode === "online") {
    update(ref(db, room), {
      board: board,
      currentPlayer: currentPlayer,
      gameOver: gameOver,
      scoreX: scoreX,
      scoreO: scoreO,
      scoreDraw: scoreDraw
    });
  }
}

// 🔹 Handle cell click
function cellClick(e) {
  const index = e.target.getAttribute("data-index");

  if (board[index] || gameOver) return;

  // Block move in online mode if not local player's turn
  if (mode === "online" && currentPlayer !== localPlayer) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (checkWinner()) {
    updateStatus();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  saveState();
  updateStatus();
}

// 🔹 Reset game
function resetGame() {
  board.fill("");
  gameOver = false;
  currentPlayer = "X";
  cells.forEach(cell => cell.textContent = "");
  saveState();
  updateStatus();
}

// 🔹 Start online mode
function startOnline() {
  const roomRef = ref(db, room);

  // Listen to Firebase changes
  onValue(roomRef, snapshot => {
    const data = snapshot.val();
    if (data) {
      board = data.board || Array(9).fill("");
      currentPlayer = data.currentPlayer || "X";
      gameOver = data.gameOver || false;

      // Restore scoreboard
      scoreX = data.scoreX || 0;
      scoreO = data.scoreO || 0;
      scoreDraw = data.scoreDraw || 0;
      updateScoreboard();

      cells.forEach((cell, i) => cell.textContent = board[i]);
      updateStatus();
    }
  });

  // If room doesn't exist, create initial state
  update(roomRef, {
    board: Array(9).fill(""),
    currentPlayer: "X",
    gameOver: false,
    scoreX: scoreX,
    scoreO: scoreO,
    scoreDraw: scoreDraw
  });
}

// 🔹 Event listeners
cells.forEach(cell => cell.addEventListener("click", cellClick));
resetBtn.addEventListener("click", resetGame);

// Change game mode
if (modeSelect) {
  modeSelect.addEventListener("change", e => {
    mode = e.target.value;
    if (mode === "online") {
      localPlayer = localPlayer === null ? "X" : "O";
      startOnline();
    } else {
      localPlayer = null;
      resetGame();
    }
  });
}

// Initial state
updateStatus();
updateScoreboard();
