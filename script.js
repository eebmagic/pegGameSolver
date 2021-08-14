/**
 *  Load peg states from front end and convert to board shaped matrix.
 *  The resulting board is used in the constructor for a Board object.
 */
function processPegs() {
  let values = Array(15).fill(false);
  let pegs = document.getElementsByClassName('peg');
  Array.from(pegs).forEach(function(p, ind){
    if (p.dataset.clicked == "true") {
      values[ind] = true;
    }
  });

  let out = [
    [values[0]],
    [values[1], values[2]],
    [values[3], values[4], values[5]],
    [values[6], values[7], values[8], values[9]],
    [values[10], values[11], values[12], values[13], values[14]],
  ]

  return out;
}

/**
 *  Where a and b are two coordinates (x, y).
 *  Checks that peg at point a can possibly jump point b.
 * 
 *  Return the new position of peg a after jumping peg b.
 *  Return false if jump not possible.
 */
function validMove(a, b) {
  // console.log(`a: ${a}`);
  // console.log(`b: ${b}`);
  if (a == b) return false;
  if (Math.abs(a[0] - b[0]) > 1) return false;
  if (Math.abs(a[1] - b[1]) > 1) return false;
  if (Math.abs(a[0] - b[0]) + Math.abs(a[0] - b[0]) > 2) return false;

  let out = "default";
  if (a[0] == b[0]) {
    if (Math.abs(a[1] - b[1]) == 1) {
      if (a[1] > b[1]) {
        // Left
        out = [a[0], b[1]-1];
      } else {
        // Right
        out = [a[0], b[1]+1];
      }
    }
  } else {
    // console.log('WILL BE DIAGONAL JUMP')
    if (b[1] == a[1]) {
      if (b[0] > a[0]) {
        // Down left
        // console.log("Down left");
        out = [b[0]+1, b[1]];
      } else {
        // Up right
        // console.log("Up right");
        out = [b[0]-1, b[1]];
      }
    } else if (b[1] == a[1] + 1 && b[0] == a[0] + 1) {
      // Down right
      // console.log("Down right");
      out = [b[0]+1, b[1]+1];
    } else if (b[1] + 1 == a[1] && b[0] + 1 == a[0]) {
      // Up left
      // console.log("Up left");
      out = [b[0]-1, b[1]-1];
    }
  }

  // Check output a valid point
  if (out[0] < 0 || out[0] > 4) {
    return false;
  }
  if (out[1] > out[0] || out[1] < 0 || out[1] > 4) {
    return false;
  }
  return out;
}

/**
 *  Make a deep copy of a board matrix.
 */
function makeBoardCopy(boardMatrix) {
  let out = [];
  boardMatrix.forEach(row => {
    out.push(row.slice());
  })
  return out
}

function makeBoard(triboardArr) {
  /**
   *  Board object
   *  For the DFS algo implementation boards work as nodes,
   *  and possible moves work as edges.
   */
  return {
    board: makeBoardCopy(triboardArr),
    points: [
      [0, 0], [1, 0], [1, 1],
      [2, 0], [2, 1], [2, 2],
      [3, 0], [3, 1], [3, 2],
      [3, 3], [4, 0], [4, 1],
      [4, 2], [4, 3], [4, 4]
    ],

    /**
     *  Iterate over all peg pairs and check for valid moves.
     *  Return a list of all (a, b) peg pairs (where a can jump b).
     */
    getMoves: function() {
      let out = [];
      for (let aInd = 0; aInd < this.points.length; aInd++) {
        for (let bInd = 0; bInd < this.points.length; bInd++) {
          if (aInd != bInd) {
            let a = this.points[aInd];
            let b = this.points[bInd];
            if (this.board[a[0]][a[1]] == true && this.board[b[0]][b[1]] == true) {
              let c = validMove(a, b);
              if (c != false && this.board[c[0]][c[1]] == false) {
                out.push([a, b]);
              }
            }
          }
        }
      }
      return out;
    },

    getPegCount: function() {
      let total = 0;
      this.board.forEach((arr) => {
        arr.forEach((value) => {
          if (value == true) {
            total += 1;
          }
        });
      });
      return total;
    },

    /**
     *  Check valid move and perform corresponding flips on board.
     */
    makeMove: function(a, b) {
      let c = validMove(a, b);
      if (c == false) {
        console.log(`Invalid move: ${a} -> ${b}`);
        return;
      }

      let aValid = this.board[a[0]][a[1]] == true;
      let bValid = this.board[b[0]][b[1]] == true;
      let cValid = this.board[c[0]][c[1]] == false;
      if (aValid && bValid && cValid) {
        this.board[a[0]][a[1]] = false;
        this.board[b[0]][b[1]] = false;
        this.board[c[0]][c[1]] = true;
        return;
      } else {
        console.log(`Jump not possible ${a} -> ${b} | ${c}`);
        return;
      }
    }
  }
}

