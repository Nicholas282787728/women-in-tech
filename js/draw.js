function drawPipe() {

  // Save total counts by sex for each education/career stage
  var overviewData = [];
  overviewData.push({
    'id': 'hs',
    'data': data['hs'],
    'label': 'High School',
    'description': 'AP CS Tests Taken',
    'male': d3.sum(data['hs'], function(s) {
      return s.sex == 'M' ? s.count : 0;
    }),
    'female': d3.sum(data['hs'], function(s) {
      return s.sex == 'F' ? s.count : 0;
    })
  });

  overviewData.push({
    'id': 'bs',
    'data': data['bs'],
    'label': 'College',
    'description': 'Tech Degrees Awarded',
    'male': d3.sum(data['bs'], function(s) {
      return s.sex == 'M' ? s.count : 0;
    }),
    'female': d3.sum(data['bs'], function(s) {
      return s.sex == 'F' ? s.count : 0;
    })
  });

  overviewData.push({
    'id': 'grad',
    'data': data['ms'].concat(data['phd']),
    'label': 'Graduate School',
    'description': 'Tech Degrees Awarded',
    'male': d3.sum(data['ms'].concat(data['phd']), function(s) {
      return s.sex == 'M' ? s.count : 0;
    }),
    'female': d3.sum(data['ms'].concat(data['phd']), function(s) {
      return s.sex == 'F' ? s.count : 0;
    })
  });

  overviewData.push({
    'id': 'work',
    'data': data['job'],
    'label': 'Workforce',
    'description': 'People Employed in Computing',
    'male': d3.sum(data['hs'], function(s) {
      return s.sex == 'M' ? s.count : 0;
    }),
    'female': d3.sum(data['hs'], function(s) {
      return s.sex == 'F' ? s.count : 0;
    })
  });

  // Set canvas variables
  var canvas = d3.select('#pipes').append('svg')
    .attr('viewBox', '0, 0, 600, 125')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed("svg-content", true);
  var groupWidth = 150;
  var gutterWidth = 1;
  var pipeHeight = 75;


  // Create pipe segments for each group
  var groups = canvas.selectAll('.pipe').data(overviewData).enter()
    .append('a').attr('href', function(d) { return '#'+ d.id; })
    .append('g')
    .classed('pipe', 'true')
    .attr('transform', function(d,i) {
      return 'translate('+ i * groupWidth +',20)'
    });


  // Add top label
  groups.append('text').text(function(d) { return d.label; })
    .attr('text-anchor', 'middle')
    .attr('x', groupWidth / 2)
    .attr('y', -5);

  // Add female pipe segment
  groups.append('rect')
    .attr('height', function(d) {
      return pipeHeight * d.female / (d.male + d.female);
    })
    .attr('width', groupWidth - gutterWidth)
    .attr('y', gutterWidth)
    .attr('class', 'female');

  // Add male pipe segment
  groups.append('rect')
    .attr('y', function(d) {
      return gutterWidth + pipeHeight * d.female / (d.male + d.female);
    })
    .attr('width', groupWidth - gutterWidth)
    .attr('height', function(d) {
      return pipeHeight * d.male / (d.male + d.female);
    })
    .attr('class', 'male');

  // Add bottom label
  groups.append('text').text(function(d) { return d.description; })
    .attr('text-anchor', 'middle')
    .attr('x', groupWidth / 2)
    .attr('y', pipeHeight + 15)
    .classed('small-label', 'true');

  // Add 50% line
  groups.append('line')
    .attr('x1', 0)
    .attr('x2', groupWidth)
    .attr('y1', pipeHeight / 2)
    .attr('y2', pipeHeight / 2)
    .attr('stroke', 'black');

  // groups.selectAll('text.small-label').call(wrapText, groupWidth);
  //
  // function wrapText(text, width) {
  //   text.each(function() {
  //     var t = d3.select(this);
  //     var words = t.text().split(/\s+/).reverse(),
  //         word = '';
  //     var line = [],
  //         lineNum = 0,
  //         lineHeight = 1.1;
  //     var y = t.attr('y'),
  //         dy = parseFloat(t.attr('dy'));
  //     var tspan = t.text(null).append('tspan')
  //           .attr('x', 0)
  //           .attr('y', y)
  //           .attr('dy', dy +'em');
  //
  //     while (word = words.pop()) {
  //       line.push(word);
  //       tspan.text(line.join(" "));
  //       if (tspan.node().getComputedTextLength() > width) {
  //         line.pop();
  //         tspan.text(line.join(" "));
  //         line = [word];
  //         tspan = t.append('tspan').attr('x', 0).attr('y', y)
  //           .attr('dy', ++lineNum * lineHeight);
  //       }
  //     }
  //   });
  // }

}

