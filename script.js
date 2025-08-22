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

// Sala fixa
const room = "room1";

// Variáveis do jogo
let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let localPlayer = null; // jogador local (X ou O)

// ⚡ Configuração do modo
let mode = "local"; // "local" ou "online"

// 🔹 Placar
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

// Elementos HTML
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const modeSelect = document.getElementById("modeSelect");

// Player selection UI
const playerSelectDiv = document.getElementById("playerSelect");
const btnX = document.getElementById("chooseX");
const btnO = document.getElementById("chooseO");

// 🔹 Atualiza placar na tela
function updateScoreboard() {
  document.getElementById("scoreX").textContent = scoreX;
  document.getElementById("scoreO").textContent = scoreO;
  document.getElementById("scoreDraw").textContent = scoreDraw;
}

// 🔹 Atualiza status na tela
function updateStatus() {
  if (gameOver) {
    statusText.style.color = "Chocolate";
    if (statusText.textContent.includes("Ganhou")) {
      statusText.style.color = "green";
    }
  } else {
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
    statusText.style.color = currentPlayer === "X" ? "DarkBlue" : "red";
  }
}

// 🔹 Verifica vencedor
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

      if (board[a] === "X") scoreX++;
      else scoreO++;
      updateScoreboard();
      saveState();
      return true;
    }
  }

  if (!board.includes("")) {
    gameOver = true;
    statusText.textContent = "Empate!";
    scoreDraw++;
    updateScoreboard();
    saveState();
    return true;
  }

  return false;
}

// 🔹 Salva estado no Firebase
function saveState() {
  if (mode === "online") {
    update(ref(db, room), {
      board,
      currentPlayer,
      gameOver,
      scoreX,
      scoreO,
      scoreDraw
    });
  }
}

// 🔹 Ao clicar na célula
function cellClick(e) {
  const index = e.target.getAttribute("data-index");
  if (board[index] || gameOver) return;

  // Bloqueia jogada se não for a vez do jogador local
  if (mode === "online" && currentPlayer !== localPlayer) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (!checkWinner()) {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    saveState();
    updateStatus();
  } else {
    updateStatus();
  }
}

// 🔹 Reset do jogo (apenas tabuleiro, mantém placar)
function resetGame() {
  board.fill("");
  gameOver = false;
  currentPlayer = "X";
  cells.forEach(cell => cell.textContent = "");
  saveState();
  updateStatus();
}

// 🔹 Inicia modo online
function startOnline() {
  const roomRef = ref(db, room);

  // Escuta mudanças no Firebase
  onValue(roomRef, snapshot => {
    const data = snapshot.val() || {};

    board = data.board || Array(9).fill("");
    currentPlayer = data.currentPlayer || "X";
    gameOver = data.gameOver || false;

    // 🔹 Mantém o placar persistente
    scoreX = data.scoreX || 0;
    scoreO = data.scoreO || 0;
    scoreDraw = data.scoreDraw || 0;

    updateScoreboard();
    cells.forEach((cell, i) => cell.textContent = board[i]);
    updateStatus();
  });

  // Cria estado inicial se a sala estiver vazia
  update(roomRef, {
    board,
    currentPlayer,
    gameOver,
    scoreX,
    scoreO,
    scoreDraw
  });
}

// 🔹 Seleção de jogador na própria página
function choosePlayerUI() {
  playerSelectDiv.style.display = "flex"; // mostra apenas no modo online

  btnX.onclick = () => {
    localPlayer = "X";
    playerSelectDiv.style.display = "none";
    startOnline();
  };

  btnO.onclick = () => {
    localPlayer = "O";
    playerSelectDiv.style.display = "none";
    startOnline();
  };
}

// 🔹 Event listeners
cells.forEach(cell => cell.addEventListener("click", cellClick));
resetBtn.addEventListener("click", resetGame);

// 🔹 Mudar modo de jogo
if (modeSelect) {
  modeSelect.addEventListener("change", e => {
    mode = e.target.value;
    if (mode === "online") {
      choosePlayerUI(); // mostra seleção de jogador
    } else {
      localPlayer = null;
      resetGame();
      playerSelectDiv.style.display = "none"; // oculta seleção no modo local
    }
  });
}

// Estado inicial
updateStatus();
updateScoreboard();
