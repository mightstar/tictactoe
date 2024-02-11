<?php
session_start();
include './common.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $game_id = $_SESSION['game_id'];
    $player_id = $_SESSION['player_id'];
    $action = $_POST['action'];

    if ($action == 'move') {
        $cell_index = $_POST['cell_index'];
        makeMove($game_id, $player_id, $cell_index);
    } elseif ($action == 'state') {
        $state = getGameState($game_id);
        echo json_encode($state);
    } elseif ($action == 'restart') {
        // Handle the restart action
        if ($game_id && isset($_SESSION['game_state'][$game_id])) {
            restartGame($game_id);
        }
    }
}

function restartGame($game_id)
{
    $players = $_SESSION['game_state'][$game_id]['players'];
    $_SESSION['game_state'][$game_id] = [
        'board' => array_fill(0, 9, null),
        'players' => $players,
        'current_player' => 'X',
        'winner' => null,
    ];
}

?>