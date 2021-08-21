//constant//
//width of the canva
const mapWidth = 300
//height of the canva
const mapHeight = 600
//number of rows
const numberOfRows = 20
//number of columns
const numberOfCols = 10
//cell size
const cellSize = mapWidth / numberOfCols
//bordersize
const borderSize = 0.2

/*an array of Booleans (z-shape). 1 if there is a part of the 
game piece or a 0 if there is no square of the game piece. */
const zType = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0],
]

/*an array of Booleans (s-shape). 2 if there is a part of the 
game piece or a 0 if there is no square of the game piece. */
const sType = [
  [0, 2, 2],
  [2, 2, 0],
  [0, 0, 0],
]

/*an array of Booleans (i-shape). 3 if there is a part of the 
game piece or a 0 if there is no square of the game piece. */
const iType = [
  [0, 3, 0, 0],
  [0, 3, 0, 0],
  [0, 3, 0, 0],
  [0, 3, 0, 0],
]

/*an array of Booleans (l-shape). 4 if there is a part of the 
game piece or a 0 if there is no square of the game piece. */
const lType = [
  [4, 0, 0],
  [4, 0, 0],
  [4, 4, 0],
]

/*an array of Booleans (j-shape). 5 if there is a part of the 
game piece or a 0 if there is no square of the game piece. */
const jType = [
  [0, 0, 5],
  [0, 0, 5],
  [0, 5, 5],
]

/*an array of Booleans (square-shape). 6 if there is a part of the 
game piece or a 0 if there is no square of the game piece. */
const oType = [
  [6, 6],
  [6, 6],
]

/*an array of Booleans (t-shape). 7 if there is a part of the 
game piece or a 0 if there is no square of the game piece. */
const tType = [
  [0, 7, 0],
  [7, 7, 7],
  [0, 0, 0],
]

//constant colors of the pieces
const blockColors = [
  'limegreen',
  'darkorange',
  'mediumorchid',
  'dodgerblue',
  'orangered',
  'cornflowerblue',
  'tomato',
]

//constant block types
const blockTypes = {
  zType,
  sType,
  iType,
  lType,
  jType,
  oType,
  tType,
}

// the constructor function assigns instances to the block class
class Block {
   constructor(cells, x, y) {
 /*this is assigned so that at the time of execution of the blocks, 
 it points towards this same object and not from the global scope*/    
    this.cells = cells
    this.position = { x, y }
    this.isAlive = true
  }

  //if the last row is full, the row disappears and the upper blocks go down
  rotate() {
    const newCells = []
    for (let i = 0; i < this.cells.length; i++) {
      newCells[i] = []
      for (let j = 0; j < this.cells.length; j++) {
        newCells[i][j] = this.cells[this.cells.length - 1 - j][i]
      }
    }
    this.cells = newCells
  }
  
  //keyboard controls
  moveBlockByEvent(e) {
    switch(e.key) {

      //left arrow execution
      case 'ArrowLeft': {
        this.position.x--
        break
      }
      //right arrow execution
      case 'ArrowRight': {
        this.position.x++
        break
      }
      //down arrow execution
      case 'ArrowDown': {
        if (this.position.y + this.cells.length < numberOfRows) {
          this.position.y++
        }
        break
      }

      //left arrow up execution
      case 'ArrowUp': {
        this.rotate()
        break
      }
    }
  }


  //Find for collisions using x,y coordinates. assigned from the same block using this
  findCollison(field) {
    const { x, y } = this.position
    this.cells.forEach((rows, i) => {
      rows.forEach((cell, j) => {
        if (cell && ((y + i >= numberOfRows) || field[y + i][x + j])) {
          this.isAlive = false
          return
        }
      })
    })
  }
}

//the score starts from 0 and changes levels at 1000
Block.timeToChange = 1000

//lowers the block, when it collides with another block or the last row, it takes out new block
const canMoveLeft = (block, field) => {
  const { cells, position } = block
  const { x, y } = position
  return !cells.some((rows, i) => {
    return rows.some((cell, j) => {
      if (
        (cell && x + j < 0) ||
        (cell && x + j >= numberOfCols) ||
        (cell && field[y + i][x + j])
      ) return true
    })
  })
}
//This function makes the figures come out and take the score that has been given by the eliminated line
const updateScore = (score) => {
  const scoreElem = document.getElementById('score')
  scoreElem.innerHTML = score
}
//The functions change color determinedly from the position where it is
const drawField = (field, ctx) => {
  field.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      ctx.fillStyle = cell ? blockColors[cell - 1] : 'lightblue'
      ctx.strokeStyle = '#555'
      ctx.lineWidth = borderSize

      const args = [
        columnIndex * cellSize, rowIndex * cellSize,
        cellSize, cellSize,
      ]

      ctx.fillRect(...args)
      ctx.strokeRect(...args)
    })
  })
}
// This function is about the animation of how the game moves smoothly
const { requestAnimationFrame } = window
const fps = 24
const timeToMoveDown = 500

