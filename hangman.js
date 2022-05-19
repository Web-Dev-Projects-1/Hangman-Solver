const prompt = require("prompt-sync")({sigint: true});
var fs = require("fs");

// words short better (pretty much has all the words, except for very obscure ones)
fs.readFile("words.txt", "utf8", (err, data) => {
  let allWords = data.split("\r\n");
  const maxStrikes = +prompt("How many strikes will have us hanged? ");

  let endGame = false;
  while (!endGame) {
    gameLoop();
    endGame = playMorePrompt();
  }

  function playMorePrompt() {
    const playMore = prompt("Play another game (Y/N)? ");
    return playMore == "Y" ? false : true;
  }

  function gameLoop() {
    console.log("\n");
    let strikes = 0;
    let letters = "abcdefghijklmnopqrstuvwxyz".split("");
    const len = +prompt("What is the number of letters? ") || 0;
    let word = Array(len).fill(".");
    let possibleWords = allWords.filter((e) => e.length == len);

    while (strikes < maxStrikes) {
      if (possibleWords.length == 1) {
        console.log("The word is " + possibleWords[0]);
        break;
      }
      let min = Number.MAX_SAFE_INTEGER;
      let bestLetter = "";
      // find the safest letter
      letters = letters.filter((l) => {
        let count = 0;
        possibleWords.forEach((w) => {
          if (!w.includes(l)) count++;
        });
        if (count == possibleWords.length) {
          return false;
        } else if (count < min) {
          min = count;
          bestLetter = l;
        }
        return true;
      });
      // the dictionary does not have that word
      if (bestLetter === "") {
        console.log("I don't know m8!");
        break;
      }
      console.log("Best letter is: " + bestLetter);
      let correctInput = false;
      // get user input after entering the letter
      getInput: while (!correctInput) {
        let indices = prompt(
          "Enter the opened positions (separated by whitespace) or 0, if there are none: "
        );
        // check if the format of input is correct
        if (!/^(0|([1-9]\d?\s)*[1-9]\d?)$/.test(indices)) {
          console.log("Check your input");
          continue getInput;
        }
        indices = indices.split(" ");
        // check if one of the indices is larger than the length of the word or was already entered
        for (let i = 0; i < indices.length; i++) {
          if (indices[i] > len) {
            console.log("Error: index bigger than word length");
            continue getInput;
          } else if (indices[i] != 0 && word[indices[i] - 1] !== ".") {
            console.log("Error: that index was already entered");
            continue getInput;
          }
        }
        correctInput = true;
        // remove the letter from possible letters
        letters.splice(letters.indexOf(bestLetter), 1);
        if (indices[0] == 0) {
          // if the letter is not in the word, remove all words with that letter
          strikes++;
          possibleWords = possibleWords.filter((e) => !e.includes(bestLetter));
        } else {
          // if the letter is in the word, filter the words according to the new information
          indices.forEach((e) => (word[e - 1] = bestLetter));
          const tempWord = word.join("").replaceAll(".", "[^" + bestLetter + "]");
          const regex = new RegExp("^" + tempWord + "$");
          possibleWords = possibleWords.filter((e) => regex.test(e));
        }
        if (strikes == maxStrikes) {
          console.log("Mission faelled! We'll get'em next toime!");
        }
      }
    }
  }
});
