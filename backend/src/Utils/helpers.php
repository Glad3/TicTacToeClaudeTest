<?php

declare(strict_types=1);

namespace TicTacToe\Utils;

/**
 * Utility helper functions for the Tic Tac Toe application
 */
class Helpers
{
    /**
     * Send a JSON response with appropriate headers
     *
     * @param array<string, mixed> $data
     */
    public static function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
    }

    /**
     * Get JSON input from request body
     *
     * @return array<string, mixed>|null
     */
    public static function getJsonInput(): ?array
    {
        $input = file_get_contents('php://input');
        if ($input === false || $input === '') {
            return null;
        }

        $decoded = json_decode($input, true);
        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Validate that required fields exist in an array
     *
     * @param array<string, mixed> $data
     * @param array<int, string> $requiredFields
     * @return array<int, string> Missing fields
     */
    public static function validateRequired(array $data, array $requiredFields): array
    {
        $missing = [];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                $missing[] = $field;
            }
        }
        return $missing;
    }

    /**
     * Generate a simple unique ID for game sessions
     */
    public static function generateGameId(): string
    {
        return bin2hex(random_bytes(8));
    }
}
