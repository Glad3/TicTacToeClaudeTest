/**
 * Extracts a room ID from various input formats:
 * - Direct room code: "room-abc123"
 * - Full URL: "http://localhost:3000/room/room-abc123"
 * - Relative path: "/room/room-abc123"
 *
 * @param input - The input string to extract room ID from
 * @returns The extracted room ID or null if invalid
 */
export function extractRoomId(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();

  // Check if it's already a valid room ID format
  if (/^room-[a-zA-Z0-9]+$/.test(trimmed)) {
    return trimmed;
  }

  // Try to extract from URL or path
  // Match patterns like /room/room-abc123 or http://domain.com/room/room-abc123
  const urlMatch = trimmed.match(/\/room\/(room-[a-zA-Z0-9]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // No valid room ID found
  return null;
}

/**
 * Validates if a string is a properly formatted room ID
 *
 * @param roomId - The room ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidRoomId(roomId: string): boolean {
  if (!roomId || typeof roomId !== 'string') {
    return false;
  }
  return /^room-[a-zA-Z0-9]+$/.test(roomId.trim());
}
