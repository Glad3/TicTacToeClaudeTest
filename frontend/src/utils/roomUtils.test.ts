import { describe, it, expect } from 'vitest';
import { extractRoomId, isValidRoomId } from './roomUtils';

describe('roomUtils', () => {
  describe('extractRoomId', () => {
    it('extracts valid room ID from direct input', () => {
      expect(extractRoomId('room-abc123')).toBe('room-abc123');
      expect(extractRoomId('room-XYZ789')).toBe('room-XYZ789');
      expect(extractRoomId('room-test123ABC')).toBe('room-test123ABC');
    });

    it('extracts room ID from full URL', () => {
      expect(extractRoomId('http://localhost:3000/room/room-abc123')).toBe('room-abc123');
      expect(extractRoomId('https://example.com/room/room-test123')).toBe('room-test123');
      expect(extractRoomId('https://example.com:8080/room/room-xyz')).toBe('room-xyz');
    });

    it('extracts room ID from relative path', () => {
      expect(extractRoomId('/room/room-abc123')).toBe('room-abc123');
      expect(extractRoomId('/room/room-test')).toBe('room-test');
    });

    it('handles whitespace in input', () => {
      expect(extractRoomId('  room-abc123  ')).toBe('room-abc123');
      expect(extractRoomId('  /room/room-test123  ')).toBe('room-test123');
    });

    it('returns null for invalid formats', () => {
      expect(extractRoomId('abc123')).toBeNull();
      expect(extractRoomId('room-')).toBeNull();
      expect(extractRoomId('invalid-format')).toBeNull();
      expect(extractRoomId('/rooms/room-abc123')).toBeNull(); // wrong path
      expect(extractRoomId('room-abc 123')).toBeNull(); // space in ID
    });

    it('returns null for empty or invalid input', () => {
      expect(extractRoomId('')).toBeNull();
      expect(extractRoomId('   ')).toBeNull();
      expect(extractRoomId(null as any)).toBeNull();
      expect(extractRoomId(undefined as any)).toBeNull();
      expect(extractRoomId(123 as any)).toBeNull();
    });

    it('handles URLs with query parameters', () => {
      expect(extractRoomId('http://localhost:3000/room/room-abc123?player=1')).toBe('room-abc123');
      expect(extractRoomId('https://example.com/room/room-test?foo=bar&baz=qux')).toBe('room-test');
    });

    it('handles URLs with hash fragments', () => {
      expect(extractRoomId('http://localhost:3000/room/room-abc123#section')).toBe('room-abc123');
      expect(extractRoomId('/room/room-test#top')).toBe('room-test');
    });
  });

  describe('isValidRoomId', () => {
    it('validates correct room ID format', () => {
      expect(isValidRoomId('room-abc123')).toBe(true);
      expect(isValidRoomId('room-XYZ789')).toBe(true);
      expect(isValidRoomId('room-test123ABC')).toBe(true);
      expect(isValidRoomId('room-a')).toBe(true);
      expect(isValidRoomId('room-123')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidRoomId('abc123')).toBe(false);
      expect(isValidRoomId('room-')).toBe(false);
      expect(isValidRoomId('room-abc 123')).toBe(false);
      expect(isValidRoomId('room-abc-123')).toBe(false); // hyphen not allowed in suffix
      expect(isValidRoomId('room_abc123')).toBe(false); // underscore instead of hyphen
      expect(isValidRoomId('ROOM-abc123')).toBe(false); // uppercase prefix
    });

    it('handles whitespace correctly', () => {
      expect(isValidRoomId('  room-abc123  ')).toBe(true);
      expect(isValidRoomId('  invalid  ')).toBe(false);
    });

    it('rejects empty or invalid input', () => {
      expect(isValidRoomId('')).toBe(false);
      expect(isValidRoomId('   ')).toBe(false);
      expect(isValidRoomId(null as any)).toBe(false);
      expect(isValidRoomId(undefined as any)).toBe(false);
      expect(isValidRoomId(123 as any)).toBe(false);
    });

    it('rejects special characters', () => {
      expect(isValidRoomId('room-abc@123')).toBe(false);
      expect(isValidRoomId('room-abc#123')).toBe(false);
      expect(isValidRoomId('room-abc$123')).toBe(false);
      expect(isValidRoomId('room-abc!123')).toBe(false);
    });
  });
});
