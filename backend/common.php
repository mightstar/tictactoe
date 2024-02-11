<?php
function initializeGameState($game_id, $player_id, $player_symbol)
{
    // This should ideally interface with a database
    $_SESSION['game_state'][$game_id] = [
        'board' => array_fill(0, 9, null),
        'players' => [
            $player_id => $player_symbol
        ],
        'current_player' => $player_symbol,
        'winner' => null,
    ];
}

function joinGame($game_id, $join_player_id)
{
    if (isset($_SESSION['game_state'][$game_id]) && count($_SESSION['game_state'][$game_id]['players']) < 2) {
        $_SESSION['game_state'][$game_id]['players'][$join_player_id] = 'O';
        return true;
    }
    return false;
}

function makeMove($game_id, $player_id, $cell_index)
{
    if ($_SESSION['game_state'][$game_id]['board'][$cell_index] === null) {
        $_SESSION['game_state'][$game_id]['board'][$cell_index] = $_SESSION['game_state'][$game_id]['current_player'];
        checkWinner($game_id);
        $_SESSION['game_state'][$game_id]['current_player'] = ($_SESSION['game_state'][$game_id]['current_player'] == 'X') ? 'O' : 'X';
    }
}

function getGameState($game_id)
{
    return $_SESSION['game_state'][$game_id];
}

function checkGameExists($game_id)
{
    return isset($_SESSION['game_state'][$game_id]);
}

function checkWinner($game_id)
{
    $board = $_SESSION['game_state'][$game_id]['board'];
    $winning_combinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // columns
        [0, 4, 8],
        [2, 4, 6]  // diagonals
    ];

    foreach ($winning_combinations as $combination) {
        if ($board[$combination[0]] && $board[$combination[0]] == $board[$combination[1]] && $board[$combination[0]] == $board[$combination[2]]) {
            $_SESSION['game_state'][$game_id]['winner'] = $board[$combination[0]];
            return;
        }
    }

    if (!in_array(null, $board)) {
        $_SESSION['game_state'][$game_id]['winner'] = 'T'; // T for tie
    }
}
?>