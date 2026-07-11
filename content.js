// content.js

function collectQueensData() {
  const cells = document.querySelectorAll("[data-cell-idx]");
  return Array.from(cells).map((cell) => {
    const label = cell.getAttribute("aria-label") || "";
    const colorMatch = label.match(/color\s+([^,]+)/i);
    return { color: colorMatch ? colorMatch[1] : "Unknown" };
  });
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
  if (typeof getSolvedQueens !== "function") {
    return { success: false, error: "Queens solver is not available." };
  }

  const cellData = collectQueensData();
  const result = getSolvedQueens(cellData);
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

  return {
    ...result,
    filledIndices: solution
      .map((value, index) => (value === 1 ? index : null))
      .filter((value) => value !== null),
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_SUDOKU_DATA") {
    const cells = document.querySelectorAll("[data-cell-idx]");
    let board = new Array(36).fill(0);
    cells.forEach((cell) => {
      const idx = parseInt(cell.getAttribute("data-cell-idx"), 10);
      const val = cell.innerText.trim();
      board[idx] = val === "" ? 0 : parseInt(val, 10);
    });
    sendResponse({ data: board });
  } else if (request.action === "GET_QUEENS_DATA") {
    sendResponse({ data: collectQueensData() });
  } else if (request.action === "SOLVE_QUEENS") {
    sendResponse(solveQueensOnPage());
  }

  return true;
});
