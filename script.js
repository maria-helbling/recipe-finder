// var userCountry = $("country-choice");
var queryURL = "https://api.covid19api.com/live/country/italy/status/confirmed/date/2020-03-21T13:13:30Z";

console.log(queryURL)

$.ajax ({
    url: queryURL,
    method: "GET"
}) .then(function(response){
    console.log(response);
    var currentCases = response[response.length - 1].Active;
    console.log(currentCases);
});