var userCountry = $("country-choice");
var queryURL = "https://api.covid19api.com/country/" + "china" + "/status/confirmed/live?from=" + "2020-06-01T00:00:00Z" + "&to=" + "2020-06-22T00:00:00Z";

$.ajax ({
    url: queryURL,
    method: "GET"
}) .then(function(response){
    console.log(response);
})