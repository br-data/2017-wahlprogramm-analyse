function rightLeftChart(id, data, colors) {

  var margin = { top: 15, right: 20, bottom: 20, left: 10 };

  var chart, plot, svg, group, max, min, xScale, xAxis, width, height, timeout;

  (function init() {

    data = Object.keys(data).map(function (key) {

      return {
        party: key,
        value: data[key]
      };
    });

    draw(id, data);
  })();

  function draw(id, data) {

    svg = d3.select('#' + id);

    width = +svg.attr('width') - margin.left - margin.right;
    height = +svg.attr('height') - margin.top - margin.bottom;

    min = d3.min(data, function (d) { return d.value; } );
    max = d3.max(data, function (d) { return d.value; } );

    xScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([margin.left, width - margin.right]);

    xAxis = d3.axisBottom(xScale);

    plot = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    plot.append('g')
      .attr('transform', 'translate(0,' + 30 + ')')
      .call(xAxis);

    group = plot.append('g');

    group.selectAll('circles')
        .data(data)
        .enter()
      .append('circle')
        .attr('cx', function (d) { return xScale(d.value); })
        .attr('cy', 7.5)
        .attr('r', 7.5)
        .attr('stroke-width', 2)
        .attr('stroke', function (d) {
          return colors[d.party];
        })
        .attr('fill-opacity', 0)
        .attr('fill', function (d) {
          return '#fff'
          //return colors[d.party];
        });
  }
}
