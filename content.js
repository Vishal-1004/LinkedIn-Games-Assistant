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
      let idx = parseInt(cell.getAttribute("data-cell-idx"));
      let val = cell.innerText.trim();
      board[idx] = val === "" ? 0 : parseInt(val);
    });
    sendResponse({ data: board });
  } else if (request.action === "GET_QUEENS_DATA") {
    sendResponse({ data: collectQueensData() });
  } else if (request.action === "SOLVE_QUEENS") {
    const result = solveQueensOnPage();
    sendResponse(result);
  } else if (request.action === "SOLVE_TANGO") {
    if (typeof getSolvedTango !== "function") {
      sendResponse({ success: false, error: "Tango solver is not available." });
      return true;
    }

    const cells = Array.from(document.querySelectorAll("[data-cell-idx]"));
    const result = getSolvedTango(cells);
    if (result.success) {
      cells.forEach((cell, index) => {
        const value = result.solution[index];
        if (value === "S" || value === "M") {
          const svg = cell.querySelector("svg[data-testid='cell-empty']");
          if (svg && !cell.getAttribute("aria-disabled") === "true") {
            const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            icon.setAttribute("width", "24");
            icon.setAttribute("height", "24");
            icon.setAttribute("viewBox", "0 0 24 24");
            icon.setAttribute("fill", "none");
            icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            icon.setAttribute("aria-label", value === "S" ? "Sun" : "Moon");
            icon.setAttribute("data-testid", value === "S" ? "cell-zero" : "cell-one");
            icon.innerHTML = value === "S"
              ? '<g id="Sun"><path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g>'
              : '<g id="Moon"><path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a6.5 6.5 0 1 0 9.5 9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>';
            svg.replaceWith(icon);
          }
        }
      });
    }
    sendResponse(result);
  }

  return true;
});
