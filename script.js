import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔹 CONFIGURAÇÃO DO FIREBASE
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

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Sala fixa
const sala = "sala1";

// Variáveis do jogo
let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;

// ⚡ Configuração de modo
let modo = "local"; // "local" ou "online"
let playerLocal = "X"; // No modo online, define se é X ou O

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const modeSelect = document.getElementById("modeSelect"); // Um select para escolher modo

// 🔹 Atualiza status na tela
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
      statusText.textContent = `Jogador ${board[a]} venceu!`;
      return true;
    }
  }

  if (!board.includes("")) {
    gameOver = true;
    statusText.textContent = "Empate!";
    return true;
  }

  return false;
}

// 🔹 Salvar estado no Firebase (apenas modo online)
function salvarEstado() {
  if (modo === "online") {
    update(ref(db, sala), {
      board: board,
      currentPlayer: currentPlayer,
      gameOver: gameOver,
    });
  }
}

// 🔹 Quando clica em uma célula
function cellClick(e) {
  const index = e.target.getAttribute("data-index");

  if (board[index] || gameOver) return;

  // Bloqueia jogada online se não for a vez do jogador
  if (modo === "online" && currentPlayer !== playerLocal) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (checkWinner()) {
    salvarEstado();
    updateStatus();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  salvarEstado();
  updateStatus();
}

// 🔹 Reiniciar jogo
function resetGame() {
  board.fill("");
  gameOver = false;
  currentPlayer = "X";
  cells.forEach(cell => cell.textContent = "");
  salvarEstado();
  updateStatus();
}

// 🔹 Escutar mudanças do Firebase em tempo real (modo online)
if (modo === "online") {
  onValue(ref(db, sala), snapshot => {
    const data = snapshot.val();
    if (data) {
      board = data.board;
      currentPlayer = data.currentPlayer;
      gameOver = data.gameOver;
      cells.forEach((cell, i) => cell.textContent = board[i]);
      updateStatus();
    }
  });
}

// 🔹 Listeners
cells.forEach(cell => cell.addEventListener("click", cellClick));
resetBtn.addEventListener("click", resetGame);

// Mudar modo de jogo
if (modeSelect) {
  modeSelect.addEventListener("change", e => {
    modo = e.target.value;
    if (modo === "online") {
      playerLocal = "X"; // ou "O" se quiser definir jogador manualmente
      onValue(ref(db, sala), snapshot => {
        const data = snapshot.val();
        if (data) {
          board = data.board;
          currentPlayer = data.currentPlayer;
          gameOver = data.gameOver;
          cells.forEach((cell, i) => cell.textContent = board[i]);
          updateStatus();
        }
      });
    }
  });
}

// Estado inicial
updateStatus();
