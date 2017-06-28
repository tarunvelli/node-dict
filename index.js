var http = require('http')
var key = require('./key/key.js')

var type = process.argv[2]
var word = process.argv[3]

switch(type) {
  case "syn" :
  url = 'http://api.wordnik.com:80/v4/word.json/'+word+'/relatedWords?relationshipTypes=synonym&api_key='+key
  break
  case "ant":
  url = 'http://api.wordnik.com:80/v4/word.json/'+word+'/relatedWords?relationshipTypes=antonym&api_key='+key
  break
  case "def":
  url = 'http://api.wordnik.com:80/v4/word.json/'+word+'/definitions?limit=5&api_key='+key
  break
  case "ex":
  url = 'http://api.wordnik.com:80/v4/word.json/'+word+'/examples?limit=5&api_key='+key
}


http.request( url, function(res) {
  res.on('data', function (info) {
    console.log(JSON.parse(info))
  });
}).end();
