function wrapText(text, width) {
  text.each(function() {
    var t = d3.select(this);
    var words = t.text().split(/\s+/).reverse(),
        word = '';
    var line = [],
        lineNum = 0,
        lineHeight = 1.1;
    var x = t.attr('x'),
        y = t.attr('y'),
        dy = parseFloat(t.attr('dy')) || 0;
    var tspan = t.text(null).append('tspan')
          .classed('small-label', true)
          .attr('x', x).attr('text-anchor', 'middle')
          .attr('y', y)
          .attr('dy', dy +'em');

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = t.append('tspan')
          .attr('x', x).attr('text-anchor', 'middle')
          .attr('y', y)
          .attr('dy', ++lineNum * lineHeight);
      }
    }
  });
}

function drawPipe() {

  // Save total counts by sex for each education/career stage
  var overviewData = [];
  overviewData.push({
    'id': 'hs',
    'data': data.hs,
    'label': 'High School',
    'description': 'AP Computer Science Tests Taken',
    'male': d3.sum(data.hs, function(s) {
      return s.sex == 'M' ? s.count : 0;
    }),
    'female': d3.sum(data.hs, function(s) {
      return s.sex == 'F' ? s.count : 0;
    })
  });

  overviewData.push({
    'id': 'bs',
    'data': data.bs,
    'label': 'College',
    'description': 'Tech Degrees Awarded',
    'male': d3.sum(data.bs, function(s) {
      return s.sex == 'M' ? s.count : 0;
    }),
    'female': d3.sum(data.bs, function(s) {
      return s.sex == 'F' ? s.count : 0;
    })
  });

  overviewData.push({
    'id': 'grad',
    'data': data.ms.concat(data.phd),
    'label': 'Graduate School',
    'description': 'Tech Degrees Awarded',
    'male': d3.sum(data.ms.concat(data.phd), function(s) {
      return s.sex == 'M' ? s.count : 0;
    }),
    'female': d3.sum(data.ms.concat(data.phd), function(s) {
      return s.sex == 'F' ? s.count : 0;
    })
  });

  overviewData.push({
    'id': 'work',
    'data': data.job,
    'label': 'Workforce',
    'description': 'People Employed in Computing',
    'male': d3.sum(data.hs, function(s) {
      return s.sex == 'M' ? s.count : 0;
    }),
    'female': d3.sum(data.hs, function(s) {
      return s.sex == 'F' ? s.count : 0;
    })
  });

  // Set canvas variables
  var canvas = d3.select('#pipes').append('svg')
    .attr('viewBox', '0, 0, 1300, 250')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed("svg-content", true);
  var groupWidth = 300;
  var gutterWidth = 2;
  var pipeHeight = 150;


  // Create pipe segments for each group
  var groups = canvas.selectAll('.pipe').data(overviewData).enter()
    // .append('a').attr('href', function(d) { return '#'+ d.id; })
    .append('g')
    .classed('pipe', 'true')
    .attr('transform', function(d,i) {
      return 'translate('+ i * groupWidth +',40)';
    });


  // Add top label
  groups.append('text').text(function(d) { return d.label; })
    .classed('big-label', true)
    .attr('text-anchor', 'middle')
    .attr('x', groupWidth / 2)
    .attr('y', -10);

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
    .attr('y', pipeHeight + 30);

  // Add legend
  var legends = canvas.append('g')
    .attr('transform', 'translate(0, '+ (40+gutterWidth) +')');

  // Add female legends
  var fLegend = legends.append('rect')
    .classed('female', true)
    .attr('x', groupWidth * overviewData.length + gutterWidth)
    .attr('width', 14)
    .attr('height', pipeHeight/2);
  var fLabel = legends.append('text')
    .classed('small-label', true).classed('female', true)
    .attr('x', groupWidth * overviewData.length + 54)
    .attr('text-anchor', 'middle')
    .attr('y', 20)
    .attr('alignment-baseline', 'middle');
  legends.append('text').classed('small-label', true).classed('female', true)
    .text('Female')
    .attr('x', groupWidth * overviewData.length + 54)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'hanging');

  // Add male legends
  var mLegend = legends.append('g')
    .append('rect')
    .classed('male', true)
    .attr('x', groupWidth * overviewData.length + gutterWidth)
    .attr('y', pipeHeight/2)
    .attr('width', 14)
    .attr('height', pipeHeight/2);
  var mLabel = legends.append('text')
    .classed('small-label', true).classed('male', true)
    .attr('x', groupWidth * overviewData.length + 54)
    .attr('text-anchor', 'middle')
    .attr('y', pipeHeight/2 + 40)
    .attr('alignment-baseline', 'middle');
  legends.append('text').classed('small-label', true).classed('male', true)
    .text('Male')
    .attr('x', groupWidth * overviewData.length + 52)
    .attr('y', pipeHeight)
    .attr('text-anchor', 'middle');

  // Add 50% line
  legends.append('line')
    .attr('x1', 0)
    .attr('x2', 1240)
    .attr('y1', pipeHeight / 2)
    .attr('y2', pipeHeight / 2)
    .attr('stroke', 'black');
  legends.append('text').classed('small-label', true)
    .text('50%')
    .attr('x', 1240+gutterWidth)
    .attr('y', pipeHeight / 2)
    .attr('alignment-baseline', 'middle');

  groups.selectAll('text').call(wrapText, groupWidth);

  function resetLegend() {
    canvas.selectAll('.interactive').remove();
    fLegend.transition().duration(250)
      .attr('height', pipeHeight/2);
    fLabel.text('');
    mLegend.transition().duration(250)
      .attr('y', pipeHeight/2).attr('height', pipeHeight/2);
    mLabel.text('');
  }

  canvas.on('mousemove', function() {
    // Remove existing lines/labels
    canvas.selectAll('.interactive').remove();

    // Save current mouse height (snap to graph wall)
    var coordinates = d3.mouse(this);
    var realMouseY = coordinates[1]; // use this for drawing
    // Pipe is offset by 40px
    var adjustedMouseY = realMouseY - 40; // use this for calculating
    if (adjustedMouseY > pipeHeight || adjustedMouseY < 0) {
    //  resetLegend();
      return;
    }

    // Add line at current mouse height
    canvas.append('line')
      .attr('x1', 0)
      .attr('x2', 1220)
      .attr('y1', realMouseY)
      .attr('y2', realMouseY)
      .classed('line-highlight', true)
      .classed('interactive', true);

    // Adjust legend height to match current mouse height
    fLegend.attr('height', adjustedMouseY);
    mLegend.attr('y', adjustedMouseY).attr('height', pipeHeight - adjustedMouseY);

    // Adjust percentages to match current mouse height
    fLabel.text(Math.round(1000 * adjustedMouseY / pipeHeight)/10);
    mLabel.text(Math.round(1000 - Math.round(1000 * adjustedMouseY / pipeHeight))/10);
  })
  .on('mouseleave', resetLegend);
}

document.addEventListener('scroll', function() {
  var arrow = document.querySelector('.arrow-container');
  if (document.body.scrollTop < arrow.offsetTop) {
    arrow.style.opacity = 1 - (document.body.scrollTop / arrow.offsetTop);
  }
});
