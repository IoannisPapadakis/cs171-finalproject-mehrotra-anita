/**
 * @author: Anita Mehrotra
 * @class: CS 171 Visualization
 * @finalproject: USA Map, Mobility by county
 */

var width = 960,
    height = 600;

var mobilityById = d3.map();

// var quantize_rel = d3.scale.quantize()
//     .domain([0, .66])
//     .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var quantize_abs = d3.scale.quantize()
    .domain([20, 65])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var projection = d3.geo.albersUsa()
    .scale(1280)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

queue()
    .defer(d3.json, "../data/counties.json")
    // .defer(d3.tsv, "../data/relative_mobility.tsv", function(d) { 
    .defer(d3.tsv, "../data/absolute_mobility.tsv", function(d) { 
      // console.log("d.id", d.id);
      // mobilityById.set(d.id, +d.relative); 
      mobilityById.set(d.id, +d.absolute);
    })
    .await(ready);

function ready(error, us) {


  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      // .attr("class", function(d) { return quantize_rel(mobilityById.get(d.id)); })
      .attr("class", function(d) { 

        if (mobilityById.get(d.id) == undefined) {
          // console.log(d.id, "is undefined");
          return "q0-0"; //////////// <-- WHY ARE ONLY SOME SHOWING UP AS ORANGE? //////////
          // my hunch is that this is because these are id's that exist in the geo map but I don't have data for
        }
        else {
          // console.log(quantize_abs(mobilityById.get(d.id)));
          return quantize_abs(mobilityById.get(d.id));
        }

      })
      .attr("d", path);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
}

d3.select(self.frameElement).style("height", height + "px");




