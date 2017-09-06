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

function transform(data) {

  let result = {};

  data.forEach(paragraph => {

    let party = result[paragraph.party] = result[paragraph.party] || {};

    leftright.forEach(leri => {

      party[leri] = party[leri] || [];
      party[leri].push(paragraph[leri]);

      party['max_domain_' + leri] = party['max_domain_' + leri] || {};
      party['max_domain_' + leri][paragraph.max_domain] = party['max_domain_' + leri][paragraph.max_domain] || [];
      party['max_domain_' + leri][paragraph.max_domain].push(paragraph[leri]);

      if (paragraph.max_leftright == leri) {

        party['max_domain_max_' + leri] = party['max_domain_max_' + leri] || [];
        party['max_domain_max_' + leri].push(paragraph.max_domain);
      }
    });

    maxima.forEach(maximum => {

      party[maximum] = party[maximum] || [];
      party[maximum].push(paragraph[maximum]);
    });

    domains.forEach(domain => {

      party[domain] = party[domain] || [];
      party[domain].push(paragraph[domain]);
    });

    manifesto.forEach(man => {

      party[man] = party[man] || [];
      party[man].push(paragraph[man]);
    });
  });

  return result;
}

function aggregate(data) {

  let result = {};

  parties.forEach(party => {

    result[party] = result[party] || {};

    maxima.forEach(maximum => {

      result[party][maximum] = count(data[party][maximum]);
    });

    leftright.forEach(leri => {

      // Average right and left from right/left
      result[party][leri + '_mean'] = mean(data[party][leri]);
      result[party][leri + '_median'] = median(data[party][leri]);
      result[party][leri + '_stddev'] = stdDev(data[party][leri]);

      // Max right and left count from max domain
      result[party]['max_domain_max_' + leri] = count(data[party]['max_domain_max_' + leri]);

      // Average right and left from max domain
      domains.forEach(domain => {

        result[party]['max_domain_' + leri] = result[party]['max_domain_' + leri] || {};
        result[party]['max_domain_' + leri][domain] = mean(data[party]['max_domain_' + leri][domain]);
      });
    });

    result[party].rile_mean = result[party].right_mean - result[party].left_mean;
    result[party].rile_median = result[party].right_mean - result[party].left_mean;
  });

  return result;
}

function calculate(data) {

  let result = {};

  parties.forEach(party => {

    result[party] = result[party] || {};

    domains.forEach(domain => {

      // Average rile from max domain
      result[party].max_domain_rile = result[party].max_domain_rile || {};

      data[party].max_domain_right[domain] = data[party].max_domain_right[domain] || 0;
      data[party].max_domain_left[domain] = data[party].max_domain_left[domain] || 0;

      result[party].max_domain_rile[domain] =
        (data[party].max_domain_right[domain] - data[party].max_domain_left[domain]);

      // Max rile from max domain
      result[party].max_domain_max_rile = result[party].max_domain_max_rile || {};

      data[party].max_domain_max_right[domain] = data[party].max_domain_max_right[domain] || 0;
      data[party].max_domain_max_left[domain] = data[party].max_domain_max_left[domain] || 0;

      result[party].max_domain_max_rile[domain] =
        (data[party].max_domain_max_right[domain] - data[party].max_domain_max_left[domain]) /
        (data[party].max_domain_max_right[domain] + data[party].max_domain_max_left[domain]);
    });

    // Rile from manifesto codes
    result[party].right_calc = 0;
    result[party].left_calc = 0;

    manifestoRight.forEach(right => {

      result[party].right_calc += data[party].max_manifesto[right] || 0;
    });

    manifestoLeft.forEach(left => {

      result[party].left_calc += data[party].max_manifesto[left] || 0;
    });

    result[party].rile_calc = (result[party].right_calc - result[party].left_calc) /
      (result[party].right_calc + result[party].left_calc);
    result[party].rile_calc = round(result[party].rile_calc);
  });

  console.log(result);

  return result;
}

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

function round(float) {

  return Math.round(float * 100) / 100;
}

function mean(arr) {

  return arr.reduce(function (acc, curr) {

    return acc + curr;
  }) / arr.length;
}

function median(arr) {

  var middle = Math.floor(arr.length / 2);

  arr.sort(function (a, b) { return a - b; });

  if (arr.length % 2) {

    return arr[middle];
  } else {

    return (arr[middle - 1] + arr[middle]) / 2.0;
  }
}

function stdDev(arr) {

  var squareDiffs = arr.map(function (value) {

    var diff = value - mean(arr);
    var sqrDiff = diff * diff;

    return sqrDiff;
  });

  var variance = mean(squareDiffs);

  return Math.sqrt(variance);
}

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

function saveFile(relativePath, string) {

  relativePath = path.normalize(relativePath);

  console.log('Saved file', relativePath);

  try {

    return fs.writeFileSync(relativePath, string, 'utf8');
  } catch (error) {

    console.log(error);
  }
}
