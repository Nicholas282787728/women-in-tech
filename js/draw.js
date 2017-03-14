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
    .append('g')
    .classed('pipe', 'true')
    .attr('transform', function(d,i) {
      return 'translate('+ i * groupWidth +',20)'
    });

  // Add click handler
  groups.on('click', function(d) {
    plotByYear(d.id, d.data);
    plotByCategory(d.id+'-cat', d.data);
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

function plotByYear(canvasId, groupData) {
  var canvas = d3.select('#'+canvasId);
  var barHeight = 100;

  var nestedData = d3.nest()
    .key(function(d) { return d.year; }).sortKeys(d3.ascending)
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


  var years = canvas.selectAll('.year').data(nestedData).enter()
    .append('g')
    .attr('transform', function(d,i) { return 'translate('+i * 75+',20)'; });

  years.append('text').text(function(d) { return d.key; });
  years.append('rect')
    .attr('x', 0).attr('width', 70)
    .attr('y', 5)
    .attr('height', function(d) {
      return barHeight * d.value.female / (d.value.male+d.value.female);
    })
    .attr('class', 'female');

    years.append('rect')
      .attr('x', 0).attr('width', 70)
      .attr('y', function(d) {
        return barHeight * d.value.female / (d.value.male+d.value.female);
      })
      .attr('height', function(d) {
        return barHeight * d.value.male / (d.value.male+d.value.female);
      })
      .attr('class', 'male');

    years.append('line')
      .attr('x1', 0).attr('x2', 70)
      .attr('y1', barHeight / 2).attr('y2', barHeight / 2)
      .attr('stroke', 'black');
}

function plotByCategory(canvasId, groupData) {
  var canvas = d3.select('#'+canvasId);
  var barHeight = 100;

  var category = 'program';
  if (typeof groupData[0].score !== 'undefined') {
    category = 'score';
  } else if (typeof groupData[0].occupation !== 'undefined') {
    category = 'occupation';
  }

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

  var categories = canvas.selectAll('.categories').data(nestedData).enter()
    .append('g')
    .attr('transform', function(d,i) { return 'translate('+i * 75+',20)'; });

  categories.append('text').text(function(d) { return d.key.substring(0,9); });
  categories.append('rect')
    .attr('x', 0).attr('width', 70)
    .attr('y', 5)
    .attr('height', function(d) {
      return barHeight * d.value.female / (d.value.male+d.value.female);
    })
    .attr('class', 'female');

    categories.append('rect')
      .attr('x', 0).attr('width', 70)
      .attr('y', function(d) {
        return barHeight * d.value.female / (d.value.male+d.value.female);
      })
      .attr('height', function(d) {
        return barHeight * d.value.male / (d.value.male+d.value.female);
      })
      .attr('class', 'male');

    categories.append('line')
      .attr('x1', 0).attr('x2', 70)
      .attr('y1', barHeight / 2).attr('y2', barHeight / 2)
      .attr('stroke', 'black');
}
