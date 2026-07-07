// tango_solver.js

function parseTangoBoard(cells) {
  const size = 6;
  const board = Array.from({ length: size }, () => Array(size).fill(null));
  const edgeMap = new Map();

  cells.forEach((cell) => {
    const idx = Number(cell.getAttribute("data-cell-idx"));
    const row = Math.floor(idx / size);
    const col = idx % size;

    const svg = cell.querySelector("svg");
    const ariaLabel = svg?.getAttribute("aria-label") || "";
    const isFixed = cell.getAttribute("aria-disabled") === "true";

    let value = null;
    if (ariaLabel === "Sun" || ariaLabel === "Moon") {
      value = ariaLabel === "Sun" ? "S" : "M";
    }

    board[row][col] = value;

    const edges = [];
    const edgeSvgs = cell.querySelectorAll("svg[data-testid^='edge-']");
    edgeSvgs.forEach((edgeSvg) => {
      const edgeType = edgeSvg.getAttribute("aria-label") || "";
      if (edgeType === "Equal") {
        edges.push("=");
      } else if (edgeType === "Cross") {
        edges.push("X");
      }
    });

    if (edges.length > 0) {
      edgeMap.set(idx, edges);
    }
  });

  return { board, edgeMap, size, fixed: new Set(cells.filter((cell) => cell.getAttribute("aria-disabled") === "true").map((cell) => Number(cell.getAttribute("data-cell-idx")))) };
}

function solveTango(board, size, edgeMap) {
  const rows = Array.from({ length: size }, () => Array(size).fill(null));
  const cols = Array.from({ length: size }, () => Array(size).fill(null));
  const fixed = new Set();

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) {
        rows[r][c] = board[r][c];
        cols[c][r] = board[r][c];
        fixed.add(`${r},${c}`);
      }
    }
  }

  const solutions = [];

  function countValues(arr) {
    let s = 0;
    let m = 0;
    arr.forEach((v) => {
      if (v === "S") s++;
      if (v === "M") m++;
    });
    return { s, m };
  }

  function isValidPlacement(r, c, value) {
    const rowValues = rows[r];
    const colValues = cols[c];

    const rowCount = countValues(rowValues);
    const colCount = countValues(colValues);

    if (rowValues[c] !== null || colValues[r] !== null) return false;

    if ((rowCount.s + (value === "S" ? 1 : 0)) > size / 2) return false;
    if ((rowCount.m + (value === "M" ? 1 : 0)) > size / 2) return false;
    if ((colCount.s + (value === "S" ? 1 : 0)) > size / 2) return false;
    if ((colCount.m + (value === "M" ? 1 : 0)) > size / 2) return false;

    const rowFilled = rowValues.filter((v) => v !== null).length;
    const colFilled = colValues.filter((v) => v !== null).length;
    if (rowFilled > size / 2 || colFilled > size / 2) return false;

    const neighborChecks = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];

    for (const [nr, nc] of neighborChecks) {
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const other = rows[nr][nc];
      if (other !== null) {
        const sameNeighbors = (other === value ? 1 : 0);
        const totalNeighbors = 1;
        if (sameNeighbors > 0) {
          let adjacentCount = 0;
          const around = [
            [nr - 1, nc],
            [nr + 1, nc],
            [nr, nc - 1],
            [nr, nc + 1],
          ];
          for (const [ar, ac] of around) {
            if (ar < 0 || ar >= size || ac < 0 || ac >= size) continue;
            if (rows[ar][ac] === value) adjacentCount++;
          }
          if (adjacentCount >= 2) return false;
        }
      }
    }

    return true;
  }

  function applyEdgeConstraints(r, c, value) {
    const idx = r * size + c;
    const edges = edgeMap.get(idx) || [];

    for (const edge of edges) {
      const [dr, dc] = edge === "=" ? [0, 1] : [0, 0];
    }

    return true;
  }

  function backtrack() {
    let best = null;
    let bestPos = null;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (rows[r][c] === null) {
          const rowCount = countValues(rows[r]);
          const colCount = countValues(cols[c]);
          if (rowCount.s > size / 2 || rowCount.m > size / 2 || colCount.s > size / 2 || colCount.m > size / 2) {
            return null;
          }
          if (best === null || (rowCount.s + rowCount.m + colCount.s + colCount.m) < best) {
            best = rowCount.s + rowCount.m + colCount.s + colCount.m;
            bestPos = [r, c];
          }
        }
      }
    }

    if (!bestPos) {
      return rows.map((row) => [...row]);
    }

    const [r, c] = bestPos;
    for (const value of ["S", "M"]) {
      if (isValidPlacement(r, c, value)) {
        rows[r][c] = value;
        cols[c][r] = value;
        const result = backtrack();
        if (result) {
          return result;
        }
        rows[r][c] = null;
        cols[c][r] = null;
      }
    }

    return null;
  }

  const solved = backtrack();
  return solved;
}

function getSolvedTango(cells) {
  const parsed = parseTangoBoard(cells);
  const solution = solveTango(parsed.board, parsed.size, parsed.edgeMap);

  if (!solution) {
    return { success: false, error: "No valid Tango solution found." };
  }

  const flat = solution.flat();
  return {
    success: true,
    solution: flat,
    rawBoard: solution,
  };
}
