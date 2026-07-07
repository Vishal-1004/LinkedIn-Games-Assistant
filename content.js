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

function collectTangoData() {
  const cells = Array.from(document.querySelectorAll("[data-cell-idx]"));

  return cells.map((cell, index) => {
    const svg = cell.querySelector("svg[aria-label]");
    const label = svg?.getAttribute("aria-label") || "";
    const iconLabels = Array.from(cell.querySelectorAll("svg[aria-label]"))
      .map((svgItem) => svgItem.getAttribute("aria-label"))
      .filter(Boolean);

    return {
      index,
      dataCellIdx: cell.getAttribute("data-cell-idx"),
      label,
      iconLabels,
      text: (cell.innerText || "").trim(),
      className: cell.className || "",
      htmlSnippet: (cell.innerHTML || "").slice(0, 300),
    };
  });
}

function highlightTangoIcons() {
  const cells = Array.from(document.querySelectorAll("[data-cell-idx]"));
  const debugData = collectTangoData();

  console.log("[Tango Debug] Scraped board data:", debugData);

  cells.forEach((cell) => {
    const svg = cell.querySelector("svg[aria-label]");
    const label = svg?.getAttribute("aria-label") || "";

    cell.style.removeProperty("outline");
    cell.style.removeProperty("outline-offset");
    cell.style.removeProperty("box-shadow");
    cell.style.removeProperty("background-color");
    cell.style.removeProperty("transition");

    if (label === "Sun") {
      cell.style.outline = "3px solid #ffbf00";
      cell.style.outlineOffset = "-3px";
      cell.style.boxShadow = "0 0 0 4px rgba(255, 191, 0, 0.35)";
      cell.style.backgroundColor = "rgba(255, 191, 0, 0.22)";
      cell.style.transition = "all 0.2s ease";
    } else if (label === "Moon") {
      cell.style.outline = "3px solid #ffffff";
      cell.style.outlineOffset = "-3px";
      cell.style.boxShadow = "0 0 0 4px rgba(255, 255, 255, 0.6)";
      cell.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
      cell.style.transition = "all 0.2s ease";
    }
  });

  return {
    success: true,
    highlighted: cells.filter((cell) => {
      const svg = cell.querySelector("svg[aria-label]");
      return svg && (svg.getAttribute("aria-label") === "Sun" || svg.getAttribute("aria-label") === "Moon");
    }).length,
    debugData,
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
    const result = highlightTangoIcons();
    if (request.debug) {
      console.log("[Tango Debug] Popup requested debug data:", result.debugData);
    }
    sendResponse(result);
  }

  return true;
});
