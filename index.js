#!/usr/bin/env node
var http = require('http')
var key = require('./key/key.js')

var type = process.argv[2]
var word = process.argv[3]

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
