#!/usr/bin/env node
var axios = require('axios')
var readline = require('readline')
var key = require('./key/key.js')
var date = new Date()
date = `${date.getUTCFullYear()}-${(date.getMonth() + 1)}-${(date.getDate())}`

var type = process.argv[2]
var word = process.argv[3]

if (type == null) {
  type = 'wotd' // word of the day
}

// Command definitions

var commands = {}

commands['syn'] = async () => {
  var url = `/v4/word.json/${word}/relatedWords?relationshipTypes=synonym&api_key=${key}`
  var txt = `Synonyms for '${word}' are :\n`
  await getData(url)
  .then(response => processData(response.data, txt, 'syn'))
  .catch(err => console.log(err))
  return Promise.resolve()
}

commands['ant'] = async () => {
  var url = `/v4/word.json/${word}/relatedWords?relationshipTypes=antonym&api_key=${key}`
  var txt = `Antonyms for '${word}' are :\n`
  await getData(url)
  .then(response => processData(response.data, txt, 'ant'))
  .catch(err => console.log(err))
  return Promise.resolve()
}

commands['def'] = async () => {
  var url = `/v4/word.json/${word}/definitions?limit=5&api_key=${key}`
  var txt = `Definitions for '${word}' are :\n`
  await getData(url)
  .then(response => processData(response.data, txt, 'def'))
  .catch(err => console.log(err))
  return Promise.resolve()
}

commands['ex'] = async () => {
  var url = `/v4/word.json/${word}/examples?limit=5&api_key=${key}`
  var txt = `Examples for '${word}' are :\n`
  await getData(url)
  .then(response => processData(response.data, txt, 'ex'))
  .catch(err => console.log(err))
  return Promise.resolve()
}

commands['wotd'] = async () => {
  var url = `/v4/words.json/wordOfTheDay?date=${date}&api_key=${key}`
  var txt = 'Word of the day is : '
  await getData(url)
  .then(response => {
    word = response.data.word
    console.log(`${txt} ${word}\n`)
  })
  .catch(err => console.log(err))

  commands['dict']()
}

commands['dict'] = async () => {
  await commands['def']()
  await commands['syn']()
  await commands['ant']()
  await commands['ex']()
}

commands['play'] = () => {
  var url = `/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=2&maxLength=8&api_key=${key}`
  getData(url)
  .then(response => playFunction(response.data))
  .catch(err => console.log(err))
}

// play functions

var hints = ['def', 'syn', 'ant']
var hintsLong = ['definition', 'synonym', 'antonym']
var dir = {
  'def': [],
  'syn': [],
  'ant': []
}

async function playFunction (info) {
  word = info.word
  dir = {
    'def': [],
    'syn': [],
    'ant': []
  }
  await commands['def']()
  await commands['syn']()
  await commands['ant']()
  gameOn()
}

// main game

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
var newHint = true
var clue

function gameOn () {
  clue = newHint ? hinter() : ''
  newHint = false

  rl.question(`\n${clue} \nGuess the word: `, function (answer) {
    if (answer === word || dir['syn'].includes(answer)) {
      console.log('You guessed right!')
      rl.close()
    } else {
      console.log('\nYou guessed wrong :/\n\n1: Guess again\n2: New hint\n3: Show word and quit')
      wrongGuess()
    }
  })
}

// options displayed on wrong guess

function wrongGuess () {
  rl.question('Enter your option\n', function (answer) {
    if (answer === '1') {
      console.log('Guess again')
      gameOn()
    } else if (answer === '2') {
      console.log('New hint')
      newHint = true
      gameOn()
    } else if (answer === '3') {
      console.log('Show word and quit')
      console.log(word)
      rl.close()
    } else {
      console.log('Invalid option')
      wrongGuess()
    }
  })
}

// hint generator

function hinter () {
  var coinFlip
  if (clue == null) {
    coinFlip = 1
  } else {
    coinFlip = Math.floor(Math.random() * 2)
  }

  if (coinFlip) {
    do {
      var index1 = Math.floor(Math.random() * 3)
      var row = dir[hints[index1]]
    } while (row.length < 1)
    var index2 = Math.floor(Math.random() * row.length)
    return `${hintsLong[index1]} : ${row[index2]}`
  } else {
    return `Jumbled word : ${jumble(word)}`
  }
}

// word jumble

function jumble (word) {
  word = word.split('')
  for (var i = word.length - 1; i >= 0; i--) {
    var rand = Math.floor(Math.random() * i)
    var temp = word[i]
    word[i] = word[rand]
    word[rand] = temp
  }
  word = word.join('')
  return word
}

// GET request

function getData (url, next, txt, id) {
  var options = {
    url: url,
    baseURL: 'http://api.wordnik.com',
    method: 'get'
  }

  return axios(options)
}

// data formatting

function processData (response, txt, id) {
  if (id === 'ex') {
    response = response.examples.map(example => example.text)
  } else if (id === 'def') {
    response = response.map(definition => definition.text)
  } else if (response.length) {
    response = response[0].words
  }

  if (type === 'play') {
    dir[id] = response
  } else {
    txt = txt + response.reduce((acc, cur, index) => acc + `${index + 1}) ${cur}\n`, '\n')
    console.log(txt)
    rl.close()
  }
}

// execute command

if (typeof commands[type] === 'function') {
  commands[type]()
} else {
  console.log('Not a valid option')
  rl.close()
}
