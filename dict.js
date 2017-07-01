#!/usr/bin/env node
var http = require('http')
var readline = require('readline')
var key = require('./key/key.js')
var date = new Date()
date = date.getUTCFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()

var type = process.argv[2]
var word = process.argv[3]

if (type==null) {
  type="wotd" //word of the day
}

// Command definitions

var commands = {}

commands["syn"] = function(callback) {
  url = '/v4/word.json/'+word+'/relatedWords?relationshipTypes=synonym&api_key='+key
  txt="Synonyms for \""+word+"\" are :\n\n"
  getData(url,prettyFormat,txt,callback,"syn")
}

commands["ant"] = function(callback) {
  url = '/v4/word.json/'+word+'/relatedWords?relationshipTypes=antonym&api_key='+key
  txt="Antonyms for \""+word+"\" are :\n\n"
  getData(url,prettyFormat,txt,callback,"ant")
}

commands["def"] = function(callback) {
  url = '/v4/word.json/'+word+'/definitions?limit=5&api_key='+key
  txt="Definitions for \""+word+"\" are :\n\n"
  getData(url,prettyFormat,txt,callback,"def")
}

commands["ex"] = function(callback) {
  url = '/v4/word.json/'+word+'/examples?limit=5&api_key='+key
  txt="Examples for \""+word+"\" are :\n\n"
  getData(url,prettyFormat,txt,callback,"ex")
}

commands["wotd"] = function() {
  url = '/v4/words.json/wordOfTheDay?date='+date+'&api_key='+key
  txt="Word of the day is : "
  getData(url,localPrint,txt)

  function localPrint(info,txt) {
    word = JSON.parse(info)["word"]
    console.log(txt +" "+ word +"\n\n")
    commands["dict"]()
  }
}

commands["dict"] = function() {
  function ant() {
    commands["ant"](commands["ex"])
  }
  function syn() {
    commands["syn"](ant)
  }
  commands["def"](syn)
}

commands["play"] = function() {
  url = '/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=2&maxLength=8&api_key='+key
  getData(url, playFunction)
}

// play functions

  // save data

function playFunction(info) {
  word = JSON.parse(info)["word"]
  hints=["def","syn","ant"]
  hintsLong=["definition","synonym","antonym"]
  dir = {
    "def":[],
    "syn":[],
    "ant":[]
  }
  function ant() {
    commands["ant"](gameOn)
  }
  function syn() {
    commands["syn"](ant)
  }
  commands["def"](syn)
}

 // main game

 var rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout
 })
 var newHint = true
 var clue
 function gameOn() {

  clue = newHint?hinter():""
  newHint = false

   rl.question("\n"+clue +"\nGuess the word: ", function(answer) {
     if (answer==word || dir["syn"].includes(answer)) {
       console.log("You guessed right!")
       rl.close()
     }
     else {
       console.log("\nYou guessed wrong :/\n1: Guess again\n2: New hint\n3: Show word and quit")
       wrongGuess()
     }
   })
 }

  // options displayed on wrong guess

function wrongGuess() {

  rl.question("Enter your option\n", function(answer) {
    if (answer=="1") {
      console.log("Guess again")
      gameOn()
    }
    else if (answer=="2") {
      console.log("New hint")
      newHint = true
      gameOn()
    }
    else if (answer=="3") {
      console.log("Show word and quit")
      console.log(word)
      rl.close()
    }
    else {
      console.log("Invalid option")
      wrongGuess()
    }
  })
}

  // hint generator

  function hinter() {
    if(clue==null) {
      var coinFlip = 1
    }
    else {
      var coinFlip = Math.floor(Math.random()*2)
    }
    if (coinFlip) {
      do {
        var index1 = Math.floor(Math.random()*3)
        var row = dir[hints[index1]]
      } while ( row.length < 1)
      var index2 = Math.floor(Math.random()*row.length)
      return  hintsLong[index1]+" : "+row[index2]
    }
    else {
      return "Jumbled word : "+jumble(word)
    }
  }

  // word jumble

function jumble(word) {
  word=word.split("")
  for(var i=word.length-1;i>=0;i--) {
    var rand = Math.floor(Math.random()*i)
    var temp =word[i]
    word[i]=word[rand]
    word[rand]=temp
  }
  word = word.join("")
  return word
}

// http GET request

function getData(url, next, txt, callback, id) {

  var options = {
    host : 'api.wordnik.com',
    port : 80,
    path : url,
    method : 'GET'
  }

  http.request(options, function(res) {
    var responseString = ''
    res.on('data', function(data) {
      responseString += data
    })
    res.on('end', function() {
      next(responseString, txt, callback, id)
    })
  }).end()

}

// data formatting

function prettyFormat(responseString, txt, callback, id) {
  info=JSON.parse(responseString)
  if (id=="ex") {
    info = info["examples"]
    var index = 0
    info.map(function(x) {info[index++]=x["text"]})
  }
  else if(id=="def"){
    var index = 0
    info.map(function(x) {info[index++]=x["text"]})
  }
  else {
    if(info.length>0) {
      info = info[0]["words"]
    }
    else {
      info = []
    }
  }

  if(type=="play") {
    saveTo(info, txt, callback, id)
  }
  else {
    print(info, txt, callback, id)
  }
}

// printing function

function print(info, txt, callback) {
  var index = 1
  info.map(function(x) { txt += index++ +") "+x+"\n"})
  console.log(txt)
  if(typeof callback == "function") {
    callback()
  }
  rl.close()
}

// save function

function saveTo(info, txt, callback, id){
  dir[id]=info
  if(typeof callback == "function") {
    callback()
  }
}

// execute command

if(typeof commands[type] == "function") {
  commands[type]()
}
else {
  console.log("Not a valid option")
  rl.close()
}
