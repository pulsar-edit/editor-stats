const $ = require('atom-space-pen-views').$;

class StatsTracker {
  startDate = new Date();
  hours = 6;
  eventLog = {};

  constructor() {
    const date = new Date(this.startDate);
    const future = new Date(date.getTime() + (36e5 * this.hours));
    this.eventLog[this.time(date)] = 0;
    while (date < future) {
      this.eventLog[this.time(date)] = 0;
    }
    const workspaceView = atom.views.getView(atom.workspace);
    $(workspaceView).on('keydown', () => this.track());
    $(workspaceView).on('mouseup', () => this.track());
  }

  clear() {
    this.eventLog = {};
  }

  track() {
    const date = new Date();
    const times = this.time(date);
    const base = this.eventLog;
    if (base[times] == null) {
      base[times] = 0;
    }
    this.eventLog[times] += 1;
    if (this.eventLog.length > (this.hours * 60)) {
      return this.eventLog.shift();
    }
  }

  time(date) {
    date.setTime(date.getTime() + 6e4);
    const hour = date.getHours();
    const minute = date.getMinutes();
    return hour + ":" + minute;
  }
}

module.exports = StatsTracker;