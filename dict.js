#!/usr/bin/env node
const axios = require('axios')
const readline = require('readline')
const key = require('./key/key.js')

const type = process.argv[2] || 'wotd'
const queryWord = process.argv[3]

// Command definitions

var commands = {}

commands.syn = async (parsedWord) => {
  var url = `/v4/word.json/${parsedWord}/relatedWords?relationshipTypes=synonym&api_key=${key}`
  var txt = `Synonyms for '${parsedWord}' are :\n`

  await getData(url)
  .then(response => processData(response.data, 'syn'))
  .then(response => print(response, txt, 'syn'))
  .catch(err => console.log(err))

  return Promise.resolve()
}

commands.ant = async (parsedWord) => {
  var url = `/v4/word.json/${parsedWord}/relatedWords?relationshipTypes=antonym&api_key=${key}`
  var txt = `Antonyms for '${parsedWord}' are :\n`

  await getData(url)
  .then(response => processData(response.data, 'ant'))
  .then(response => print(response, txt, 'ant'))
  .catch(err => console.log(err))

  return Promise.resolve()
}

commands.def = async (parsedWord) => {
  var url = `/v4/word.json/${parsedWord}/definitions?limit=5&api_key=${key}`
  var txt = `Definitions for '${parsedWord}' are :\n`

  await getData(url)
  .then(response => processData(response.data, 'def'))
  .then(response => print(response, txt, 'def'))
  .catch(err => console.log(err))

  return Promise.resolve()
}

commands.ex = async (parsedWord) => {
  var url = `/v4/word.json/${parsedWord}/examples?limit=5&api_key=${key}`
  var txt = `Examples for '${parsedWord}' are :\n`

  await getData(url)
  .then(response => processData(response.data, 'ex'))
  .then(response => print(response, txt, 'ex'))
  .catch(err => console.log(err))

  return Promise.resolve()
}

commands.wotd = async () => {
  var date = new Date()
  date = `${date.getUTCFullYear()}-${(date.getMonth() + 1)}-${(date.getDate())}`

  var url = `/v4/words.json/wordOfTheDay?date=${date}&api_key=${key}`
  var txt = 'Word of the day is : '
  var parsedWord

  await getData(url)
  .then(response => {
    parsedWord = response.data.word
    console.log(`${txt} ${parsedWord}\n`)
  })
  .catch(err => console.log(err))

  commands['dict'](parsedWord)
}

commands.dict = async (parsedWord) => {
  await commands['def'](parsedWord)
  await commands['syn'](parsedWord)
  await commands['ant'](parsedWord)
  await commands['ex'](parsedWord)
}

commands.play = () => {
  var url = `/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=2&maxLength=8&api_key=${key}`
  getData(url)
  .then(response => playFunction(response.data.word))
  .catch(err => console.log(err))
}

// play functions

let hintStore = {
  'def': [],
  'syn': [],
  'ant': []
}

async function playFunction (randomWord) {
  hintStore = {
    'def': [],
    'syn': [],
    'ant': []
  }

  await Promise.all([
    commands['def'](randomWord),
    commands['syn'](randomWord),
    commands['ant'](randomWord)
  ])

  gameOn(true, randomWord)
}

// main game

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function gameOn (showHint, randomWord) {
  var clue = showHint ? hinter(randomWord) : ''

  rl.question(`\n${clue} \nGuess the word: `, answer => {
    if (answer === randomWord || hintStore['syn'].includes(answer)) {
      console.log('You guessed right!')
      rl.close()
    } else {
      console.log('\nYou guessed wrong :/\n\n1: Guess again\n2: New hint\n3: Show word and quit')
      wrongGuess(randomWord)
    }
  })
}

// options displayed on wrong guess

function wrongGuess (randomWord) {
  rl.question('Enter your option\n', function (answer) {
    if (answer === '1') {
      console.log('Guess again')
      gameOn(false, randomWord)
    } else if (answer === '2') {
      console.log('New hint')
      gameOn(true, randomWord)
    } else if (answer === '3') {
      console.log('Show word and quit')
      console.log(randomWord)
      rl.close()
    } else {
      console.log('Invalid option')
      wrongGuess(randomWord)
    }
  })
}

// hint generator

function hinter (parsedWord) {
  var hints = Object.keys(hintStore)
  var coinFlip = Math.floor(Math.random() * 2)

  if (coinFlip) {
    do {
      var hintType = Math.floor(Math.random() * 3)
      var row = hintStore[hints[hintType]]
    } while (!row.length)

    var hintIndex = Math.floor(Math.random() * row.length)
    return `${expand(hints[hintType])} : ${row[hintIndex]}`
  } else {
    return `Jumbled word : ${jumble(parsedWord)}`
  }
}

// expand hint type

function expand (inType) {
  if (inType === 'syn') {
    return 'Synonym'
  } else if (inType === '') {
    return 'Antonym'
  } else {
    return 'Definition'
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

function getData (url) {
  return axios({
    url: url,
    baseURL: 'http://api.wordnik.com',
    method: 'get'
  })
}

// data formatting

function processData (response, id) {
  if (id === 'ex') {
    response = response.examples.map(example => example.text)
  } else if (id === 'def') {
    response = response.map(definition => definition.text)
  } else if (response.length) {
    response = response[0].words
  }

  if (type !== 'play') {
    response = response.reduce((acc, cur, index) => acc + `${index + 1}) ${cur}\n`, '\n')
    rl.close()
  }

  return Promise.resolve(response)
}

// print function

function print (response, txt, id) {
  if (type !== 'play') {
    console.log(txt + response)
  } else {
    hintStore[id] = response
  }
}

// execute command

if (key === 'api key value') {
  console.log('Invalid API key. Add a valid key in /key/key.js')
} else if (typeof commands[type] === 'function') {
  commands[type](queryWord)
} else {
  console.log('Not a valid option')
  rl.close()
}
