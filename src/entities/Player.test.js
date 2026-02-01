jest.mock('phaser', () => ({
  Math: {
    Distance: {
      Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
    }
  }
}));

import Player from './Player';

describe('Player.getNearbyNPCs', () => {
  const createPlayerStub = (x, y, radius) => {
    const player = Object.create(Player.prototype);
    player.sprite = { x, y };
    player.interactionRadius = radius;
    return player;
  };

  it('should return NPCs within interaction radius', () => {
    const player = createPlayerStub(0, 0, 10);
    const npcs = [
      { id: 'near', x: 3, y: 4 },
      { id: 'edge', x: 10, y: 0 },
      { id: 'far', x: 11, y: 0 }
    ];

    const result = player.getNearbyNPCs(npcs);
    expect(result.map((npc) => npc.id)).toEqual(['near', 'edge']);
  });

  it('should return empty array when no NPCs are in range', () => {
    const player = createPlayerStub(0, 0, 5);
    const npcs = [
      { id: 'far1', x: 10, y: 10 },
      { id: 'far2', x: -6, y: 0 }
    ];

    const result = player.getNearbyNPCs(npcs);
    expect(result).toEqual([]);
  });
});
