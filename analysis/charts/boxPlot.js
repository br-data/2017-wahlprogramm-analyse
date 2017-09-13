function boxPlot(id, data, left, right, colors) {

  // Chart settings
  var margin = { top: 15, right: 20, bottom: 20, left: 10 };

  // D3 elements, variables and functions
  var chart, plot, svg, group, max, min, xScale, xAxis, width, height, timeout;

  (function init() {

    data = Object.keys(data).map(function (key) {

      return {
        party: key,
        value: data[key],
        left: left[key],
        right: right[key]
      };
    });

    draw(id, data);
  })();

  function draw(id, data) {

    svg = d3.select('#' + id);

    width = +svg.attr('width') - margin.left - margin.right;
    height = +svg.attr('height') - margin.top - margin.bottom;

    min = d3.min(data, function (d) { return d.percent; } );
    max = d3.max(data, function (d) { return d.percent; } );

    xScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([margin.left, width - margin.right]);

    xAxis = d3.axisBottom(xScale);

    plot = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Draw the axis
    plot.append('g')
        .attr('transform', 'translate(0,' + 130 + ')')
        .attr('class', 'axis')
        .call(xAxis);

    group = plot.append('g');

    // Draw the bars
    group.selectAll('rects')
        .data(data)
        .enter()
      .append('rect')
        .attr('x', function (d) { return xScale(d.value - d.left); })
        .attr('y', function (d, i) { return i * 20; })
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('width', function (d) {
          return xScale(d.value + d.right) - xScale(d.value - d.left); })
        .attr('height', 15)
        .attr('fill', function (d) { return colors[d.party]; });

    // Draw the median line
    group.selectAll('circles')
        .data(data)
        .enter()
      .append('circle')
        .attr('cx', function (d) { return xScale(d.value); })
        .attr('cy', function (d, i) { return (i * 20) + 7.5; })
        .attr('r', 7.5)
        .attr('fill', '#fff');
  }
}
