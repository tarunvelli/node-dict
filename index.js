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
  txt="Synonyms for \""+word+"\" are :\n\n"
  getData(url,prettyPrint,txt)
}

commands["ant"] = function() {
  url = '/v4/word.json/'+word+'/relatedWords?relationshipTypes=antonym&api_key='+key
  txt="Antonyms for \""+word+"\" are :\n\n"
  getData(url,prettyPrint,txt)
}

commands["def"] = function() {
  url = '/v4/word.json/'+word+'/definitions?limit=5&api_key='+key
  txt="Definitions for \""+word+"\" are :\n\n"
  getData(url,localPrint, txt)

  function localPrint(info, txt) {
    info = JSON.parse(info)
    var index = 1
    info.map( function(x) {txt += index++ +") "+x["text"]+"\n\n"} )
    console.log(txt)
  }
}

commands["ex"] = function() {
  url = '/v4/word.json/'+word+'/examples?limit=5&api_key='+key
  txt="Examples for \""+word+"\" are :\n\n"
  getData(url,localPrint, txt)

  function localPrint(info, txt) {
    info = JSON.parse(info)["examples"]
    var index = 1
    info.map( function(x) {txt += index++ +") "+x["text"]+"\n\n"} )
    console.log(txt)
  }
}

commands["wotd"] = function() {
  url = '/v4/words.json/wordOfTheDay?date='+date+'&api_key='+key
  txt="Word of the day is : "
  getData(url, callback, txt)

  function callback(info, txt) {
    word = JSON.parse(info)["word"]
    console.log(txt +" "+ word +"\n\n")
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

function getData(url, print, txt) {

  var options = {
    host : 'api.wordnik.com',
    port : 80,
    path : url,
    method : 'GET'
  };

  http.request(options, function(res) {
    res.on('data', function (info) {
      print(info, txt)
    });
  }).end();

}

// printing function

function prettyPrint(info, txt) {
  info=JSON.parse(info)
  var index = 1
  if (info.length>=1) {
    info = info[0]["words"]
    info.map(function(x) { txt += index++ +") "+x+"\n"})
  }
  console.log(txt)
}

// execute command

commands[type]()
