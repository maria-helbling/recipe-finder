let countryChoice;
let activeCases;
let confirmedDiff;
let currentPop;

//populates countries to drop-down from countries.js
populateCountries("country-choice");

// grabbing country covid data
function countryData() {
    if (countryChoice === 'United States') {countryChoice='US'}
    var queryURL = "https://covid-api.com/api/reports?date=" + "2020-06-23" + "&region_name=" + countryChoice;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        activeCases = 0;
        // var confirmedCases = 0;
        confirmedDiff = 0;
        var regionCount = response.data.length
        // for loop to grap the data for each region/province
        for (let i = 0; i < regionCount; i++) {
            activeCases += (response.data[i].active);

            confirmedDiff += response.data[i].confirmed_diff;
        }

        renderResults();
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
    
    let dispActive = (activeCases/currentPop)*100000
    dispActive = dispActive.toFixed(1)
    let dispNew = (confirmedDiff/currentPop)*100000
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
