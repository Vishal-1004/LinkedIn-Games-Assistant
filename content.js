// content.js

function collectSudokuBoard() {
  const cells = document.querySelectorAll("[data-cell-idx]");
  const board = new Array(36).fill(null);

  cells.forEach((cell) => {
    const idx = parseInt(cell.getAttribute("data-cell-idx"), 10);
    const contentCell = cell.querySelector(".sudoku-cell-content");
    const rawValue = (contentCell?.textContent || cell.textContent || "").trim();
    board[idx] = rawValue === "" ? null : parseInt(rawValue, 10);
  });

  console.log("[Sudoku] Collected board:", board);
  return board;
}

function fillSolvedSudokuBoard(solution) {
  const cells = Array.from(document.querySelectorAll("[data-cell-idx]"));
  const filledIndices = [];

  console.log("[Sudoku] Filling solved values into the board...");

  cells.forEach((cell, index) => {
    const contentCell = cell.querySelector(".sudoku-cell-content");
    const currentValue = (contentCell?.textContent || cell.textContent || "").trim();
    const isEmpty = currentValue === "";

    if (isEmpty && solution && solution[index] != null) {
      const value = solution[index];
      if (contentCell) {
        contentCell.textContent = String(value);
      } else {
        cell.textContent = String(value);
      }

      filledIndices.push(index);
      if (typeof cell.click === "function") {
        cell.click();
      }
      cell.dispatchEvent(new KeyboardEvent("keydown", { key: String(value), bubbles: true }));
    }
  });

  console.log("[Sudoku] Filled cells:", filledIndices);
  return filledIndices;
}

function solveSudokuOnPage() {
  const board = collectSudokuBoard();
  console.log("[Sudoku] Starting solver...");

  if (typeof getSolvedSudoku !== "function") {
    return { success: false, error: "Sudoku solver is not available." };
  }

  const result = getSolvedSudoku(board);
  console.log("[Sudoku] Solver result:", result);

  if (!result.success) {
    return result;
  }

  const filledIndices = fillSolvedSudokuBoard(result.solution);
  console.log("[Sudoku] Final solved board:", result.solution);

  return {
    ...result,
    filledIndices,
  };
}

function collectTangoBoard() {
  const cells = document.querySelectorAll("[data-cell-idx]");
  const board = Array.from(cells).map((cell) => {
    const svg = cell.querySelector("svg[aria-label]");
    const label = svg?.getAttribute("aria-label") || "";
    return label === "Moon" ? "Moon" : label === "Sun" ? "Sun" : null;
  });

  console.log("[Tango] Board entries:", board);
  return board;
}

function fillSolvedTangoBoard(solution) {
  const cells = Array.from(document.querySelectorAll("[data-cell-idx]"));
  const filledIndices = [];

  console.log("[Tango] Filling solved values into the board...");

  cells.forEach((cell, index) => {
    const svg = cell.querySelector("svg[aria-label]");
    const currentLabel = svg?.getAttribute("aria-label") || "";
    const target = solution && solution[index] ? solution[index] : null;

    if (target && currentLabel !== target) {
      if (svg) {
        svg.setAttribute("aria-label", target);
      } else {
        cell.setAttribute("aria-label", target);
      }

      // Try to trigger any page handlers by clicking the cell
      if (typeof cell.click === "function") {
        cell.click();
      }
      cell.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

      filledIndices.push(index);
    }
  });

  console.log("[Tango] Filled cells:", filledIndices);
  return filledIndices;
}

function highlightTango(solution) {
  const cells = Array.from(document.querySelectorAll("[data-cell-idx]"));

  // Clear any existing highlights first
  cells.forEach((cell) => {
    cell.removeAttribute("data-tango-highlight");
    cell.style.removeProperty("outline");
    cell.style.removeProperty("outline-offset");
    cell.style.removeProperty("box-shadow");
    cell.style.removeProperty("background-color");
    cell.style.removeProperty("transition");
  });

  cells.forEach((cell, index) => {
    const value = solution && solution[index] ? solution[index] : null;
    if (value === "Moon") {
      cell.setAttribute("data-tango-highlight", "moon");
      cell.style.outline = "3px solid #ffffff";
      cell.style.outlineOffset = "-3px";
      cell.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.35)";
      cell.style.backgroundColor = "#ffffff";
      cell.style.transition = "all 0.2s ease";
    } else if (value === "Sun") {
      cell.setAttribute("data-tango-highlight", "sun");
      cell.style.outline = "3px solid #ffbf00";
      cell.style.outlineOffset = "-3px";
      cell.style.boxShadow = "0 0 0 4px rgba(255, 191, 0, 0.35)";
      cell.style.backgroundColor = "#ffefb8";
      cell.style.transition = "all 0.2s ease";
    }
  });
}

