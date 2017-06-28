var http = require('http')

key = "api key value"
url = "http://api.wordnik.com:80/v4/words.json/wordOfTheDay?date=2017-06-29&api_key="+key

http.request( url, function(res) {
  res.on('data', function (info) {
    console.log(JSON.parse(info))
  });
}).end();
