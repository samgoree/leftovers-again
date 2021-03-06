import Battle from './battle';
import Log from './log';

let BotClass;

export default class BattleManager {
  constructor(Bot, timeout = 0) {
    if (!Bot) {
      Log.error('BattleManager called with no bot! That is bad.');
    }
    BotClass = Bot;
    this.battles = {};
    this.timeout = timeout;
  }
  find(id) {
    if (!this.battles[id]) {
      const bot = BotClass.default ? new BotClass.default() : new BotClass(); // eslint-disable-line
      this.battles[id] = new Battle(id, bot, this.timeout);
    }
    return this.battles[id];
  }
}
