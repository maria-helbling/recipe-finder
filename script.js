//populates countries to drop-down from countries.js
populateCountries("country-choice");

var countryName = $("#country-choice");

// grabbing country covid data
function countryData (){
    var resultBox = $("#result-box");
    
    var queryURL = "https://covid-api.com/api/reports?date=" + "2020-06-23" + "&region_name=" + "estonia";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        var activeCases = 0;
        // var confirmedCases = 0;
        confirmedDiff = 0;
        var regionCount= response.data.length
        // for loop to grap the data for each region/province
        for (let i = 0; i < regionCount; i++) {
            activeCases += (response.data[i].active);
            
            confirmedDiff += response.data[i].confirmed_diff;
        }
        console.log(activeCases);
        console.log(confirmedDiff)
    })
}
// grabbing country population for calculations
function countryPop (){
    var popURL = "https://data.opendatasoft.com/api/records/1.0/search/?dataset=world-population%40kapsarc&q=" + "Estonia" + "&facet=year&facet=country_name&refine.year=2018"

    $.ajax({
        url: popURL,
        method: "GET"
    }).then(function(response){
        var currentPop = response.records[0].fields.value;
        console.log(currentPop);
    })
}

countryData();
countryPop();