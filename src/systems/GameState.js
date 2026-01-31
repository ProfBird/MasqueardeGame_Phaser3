import { EventEmitter } from 'events';

const DEFAULT_TIMER_SECONDS = 120;
const DEFAULT_GUEST_COUNT = 12;
const DEFAULT_CLUE_POOL = [
  'blue eyes',
  'freckles',
  'scar on left cheek',
  'golden earring',
  'green eyes',
  'mole above lip'
];

class GameState extends EventEmitter {
  constructor(options = {}) {
    super();

    this.timerSeconds = options.timerSeconds ?? DEFAULT_TIMER_SECONDS;
    this.guestIds = options.guestIds ?? Array.from({ length: DEFAULT_GUEST_COUNT }, (_, i) => `guest-${i + 1}`);
    this.cluePool = options.cluePool ?? DEFAULT_CLUE_POOL;

    this.thiefId = null;
    this.clueFeature = null;
    this._timerEvent = null;
    this._remainingSeconds = this.timerSeconds;
  }

  initializeRound() {
    this.thiefId = this._pickRandom(this.guestIds);
    this.clueFeature = this._pickRandom(this.cluePool);
    this.emit('clue', { clueFeature: this.clueFeature });
    this.emit('thief-selected', { thiefId: this.thiefId });
  }

  startTimer(scene) {
    if (this._timerEvent) {
      this._timerEvent.remove(false);
    }

    this._remainingSeconds = this.timerSeconds;
    this.emit('timer', this._remainingSeconds);

    this._timerEvent = scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this._remainingSeconds -= 1;
        this.emit('timer', this._remainingSeconds);

        if (this._remainingSeconds <= 0) {
          this.emit('loss', { reason: 'timeout' });
          this.stopTimer();
        }
      }
    });
  }

  stopTimer() {
    if (this._timerEvent) {
      this._timerEvent.remove(false);
      this._timerEvent = null;
    }
  }

  accuse(guestId) {
    if (!guestId) {
      return;
    }

    if (guestId === this.thiefId) {
      this.emit('win', { thiefId: this.thiefId });
    } else {
      this.emit('loss', { reason: 'wrong-accusation', thiefId: this.thiefId });
    }

    this.stopTimer();
  }

  _pickRandom(list) {
    if (!list || list.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }
}

export default GameState;
