<?php
session_start();
include './common.php';

if (!isset($_SESSION['player_id'])) {
    $_SESSION['player_id'] = uniqid();
}

if (!isset($_SESSION['game_id'])) {
    $_SESSION['game_id'] = null;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];

    if ($action == 'create') {
        $_SESSION['game_id'] = uniqid();
        $_SESSION['player_symbol'] = 'X'; // Creator of the game is 'X'
        initializeGameState($_SESSION['game_id'], $_SESSION['player_id'], 'X');
        echo json_encode(['game_id' => $_SESSION['game_id'], 'player_symbol' => 'X']);
    } elseif ($action == 'join') {
        $game_id = $_POST['game_id'];
        if (checkGameExists($game_id) && joinGame($game_id, $_SESSION['player_id'])) {
            $_SESSION['game_id'] = $game_id;
            $_SESSION['player_symbol'] = 'O'; // Joiner of the game is 'O'
            echo json_encode(['game_id' => $game_id, 'player_symbol' => 'O']);
        } else {
            echo json_encode(['error' => 'Game not found or already full']);
        }
    }
}
?>