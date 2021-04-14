
const textElement = document.getElementById('text')
const optionButtonsElement = document.getElementById('option-buttons')

let answerYes = 0;  //Counter which shows how many rounds one has answered yes
let answerNo = 0;   //Counter which shows how many rounds one has answered no

var neverHaveIEverPrompts = ["had a talk with the police.","shat myself.","had too much to drink, according to myself.",
"jay-walked.","cheated on a diet.","sneaked food into a cinema.","driven more than 20% above the speed limit.","clogged a friend's toilet.","peed in the sink.","slept for more than 12 hours.",
"not been able to find my way home.","been awake for more than 36 hours.","spent way too much money on something which wasn't worth it.","been scared of heights.","been outside Europe.",
"had 3 jobs at the same time.","had a surname ending in \"sen\""] 
//here all the prompts will be stored, to be used as placeholders in "const textnodes"
ranPrompts = [] //https://stackoverflow.com/questions/18806210/generating-non-repeating-random-numbers-in-js inspiration
let usedPrompts = []

let nevertext = document.getElementById("neverText")
let nexttext = document.getElementById("nexttext")

let counter = 0

nevertext.innerText = "Click \"Next round\" to start the game"

nexttext.addEventListener("click", () => {
  if(unusedPromptsLeft() === true) {
    let randomNum
    do {
      randomPromptIndex = Math.floor(Math.random() * neverHaveIEverPrompts.length)
    } while(checkIfPromptHasBeenUsed(randomPromptIndex) === false)
    nevertext.innerText = "Never have I ever " + neverHaveIEverPrompts[randomPromptIndex]
    usedPrompts[counter] = randomPromptIndex
    counter++
  } else {
    nevertext.innerText = "GAME OVER LOSERS" 
  } 
})

function checkIfPromptHasBeenUsed(randomPromptIndex) {
  if(usedPrompts.includes(randomPromptIndex)) {
    return false
  }
  return true
}

function unusedPromptsLeft() {
  if(usedPrompts.length === neverHaveIEverPrompts.length) {
    console.log(usedPrompts)
    return false
  }
  return true
}

/* Below this*/ 
/* Do we agree that his does nothing? and isn't used and won't be used?*/ 

function showTextNode(textNodeIndex) { /* https://www.youtube.com/watch?v=R1S_NhKkvGA "borrowed" from here */
  const textNode = textNodes.find(textNode => textNode.id === textNodeIndex)  
  textElement.innerText = textNode.text
  while (optionButtonsElement.firstChild) {
    optionButtonsElement.removeChild(optionButtonsElement.firstChild)
  }

  textNode.options.forEach(option => {
    if (showOption(option)) {
      const button = document.createElement('button')
      button.innerText = option.text
      button.classList.add('btn')
      button.addEventListener('click', () => selectOption(option))
      optionButtonsElement.appendChild(button)
    }
  })
}

function selectOption(option) {
  const nextTextNodeId = option.nextText
  if (nextTextNodeId <= 0) {
    return startGame()
  }
}

/* Do we agree that his does nothing? and isn't used and won't be used?*/ 
/* Above this */

// //The goal of the below function is to display the prompts, allow answers, count answers, and give next prompt
// const textNodes = [
//   {
//     options: [
//       {
//         text: 'Yes I have\'t',
//         ++answerYes,
//       }, 
//       {
//         text: 'No, I haven\'t',
//         ++answerNo,
//       }                                                                
//       ]                                                                          
//     }                                                                            
// ]
// startGame()