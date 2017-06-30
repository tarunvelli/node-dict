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
  url = 'http://api.wordnik.com:80/v4/word.json/'+word+'/relatedWords?relationshipTypes=synonym&api_key='+key
  getData(url)
}

commands["ant"] = function() {
  url = 'http://api.wordnik.com:80/v4/word.json/'+word+'/relatedWords?relationshipTypes=antonym&api_key='+key
  getData(url)
}

commands["def"] = function() {
  url = 'http://api.wordnik.com:80/v4/word.json/'+word+'/definitions?limit=5&api_key='+key
  getData(url)
}

commands["ex"] = function() {
  url = 'http://api.wordnik.com:80/v4/word.json/'+word+'/examples?limit=5&api_key='+key
  getData(url)
}

commands["wotd"] = function() {
  url = 'http://api.wordnik.com:80/v4/words.json/wordOfTheDay?date='+date+'&api_key='+key
  getData(url)
}

commands["dict"] = function() {
  // TODO print the output in sequence
  commands["def"]()
  commands["syn"]()
  commands["ant"]()
  commands["ex"]()
}

// http GET request

function getData() {
  http.request( url, function(res) {
    res.on('data', function (info) {
      console.log(JSON.parse(info))
    });
  }).end();
}

// execute command

commands[type]()