/**
 *  Count how many true values in a board matrix.
 *  Return int total true values.
 */
function evalMatrix(boardMatrix) {
  let total = 0;
  boardMatrix.forEach(row => {
    row.forEach(value => {
      if (value) total += 1;
    });
  });
  return total;
}

/**
 *  Recursive DFS implementation to find longest path.
 *  Longest path in this case will involve removing the
 *  most number of pegs possible (each step in path being a removal).
 */
function recSolve(board, path) {
  let moves = board.getMoves();
  if (moves.length == 0) {
    return path;
  }

  let bestPath = path.slice();
  for (let i = 0; i < moves.length; i++) {
    let move = moves[i];
    let childBoard = makeBoard(board.board);
    childBoard.makeMove(move[0], move[1]);
    let childPath = path.slice();
    childPath.push([move, childBoard.board]);

    let p = recSolve(childBoard, childPath);
    if (p.length > bestPath.length) {
      bestPath = p;
    }
  }
  return bestPath;
}

/**
 * Flatten board matrix to make it easier to iterate later.
 */
function flattenMatrix(matrix) {
  let out = [];
  matrix.forEach(item => {
    item.forEach(subitem => {
      out.push(subitem);
    });
  });
  return out;
}

/**
 *  Convert (x, y) position used in matrix to peg label for front-end.
 */
function flatPosition(x, y) {
  let total = 0;
  for (let i=1; i<=x; i++) total += i;
  return total + y + 1;
}

/////////////////////////////////////////////////////////////////////////////

function main() {
  console.log('STARTING MAIN FUNC!!!');

  // Load board
  let pegs = processPegs();
  let startBoard = makeBoard(pegs);

  // Run algorithm
  let nextMove = recSolve(startBoard, [[null, startBoard.board]]);
  let finalTotal = evalMatrix(nextMove[nextMove.length-1][1]);

  // Remove old board displays
  let oldBoards = document.getElementsByClassName("board-display");
  Array.from(oldBoards).forEach(board => board.remove())
  let oldTitle = document.getElementsByTagName("h2");
  Array.from(oldTitle).forEach(title => title.remove());
  let oldLabels = document.getElementsByTagName("h4");
  Array.from(oldLabels).forEach(label => label.remove());

  // Get board elements
  let target = document.getElementById("body");
  let template = document.getElementById("input-screen").cloneNode(true);
  template.setAttribute('class', 'board-display');

  // Add title
  let header = document.createElement("h2");
  header.innerText = "Solution Steps:";
  target.append(header);

  // Add board for each step in solution path
  nextMove.forEach(item => {
    let move = item[0];
    let board = item[1];
    let boardResult = template.cloneNode(true);
    let pegs = Array.from(boardResult.getElementsByClassName("peg"));

    // Set peg position states
    flattenMatrix(board).forEach((value, ind) => {
      if (value) {
        pegs[ind].setAttribute('data-clicked', 'true');
      } else {
        pegs[ind].setAttribute('data-clicked', 'false');
      }
    });

    // Add line
    if (move) {
      let posA = move[0];
      let posB = move[1];
      let posC = validMove(posA, posB);
      let startPeg = pegs[flatPosition(posA[0], posA[1])-1];
      let stopPeg = pegs[flatPosition(posC[0], posC[1])-1];
      console.log('Start peg:');
      console.log(startPeg);
      console.log(startPeg.getAttribute('cx'), startPeg.getAttribute('cy'))
      console.log('Stop peg:');
      console.log(stopPeg);

      let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute('x1', startPeg.getAttribute('cx'));
      line.setAttribute('y1', startPeg.getAttribute('cy'));
      line.setAttribute('x2', stopPeg.getAttribute('cx'));
      line.setAttribute('y2', stopPeg.getAttribute('cy'));

      boardResult.appendChild(line);
    }

    // Make move description
    let moveTitle = document.createElement("h4");
    if (move) {
      let newPos = validMove(move[0], move[1]);
      moveTitle.innerText = `${flatPosition(move[0][0], move[0][1])} -> ${flatPosition(newPos[0], newPos[1])}`;
    } else {
      moveTitle.innerText = "Start Position"
    }

    // Add elements
    target.appendChild(moveTitle);
    target.appendChild(boardResult);
  })

}

