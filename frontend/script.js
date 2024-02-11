document.addEventListener("DOMContentLoaded", function () {
  const createGameBtn = document.getElementById("create-game");
  const joinGameBtn = document.getElementById("join-game");
  const restartGameBtn = document.getElementById("restart-game");
  const gameIdInput = document.getElementById("join-game-id");
  const gameBoard = document.getElementById("game-board");
  const gameInfo = document.getElementById("game-info");
  const roomInfo = document.getElementById("room-info");
  let gameId = null;
  let playerSymbol = null;
  let isEnded = false;

  // Function to regularly check the game state
  function pollGameState() {
    updateBoard(); // Call updateBoard immediately to update the board
    setInterval(updateBoard, 500); // Update the board real-time
  }

  createGameBtn.addEventListener("click", function () {
    fetch("/backend/session.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "action=create",
    })
      .then((response) => response.json())
      .then((data) => {
        gameId = data.game_id;
        playerSymbol = data.player_symbol; // Store the player's symbol
        roomInfo.innerHTML =
          "Game ID: <b class='room-id'>" +
          gameId +
          "</b> You are: " +
          playerSymbol;
        createBoard();
        pollGameState(); // Start polling when the game is created
      });
  });

  joinGameBtn.addEventListener("click", function () {
    const joinGameId = gameIdInput.value;
    fetch("/backend/session.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=join&game_id=${joinGameId}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          roomInfo.innerText = data.error;
        } else {
          gameId = data.game_id;
          playerSymbol = data.player_symbol; // Store the player's symbol
          roomInfo.innerHTML =
            "Game ID: <b class='room-id'>" +
            gameId +
            "</b> You are: " +
            playerSymbol;
          createBoard();
          pollGameState(); // Start polling when the game is created
        }
      });
  });

  restartGameBtn.addEventListener("click", function () {
    fetch("/backend/game.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "action=restart",
    })
      .then(() => {
        restartGame();
      })
      .catch((error) => console.error("Error:", error));
  });

  function restartGame() {
    isEnded = false;
    gameInfo.innerText = "Game restarted. Waiting for moves...";
    createBoard(); // Re-create the game board
    restartGameBtn.style.display = "none"; // Hide the restart button
  }

  function handleCellClick() {
    const index = this.dataset.index; // Make sure you set this attribute when creating the cell
    if (gameId && this.innerText === "" && !isEnded) {
      fetchCurrentGameStateAndMakeMove(index);
    }
  }

  function createBoard() {
    gameBoard.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = i; // Set index as a data attribute
      cell.addEventListener("click", handleCellClick);
      gameBoard.appendChild(cell);
    }
    updateBoard();
  }

  function fetchCurrentGameStateAndMakeMove(index) {
    fetch("/backend/game.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=state`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.current_player === playerSymbol) {
          makeMove(index);
        } else {
          alert("Not your turn");
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  function makeMove(index) {
    fetch("/backend/game.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=move&cell_index=${index}`,
    }).then(() => {
      updateBoard();
    });
  }

  function updateBoard() {
    if (gameId) {
      fetch("/backend/game.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=state`,
      })
        .then((response) => response.json())
        .then((data) => {
          const cells = gameBoard.children;
          for (let i = 0; i < cells.length; i++) {
            cells[i].innerText = data.board[i] ? data.board[i] : "";
          }
          if (data.winner) {
            gameInfo.innerText =
              data.winner === "T" ? "Tie Game" : "Winner: " + data.winner;
            isEnded = true;
            restartGameBtn.style.display = "block"; // Show the restart button
          } else {
            if (isEnded) restartGame();
            gameInfo.innerText =
              "Current Player: " +
              (data.current_player === playerSymbol ? "You" : "Opponent");
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }
});
