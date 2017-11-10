const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/lib/sync');

const parties = [
  'AfD',
  'CDU/CSU',
  'FDP',
  'SPD',
  'Grüne',
  'Die Linke'
];

const leftright = [
  'left',
  'right'
];

const maxima = [
  'max_domain',
  'max_manifesto',
  'max_leftright'
];

const domains = [
  'External Relations',
  'Freedom and Democracy',
  'Political System',
  'Economy',
  'Welfare and Quality of Life',
  'Fabric of Society'
];

const manifesto = [
  'military +',
  'military -',
  'peace +',
  'internationalism +',
  'europe +',
  'europe -',
  'freedom/human rights +',
  'democracy +',
  'constitution +',
  'decentralism +',
  'gov-admin efficiency +',
  'political corruption -',
  'political authority +',
  'free enterprise +',
  'incentives +',
  'market regulation +',
  'economic goals',
  'productivity +',
  'infrastructure +',
  'nationalization +',
  'economic orthodoxy +',
  'anti-growth economy +',
  'environmentalism +',
  'culture +',
  'social justice +',
  'welfare +',
  'education +',
  'national way of life +',
  'traditional morality +',
  'traditional morality -',
  'law and order +',
  'social harmony +',
  'multiculturalism +',
  'labour +',
  'agriculture +',
  'minority groups +',
  'non economic groups +'
];

const manifestoRight = [
  'military +',
  'freedom/human rights +',
  'constitution +',
  'political authority +',
  'free enterprise +',
  'incentives +',
  'protectionism -',
  'economic orthodoxy +',
  'welfare -',
  'national way of life +',
  'traditional morality +',
  'law and order +',
  'social harmony +'
];

const manifestoLeft = [
  'anti-imperial,sm +',
  'military -',
  'peace +',
  'internationalism +',
  'market regulation +',
  'economic planning +',
  'protectionism +',
  'controlled economy +',
  'nationalization +',
  'welfare +',
  'education +',
  'labour +',
  'democracy +'
];

(function init() {

  let result, aggregation, calculation, transposition;

  loadFile('../data/resultate/results.csv', data => {

    data = parse(data);
    data = transform(data);

    aggregation = aggregate(data);
    calculation = calculate(aggregation);
    result = merge(aggregation, calculation);

    transposition = transpose(result);

    saveFile('./results/results.json', JSON.stringify(transposition, null, 2));
  });
})();

function loadFile(filePath, callback) {

  fs.readFile(filePath, 'utf8', (error, result) => {

    if (!error) {

      callback(result);
    } else {

      console.error(error);
    }
  });
}

// Read CSV lines to JavaScript object(s)
function parse(data) {

  const options = {
    columns: true,
    auto_parse: true
  };

  return csvParse(data, options, (error, result) => {

    if (error) { console.error(error); }

    return result;
  });
}

// Transform properties per paragraphs to properties per party
function transform(data) {

  let result = {};

  data.forEach(paragraph => {

    let party = result[paragraph.party] = result[paragraph.party] || {};

    party.weights = party.weights || [];
    party.weights.push(paragraph.content.length);

    leftright.forEach(leri => {

      // Save all left/right prediction values per party
      party[leri] = party[leri] || [];
      party[leri].push(paragraph[leri]);

      // Save all left/right weights per party
      party['weights_' + leri] = party['weights_' + leri] || [];
      party['weights_' + leri].push(paragraph.content.length);

      // Save all left/right prediction values per party AND max_domain
      party['max_domain_' + leri] = party['max_domain_' + leri] || {};
      party['max_domain_' + leri][paragraph.max_domain] = party['max_domain_' + leri][paragraph.max_domain] || [];
      party['max_domain_' + leri][paragraph.max_domain].push(paragraph[leri]);

      // Save all left/right weights per party AND max_domain
      party['max_domain_weights_' + leri] = party['max_domain_weights_' + leri] || {};
      party['max_domain_weights_' + leri][paragraph.max_domain] = party['max_domain_weights_' + leri][paragraph.max_domain] || [];
      party['max_domain_weights_' + leri][paragraph.max_domain].push(paragraph.content.length);

      // Save all max_leftright occurences per party AND max_domain
      if (paragraph.max_leftright == leri) {

        party['max_domain_max_' + leri] = party['max_domain_max_' + leri] || [];
        party['max_domain_max_' + leri].push(paragraph.max_domain);
      }
    });

    // Save all maxmimum occurences (leftright, domain, manifesto) per party
    maxima.forEach(maximum => {

      party[maximum] = party[maximum] || [];
      party[maximum].push(paragraph[maximum]);
    });

    // Save all domain prediction values per party
    domains.forEach(domain => {

      party[domain] = party[domain] || [];
      party[domain].push(paragraph[domain]);
    });

    // Save all manifesto code prediction values per party
    manifesto.forEach(man => {

      party[man] = party[man] || [];
      party[man].push(paragraph[man]);
    });
  });

  return result;
}

