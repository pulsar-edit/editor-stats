const StatsTracker = require('./stats-tracker');

module.exports = {
  activate() {
    this.stats = new StatsTracker();
    atom.commands.add('atom-workspace', 'editor-stats:toggle',
      () => this.createView().toggle(this.stats)
    );
  },
  deactivate() {
    this.editorStatsView = null;
    this.stats = null;
  },
  createView() {
    if (!this.editorStatsView) {
      const EditorStatsView = require('./editor-stats-view');
      this.editorStatsView = new EditorStatsView();
    }
    return this.editorStatsView;
  }
};
