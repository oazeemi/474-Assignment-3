let allBooks = [];
let allAuthors = [];
let AllLanguages = [];
AuthorSet = new Set();
LanguageSet = new Set();

d3.json("classics.json", function(data) {
  for (key in data) {
    if(data[key]["bibliography"]["languages"][0] !== "en"){
      let bookObject = {};
      bookObject.name = data[key]["bibliography"]["title"];
      bookObject.bibliography = data[key]["bibliography"];
      bookObject.size = 1;
      allBooks.push(bookObject);
  
    }
  }
  buildAuthors(allBooks);
  buildLanguages(allAuthors);

  let finalData = {
    name: "Languages",
    children: AllLanguages
  };
  var myJSON = JSON.stringify(finalData);
});

function buildAuthors(allBooks) {
  allBooks.forEach(bookObject => {
    let AuthorObject = {};
    curAuthorName = bookObject.bibliography.author.name;
    if (!AuthorSet.has(curAuthorName)) {
      AuthorObject.name = curAuthorName;
      AuthorObject.children = [bookObject];
      allAuthors.push(AuthorObject);
      AuthorSet.add(curAuthorName);
    } else {
      AuthorObject = allAuthors.find(function(element) {
        return element.name == curAuthorName;
      });
      AuthorObject.children.push(bookObject);
    }
  });
  //console.log(allAuthors)
}

function buildLanguages(allAuthors) {
  allAuthors.forEach(AuthorObject => {
    let LanguageObject = {};
    curLanguage = AuthorObject.children[0].bibliography.languages[0];
    // add a for each loop to go through each value in the books array instead of just looking at the first book
    if (!LanguageSet.has(curLanguage)) {
      LanguageObject.name = curLanguage;
      LanguageObject.children = [AuthorObject];
      AllLanguages.push(LanguageObject);
      LanguageSet.add(curLanguage);
    } else {
      LanguageObject = AllLanguages.find(function(element) {
        return element.name == curLanguage;
      });
      LanguageObject.children.push(AuthorObject);
    }
  });
}

var width = 960,
height = 700,
radius = Math.min(width, height) / 2 - 10;

var formatNumber = d3.format(",d");

var x = d3.scale.linear().range([0, 2 * Math.PI]);

var y = d3.scale.sqrt().range([0, radius]);

var color = d3.scale.category20c();

var partition = d3.layout.partition().value(function(d) {
return d.size;
});

var arc = d3.svg
.arc()
.startAngle(function(d) {
  return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
})
.endAngle(function(d) {
  return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
})
.innerRadius(function(d) {
  return Math.max(0, y(d.y));
})
.outerRadius(function(d) {
  return Math.max(0, y(d.y + d.dy));
});

var svg = d3
.select("body")
.append("svg")
.attr("width", width)
.attr("height", height)
.append("g")
.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.json("newDataWithoutEnglish.json", function(error, root) {
if (error) throw error;
svg
  .selectAll("path")
  .data(partition.nodes(root))
  .enter()
  .append("path")
  .attr("d", arc)
  .style("fill", function(d) {
    //console.log(d.children);
    return color(d.name); //(d.children ? d : d.parent).name);
  })
  .on("click", click)
  .append("title")
  .text(function(d) {
    return d.name + "\n" + formatNumber(d.value);
  });
});

function click(d) {
svg
  .transition()
  .duration(750)
  .tween("scale", function() {
    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
    return function(t) {
      x.domain(xd(t));
      y.domain(yd(t)).range(yr(t));
    };
  })
  .selectAll("path")
  .attrTween("d", function(d) {
    return function() {
      return arc(d);
    };
  });
}

d3.select(self.frameElement).style("height", height + "px");
