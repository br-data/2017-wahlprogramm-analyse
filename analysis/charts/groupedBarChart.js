function groupedBarChart(id, data) {

  (function init() {

    draw(id, transform(data));
  })();

  function transform(data) {

    var result = {};

    result = Object.keys(data).map(function (key) {

      var count = Object.keys(data[key]).reduce(function (acc, curr) {

        return acc + data[key][curr];
      }, 0);

      Object.keys(data[key]).map(function (curr) {

        data[key][curr] = (data[key][curr] / count) * 100;
      });

      data[key].party = key;

      return data[key];
    });

    return result;
  }

  function draw(id, data) {

    var svg = d3.select('#' + id),
        margin = { top: 20, right: 20, bottom: 30, left: 35 },
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom,
        g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(['#8dd3c7', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69']);

    var keys = Object.keys(data[0]).slice(0,6);

    x0.domain(data.map(function (d) { return d.party; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

    g.append('g')
      .selectAll('g')
      .data(data)
      .enter().append('g')
        .attr('transform', function(d) { return 'translate(' + x0(d.party) + ',0)'; })
      .selectAll('rect')
      .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
      .enter().append('rect')
        .attr('x', function(d) { return x1(d.key); })
        .attr('y', function(d) { return y(d.value); })
        .attr('width', x1.bandwidth())
        .attr('height', function(d) { return height - y(d.value); })
        .attr('fill', function(d) { return z(d.key); });

    g.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x0));

    g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).ticks(null, 's'))
      .append('text')
        .attr('x', 2)
        .attr('y', y(y.ticks().pop()) + 0.5)
        .attr('dy', '0.32em')
        .attr('fill', '#000')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'start')
        .text('in %');

    var legend = g.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
      .selectAll('g')
      .data(keys.slice())
      .enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(0, ' + i * 20 + ')';
        });

    legend.append('rect')
        .attr('x', width - 15)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', z);

    legend.append('text')
        .attr('x', width - 24)
        .attr('y', 9.5)
        .attr('dy', '0.15em')
        .text(function(d) { return d; });
  }
}
