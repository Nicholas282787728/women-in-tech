// Declare data variables
var data = {
  'hs': [],
  'bs': [],
  'ms': [],
  'phd': [],
  'job': []
};

// Set graph options
var graphOptions = {
  'hs-group': {
    graphWidth: 500,
    graphHeight: 200
  },
  'hs-year': {
    'graphWidth': 600,
    'graphHeight': 400
  },
  'bs-group': {
    graphWidth: 500,
    graphHeight: 200
  },
  'bs-year': {
    'graphWidth': 600,
    'graphHeight': 400
  },
  'grad-group': {
    graphWidth: 500,
    graphHeight: 200
  },
  'grad-year': {
    'graphWidth': 600,
    'graphHeight': 400
  },
  'work-group': {
    graphWidth: 500,
    graphHeight: 150,
    marginRight: 10,
    labels: 'staggered'
  },
  'work-year': {
    'graphWidth': 600,
    'graphHeight': 400
  },
};


function combineData() {
  return function(error, raw_hs_data, raw_college_data,
    raw_ms_data, raw_phd_data, raw_job_data) {

    raw_hs_data.forEach(function(d) {
      data.hs.push({
        year: +d.Year,
        score: d.Score,
        sex: d.Sex,
        count: +d.Counts
      });
    });

    raw_college_data.forEach(function(d) {
      data.bs.push({
        year: +d.Year,
        program: d.Program,
        sex: d.Sex,
        count: +d.Graduates
      });
    });

    raw_ms_data.forEach(function(d) {
      data.ms.push({
        year: +d.Year,
        program: d.Program,
        sex: d.Sex,
        count: +d.Graduates
      });
    });

    raw_phd_data.forEach(function(d) {
      data.phd.push({
        year: +d.Year,
        program: d.Program,
        sex: d.Sex,
        count: +d.Graduates
      });
    });

    var cleaned_job_data = [];
    raw_job_data.forEach(function(d) {
      cleaned_job_data.push({
        year: +d.Year,
        count: parseInt(d.NumEmployed),
        occupation: d.Type,
        pctFemale: +d.PctFemale,
        shortOccupation: d.ShortType
      });
    });

    cleaned_job_data = cleaned_job_data.filter(function(d) {
      return !isNaN(d.pctFemale);
    });

    // Re-format job data to match others
    cleaned_job_data.forEach(function(d) {
      data.job.push({
        year: d.year,
        occupation: d.occupation,
        sex: 'F',
        count: Math.ceil(d.count * d.pctFemale),
        shortOccupation: d.shortOccupation
      });
      data.job.push({
        year: d.year,
        occupation: d.occupation,
        sex: 'M',
        count: Math.floor(d.count * (1 - d.pctFemale)),
        shortOccupation: d.shortOccupation
      });
    });

    drawPipe();
    plotByCategory('hs-group', data.hs);
    plotByYear('hs-year', data.hs);
    plotByCategory('bs-group', data.bs);
    plotByYear('bs-year', data.bs);
    plotByCategory('grad-group', data.ms.concat(data.phd));
    plotByYear('grad-year', data.ms.concat(data.phd));
    plotByCategory('work-group', data.job, graphOptions['work-group']);
    plotByYear('work-year', data.job);
  };
}

function loadData() {
    var highSchoolFile = "data/ap-scores.csv";
    var collegeFile = "data/bachelors-degrees-by-sex.csv";
    var mastersFile = "data/masters-grads-by-sex.csv";
    var phdFile = "data/phd-grads-by-sex.csv";
    var jobFile = "data/computing-occupations-by-sex.csv";

    var q = d3.queue()
        .defer(d3.csv, highSchoolFile)
        .defer(d3.csv, collegeFile)
        .defer(d3.csv, mastersFile)
        .defer(d3.csv, phdFile)
        .defer(d3.csv, jobFile)
        .await(combineData());
}

loadData();
