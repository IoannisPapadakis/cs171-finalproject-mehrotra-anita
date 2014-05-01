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

// create svg elements for each viz (detail and overview)
var detailVisWidth = 600;
var detailVisHeight = 700;

var canvas = d3.select("#vis").append("svg").attr({
    width: width-100,
    //  + margin.left + margin.right
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:detailVisWidth,
    height:detailVisHeight
})

var brush_timer;

// title
svg.append("text")
        .attr("x", ((width /2) - 450))             
        .attr("y", 0 - (margin.top/2))
        .attr("text-anchor", "left-align")  
        .style("font-size", "40px")
        .style("fill", "black")
        .style("font-family", "Goudy Bookletter 1911")
        .text("U.S. K-12 Education and Mobility");

// add feature descriptions
svg.append("svg:text")
        .attr("x", ((width /2) - 450))             
        .attr("y", height - (margin.top/2))
        .attr("text-anchor", "left-align")  
        .style("font-size", "10px")
        .style("fill", "grey")
        .style("font-family", "Goudy Bookletter 1911")
        .append("svg:tspan")
        .attr("x", ((width /2) - 450))             
        .attr("y", height - (margin.top/2) - 25)
        .text("So... What do the above features mean?")
        .append("svg:tspan")
        .attr("x", ((width /2) - 450))             
        .attr("y", height - (margin.top/2))
        .text("SCHOOL EXPENDITURE PER STUDENT: Average expenditures per student in public schools")
        .append("svg:tspan")
        .attr("x", ((width /2) - 450))             
        .attr("y", height - (margin.top/2) + 15)
        .text("STUDENT-TEACHER RATIO: Average student-teacher ratio in public schools")
        .append("svg:tspan")
        .attr("x", ((width /2) - 450))             
        .attr("y", height - (margin.top/2) + 30)
        .text("TEST SCORE PERCENTILE (income-adjusted): Residual from a regression of mean Math & English standardized test scores on household income per capita in 2000")
        .append("svg:tspan")
        .attr("x", ((width /2) - 450))             
        .attr("y", height - (margin.top/2) + 45)
        .text("HIGH SCHOOL DROPOUT RATE (income-adjusted): Residual from a regression of HS dropout rates on household income per capita in 2000")
        .append("svg:tspan")
        .attr("x", ((width /2) - 450))             
        .attr("y", height - (margin.top/2) + 60)
        .text("TEENAGE PREGNANCY RATE: Fraction of female children in core sample claiming dependent born between kids ages 13-19")
        .append("svg:tspan")
        .attr("x", ((width /2) - 450))             
        .attr("y", height - (margin.top/2) + 75)
        .text("MEAN PARENT INCOME: Mean parent family income within county");

// add feature descriptions
detailVis.append("svg:text")
        .attr("x", (detailVisWidth/2) - 190)             
        .attr("y", detailVisHeight - 160)
        .attr("text-anchor", "left-align")  
        .style("font-size", "10px")
        .style("fill", "grey")
        .style("font-family", "Goudy Bookletter 1911")
        .append("svg:tspan")
        .attr("x", (detailVisWidth/2) - 190)             
        .attr("y", detailVisHeight - 160)
        .text("ABSOLUTE MOBILITY is the expected rank of a child born between 1980-82,")
        .append("svg:tspan")
        .attr("x", (detailVisWidth/2) - 140)             
        .attr("y", detailVisHeight - 145)
        .text("given the corresponding percentile of parent income");
        

// load data
queue()
    .defer(d3.json, "data/counties.json")
    .defer(d3.tsv, "data/county_and_mobility.tsv", function(d) {
      names_and_mobility.push(d);
    })
    .defer(d3.tsv, "data/absolute_mobility.tsv", function(d) { 
      mobilityById.set(d.id, +d.absolute);
    })
    .await(ready);

// initialize vars and set up scales
var names_and_mobility = [];
var ext_color_domain = [0, 25, 30, 35, 40, 45, 50, 55, 60];
var legend_labels = ["< 25", "25+", "30+", "35+", "40+", "45+", "50+", "55+", "> 60"] 
var centered;

var mobilityById = d3.map();

