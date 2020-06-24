let countryChoice;
let currentPop;

//listen to drop-down menu change
$('#country-choice').change(function(){
    countryChoice = $(this).val()
    // this will go inside the countryData ajax: if (countryChoice === 'United States') {countryChoice='US'}
    console.log(countryChoice)
    //call ajax for case data
    countryData();
    //call ajax for population data
    countryPop();
    //TODO: call result display function
})

//populates countries to drop-down from countries.js
populateCountries("country-choice");

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

//render results on page
let renderResults = () => {
    
}
