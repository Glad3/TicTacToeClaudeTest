<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use TicTacToe\Api\Router;

$router = new Router();
$router->handleRequest();
