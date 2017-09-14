function stackedBarChart(id, data, colors) {

  (function init() {

    draw(id, transform(data));
  })();

  function transform(data) {

    var result = {};

    data = JSON.parse(JSON.stringify(data));

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

    console.log(data);

    var svg = d3.select('#' + id),
    margin = {top: 20, right: 180, bottom: 30, left: 40},
    width = +svg.attr('width') - margin.left - margin.right,
    height = +svg.attr('height') - margin.top - margin.bottom,
    g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.3)
        .align(0.3);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal(d3.schemeCategory20);

    var stack = d3.stack();

    var keys = Object.keys(data[0]).slice(0,6);

    keys = [
      'Welfare and Quality of Life',
      'Economy',
      'External Relations',
      'Fabric of Society',
      'Freedom and Democracy',
      'Political System'
    ];

    x.domain(data.map(function(d) { return d.party; }));
    y.domain([0, 100]);

    // x0.domain(data.map(function (d) { return d.party; }));
    // x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    // y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

    g.selectAll('groups')
        .data(data)
        .enter()
      .append('g')
      .selectAll('rect')
        .data(function(d) { return d; })
        .enter()
      .append('rect')
        .attr('fill', function(d) { return colors[d.key]; })
        .attr('x', function(d) { return x(d.data.party); })
        .attr('y', function(d) { return y(d[1]); })
        .attr('height', function(d) { return y(d[0]) - y(d[1]); })
        .attr('width', x.bandwidth());

    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y).ticks(10, 's'))
      .append('text')
        .attr('x', 2)
        .attr('y', y(y.ticks(10).pop()))
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .attr('fill', '#000')
        .text('Population');
  }
}
