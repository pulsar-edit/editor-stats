const _ = require('underscore-plus');
const {$,ScrollView} = require('atom-space-pen-views');
const d3 = require('d3-browserify');

class EditorStatsView extends ScrollView {
  pt = 15;
  pl = 10;
  pb = 3;
  pr = 25;

  initialize() {
    super.initialize(arguments);
    $(window).on('resize', _.debounce(() => {
      if (!this.isOnDom()) return;
      this.draw();
      this.update();
    }, 300));
  }

  draw() {
    this.editorStats.empty();
    this.x ||= d3.scale.ordinal().domain(d3.range(this.stats.hours * 60));
    this.y ||= d3.scale.linear();
    const w = $(atom.views.getView(atom.workspace)).find('.vertical').width();
    const h = this.height();
    const data = d3.entries(this.stats.eventLog);
    const max = d3.max(data, d => d.value );
    this.x.rangeBands([0, w - this.pl - this.pr], 0.2);
    this.y.domain([0, max]).range([h - this.pt - this.pb, 0]);

    this.xaxis ||= d3.svg.axis().scale(this.x).orient('top').tickSize(-h + this.pt + this.pb).tickFormat( d => {
      d = new Date(this.stats.startDate.getTime() + (d * 6e4));
      let mins = d.getMinutes();
      if (mins <= 9) {
        mins = "0" + mins;
      }
      return d.getHours() + ":" + mins;
    });

    const vis = d3.select(this.editorStats.get(0)).append('svg').attr('width', w).attr('height', h).append('g').attr('transform', "translate(" + this.pl + "," + this.pt + ")");
    vis.append('g').attr('class', 'x axis').call(this.xaxis).selectAll('g').classed('minor', (d, i) =>
      i % 5 === 0 && i % 15 !== 0
    ).style('display', (d, i) => {
      if (i % 15 === 0 || i % 5 === 0 || i === data.length - 1) {
        return 'block';
      } else {
        return 'none';
      }
    });
    this.bars = vis.selectAll('rect.bar').data(data).enter().append('rect').attr('x', (d, i) =>
      this.x(i)
    ).attr('height', (d, i) =>
      h - this.y(d.value) - this.pt - this.pb
    ).attr('y', d =>
      this.y(d.value)
    ).attr('width', this.x.rangeBand()).attr('class', 'bar');
    clearInterval(this.updateInterval);
    const updater = () => {
      if (this.isOnDom()) {
        this.update();
      }
    };
    setTimeout(updater, 100);
    this.updateInterval = setInterval(updater, 5000);
  }

  update() {
    const newData = d3.entries(this.stats.eventLog);
    const max = d3.max(newData, d => d.value);
    this.y.domain([0, max]);
    const h = this.height();
    this.bars.data(newData).transition().attr('height', (d, i) =>
        h - this.y(d.value) - this.pt - this.pb
    ).attr('y', (d, i) =>
        this.y(d.value)
    );
    this.bars.classed('max', (d, i) =>
      d.value === max
    );
  }

  toggle(stats) {
    this.stats = stats;
    if (this.panel?.isVisible()) {
      this.detach();
    } else {
      this.attach();
    }
  }

  attach() {
    this.panel ||= atom.workspace.addBottomPanel({
      item: this
    });
    this.panel.show();
    this.draw();
  }

  detach() {
    this.panel?.hide();
    clearInterval(this.updateInterval);
    $(atom.views.getView(atom.workspace)).focus();
  }

  static activate() {
    return new EditorStatsView();
  }

  static content() {
    return this.div({
      "class": 'editor-stats-wrapper',
      tabindex: -1
    }, () => this.div({
        "class": 'editor-stats',
        outlet: 'editorStats'
      })
    );
  }
}

module.exports = EditorStatsView;