function plotByYear(canvasId, groupData, options={}) {
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
      }
    })
    .entries(groupData);

  // Set graph options
  var defaults = {
    'graphWidth': 600,
    'graphHeight': 400,
    'marginLeft': 50,
    'marginRight': 50,
    'marginTop': 10,
    'marginBottom': 50,
  }
  for (option in defaults) {
    if (!options[option]) {
      options[option] = defaults[option];
    }
  }

  var graphWallWidth = options.graphWidth - options.marginLeft - options.marginRight;
  var graphWallHeight = options.graphHeight - options.marginTop - options.marginBottom

  // Create width & height scales
  var scaleWidth = function(rawValue) { return rawValue * graphWallWidth; },
      scaleHeight = function(rawValue) { return rawValue * graphWallHeight; };

  var canvas = d3.select('#'+canvasId);
  var svg = canvas.append('svg')
    .attr('viewBox', '0 0 '+ options.graphWidth +' '+ options.graphHeight)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed('svg-content', 'true');
  var barHeight = graphWallHeight / nestedData.length;

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
      return scaleWidth(d.value.female / (d.value.male + d.value.female));
    })
    .attr('y', 0)
    .attr('height', barHeight)
    .attr('class', 'female bar')
    .on('mouseover', function(d) { console.log(canvasId); });

  // Add male bars
  years.append('rect')
    .attr('x', function(d) {
      return options.marginLeft + scaleWidth(d.value.female / (d.value.male + d.value.female));
    })
    .attr('width', function(d) {
      return scaleWidth(d.value.male / (d.value.male + d.value.female));
    })
    .attr('y', 0)
    .attr('height', barHeight)
    .attr('class', 'male bar');

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

  // 25% (secondary)
  svg.append('line')
    .attr('x1', options.marginLeft + 0.25 * graphWallWidth)
    .attr('x2', options.marginLeft + 0.25 * graphWallWidth)
    .attr('y1', 0.5 * options.marginTop)
    .attr('y2', options.marginTop + graphWallHeight + 0.1 * options.marginBottom)
    .classed('line-secondary', true);
  svg.append('text').text('25%').attr('text-anchor', 'middle')
    .attr('x', options.marginLeft + 0.25 * graphWallWidth + 2)
    .attr('y', options.graphHeight - 0.6 * options.marginBottom);

  // 75% (secondary)
  svg.append('line')
    .attr('x1', options.marginLeft + 0.75 * graphWallWidth)
    .attr('x2', options.marginLeft + 0.75 * graphWallWidth)
    .attr('y1', 0.5 * options.marginTop)
    .attr('y2', options.marginTop + graphWallHeight + 0.1 * options.marginBottom)
    .classed('line-secondary', true);
  svg.append('text').text('75%').attr('text-anchor', 'middle')
    .attr('x', options.marginLeft + 0.75 * graphWallWidth + 2)
    .attr('y', options.graphHeight - 0.6 * options.marginBottom);

  // 0% (label only)
  svg.append('text').text('0%').attr('text-anchor', 'middle')
    .attr('x', options.marginLeft + 2)
    .attr('y', options.graphHeight - 0.6 * options.marginBottom);

  // 100% (label only)
  svg.append('text').text('100%').attr('text-anchor', 'middle')
    .attr('x', options.graphWidth - options.marginRight + 2)
    .attr('y', options.graphHeight - 0.6 * options.marginBottom);


  // years.append('text').text(function(d) { return d.key; });
  // years.append('rect')
  //   .attr('x', 0).attr('width', 70)
  //   .attr('y', 5)
  //   .attr('height', function(d) {
  //     return barHeight * d.value.female / (d.value.male+d.value.female);
  //   })
  //   .attr('class', 'female');
  //
  //   years.append('rect')
  //     .attr('x', 0).attr('width', 70)
  //     .attr('y', function(d) {
  //       return barHeight * d.value.female / (d.value.male+d.value.female);
  //     })
  //     .attr('height', function(d) {
  //       return barHeight * d.value.male / (d.value.male+d.value.female);
  //     })
  //     .attr('class', 'male');
  //
  //   years.append('line')
  //     .attr('x1', 0).attr('x2', 70)
  //     .attr('y1', barHeight / 2).attr('y2', barHeight / 2)
  //     .attr('stroke', 'black');
}

