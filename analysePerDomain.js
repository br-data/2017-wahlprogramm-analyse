var fs = require('fs');
var path = require('path');

var csv = require('csv-parse/lib/sync');

(function init() {

  loadFile('./data/resultate/results.csv', function (data) {

    data = parse(data);

    console.log(data[0]);
    // data = transform(data);
    // data = aggregate(data);
    // data = analyse(data);

    //saveFile('./output/policy.json', JSON.stringify(data, null, 2));
  });
})();

function loadFile(filePath, callback) {

  fs.readFile(filePath, 'utf8', function (error, result) {

    if (!error) {

      callback(result);
    } else {

      console.error(error);
    }
  });
}

function parse(data) {

  var options = {
    columns: true,
    auto_parse: true
  };

  return csv(data, options, function(error, result){

    if (!error) {

      return result;
    } else {

      console.error(error);
    }
  });
}
