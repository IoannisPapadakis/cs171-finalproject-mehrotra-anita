/*
 * @author: Anita Mehrotra
 * @class: CS 171 Visualization
 * @finalproject: Parallel coords + map
 */

var margin = {
    top: 80,
    right: 10,
    bottom: 50,
    left: 10
};

var width = 960,
    height = 500 - margin.bottom - margin.top;

// create svg elements for each (detail and overview)
var detailVisWidth = 600;
var detailVisHeight = 700;

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:detailVisWidth,
    height:detailVisHeight
})

var canvas = d3.select("#vis").append("svg").attr({
    width: width-100,
    //  + margin.left + margin.right
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

svg.append("text")
        .attr("x", ((width /2) - 450))             
        .attr("y", 0 - (margin.top/2))
        .attr("text-anchor", "left-align")  
        .style("font-size", "40px")
        .style("fill", "black")
        .style("font-family", "Goudy Bookletter 1911")
        .text("U.S. K-12 Education and Mobility");




// load data
queue()
    .defer(d3.json, "../data/counties.json")
    .defer(d3.tsv, "../data/county_and_mobility.tsv", function(d) {
      names_and_mobility.push(d);
    })
    .defer(d3.tsv, "../data/absolute_mobility.tsv", function(d) { 
      mobilityById.set(d.id, +d.absolute);
    })
    .await(ready);

// set up scales
var names_and_mobility = [];

var mobilityById = d3.map();

var quantize_abs = d3.scale.quantize()
    .domain([20, 65])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var projection = d3.geo.albersUsa()
    .scale(800)
    .translate([(detailVisWidth-28)/2, (detailVisHeight-60) / 2]);

var path = d3.geo.path()
    .projection(projection);

function ready(error, us) {

  var allcounties = topojson.feature(us, us.objects.counties).features;

  // 1. create parallel coordinates visualization & highlight counties on map
  getCounties(allcounties);

  // 2. create USA map of mobility

  // add tooltip
  var div = d3.select("body").append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0);

  // create map of counties
  var counties = detailVis.append("g")
                    .attr("class", "counties")
                  .selectAll("path")
                    .data(allcounties)
                  .enter().append("path");

  // color counties according to scale
  counties.attr("class", function(d) { 
              return quantize_abs(mobilityById.get(d.id));
            })
          .attr("d", path);

  // add county and state border lines
  detailVis.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);

  // include tooltip on hover over county
  var fip_name = [];
  var fip_mobility = [];
  names_and_mobility.forEach(function(d) {
    fip_name[d.fip] = d["county state"];
    fip_mobility[d.fip] = d["absolute mobility"];
  })
  // console.log(fip_name);
  // console.log(fip_mobility);

  counties.on("mouseover", function (d) { 
      div.transition()        
          .duration(200)      
          .style("opacity", .9);      
      div.html( fip_name[d.id] + "<br/>" + "Mobility: " + fip_mobility[d.id])
          .style("left", (d3.event.pageX) + "px")     
          .style("top", (d3.event.pageY - 28) + "px");    
      })
      .on("mouseout", function (d) {
          div.transition()
              .duration(500)
              .style("opacity", 0);
      });
  
}

// FUNCTIONS

// Get county ID's for each line in parallel coordinates
var getCounties = function(allcounties) {

  d3.csv("../data/countyID_again.csv", function(error, data) {

    var counties = [];
    data.forEach(function(d, i) {
      counties[i] = d["County ID"];
    });

    // Create parallel coordinates
    createParallelCoords(allcounties, counties);

  })

}

// Create parallel coordinates visualization
var createParallelCoords = function(allcounties, counties) {

  // console.log("counties", counties);

  var x = d3.scale.ordinal().rangePoints([0, width-100], 1),
      y = {},
      dragging = {};

  var line = d3.svg.line(),
      axis = d3.svg.axis().orient("left"),
      background,
      foreground;

  d3.csv("../data/all_data.csv", function(error, education) {

    // Extract the list of dimensions, ignoring county ID, and create a scale for each.
    x.domain(dimensions = d3.keys(education[0]).filter(function(d) {
      return d != "County ID" && (y[d] = d3.scale.linear()
          .domain(d3.extent(education, function(p) { return +p[d]; }))
          .range([height-100, 0]));
    }));

    // Add background lines (context)
    background = svg.append("g")
        .attr("class", "background")
      .selectAll("path")
        .data(education)
      .enter().append("path")
        .attr("d", path);

    // Add foreground lines (focus)
    foreground = svg.append("g")
        .attr("class", "foreground")
      .selectAll("path")
        .data(education)
      .enter().append("path")
        .attr("d", path);

    // Add a group element for each dimension/axis (feature vector)
    var g = svg.selectAll(".dimension")
        .data(dimensions)
      .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

    // Add feature axes and titles
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
      .append("text")
        .attr("text-anchor", "middle")
        .attr("y", -9)
        .text(String);

    // Add and store a brush for each axis
    g.append("g")
        .attr("class", "brush")
        .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush)); })
      .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);
  });

  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }

  function transition(g) {
    return g.transition().duration(500);
  }

  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
  }

  // When brushing, don’t trigger axis dragging.
  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }

  // Handles a brush event, toggling the display of foreground lines.
  function brush() {

    var actives = dimensions.filter(function(p) { 
      return !y[p].brush.empty(); // returns boolean: true if there IS a line
    });

    var extents = actives.map(function(p) { 
      return y[p].brush.extent(); // returns an array with [lower bound, upper bound]
    });

    // identify county ID for selected lines
    var ids = [];
    foreground.style("display", function(d) {
      actives.every(function(p, i) {

        // highlight counties on US map
        if ( extents[i][0] <= d[p] && d[p] <= extents[i][1] ) {

          // store highlighted county IDs
          ids.push(d["County ID"]);

          // send to function for highlighting on map 
          highlightCounty(allcounties, ids);

        }
      })
    });

    // highlight selected lines
    foreground.style("display", function(d) {
      return actives.every(function(p, i) {
        return extents[i][0] <= d[p] && d[p] <= extents[i][1]; 
      }) ? null : "none";

    });

  }
}





// Highlight counties that are selected in parallel coordinates
var highlightCounty = function(allcounties, ids) {
  
  var selected_county = [];
  ids.forEach(function(m) {

    allcounties.forEach(function(d, i) {

      // get geo-object associated with each id
      if (d.id==m) {
        selected_county.push(d);
      }

    });

  });

  console.log("selected counties", ids);

  // highlight counties on map

  // detailVis.selectAll("g.highlight").remove();
  
  detailVis.append("g")
      .attr("class", "highlight")
    .selectAll("path")
      .data(selected_county)
    .enter().append("path")
      .attr("d", path)
      .style("stroke-width", 1.25)
      .style("stroke", "darkred")
      .style("stroke-opacity", .2);

}







