bibliographies = new Map();
cleanedData = new Map();
array = [];

d3.json("classics.json", function(data) {
  for (key in data) {
    for (key1 in data[key]) {
      bibliographies.set(key, data[key]["bibliography"]);
    }
  }
  cleanData(bibliographies);
});

function cleanData(dataset) {
  details = new Object();
  for (const [k, v] of dataset.entries()) {
    var language = v.languages[0];
    if (!cleanedData.has(language)) {
      cleanedData.set(language, new Set([[v.title, v.author.name]]));
    }
    cleanedData.get(language).add([[v.title, v.author.name]]);
  }
}
