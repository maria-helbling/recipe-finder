let countryChoice;
let activeCases = [];
let confirmedDiff = [];
let currentPop;
var dateArray = [];

// variables for states:
let stateChoice= "Washington"


// variables for compare button 
var compareBtn = $("#compare-button")
// disable comparison button until initial results are rendered
compareBtn.attr("disabled", true);
var compare = false;
console.log(compare);

//populates countries to drop-down from countries.js
populateCountries("country-choice");

// //populates states to drop-down from states.js?
populateStates("state-choice");

//populates the data array with the last 14 days
for (let i = 15; i > 1; i--) {
    var date = moment().subtract(i, 'days').format("YYYY-MM-DD");
    dateArray.push(date);
}

// grabbing country covid data
function countryData() {
    //adjust for different spelling in this API
    if (countryChoice === 'United States') { countryChoice = 'US' }
    //reset array variables
    activeCases = [];
    confirmedDiff = [];
    //loop through the last 14 days of data
    dateArray.forEach((value, index) => {

        var queryURL = "https://covid-api.com/api/reports?date=" + value + "&region_name=" + countryChoice;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            var activeSum = 0;
            var newSum = 0;
            var regionCount = response.data.length
             if (countryChoice === 'US') {regionCount--}
            // for loop to grab the data for each region/province
            for (let i = 0; i < regionCount; i++) {
                activeSum += (response.data[i].active);
                newSum += response.data[i].confirmed_diff;
            }
            //results array
            activeCases.push(activeSum);
            confirmedDiff.push(newSum);

            //on the last date iteration do calculations and render results
            if (index === dateArray.length - 1) {
                //put results on page
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
        console.log(currentPop)
        countryData();
    })

}


function stateData() {
     //reset array variables
     activeCases = [];
     confirmedDiff = [];
    //loop through the last 14 days of data
    dateArray.forEach((value, index) => {

        var queryStateURL = "https://covid-api.com/api/reports?date=" + value + "&q=US%20" + stateChoice + "&region_name=US";

        $.ajax({
            url: queryStateURL,
            method: "GET"
        }).then(function (response) {
            
            //results array
            activeCases.push(response.data[0].active);
            confirmedDiff.push(response.data[0].confirmed_diff);

            //on the last date iteration do calculations and render results
            if (index === dateArray.length - 1) {
                //put results on page
                renderResults();
            }
        })
    })
}

function statePop() {
    var popURL = "https://api.census.gov/data/2019/pep/population?get=POP,NAME,STATE&for=state"

    $.ajax({
        url: popURL,
        method: "GET"
    }).then(function (response) {

        for (let value of response){
            console.log(value);
            if (value[1] === stateChoice){
            currentPop = parseInt(value[0]);
            break
            }
        };
        stateData();
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
        sumX += (index + 1);
        sumX2 += (index + 1) ** 2;
        sumXY += (index + 1) * value;
        sumY += value;
    })
    let b = (sumXY - sumX * sumY / n) / (sumX2 - sumX * sumX / n);
    let mean = sumY / n
    //return trend as % of average value for more comprehensible result
    return b / mean * 100;
}

//render results on page
let renderResults = () => {
    // if statement to determine where to print results
    if (compare === true){
        $('#compare-box').empty()
        //final calc for output variables
        //here we take latest day data on cases per 100 000 people
        let dispActive = (activeCases[activeCases.length-1] / currentPop) * 100000
        dispActive = dispActive.toFixed(1)
        let dispNew = (confirmedDiff[confirmedDiff.length -1] / currentPop) * 100000
        dispNew = dispNew.toFixed(2)
        //here we calculate the trend in each variable over 14 days
        let dispActiveTrend = calcTrend(activeCases)
        dispActiveTrend = dispActiveTrend.toFixed(1)
        let dispNewTrend = calcTrend(confirmedDiff)
        dispNewTrend = dispNewTrend.toFixed(1)
        //here we include a variable for + sign in case the trend is positive. - sign for negative would appear mathematically anyway
        let signActiveTrend = (dispActiveTrend > 0) ? '+' : '';
        let signNewTrend = (dispNewTrend > 0) ? '+' : '';
        //append to page
        $('#compare-box').append($('<div id="active-cases">').text(`Active cases per 100k people ${dispActive}`));
        $('#compare-box').append($('<div id="active-cases-trend">').text(`Active case trend is ${signActiveTrend}${dispActiveTrend}% per day`));
    
        $('#compare-box').append($('<div id="new-cases">').text(`New cases per day per 100k people ${dispNew}`));
        $('#compare-box').append($('<div id="new-cases-trend">').text(`New case trend is ${signNewTrend}${dispNewTrend}% per day`));

    } else {
    $('#result-box').empty()
    //final calc for output variables
    //here we take latest day data on cases per 100 000 people
    let dispActive = (activeCases[activeCases.length-1] / currentPop) * 100000
    dispActive = dispActive.toFixed(1)
    let dispNew = (confirmedDiff[confirmedDiff.length -1] / currentPop) * 100000
    dispNew = dispNew.toFixed(2)
    //here we calculate the trend in each variable over 14 days
    let dispActiveTrend = calcTrend(activeCases)
    dispActiveTrend = dispActiveTrend.toFixed(1)
    let dispNewTrend = calcTrend(confirmedDiff)
    dispNewTrend = dispNewTrend.toFixed(1)
    //here we include a variable for + sign in case the trend is positive. - sign for negative would appear mathematically anyway
    let signActiveTrend = (dispActiveTrend > 0) ? '+' : '';
    let signNewTrend = (dispNewTrend > 0) ? '+' : '';
    //append to page
    $('#result-box').append($('<div id="active-cases">').text(`Active cases per 100k people ${dispActive}`));
    $('#result-box').append($('<div id="active-cases-trend">').text(`Active case trend is ${signActiveTrend}${dispActiveTrend}% per day`));

    $('#result-box').append($('<div id="new-cases">').text(`New cases per day per 100k people ${dispNew}`));
    $('#result-box').append($('<div id="new-cases-trend">').text(`New case trend is ${signNewTrend}${dispNewTrend}% per day`));
    }
}

//listen to drop-down menu change
$('#country-choice').change(function () {
    countryChoice = $(this).val()
    // enable comparison button
    compareBtn.attr("disabled", false);
    // this will go inside the countryData ajax: 
    console.log(countryChoice)
    //call ajax for population data ==> countryData ==> renderResults
    countryPop();
})

// listen for compareBtn
compareBtn.click(function() {
    // changing compare to true/false depending on current state
    compare = (compare) ? false:true;
    console.log(compare);
})