function solveTangoOnPage() {
  console.log("[Tango] Starting solver...");

  if (typeof getSolvedTango !== "function") {
    return { success: false, error: "Tango solver is not available." };
  }

  const board = collectTangoBoard();
  const result = getSolvedTango(board);
  console.log("[Tango] Solver result:", result);

  if (!result.success) {
    return result;
  }

  const solution = result.solution || [];

  highlightTango(solution);
  const filledIndices = fillSolvedTangoBoard(solution);

  return {
    ...result,
    filledIndices,
  };
}

function collectQueensData() {
  const cells = document.querySelectorAll("[data-cell-idx]");
  const data = Array.from(cells).map((cell) => {
    const label = cell.getAttribute("aria-label") || "";
    const colorMatch = label.match(/color\s+([^,]+)/i);
    return { color: colorMatch ? colorMatch[1] : "Unknown" };
  });

  console.log("[Queens] Collected data:", data);
  return data;
}

function clearQueensHighlights() {
  document.querySelectorAll("[data-queen-highlight]").forEach((cell) => {
    cell.removeAttribute("data-queen-highlight");
    cell.style.removeProperty("outline");
    cell.style.removeProperty("outline-offset");
    cell.style.removeProperty("box-shadow");
    cell.style.removeProperty("background-color");
    cell.style.removeProperty("transition");
  });
}

function highlightQueens(solution) {
  const cells = Array.from(document.querySelectorAll("[data-cell-idx]"));

  clearQueensHighlights();

  cells.forEach((cell, index) => {
    if (solution[index] === 1) {
      cell.setAttribute("data-queen-highlight", "true");
      cell.style.outline = "3px solid #ffbf00";
      cell.style.outlineOffset = "-3px";
      cell.style.boxShadow = "0 0 0 4px rgba(255, 191, 0, 0.35)";
      cell.style.backgroundColor = "rgba(255, 191, 0, 0.18)";
      cell.style.transition = "all 0.2s ease";
    }
  });
}

function solveQueensOnPage() {
  console.log("[Queens] Starting solver...");

  if (typeof getSolvedQueens !== "function") {
    return { success: false, error: "Queens solver is not available." };
  }

  const cellData = collectQueensData();
  const result = getSolvedQueens(cellData);
  console.log("[Queens] Solver result:", result);

  if (!result.success) {
    return result;
  }

  const cells = Array.from(document.querySelectorAll("[data-cell-idx]"));
  const solution = result.solution || [];

  highlightQueens(solution);

  cells.forEach((cell, index) => {
    if (solution[index] === 1) {
      window.setTimeout(() => {
        if (typeof cell.click === "function") {
          cell.click();
        }
        cell.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }, index * 45);
    }
  });

  const filledIndices = solution
    .map((value, index) => (value === 1 ? index : null))
    .filter((value) => value !== null);

  console.log("[Queens] Filled indices:", filledIndices);

  return {
    ...result,
    filledIndices,
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_SUDOKU_DATA") {
    sendResponse({ data: collectSudokuBoard() });
  } else if (request.action === "SOLVE_SUDOKU") {
    sendResponse(solveSudokuOnPage());
  } else if (request.action === "GET_TANGO_DATA") {
    sendResponse({ data: collectTangoBoard() });
  } else if (request.action === "SOLVE_TANGO") {
    sendResponse(solveTangoOnPage());
  } else if (request.action === "GET_QUEENS_DATA") {
    sendResponse({ data: collectQueensData() });
  } else if (request.action === "SOLVE_QUEENS") {
    sendResponse(solveQueensOnPage());
  }

  return true;
});
