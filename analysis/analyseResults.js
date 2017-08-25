const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/lib/sync');

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

  loadFile('../data/resultate/results.csv', data => {

    data = parse(data);
    data = transform(data);
    data = aggregate(data);

    //saveFile('./output/policy.json', JSON.stringify(data, null, 2));
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

  return csv(data, options, (error, result) => {

    if (!error) {

      return result;
    } else {

      console.error(error);
    }
  });
}

function transform(data) {

  let result = {};

  data.forEach(paragraph => {

    let party = result[paragraph.party] = result[paragraph.party] || {};

    leftright.forEach(leri => {

      party[leri] = party[leri] || [];
      party[leri].push(paragraph[leri]);
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

    leftright.forEach(leri => {

      result[party][leri] = mean(data[party][leri]);
    });

    let rightValues = [];

    manifestoRight.forEach(right => {

      if (data[party][right]) {

        rightValues.push(mean(data[party][right]));
      }
    });

    let leftValues = [];

    manifestoLeft.forEach(left => {

      if (data[party][left]) {
        leftValues.push(mean(data[party][left]));
      }
    });

    result[party].rightValues = mean(rightValues);
    result[party].leftValues = mean(leftValues);

    maxima.forEach(maximum => {

      result[party][maximum] = summarize(data[party][maximum]);
    });

    domains.forEach(domain => {

      result[party][domain] = mean(data[party][domain]);
    });
  });

  console.log(result);
  return result;
}

function mean(arr) {

  return arr.reduce(function (acc, curr) {

    return acc + curr;
  }) / arr.length;
}

function summarize(arr) {

  return arr.reduce(function (acc, curr) {

    if (typeof acc[curr] == 'undefined') {

      acc[curr] = 1;
    } else {

      acc[curr] += 1;
    }

    return acc;
  }, {});
}
