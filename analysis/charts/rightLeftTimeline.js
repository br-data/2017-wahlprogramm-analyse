function rightLeftTimeline(id, data, colors) {

  var margin = { top: 20, right: 20, bottom: 30, left: 50 };

  (function init() {

    data = d3.nest()
      .key(function(d) {

        d.date = +d.date.substring(0,4);
        d.rile_focused = +d.rile_focused;

        return d.name;
      })
      .entries(data);

    draw(id, data);
  })();

  function draw(id, data) {

    var svg = d3.select('#' + id);

    var width = +svg.attr('width') - margin.left - margin.right;
    var height = +svg.attr('height') - margin.top - margin.bottom;

    svg = svg.append('g')
        .attr('transform',
              'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(
        d3.merge(data.map(function (d) {
          return d3.extent(d.values, function (e) {
            return e.rile_focused;
          });
        }))
      ));

    var y = d3.scaleLinear()
      .range([0, height])
      .domain(d3.extent(
        d3.merge(data.map(function (d) {
          return d3.extent(d.values, function (e) {
            return e.date;
          });
        }))
      ));

    var line = d3.line()
        .x(function(d) { return x(d.rile_focused); })
        .y(function(d) { return y(d.date); });

    var dotted = d3.line()
        .x(function(d) { return x(d.rile_focused); })
        .y(function(d) { return y(d.date); });

    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y)
          .tickValues([2002,2005,2009,2013,2017])
          .tickFormat(d3.format('.0f'))
        );

    var group = svg.selectAll('groups')
        .data(data)
        .enter()
      .append('g');

    group.selectAll('paths')
        .data(function (d) {
          return [d.values.filter(function (e) {
            return e.date <= 2013;
          })];
        })
        .enter()
      .append('path')
        .attr('stroke', function (d) { return colors[d[0].name]; })
        .attr('stroke-width', 4.5)
        .attr('fill', 'none')
        .attr('d', line);

    group.selectAll('paths')
        .data(function (d) {
          return [d.values.filter(function (e) {
            return e.date >= 2013;
          })];
        })
        .enter()
      .append('path')
        .attr('stroke', function (d) { return colors[d[0].name]; })
        .attr('stroke-width', 2.25)
        .attr('stroke-dasharray', ('5, 5'))
        .attr('fill', 'none')
        .attr('d', dotted);

    group.selectAll('circles')
        .data(function (d) { return d.values; })
        .enter()
      .append('circle')
        .attr('cx', function (d) { return x(d.rile_focused); })
        .attr('cy', function (d) { return y(d.date); })
        .attr('r', 7.5)
        .attr('stroke', function (d) { console.log(d);return colors[d.name]; })
        .attr('stroke-width', '2')
        .attr('fill', '#fff');
  }
}
