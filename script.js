let countryChoice;
let activeCases = [];
let confirmedDiff = [];
let currentPop;

//populates countries to drop-down from countries.js
populateCountries("country-choice");

var countryName = $("#country-choice");
var dateArray = [];

for (let i = 14; i > 0; i--) {
    var date = moment().subtract(i, 'days').format("YYYY-MM-DD");
    dateArray.push(date);
}

// grabbing country covid data
function countryData() {

    dateArray.forEach((value, index) => {
        if (countryChoice === 'United States') { countryChoice = 'US' }
        var queryURL = "https://covid-api.com/api/reports?date=" + value + "&region_name=" + countryChoice;
        console.log(queryURL)

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            var activeSum = 0;
            var newSum = 0
            // var confirmedCases = 0
            var regionCount = response.data.length
            // for loop to grap the data for each region/province
            for (let i = 0; i < regionCount; i++) {
                activeSum += (response.data[i].active);
                

                newSum += response.data[i].confirmed_diff;
            }
            // console.log(activeSum);
            
            activeCases.push(activeSum);
            confirmedDiff.push(newSum);

            if (index === dateArray.length -1){
            console.log(activeCases);
            console.log(confirmedDiff);

            calcTrend(activeCases);
            calcTrend(confirmedDiff);
            renderResults();
            
            }
        
        })
    })
} 


// grabbing country population for calculations
function countryPop() {
    var popURL = "https://data.opendatasoft.com/api/records/1.0/search/?dataset=world-population%40kapsarc&q=" + countryChoice + "&facet=year&facet=country_name&refine.year=2018"

    $.ajax({
        url: popURL,
        method: "GET"
    }).then(function (response) {
        currentPop = response.records[0].fields.value;
        countryData();
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
        sumX2 += index ** 2;
        sumXY += index * value;
        sumY += value;
    })
    let b = (sumXY - sumX * sumY / n) / (sumX2 - sumX * sumX / n);
    return b;
}

//render results on page
let renderResults = () => {

    let dispActive = (activeCases[13] / currentPop) * 100000
    dispActive = dispActive.toFixed(1)
    let dispNew = (confirmedDiff[13] / currentPop) * 100000
    dispNew = dispNew.toFixed(2)
    $('#result-box').append($('<div id="active-cases">').text(dispActive))
    $('#result-box').append($('<div id="new-cases">').text(dispNew))
}

//listen to drop-down menu change
$('#country-choice').change(function () {
    countryChoice = $(this).val()
    // this will go inside the countryData ajax: 
    console.log(countryChoice)
    //call ajax for population data ==> countryData ==> renderResults
    countryPop();
})
