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
  }
  for (option in defaults) {
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
}

function plotByCategory(canvasId, groupData, options={}) {

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

  // Set graph options
  var defaults = {
    'graphWidth': 600,
    'graphHeight': 100,
    'marginLeft': 50,
    'marginRight': 50,
    'marginTop': 10,
    'marginBottom': 15,
    'gutter': 4
  }
  for (option in defaults) {
    if (!options[option]) {
      options[option] = defaults[option];
    }
  }

  var graphWallWidth = options.graphWidth - options.marginLeft - options.marginRight;
  var graphWallHeight = options.graphHeight - options.marginTop - options.marginBottom;

  // Create width & height scales
  var scaleWidth = function(rawValue) { return rawValue * graphWallWidth; };
  var translateX = function(i) {
    return options.marginLeft + (i * barWidth * 2) + (options.gutter * (i+1));
  }
  var maxValue = d3.max(nestedData, function(d) {
    return d3.max([d.value.female, d.value.male]);
  });
  var scaleHeight = d3.scaleLinear().domain([0, maxValue]).nice()
    .range([0, graphWallHeight]);

  // Set up canvas variables
  var canvas = d3.select('#'+canvasId);
  var svg = canvas.append('svg')
    .attr('viewBox', '0 0 '+options.graphWidth+' '+ options.graphHeight)
    .classed('svg-content', 'true');
  var barWidth = (graphWallWidth - (options.gutter * nestedData.length)) /
                  (nestedData.length * 2);


  // Create category groups
  var categories = svg.selectAll('.categories').data(nestedData).enter()
    .append('g')
    .classed('categories', 'true')
    .attr('transform', function(d,i) { return 'translate('+ translateX(i) +')'; });

  // Add score label
  categories.append('text').text(function(d) { return d.key.substring(0,9); })
    .attr('x', barWidth)
    .attr('y', options.graphHeight - (options.marginBottom*0.25) + options.gutter)
    .attr('text-anchor', 'middle');

  // Add female bar
  categories.append('rect')
    .attr('x', 0).attr('width', barWidth)
    .attr('y', function(d) {
      return options.marginTop + graphWallHeight - scaleHeight(d.value.female);
    })
    .attr('height', function(d) { return scaleHeight(d.value.female); })
    .attr('class', 'female bar');

  // Add female label
  categories.append('text').attr('text-anchor', 'middle')
    .text(function(d) { return d.value.female; })
    .attr('x', barWidth/2)
    .attr('y', function(d) {
      return options.marginTop + graphWallHeight - scaleHeight(d.value.female) - options.gutter;
    })
    .classed('small-label', true);

  // Add male bar
  categories.append('rect')
    .attr('x', barWidth).attr('width', barWidth)
    .attr('y', function(d) {
      return options.marginTop + graphWallHeight - scaleHeight(d.value.male);
    })
    .attr('height', function(d) { return scaleHeight(d.value.male); })
    .attr('class', 'male bar');

  // Add male label
  categories.append('text').attr('text-anchor', 'middle')
     .text(function(d) { return d.value.male; })
     .attr('x', barWidth + barWidth/2)
     .attr('y', function(d) {
       return options.marginTop + graphWallHeight - scaleHeight(d.value.male) - options.gutter;
     })
     .classed('small-label', true);

  // Add hover handlers
  var bars = svg.selectAll('.female')
    .on('mouseover', function(d, i) {
      svg.append('line')
        .attr('x1', options.marginLeft)
        .attr('x2', options.marginLeft + graphWallWidth)
        .attr('y1', options.marginTop + graphWallHeight - scaleHeight(d.value.female))
        .attr('y2', options.marginTop + graphWallHeight - scaleHeight(d.value.female))
        .classed('line-highlight', true);
      svg.append('text').attr('text-anchor', 'middle')
         .text(d.value.female)
         .attr('x', translateX(i) + barWidth/2)
         .attr('y', options.marginTop + graphWallHeight - scaleHeight(d.value.female) - options.gutter)
         .classed('label-highlight', true)
         .classed('small-label', true);
    })
    .on('mouseout', function(d) {
      svg.selectAll('.line-highlight').remove();
      svg.selectAll('.label-highlight').remove();
    });

    var bars = svg.selectAll('.male')
      .on('mouseover', function(d, i) {
        svg.append('line')
          .attr('x1', options.marginLeft)
          .attr('x2', options.marginLeft + graphWallWidth)
          .attr('y1', options.marginTop + graphWallHeight - scaleHeight(d.value.male))
          .attr('y2', options.marginTop + graphWallHeight - scaleHeight(d.value.male))
          .classed('line-highlight', true);
        svg.append('text').attr('text-anchor', 'middle')
          .text(d.value.male)
          .attr('x', barWidth + translateX(i) + barWidth/2)
          .attr('y', options.marginTop + graphWallHeight - scaleHeight(d.value.male) - options.gutter)
          .classed('label-highlight', true)
          .classed('small-label', true);
      })
      .on('mouseout', function(d) {
        svg.selectAll('.line-highlight').remove();
        svg.selectAll('.label-highlight').remove();
      });
}