function plotByCategory(canvasId, groupData, graphWidth, graphHeight=100) {

  // Select correct category variable
  var category = 'program';
  if (typeof groupData[0].score !== 'undefined') {
    category = 'score';
  } else if (typeof groupData[0].occupation !== 'undefined') {
    category = 'occupation';
  }

  // Nest data
  var nestedData = d3.nest()
    .key(function(d) { return d[category]; }).sortKeys(d3.ascending)
    .rollup(function(leaves) {
      return {
        'male': d3.sum(leaves, function(l) {
          return l.sex == 'M' ? l.count : 0;
        }),
        'female': d3.sum(leaves, function(l) {
          return l.sex == 'F' ? l.count : 0;
        })
      }
    })
    .entries(groupData);

  // Set up canvas variables
  var canvas = d3.select('#'+canvasId);
  var svg = canvas.append('svg')
    .attr('viewBox', '0 0 '+graphWidth+' '+ graphHeight)
    .classed('svg-content', 'true');
  var barWidth = graphWidth / (nestedData.length * 2),
      gutter = 4;

  // Create Y scale
  var maxValue = d3.max(nestedData, function(d) {
    return d3.max([d.value.female, d.value.male]);
  });
  var scaleY = d3.scaleLinear().domain([0, maxValue]).nice()
    .range([0, graphHeight*0.9]);

  // Create category groups
  var categories = svg.selectAll('.categories').data(nestedData).enter()
    .append('g')
    .classed('categories', 'true')
    .attr('transform', function(d,i) {
      return 'translate('+ ((i * barWidth * 2) + (gutter / 2)) +')';
    });

  // Add score label
  categories.append('text').text(function(d) { return d.key.substring(0,9); })
    .attr('x', barWidth - gutter)
    .attr('y', graphHeight)
    .attr('text-anchor', 'middle');

  // Add female bar
  categories.append('rect')
    .attr('x', 0).attr('width', barWidth - gutter/2)
    .attr('y', function(d) { return graphHeight - scaleY(d.value.female); })
    .attr('height', function(d) { return scaleY(d.value.female); })
    .attr('class', 'female bar');

  categories.append('rect')
    .attr('x', barWidth - gutter/2).attr('width', barWidth - gutter/2)
    .attr('y', function(d) { return graphHeight - scaleY(d.value.male); })
    .attr('height', function(d) { return scaleY(d.value.male); })
    .attr('class', 'male bar');
  //
  //   categories.append('line')
  //     .attr('x1', 0).attr('x2', barWidth)
  //     .attr('y1', graphHeight / 2).attr('y2', graphHeight / 2)
  //     .attr('stroke', 'black');
}
