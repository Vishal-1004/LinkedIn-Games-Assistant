// queens_solver.js

function solveQueens(gridSize, regions) {
  // regions is an array of length gridSize*gridSize containing color/region identifiers
  const n = gridSize;
  let queens = new Array(n).fill(-1); // queens[row] = col
  let usedCols = new Array(n).fill(false);
  let usedRegions = new Array(n).fill(false);

  function canPlace(row, col) {
    // 1. Column check
    if (usedCols[col]) return false;
    // 2. Region check
    const region = regions[row * n + col];
    if (usedRegions[region]) return false;

    // 3. Touch check (no adjacent or diagonal contact)
    for (let r = 0; r < row; r++) {
      let c = queens[r];
      if (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1) {
        return false;
      }
    }
    return true;
  }

  function backtrack(row) {
    if (row === n) return true;

    for (let col = 0; col < n; col++) {
      const region = regions[row * n + col];
      if (!usedCols[col] && !usedRegions[region] && canPlace(row, col)) {
        queens[row] = col;
        usedCols[col] = true;
        usedRegions[region] = true;

        if (backtrack(row + 1)) return true;

        queens[row] = -1;
        usedCols[col] = false;
        usedRegions[region] = false;
      }
    }
    return false;
  }

  if (backtrack(0)) {
    // Convert row-to-col array into coordinate list or flat 1/0 map
    let solutionMap = new Array(n * n).fill(0);
    for (let r = 0; r < n; r++) {
      solutionMap[r * n + queens[r]] = 1;
    }
    return { success: true, solution: solutionMap, rawRows: queens };
  }
  return { success: false, error: "No valid arrangement found for Queens." };
}

function getSolvedQueens(cellData) {
  if (!cellData || cellData.length === 0)
    return { success: false, error: "No Queens grid detected." };
  const size = Math.sqrt(cellData.length);
  const regions = cellData.map((c) => c.color);
  return solveQueens(size, regions);
}
