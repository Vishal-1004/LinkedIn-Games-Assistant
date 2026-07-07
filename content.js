// content.js

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
    const cells = document.querySelectorAll("[data-cell-idx]");
    let cellData = [];
    cells.forEach((cell) => {
      let label = cell.getAttribute("aria-label") || "";
      // Extract color from aria-label string like "Empty cell of color Lavender, row 1, column 1"
      let colorMatch = label.match(/color\s+([^,]+)/);
      let color = colorMatch ? colorMatch[1] : "Unknown";
      cellData.push({ color: color });
    });
    sendResponse({ data: cellData });
  }

  return true;
});
