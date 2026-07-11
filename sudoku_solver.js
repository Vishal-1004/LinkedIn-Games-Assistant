// sudoku_solver.js

/**
 * Checks if a number can be legally placed at the given index in a 6x6 grid.
 */
function isValidPlacement(board, index, num) {
  const row = Math.floor(index / 6);
  const col = index % 6;

  // Find the top-left corner of the 2x3 region this cell belongs to
  const startRow = Math.floor(row / 2) * 2;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 6; i++) {
    // 1. Check the entire row
    if (board[row * 6 + i] === num) return false;

    // 2. Check the entire column
    if (board[i * 6 + col] === num) return false;
  }

  // 3. Check the 2x3 region
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[(startRow + r) * 6 + (startCol + c)] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * The recursive backtracking algorithm that solves the board in-place.
 */
function solveGrid(board) {
  // Find the next empty cell (represented by 0)
  const emptyIndex = board.indexOf(0);

  // If there are no empty cells left, the puzzle is solved!
  if (emptyIndex === -1) return true;

  // Try placing numbers 1 through 6
  for (let num = 1; num <= 6; num++) {
    if (isValidPlacement(board, emptyIndex, num)) {
      board[emptyIndex] = num; // Tentatively place the number

      // Move to the next empty cell
      if (solveGrid(board)) {
        return true;
      }

      // If we hit a dead end, reset the cell to 0 and backtrack
      board[emptyIndex] = 0;
    }
  }

  // If no number 1-6 works, trigger backtracking
  return false;
}

/**
 * Main wrapper function to validate the input and return the solved array.
 */
function getSolvedSudoku(boardArray) {
  if (!Array.isArray(boardArray) || boardArray.length !== 36) {
    return {
      success: false,
      error: "Invalid board data. Array must contain exactly 36 elements.",
    };
  }

  const normalizedBoard = boardArray.map((cell) => {
    if (cell === null || cell === undefined || cell === "") return 0;
    return Number(cell);
  });

  const isCompletelyEmpty = normalizedBoard.every((cell) => cell === 0);
  if (isCompletelyEmpty) {
    return {
      success: false,
      error: "Board is completely empty. Please open a Sudoku game.",
    };
  }

  let boardCopy = [...normalizedBoard];

  if (solveGrid(boardCopy)) {
    return { success: true, solution: boardCopy };
  } else {
    return { success: false, error: "This Sudoku board is unsolvable." };
  }
}
