//populates countries to drop-down from countries.js
populateCountries("country-choice");

var countryName = $("#country-choice");
var dateArray = [];

for (let i = 14; i > 0; i--) {
    var date = moment().subtract(i, 'days').format("YYYY-MM-DD");
    dateArray.push(date);
        
}

// grabbing country covid data
for (let i = 0; i < dateArray.length; i++) {
    
            function countryData (){
                var resultBox = $("#result-box");
                
                var queryURL = "https://covid-api.com/api/reports?date=" + dateArray[i] + "&region_name=" + "estonia";
                console.log(queryURL)

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

// function to calculate trend from array of numbers
let calcTrend = (numArr) => {
    let sumX = 0;
    let sumX2 = 0;
    let sumXY = 0;
    let sumY = 0;
    let n = numArr.length;
    numArr.forEach((value, index) => {
    sumX += index;
    sumX2 += index**2;
    sumXY += index*value;
    sumY += value;     
    })
    let b=(sumXY - sumX*sumY/n)/(sumX2 - sumX*sumX/n);
    return b;
}

countryData();
countryPop();