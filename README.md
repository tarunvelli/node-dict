## Requiremnets

+ node.js
+ npm
+ unix/linux*

> Has not been tested on windows, some features such as installing as global command, shorthand of ./dict.js etc. might not work on windows.  

## SETUP

### Clone repo (or Download)
```shell
git clone "https://github.com/tarunvelli/node-dict.git"
```
### Enter the directory
```shell
cd node-dict
```
### Install the dependencies
```shell
npm install
```
### Enter your api key in key/key.js as
```javascript
module.exports = "value";
```
> This is done to include key.js in .gitignore so that the key value is not pushed into public repos by mistake.

## USAGE

### To run from within the node-dict directory with shorthand
> Recommended for testing

```shell
./dict.js syn word
```
### OR

### To install as a global command
> For permanent use, installs the script as a global command to execute from any dir in the terminal with the command "node-dict"

to link
```shell
sudo npm link
```
to run
```shell
node-dict syn word
```

### OR

### Run using node  
> Should be in the node-dict directory

```shell
node dict syn word
```
## DOCS
> The examples here are run using node dict in the node-dict directory

+ **Definitions**

Get definitions of a word
```shell
node dict def word
```

+ **Synonyms**

To get synonyms of a word
```shell
node dict syn word
```

+ **Antonyms**

Get antonyms of a word
```shell
node dict ant word
```

+ **Examples**

Get examples of a word
```shell
node dict ex word
```

+ **All related info**

Get all the related info of a word,
in order of : - definitions, synonyms, antonyms and examples
```shell
node dict dict word
```

+ **Word of the day**

Get all the related info of the word of the day,
i.e. definitions, synonyms, antonyms and examples
```shell
node dict
```

+ **Play game**

Play a word guessing game
```shell
node dict play
```

**Made with [wordnik api](http://developer.wordnik.com/docs.html)**