var quantize_abs = d3.scale.quantize()
    .domain([20, 65])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var projection = d3.geo.albersUsa()
    .scale(750)
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

  // color counties according to scale and zoom on click
  counties.attr("class", function(d) { return quantize_abs(mobilityById.get(d.id)); })
          .attr("d", path)
          .on("click", clicked);

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

  // add legend
  var legend = detailVis.selectAll("g.legend")
  .data(ext_color_domain)
  .enter().append("g")
  .attr("class", "legend");

  var ls_w = 20, ls_h = 20;

  legend.append("rect")
    .attr("x", 550)
    .attr("y", function(d, i){ return height + 150 - (i*ls_h) - 2*ls_h; })
    .attr("width", ls_w)
    .attr("height", ls_h)
    .attr("class", function(d) { return quantize_abs(d); })
    .style("opacity", 0.8);

  legend.append("text")
    .attr("x", 529)
    .attr("y", function(d, i){ return height + 146 - (i*ls_h) - ls_h - 4;})
    .text(function(d, i){ return legend_labels[i]; })
    .style("font-size", "9px");
  
}

// FUNCTIONS

// Zoom in on U.S. map if clicked
function clicked(d) {
  var x, y, k;
  console.log("clicked");
  console.log("d", d);


  if (d && centered !== d) {
    // console.log("centered", centered);
    console.log("d", d);
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
    // console.log("centered", centered);

  } else {
    // x = width / 2;
    // y = height / 2;
    x = detailVisWidth / 2;
    y = detailVisHeight / 2;
    k = 1;
    centered = null;
  }

  canvas.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  canvas.transition()
      .duration(750)
      // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .attr("transform", "translate(" + detailVisWidth / 2 + "," + detailVisHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

// Get county ID's for each line in parallel coordinates
var getCounties = function(allcounties) {

  d3.csv("data/countyID_again.csv", function(error, data) {

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

  d3.csv("data/all_data.csv", function(error, education) {

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
  var all_ids = [];
  var intersection_ids = [];
  var curr_ids = [];
  var new_ids = [];

  function brush() {

    // clear out old highlights
    clearTimeout(brush_timer);

    // highlight with delay
    brush_timer = setTimeout( function() {

      var list_of_axes = []; // list of brushed axes
      var count_of_axes; // total number of brushed axes
      var curr_axis; // axis we are currently brushing
      var range_we_care_about; // range of values selected by current brush
      var new_ids = []; // overlapping ids across different brushed axes

      var actives = dimensions.filter(function(p) { 
        
        // count the number of axes being brushed
        if (!y[p].brush.empty() == true) {
          curr_axis = p;
          list_of_axes.push(p);
        }
        count_of_axes = list_of_axes.length;

        // returns boolean: true if there IS a line
        return !y[p].brush.empty(); 
      });

      
      var extents = actives.map(function(p) { 
        // returns an array with [lower bound, upper bound]
        range_we_care_about = y[p].brush.extent();
        // console.log("range_we_care_about first", range_we_care_about);
        return y[p].brush.extent(); 
      });


      foreground.style("display", function(d) {

        actives.every(function(p, i) {

          // highlight counties on US map
          if ( extents[i][0] <= d[p] && d[p] <= extents[i][1]) {

            // if it's the first selection, and curr_ids is empty, use all selected ids
            //    otherwise, use curr_ids
            if (count_of_axes == 1) {

              curr_ids.push(d["County ID"]);
              // console.log(p);
              // console.log("curr_ids ", curr_ids);
              // console.log("new_ids", new_ids);

              highlightCounty(allcounties, curr_ids);
              
            }
            else if (count_of_axes > 1) {

              // console.log(list_of_axes);

              var range_we_care_about;

              if (curr_axis != undefined) {

                var end = extents.length; 
                range_we_care_about = extents[end-1];

                // console.log("d", d);
                // console.log("d[curr_axis]", d[curr_axis]);

                if (d[curr_axis] >= range_we_care_about[0] && d[curr_axis] <= range_we_care_about[1]) {

                  // console.log(d["County ID"], " IS actually in the range");
                  new_ids.push(d["County ID"]);
                }
              }

              if (curr_ids.indexOf(new_ids) > -1) { 
                // if the item is not in the existing list, remove its highlight
                detailVis.select("g.highlight").data(selected_county).remove();
              }
              else {
                // if it is, keep the highlight
                console.log("new_ids", new_ids);
                highlightCounty(allcounties, new_ids);
              }
            } 
          }

        })

      });


      // highlight selected lines
      foreground.style("display", function(d) {
        return actives.every(function(p, i) {
          return extents[i][0] <= d[p] && d[p] <= extents[i][1]; 
        }) ? null : "none";

      });

    }, 100);
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

  // console.log("selected counties", ids);

  // highlight counties on map

  detailVis.selectAll("g.highlight").remove();
  
  detailVis.append("g")
      .attr("class", "highlight")
    .selectAll("path")
      .data(selected_county)
    .enter().append("path")
      .attr("d", path)
      .style("stroke-width", 1.25)
      .style("stroke", "darkred")
      .style("fill", "none")
      .style("stroke-opacity", .7);

}







