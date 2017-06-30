#!/usr/bin/env node
var http = require('http')
var key = require('./key/key.js')
var date = new Date()
date = date.getUTCFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()

var type = process.argv[2]
var word = process.argv[3]

if (type==null) {
  type="wotd"
}

// Command definitions

var commands = {}

commands["syn"] = function() {
  url = '/v4/word.json/'+word+'/relatedWords?relationshipTypes=synonym&api_key='+key
  getData(url,print)
}

commands["ant"] = function() {
  url = '/v4/word.json/'+word+'/relatedWords?relationshipTypes=antonym&api_key='+key
  getData(url,print)
}

commands["def"] = function() {
  url = '/v4/word.json/'+word+'/definitions?limit=5&api_key='+key
  getData(url,print)
}

commands["ex"] = function() {
  url = '/v4/word.json/'+word+'/examples?limit=5&api_key='+key
  getData(url,print)
}

commands["wotd"] = function() {
  url = '/v4/words.json/wordOfTheDay?date='+date+'&api_key='+key
  getData(url,callback)

  function callback(info) {
    word = JSON.parse(info)["word"]
    commands["dict"]()
  }
}

commands["dict"] = function() {
  // TODO print the output in sequence
  commands["def"]()
  commands["syn"]()
  commands["ant"]()
  commands["ex"]()
}

// http GET request

function getData(url, print) {

  var options = {
    host : 'api.wordnik.com',
    port : 80,
    path : url,
    method : 'GET'
  };

  http.request(options, function(res) {
    res.on('data', function (info) {
      print(info)
    });
  }).end();

}

// printing function

function print(info) {
  info = JSON.parse(info)
  console.log(info)
}

// execute command

commands[type]()