// Aggregate values per property per party
function aggregate(data) {

  let result = {};

  parties.forEach(party => {

    result[party] = result[party] || {};

    result[party].weights_mean = mean(data[party].weights);
    result[party].weights_median = median(data[party].weights);
    result[party].weights_stddev = stdDev(data[party].weights);

    leftright.forEach(leri => {

      result[party][leri + '_weighted_mean'] = weightedMean(data[party][leri], data[party]['weights_' + leri]);
      result[party][leri + '_weighted_median'] = weightedMedian(data[party][leri], data[party]['weights_' + leri]);
      result[party][leri + '_weighted_stddev'] = weightedStdDev(data[party][leri], data[party]['weights_' + leri]);

      // Average right and left from right/left per party
      result[party][leri + '_mean'] = mean(data[party][leri]);
      result[party][leri + '_median'] = median(data[party][leri]);
      result[party][leri + '_stddev'] = stdDev(data[party][leri]);

      // Max right and left count from max_domain per party
      result[party]['max_domain_max_' + leri] = count(data[party]['max_domain_max_' + leri]);

      // Average right and left from max_domain per party
      domains.forEach(domain => {

        result[party]['max_domain_' + leri] = result[party]['max_domain_' + leri] || {};
        result[party]['max_domain_' + leri][domain] = mean(data[party]['max_domain_' + leri][domain]);

        result[party]['max_domain_weighted_' + leri] = result[party]['max_domain_weighted_' + leri] || {};
        result[party]['max_domain_weighted_' + leri][domain] = weightedMedian(
          data[party]['max_domain_' + leri][domain],
          data[party]['max_domain_weights_' + leri][domain]
        );

        result[party]['max_domain_weighted_stddev_' + leri] = result[party]['max_domain_weighted_stddev_' + leri] || {};
        result[party]['max_domain_weighted_stddev_' + leri][domain] = weightedStdDev(
          data[party]['max_domain_' + leri][domain],
          data[party]['max_domain_weights_' + leri][domain]
        );
      });
    });

    // Calculate rile index from right/values per party
    // @todo Should be done in calculate()
    result[party].rile_mean = result[party].right_mean - result[party].left_mean;
    result[party].rile_median = result[party].right_mean - result[party].left_mean;

    result[party].rile_weighted_mean = result[party].right_weighted_mean - result[party].left_weighted_mean;
    result[party].rile_weighted_median = result[party].right_weighted_mean - result[party].left_weighted_mean;

    // Count occurences (leftright, domain, manifesto) per party
    maxima.forEach(maximum => {

      result[party][maximum] = count(data[party][maximum]);
    });

    result[party].max_domain_weights = coalesce(data[party].max_domain, data[party].weights);

  });

  return result;
}

function coalesce(values, weights) {

  let result = {};

  values.forEach((value, index) => {

    result[value] = result[value] || 0;
    result[value] += weights[index];
  });

  return result;
}

function calculate(data) {

  let result = {};

  parties.forEach(party => {

    result[party] = result[party] || {};

    domains.forEach(domain => {

      // Rile index from max_domain and right/left value per party
      // @todo Objects and null values should be instantiated programmatically (lambdas)
      result[party].max_domain_rile = result[party].max_domain_rile || {};

      data[party].max_domain_right[domain] = data[party].max_domain_right[domain] || 0;
      data[party].max_domain_left[domain] = data[party].max_domain_left[domain] || 0;

      result[party].max_domain_rile[domain] =
        (data[party].max_domain_right[domain] - data[party].max_domain_left[domain]);

      // Weighted Rile index from max_domain and right/left value per party
      // @todo Objects and null values should be instantiated programmatically (lambdas)
      result[party].max_domain_weighted_rile = result[party].max_domain_weighted_rile || {};

      data[party].max_domain_weighted_right[domain] = data[party].max_domain_weighted_right[domain] || 0;
      data[party].max_domain_weighted_left[domain] = data[party].max_domain_weighted_left[domain] || 0;

      result[party].max_domain_weighted_rile[domain] =
        (data[party].max_domain_weighted_right[domain] - data[party].max_domain_weighted_left[domain]);

      // Rile index from from max_domain and max_right occurences
      // @todo Remove, because the small sample and missing values lead to weird results
      result[party].max_domain_max_rile = result[party].max_domain_max_rile || {};

      data[party].max_domain_max_right[domain] = data[party].max_domain_max_right[domain] || 0;
      data[party].max_domain_max_left[domain] = data[party].max_domain_max_left[domain] || 0;

      result[party].max_domain_max_rile[domain] =
        (data[party].max_domain_max_right[domain] - data[party].max_domain_max_left[domain]) /
        (data[party].max_domain_max_right[domain] + data[party].max_domain_max_left[domain]);
    });

    // Rile index from manifesto codes (as defined in Manifesto codebook)
    result[party].right_calc = 0;
    result[party].left_calc = 0;

    // Count right occurences
    manifestoRight.forEach(right => {

      result[party].right_calc += data[party].max_manifesto[right] || 0;
    });

    // Count left occurences
    manifestoLeft.forEach(left => {

      result[party].left_calc += data[party].max_manifesto[left] || 0;
    });

    // Calculate rile index (right - left / right + left)
    result[party].rile_calc = (result[party].right_calc - result[party].left_calc) /
      (result[party].right_calc + result[party].left_calc);
    result[party].rile_calc = round(result[party].rile_calc);
  });

  return result;
}

