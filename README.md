## U.S. K-12 Education and Mobility: A Visualization

Mobility, defined in terms of the expected income rank of a child, given his/her corresponding percentile of parent income has been found to be unequal across the United States. In a 2014 paper on this topic, Chetty et al use education features, demographic information and IRS data to determine what the trends look like geographically. My visualization explores this relationship with the newest data set - and provides users with a clear picture into the correlations between mobility and educational factors.

### Important Links

Website: http://anitameh.github.io/cs171-finalproject-mehrotra-anita/

Screencast (also available on website): https://github.com/anitameh/cs171-finalproject-mehrotra-anita/blob/master/mehrotra-process-book.pdf

Process Book: 

__Something to keep in mind__: There is a lot of data being processed (over 3,000 counties are in the U.S.!), so if a particularly dense portion of the parallel coordinates visualization is brushed, there _will_ be a lag in the highlights that appear on the map.

### Relevant Scripts
 
 * FINAL-PROJECT2.HTML: html file containing CSS
 * FINAL-PROJECT2.JS: javscript file containing visualization script

### Relevant Data Files

 * COUNTYID_AGAIN.CSV: Comma-delimited file containing a list of counties for which Chetty et al have mobility computed (after merge with commuting zones data). Each item is a FIPS (Federal Information Processing Standard) ID, issued by the U.S., and corresponding uniquely with county names. For more information about this, see http://www.epa.gov/envirofw/html/codes/state.html.
 * ALL_DATA.CSV: Comma-delimited file containing county ID, and the list of features used in the first visualization (see below for a description of each).
 * COUNTIES.JSON: JSON shapefile containing U.S. county polygons.
 * COUNTY_AND_MOBILITY.TSV: Tab-delimited file containing three columns. The first has county/state, the second has county ID and the third has absolute mobility.
 * ABSOLUTE_MOBILITY.TSV: Tab-delimited file containing county ID and absolute mobility.

### Relevant Definitions

For in-depth explanations about the features used and how absolute mobility was computed, see either the Process Book I've created detailing my data transformations and design decisions, and/or Chetty et al's 2014 paper: http://anitameh.github.io/cs171-finalproject-mehrotra-anita/url. I provide some high-level definitions here.

"Absolute Mobility (at percentile p)" is computed in the following way: by combining the intercept and slope for a commuting zone, Chetty et al calculate the expected rank of children from families at any given percentile p of the national parent income distribution. This is one of two mobility metrics computed in the paper. The first is "Relative Mobility," defined as the difference in outcomes between children from top- versus bottom-income families, within a county. 

For my visualization, I use absolute mobility. The 2014 paper claims that measuring absolute mobility is valuable because increases in relative mobility have ambiguous normative implications, i.e. they may be driven by worse outcomes for the rich rather than better outcomes for the poor. This makes interpretation of the resulting visualization more intuitive.

A "Commuting Zone" is an aggregation of U.S. counties and is used in the paper because it covers rural regions of the U.S. Since the pertinent shapefiles provide a county-level granular view (and I couldn't find any shapefiles for commuting zones), I had to perform several data transformations to map the data so that it was at a county-level.

A description of each feature is provided for context in the visualization, but I include them here as well:

1. "School Expenditure per Student:" Average expenditures per student in public schools per county
2. "Student-Teacher Ratio:" Average student-teacher ratio in public schools per county
3. "Test Score Percentile (income-adjusted):" Residual from a regression of mean math and English standardized test scores on household income per capita in 2000
4. "High School Drop-out Rate (income-adjusted):" Residual from a regression of high school dropout rates on household income per capita in 2000. Coded as missing for commuting zones (and therefore for counties) in which dropout rates are missing for more than 25% of school districts
5. "Teenage Pregnancy Rate:" Fraction of female children in core sample claiming dependent born between kids ages 13-19 per county
6. "Mean Parent Income:" Mean parent family income within county

### Visualization Features

* Linking between two visualizations
* Zoom-in capability (click on a county once to zoom in, and then re-click that county to zoom out)
* Tool-tip hover
* Brushing
* Color mapping and scales

