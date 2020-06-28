let countryChoice;
let activeCases = [];
let confirmedDiff = [];
let currentPop;
var dateArray = [];
let stateChoice="";
let stateBarVisible=false;
let mean;
let counter = 0
var compare = false;
var compareBtn = $("#compare-button")
// disable comparison button until initial results are rendered
compareBtn.attr("disabled", true);

//populates countries to drop-down from countries.js
populateCountries('country-choice');

// //populates states to drop-down from states.js?
populateStates("state-choice");

//populates the date array with the last 14 days
for (let i = 15; i > 1; i--) {
    var date = moment().subtract(i, 'days').format("YYYY-MM-DD");
    dateArray.push(date);
}

// grabbing country covid data
function countryData() {
    
    //reset array variables
    if (counter === 0){
    activeCases = [];
    confirmedDiff = [];
    //adjust for different spelling in this API
    if (countryChoice === 'United States') { countryChoice = 'US' }
    }
        var queryURL = "https://covid-api.com/api/reports?date=" + dateArray[counter] + "&region_name=" + countryChoice;

        $.ajax({
            url: queryURL,
            async: true,
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
            //if need more dates, call back itself
            if (counter < 13) {
                counter++
                countryData();
            } else {
                //on the last date iteration do calculations and render results
                renderResults();
            }
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

//grabbing state based COVID data
function stateData() {
    if(counter===0){
    //reset array variables
    activeCases = [];
    confirmedDiff = [];
    }
        
        var queryStateURL = "https://covid-api.com/api/reports?date=" + dateArray[counter] + "&q=US%20" + stateChoice + "&region_name=US";
        
        $.ajax({
            url: queryStateURL,
            method: "GET"
        }).then(function (response) {
            
            //results array
            activeCases.push(response.data[0].active);
            confirmedDiff.push(response.data[0].confirmed_diff);
            
            //on the last date iteration do calculations and render results
            if (counter < 13) {
                counter++
                stateData();
            } else {
                //put results on page
                renderResults();
            }
        })

}

// grabbing country population for calculations
function statePop() {
    var popURL = "https://api.census.gov/data/2019/pep/population?get=POP,NAME,STATE&for=state"

    $.ajax({
        url: popURL,
        method: "GET"
    }).then(function (response) {

        for (let value of response){
            if (value[1] === stateChoice){
            currentPop = parseInt(value[0]);
            break;
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
    mean = sumY / n
    //return trend as % of average value for more comprehensible result
    if (b) {
        return b / mean * 100;
    } else { return 0}
    
}

//adds all numbers in array and returns sum
let sum = (arr) => {
    let tot = 0
    arr.forEach(value => tot+=value)
    return tot;
}

//render results on page
let renderResults = () => {
    //close modal
    $(".modal").removeClass("is-active");
    //grab results space from page
    let activeBox=$('#active-box');
    let activeTrendBox=$('#active-trend-box');
    let activeChartBox = $('#active-chart-box')
    let newBox=$('#new-box');
    let newTrendBox=$('#new-trend-box');
    let newChartBox = $('#new-chart-box')
    let existing = `Results for`
    let resultBox = $('#result-title')
    //pick, which box you use for results
    if (compare === true){ 
        activeBox=$('#compare-active-box');
        activeTrendBox=$('#compare-active-trend-box');
        activeChartBox = $('#compare-active-chart-box')
        newBox=$('#compare-new-box');
        newTrendBox=$('#compare-new-trend-box');
        newChartBox = $('#compare-new-chart-box')
        existing = `Comparison results for`
        resultBox = $('#compare-title')
    }
    //reset variables
    counter=0
    activeBox.empty();
    activeTrendBox.empty();
    activeChartBox.empty();
    newBox.empty();
    newTrendBox.empty();
    newChartBox.empty();
    // set box title
    resultBox.text(`${existing} ${countryChoice}`)
    if (stateChoice) {resultBox.text(`${existing} ${stateChoice}, US`)}
    //check if there is data
    if(sum(activeCases) || sum(confirmedDiff)) {
        //final calc for output variables
        //here we take latest day data on cases per 100 000 people
        let dispActive = (activeCases[activeCases.length-1] / currentPop) * 100000
        dispActive = dispActive.toFixed(1)
        let dispNew = (confirmedDiff[confirmedDiff.length -1] / currentPop) * 100000
        dispNew = dispNew.toFixed(2)
        //here we calculate the trend in new cases over 14 days
        let dispNewTrend = calcTrend(confirmedDiff)
        dispNewTrend = dispNewTrend.toFixed(1)
        //choose color for new cases
        let colorNew = 'gold'
        if (dispNewTrend<-1) { colorNew = 'darkgreen'} else if (dispNewTrend>1) {colorNew = 'darkred'}
        //here we calculate the trend in active cases over 14 days
        let dispActiveTrend = calcTrend(activeCases)
        dispActiveTrend = dispActiveTrend.toFixed(1)
        //choose color for active cases
        let colorActive = 'gold'
        if (dispActiveTrend<-1) { colorActive = 'darkgreen'} else if (dispActiveTrend>1) {colorActive = 'darkred'}
        //here we include a variable for + sign in case the trend is positive. - sign for negative would appear mathematically anyway
        let signActiveTrend = (dispActiveTrend > 0) ? '+' : '';
        let signNewTrend = (dispNewTrend > 0) ? '+' : '';
        //append to page
        activeBox.append($('<p>').text(`Active cases`));
        activeBox.append($('<p class="is-size-4">').text(dispActive));
        activeTrendBox.append($('<p>').text(`14 day trend`));
        activeTrendBox.append($('<p class="is-size-4">').text(`${signActiveTrend}${dispActiveTrend}%`));
        activeTrendBox.css(`background-color`, colorActive)
        activeTrendBox.css(`color`, `skyblue`)
        drawChart(colorActive,activeCases, activeChartBox);
        newBox.append($('<p>').text(`New cases`));
        newBox.append($('<p class="is-size-4">').text(dispNew));
        newTrendBox.append($('<p>').text(`14 day trend`));
        newTrendBox.append($('<p class="is-size-4">').text(`${signNewTrend}${dispNewTrend}%`));
        newTrendBox.css(`background-color`, colorNew)
        newTrendBox.css(`color`, 'skyblue')
        drawChart(colorNew,confirmedDiff, newChartBox);
    } else {
        activeBox.append($('<p>').text(`No data`));
        activeBox.append($('<p>').text(`reported`));
        activeTrendBox.css(`background-color`, 'white')
        activeChartBox.append($('<p>').text(`Nothing to show`))
        newBox.append($('<p>').text(`No data`));
        newBox.append($('<p>').text(`reported`));
        newTrendBox.css(`background-color`, 'white')
        newChartBox.append($('<p>').text(`Nothing to show`))
    }
}

//draw little trend chart
let drawChart = (chartColor, dataArr, appendTarget) =>{
    //set unique chart id
    let identifier = `val${dataArr[0]}`
    //put canvas on page
    // let chartArea = $(`<div class="chart-container" id="datachart">`)
    let chartArea =$(`<canvas id="${identifier}">`)
    appendTarget.append(chartArea)
    let ctx=$(`#${identifier}`);
    //draw chart
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [' ', ' ', ' ', ' ', ' ', ' ',' ',' ',' ',' ',' ',' ',' ',' '],
            datasets: [{
                label:'',
                data: dataArr,
                backgroundColor: chartColor,
                borderColor: chartColor,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:false,
                        display: false
                    },
                    gridLines: {
                        display:false
                    }
                }],
                xAxes:[{
                    gridLines: {
                        display:false
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                enabled: false
            },
            maintainAspectRatio: false
            }
    })
}

//listen to drop-down menu change
$('#country-choice').change(function () {
    $(".modal").addClass("is-active");
    countryChoice = $(this).val();
    //reset state drop-down if needed
    if (stateBarVisible) {
        $('#state-choice')[0].selectedIndex = 0;
        $('#state-choice-box').addClass('is-hidden')
        stateChoice = '';
        stateBarVisible = false;
    }
    // enable comparison button
    compareBtn.attr("disabled", false);
    //call ajax for population data ==> countryData ==> renderResults
    countryPop();
    //if US is chosen, show state choice
    if (countryChoice === 'United States'){
    $('#state-choice-box').removeClass('is-hidden')
    stateBarVisible = true
    }
})

//listen to state drop-down menu change
$('#state-choice').change(function (){
    $(".modal").addClass("is-active");
    stateChoice = $(this).val()
    //call ajax for state population data ==> state COVID data ==> renderResults
    statePop();
})

// listen for compareBtn
compareBtn.click(function() {
    // changing compare to true/false depending on current state
    compare = (compare) ? false:true;
    if (compare === true){
        $("#result-box").removeClass("box-shadow")
        $("#compare-box").addClass("box-shadow")
    } else {
        $("#compare-box").removeClass("box-shadow")
        $("#result-box").addClass("box-shadow")
    }
})
