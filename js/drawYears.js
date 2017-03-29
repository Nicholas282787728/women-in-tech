function plotByYear(canvasId, groupData) {
  // Collect and nest data
  var nestedData = d3.nest()
    .key(function(d) { return d.year; }).sortKeys(d3.descending)
    .rollup(function(leaves) {
      return {
        'male': d3.sum(leaves, function(l) {
          return l.sex == 'M' ? l.count : 0;
        }),
        'female': d3.sum(leaves, function(l) {
          return l.sex == 'F' ? l.count : 0;
        })
      };
    })
    .entries(groupData);

  var yearCount = function(d) { return d.value.female + d.value.male; };
  var totalCount = nestedData.reduce(function(total, d) {
    return total + yearCount(d);
  }, 0);

  // Set graph options
  var defaults = {
    'graphWidth': 600,
    'graphHeight': 400,
    'marginLeft': 50,
    'marginRight': 50,
    'marginTop': 10,
    'marginBottom': 50
  };
  var options = graphOptions[canvasId];
  for (var option in defaults) {
    if (!options[option]) {
      options[option] = defaults[option];
    }
  }

  var graphWallWidth = options.graphWidth - options.marginLeft - options.marginRight;
  var graphWallHeight = options.graphHeight - options.marginTop - options.marginBottom;

  // Create width & height scales
  var scaleWidth = function(rawValue) { return rawValue * graphWallWidth; },
      scaleHeight = function(rawValue) { return rawValue * graphWallHeight; };

  var canvas = d3.select('#'+canvasId);
  var svg = canvas.append('svg')
    .attr('viewBox', '0 0 '+ options.graphWidth +' '+ options.graphHeight)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed('svg-content', 'true');
  var barHeight = scaleHeight(1 / nestedData.length);

  // Add labels
  svg.append('line')
    .attr('x1', options.marginLeft + 0.5 * graphWallWidth)
    .attr('x2', options.marginLeft + 0.5 * graphWallWidth)
    .attr('y1', options.marginTop)
    .attr('y2', options.marginTop + graphWallHeight)
    .attr('stroke', 'black');

  // Create year groups
  var years = svg.selectAll('.year').data(nestedData).enter()
    .append('g')
    .classed('year', 'true')
    .attr('transform', function(d,i) {
      return 'translate(0, '+ (options.marginTop + (i * barHeight)) +')';
    });

  // Add female bars
  years.append('rect')
    .attr('x', options.marginLeft)
    .attr('width', function(d) {
      return scaleWidth(d.value.female / yearCount(d));
    })
    .attr('y', 0)
    .attr('height', barHeight)
    .attr('id', function(d) { return canvasId+'-'+d.key+'-f'; })
    .classed('female', true).classed('bar', true);

  // Add male bars
  years.append('rect')
    .attr('x', function(d) {
      return options.marginLeft + scaleWidth(d.value.female / yearCount(d));
    })
    .attr('width', function(d) {
      return scaleWidth(d.value.male / yearCount(d));
    })
    .attr('y', 0)
    .attr('height', barHeight)
    .attr('id', function(d) { return this.canvasId+'-'+d.key+'-m'; })
    .classed('male', true).classed('bar', true);

  // Add year labels
  years.append('text').text(function(d) { return d.key; })
    .attr('y', barHeight / 2);

  // Add percent lines and labels
  // 50% (primary)
  svg.append('line')
    .attr('x1', options.marginLeft + 0.5 * graphWallWidth)
    .attr('x2', options.marginLeft + 0.5 * graphWallWidth)
    .attr('y1', 0.5 * options.marginTop)
    .attr('y2', options.marginTop + graphWallHeight + 0.1 * options.marginBottom)
    .classed('line-primary', true);
  svg.append('text').text('50%').attr('text-anchor', 'middle')
    .attr('x', options.marginLeft + 0.5 * graphWallWidth + 2)
    .attr('y', options.graphHeight - 0.6 * options.marginBottom);

  // 0% (label only)
  svg.append('text').text('0%').attr('text-anchor', 'middle')
    .attr('x', options.marginLeft + 2)
    .attr('y', options.graphHeight - 0.6 * options.marginBottom);

  // 100% (label only)
  svg.append('text').text('100%').attr('text-anchor', 'middle')
    .attr('x', options.graphWidth - options.marginRight + 2)
    .attr('y', options.graphHeight - 0.6 * options.marginBottom);

  // Add hover handler
  var bars = svg.selectAll('.bar')
    .on('mouseover', function(d) {
      svg.append('line')
        .attr('x1', options.marginLeft + scaleWidth(d.value.female / yearCount(d)))
        .attr('x2', options.marginLeft + scaleWidth(d.value.female / yearCount(d)))
        .attr('y1', 0.5 * options.marginTop)
        .attr('y2', options.marginTop + graphWallHeight + 0.1 * options.marginBottom)
        .classed('line-highlight', true);
      svg.append('text').attr('text-anchor', 'middle')
        .text(Math.floor(10000 * d.value.female / yearCount(d))/100 +'%')
        .attr('x', options.marginLeft + scaleWidth(d.value.female / yearCount(d)))
        .attr('y', options.graphHeight - 0.6 * options.marginBottom)
        .classed('label-highlight', true);
    })
    .on('mouseout', function(d) {
      svg.selectAll('.line-highlight').remove();
      svg.selectAll('.label-highlight').remove();
    });

  // Add click handlers
  // bars.on('click', function(d) {
  //   var group = canvasId.split('-')[0];
  //   plotByCategory(group+'-group',
  //     groupData.filter(function(y) { return y.year == d.key; }));
  // });
}