// Transform object from "by party" to "by property"
function transpose(data) {

  let result = {};

  parties.forEach(party => {

    for (var prop in data[party]) {

      result[prop] = result[prop] || {};

      result[prop][party] = data[party][prop];
    }
  });

  return result;
}

// Merge different properties from differnt objects into one object
function merge(obj1, obj2) {

  let result = {};

  for (var prop in obj1) {

    if (obj1.hasOwnProperty(prop) && obj2.hasOwnProperty(prop)) {

      result[prop] = result[prop] || {};

      Object.assign(result[prop], obj1[prop], obj2[prop]);
    }
  }

  return result;
}

// Round by two decimal places
function round(float) {

  return Math.round(float * 100) / 100;
}

// Count occurences of uniqe values in an array
function count(arr) {

  return arr.reduce(function (acc, curr) {

    if (typeof acc[curr] == 'undefined') {

      acc[curr] = 1;
    } else {

      acc[curr] += 1;
    }

    return acc;
  }, {});
}

// Sum up all values in an array
function sum(arr) {

  return arr.reduce(function (previous, current) {

    return previous + current;
  });
}

// Calculate arithmetic mean from an array of values
function mean(arr) {

  return arr.reduce(function (acc, curr) {

    return acc + curr;
  }) / arr.length;
}

// Calculate median from an array of values
function median(arr) {

  var middle = Math.floor(arr.length / 2);

  arr.sort(function (a, b) { return a - b; });

  if (arr.length % 2) {

    return arr[middle];
  } else {

    return (arr[middle - 1] + arr[middle]) / 2.0;
  }
}

// Calculate standard deviation from an array of values
function stdDev(arr) {

  var squareDiffs = arr.map(function (value) {

    var diff = value - mean(arr);
    var sqrDiff = diff * diff;

    return sqrDiff;
  });

  var variance = mean(squareDiffs);

  return Math.sqrt(variance);
}

function weightedMean(values, weights) {

  var result = values.map(function (value, i) {

    var weight = weights[i];
    var sum = value * weight;

    return [sum, weight];
  }).reduce(function (previous, current) {

    return [previous[0] + current[0], previous[1] + current[1]];
  }, [0, 0]);

  return result[0] / result[1];
}

function weightedMedian(values, weights) {

  var midpoint = 0.5 * sum(weights);

  var cumulativeWeight = 0;
  var belowMidpointIndex = 0;

  var sortedValues = [];
  var sortedWeights = [];

  values.map(function (value, i) {

    return [value, weights[i]];
  }).sort(function (a, b) {

    return a[0] - b[0];
  }).map(function (pair) {

    sortedValues.push(pair[0]);
    sortedWeights.push(pair[1]);
  });

  if (sortedWeights.some(function (value) { return value > midpoint; })) {

    return sortedValues[sortedWeights.indexOf(Math.max.apply(null, sortedWeights))];
  }

  while (cumulativeWeight <= midpoint) {

    belowMidpointIndex++;
    cumulativeWeight += sortedWeights[belowMidpointIndex - 1];
  }

  cumulativeWeight -= sortedWeights[belowMidpointIndex - 1];

  if (cumulativeWeight - midpoint < Number.EPSILON) {

    var bounds = sortedValues.slice(belowMidpointIndex - 2, belowMidpointIndex);
    return sum(bounds) / bounds.length;
  }

  return sortedValues[belowMidpointIndex - 1];
}

function weightedStdDev(values, weights) {

  var avg = weightedMean(values, weights);

  var result = values.map(function (value, i) {

    var weight = weights[i];
    var diff = value - avg;
    var sqrDiff = weight * Math.pow(diff, 2);

    return [sqrDiff, weight];
  }).reduce(function (previous, current) {

    return [previous[0] + current[0], previous[1] + current[1]];
  }, [0, 0]);

  return Math.sqrt(result[0] / result[1]);
}


function saveFile(relativePath, string) {

  relativePath = path.normalize(relativePath);

  console.log('Saved file', relativePath);

  try {

    return fs.writeFileSync(relativePath, string, 'utf8');
  } catch (error) {

    console.log(error);
  }
}
