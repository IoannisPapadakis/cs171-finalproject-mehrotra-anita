## U.S. K-12 Education and Mobility

Mobility, defined in terms of the expected income rank of a child, given his/her corresponding percentile of parent income has been found to be unequal across the United States. In a 2014 paper on this topic, Chetty et al use education features, demographic information and IRS data to determine what the trends look like geographically. My visualization explores this relationship with the newest data set - and provides users with a clear picture into the correlations between mobility and educational factors.

### Website
http://anitameh.github.io/cs171-finalproject-mehrotra-anita/

### Relevant Scripts
 
 * FINAL-PROJECT2.HTML: html file containing CSS
 * FINAL-PROJECT2.JS: javscript file containing visualization script

### Relevant Data Files

 * COUNTYID_AGAIN.CSV: Comma-delimited file containing a list of counties for which Chetty et al have mobility computed (after merge with commuting zones data). Each item is a FIPS (Federal Information Processing Standard) ID, issued by the U.S., and corresponding uniquely with county names. For more information about this, see http://www.epa.gov/envirofw/html/codes/state.html.
 * ALL_DATA.CSV: Comma-delimited file containing county ID, and the list of features used in the first visualization (see below for a description of each).
 * COUNTIES.JSON: JSON shapefile containing U.S. county polygons.
 * COUNTY_AND_MOBILITY.TSV: Tab-delimited file containing three columns. The first has county/state, the second has county ID and the third has absolute mobility.
 * ABSOLUTE_MOBILITY.TSV: Tab-delimited file containing county ID and absolute mobility.

### Features and Mobility

For in-depth explanations about the features used and how absolute mobility was computed, see either the Process Book I've created detailing my data transformations and design decisions, and/or Chetty et al's 2014 paper: http://anitameh.github.io/cs171-finalproject-mehrotra-anita/url.

A description of each feature is provided for context in the visualization, but I include them here as well:

1. "School Expenditure per Student:" Average expenditures per student in public schools per county
2. "Student-Teacher Ratio:" Average student-teacher ratio in public schools per county
3. "Test Score Percentile (income-adjusted):" Residual from a regression of mean math and English standardized test scores on household income per capita in 2000
4. "High School Drop-out Rate (income-adjusted):" Residual from a regression of high school dropout rates on household income per capita in 2000. Coded as missing for commuting zones in which dropout rates are missing for more than 25% of school districts
5. "Teenage Pregnancy Rate:" Fraction of female children in core sample claiming dependent born between kids ages 13-19
6. "Mean Parent Income:" Mean parent family income within county
