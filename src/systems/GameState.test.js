import GameState from '../../src/systems/GameState';

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState({
      timerSeconds: 120,
      guestIds: ['guest-1', 'guest-2', 'guest-3'],
      cluePool: ['blue eyes', 'scar', 'freckles']
    });
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const defaultState = new GameState();
      expect(defaultState.timerSeconds).toBe(120);
      expect(defaultState.guestIds.length).toBe(12);
      expect(defaultState.cluePool.length).toBeGreaterThan(0);
    });

    it('should initialize with custom values', () => {
      const customState = new GameState({
        timerSeconds: 60,
        guestIds: ['a', 'b', 'c'],
        cluePool: ['feature1', 'feature2']
      });
      expect(customState.timerSeconds).toBe(60);
      expect(customState.guestIds).toEqual(['a', 'b', 'c']);
    });

    it('should have no thief or clue selected initially', () => {
      expect(gameState.thiefId).toBeNull();
      expect(gameState.clueFeature).toBeNull();
    });
  });

  describe('initializeRound', () => {
    it('should select a random thief from guest list', () => {
      gameState.initializeRound();
      expect(gameState.thiefId).toBeDefined();
      expect(gameState.guestIds).toContain(gameState.thiefId);
    });

    it('should select a random clue from pool', () => {
      gameState.initializeRound();
      expect(gameState.clueFeature).toBeDefined();
      expect(gameState.cluePool).toContain(gameState.clueFeature);
    });

    it('should emit clue event with correct feature', (done) => {
      gameState.on('clue', ({ clueFeature }) => {
        expect(clueFeature).toBe(gameState.clueFeature);
        done();
      });
      gameState.initializeRound();
    });

    it('should emit thief-selected event with correct ID', (done) => {
      gameState.on('thief-selected', ({ thiefId }) => {
        expect(thiefId).toBe(gameState.thiefId);
        done();
      });
      gameState.initializeRound();
    });
  });

  describe('accuse', () => {
    beforeEach(() => {
      gameState.initializeRound();
    });

    it('should emit win event when accusing correct thief', (done) => {
      gameState.on('win', ({ thiefId }) => {
        expect(thiefId).toBe(gameState.thiefId);
        done();
      });
      gameState.accuse(gameState.thiefId);
    });

    it('should emit loss event when accusing wrong guest', (done) => {
      const wrongGuest = gameState.guestIds.find(id => id !== gameState.thiefId);
      gameState.on('loss', ({ reason, thiefId }) => {
        expect(reason).toBe('wrong-accusation');
        expect(thiefId).toBe(gameState.thiefId);
        done();
      });
      gameState.accuse(wrongGuest);
    });

    it('should stop timer on accusation', () => {
      const mockTimer = { remove: jest.fn() };
      gameState._timerEvent = mockTimer;
      gameState.accuse(gameState.thiefId);
      expect(mockTimer.remove).toHaveBeenCalled();
    });

    it('should do nothing when guestId is falsy', () => {
      const winHandler = jest.fn();
      const lossHandler = jest.fn();
      const mockTimer = { remove: jest.fn() };
      gameState._timerEvent = mockTimer;

      gameState.on('win', winHandler);
      gameState.on('loss', lossHandler);

      gameState.accuse(null);
      gameState.accuse(undefined);
      gameState.accuse('');

      expect(winHandler).not.toHaveBeenCalled();
      expect(lossHandler).not.toHaveBeenCalled();
      expect(mockTimer.remove).not.toHaveBeenCalled();
    });
  });

  describe('stopTimer', () => {
    it('should remove timer event', () => {
      const mockTimer = { remove: jest.fn() };
      gameState._timerEvent = mockTimer;
      gameState.stopTimer();
      expect(mockTimer.remove).toHaveBeenCalledWith(false);
    });

    it('should set timer event to null', () => {
      const mockTimer = { remove: jest.fn() };
      gameState._timerEvent = mockTimer;
      gameState.stopTimer();
      expect(gameState._timerEvent).toBeNull();
    });

    it('should handle null timer gracefully', () => {
      gameState._timerEvent = null;
      expect(() => gameState.stopTimer()).not.toThrow();
    });
  });

  describe('_pickRandom', () => {
    it('should return a value from the list', () => {
      const list = ['a', 'b', 'c'];
      const picked = gameState._pickRandom(list);
      expect(list).toContain(picked);
    });

    it('should return null for empty list', () => {
      const picked = gameState._pickRandom([]);
      expect(picked).toBeNull();
    });

    it('should return null for null list', () => {
      const picked = gameState._pickRandom(null);
      expect(picked).toBeNull();
    });

    it('should eventually pick each item (statistical test)', () => {
      const list = ['a', 'b', 'c'];
      const picks = new Set();
      for (let i = 0; i < 100; i++) {
        picks.add(gameState._pickRandom(list));
      }
      expect(picks.size).toBeGreaterThan(1);
    });
  });

  describe('startTimer', () => {
    it('should emit initial timer value', (done) => {
      const mockScene = {
        time: {
          addEvent: jest.fn((config) => ({
            remove: jest.fn()
          }))
        }
      };

      gameState.on('timer', (remainingSeconds) => {
        expect(remainingSeconds).toBe(gameState.timerSeconds);
        done();
      });

      gameState.startTimer(mockScene);
    });

    it('should create timer event with 1 second delay', () => {
      const mockScene = {
        time: {
          addEvent: jest.fn((config) => ({
            remove: jest.fn()
          }))
        }
      };

      gameState.startTimer(mockScene);
      expect(mockScene.time.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          delay: 1000,
          loop: true
        })
      );
    });

    it('should remove existing timer before starting a new one', () => {
      const existingTimer = { remove: jest.fn() };
      gameState._timerEvent = existingTimer;

      const mockScene = {
        time: {
          addEvent: jest.fn(() => ({
            remove: jest.fn()
          }))
        }
      };

      gameState.startTimer(mockScene);
      expect(existingTimer.remove).toHaveBeenCalledWith(false);
    });

    it('should emit timeout loss when timer reaches zero', () => {
      const timeoutHandler = jest.fn();
      let capturedCallback;

      const mockScene = {
        time: {
          addEvent: jest.fn((config) => {
            capturedCallback = config.callback;
            return { remove: jest.fn() };
          })
        }
      };

      gameState.timerSeconds = 1;
      gameState.on('loss', timeoutHandler);
      gameState.startTimer(mockScene);

      capturedCallback();

      expect(timeoutHandler).toHaveBeenCalledWith({ reason: 'timeout' });
    });
  });
});
