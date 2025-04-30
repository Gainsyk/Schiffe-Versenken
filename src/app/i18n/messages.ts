export const MESSAGE_KEYS = ['carrier', 'battleship', 'cruiser', 'destroyer','submarine'] as const;
export type MessageKey = typeof MESSAGE_KEYS[number];

export const Messages: Record<MessageKey, string> = {
  carrier: 'Your aircraft carrier has been placed!',
  battleship: 'Your battleship has been placed!',
  cruiser: 'Your cruiser has been placed!',
  destroyer: 'Your destroyer has been placed!',
  submarine: 'Your submarine has been placed!'
}

export function getVesselMessage(key: MessageKey): string {
  return Messages[key];
}