let counterOfF = 0
let prevTime = 0
let prevPosition = { x: 0, y: 0 }
let prevBlockCells = [[]]

//this function makes the blocks come out randomly depending on the block that fell and the travel time it has
const render = (game, block, time) => {
  if (!block) {
    const arrOfTypes = Object.values(blockTypes)
    const blockType = arrOfTypes[arrOfTypes.length * Math.random() | 0]
    const x = ((numberOfCols - blockType.length) / 2) | 0
    block = new Block(blockType, x, 0)
    prevPosition = { x, y: 0 }
    console.log('block', block)
    addEventListener('keydown', (e) => block.moveBlockByEvent.bind(block)(e))
  }

  const { ctx, field } = game
  const { position } = block
 
  //the function of this is to make the chip go down slowly
  if (time - prevTime > 1000 / fps) {
    counterOfF++
    if (counterOfF === (fps * timeToMoveDown) / 1000) {
      counterOfF = 0
      if (block && block.isAlive) {
        position.y++
      } else {
        block = null
      }
    }

    prevTime = time

    insertIntoArray(prevBlockCells, field, prevPosition.y, prevPosition.x, true)

    const canMove = canMoveLeft(block, field)
    if (!canMove) {
      position.x = prevPosition.x
      block.cells = prevBlockCells
    }

    if (position.y > prevPosition.y) {
      position.y = prevPosition.y + 1
    }

    //the function of this is to make the chip go down slowly
block.findCollison(field)
    if (block.isAlive) {
      insertIntoArray(block.cells, field, position.y, position.x)
      drawField(field, ctx)
      prevPosition = Object.assign({}, position)
      prevBlockCells = [].concat(block.cells)
    } else if (prevPosition.y > block.cells.length - 1) {
      insertIntoArray(block.cells, field, prevPosition.y, prevPosition.x)
      game.field = findFilledRow(field)
      drawField(game.field, ctx)
      block = null
    } else {
      insertIntoArray(prevBlockCells, field, prevPosition.y, prevPosition.x)
      const lastBlock = block.cells.filter((row) => !row.every((cell) => !cell)).slice(-prevPosition.y)
      insertIntoArray(lastBlock, field, 0, position.x)
      drawField(game.field, ctx)
      setTimeout(() => { alert('Game Over') }, 0)
      game.field = generateField(numberOfRows + 4, numberOfCols)
      updateScore(0)
      block = null
    }
  }

  requestAnimationFrame((time) => render(game, block, time))
}

const insertIntoArray = (childArr, parrentArr, row, col, clearMode) => {
  let i = 0
  while(i < childArr.length) {
    let j = 0
    while(j < childArr[i].length) {
      parrentArr[row + i][col + j] = !clearMode
        ? childArr[i][j]
         ? childArr[i][j]
         : parrentArr[row + i][col + j]
        : childArr[i][j]
          ? 0
          : parrentArr[row + i][col + j]
      j++
    }
    i++
  }
}

//This functionality changes the score depending on the lines that are being eliminated
let score = 0
const findFilledRow = (field) => {
  const filteredField = field.filter((row) => row.some((cell) => (cell === 0)))
  const diff = field.length - filteredField.length
  score += diff * 100
  updateScore(score)
  const filledArr = generateField(diff, numberOfCols)
  return [...filledArr, ...filteredField]
}

//It is where you can generalize the return of the refund progress of the pieces when being generated again
const generateField = (rows, cols) => {
  const field = Array.from({length: rows},
    () => Array.from({length: cols}, () => 0))
  return field
}

//This makes the functionality of the canvas and its image in 2d

window.onload = () => {
  const canvas = document.getElementById('map')
  const ctx = canvas.getContext('2d')
  const game = {
    ctx,
    field: generateField(numberOfRows + 4, numberOfCols),
  }
  render(game)
}