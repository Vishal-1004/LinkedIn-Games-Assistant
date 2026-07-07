// popup.js

const outputDiv = document.getElementById("output");
const detectorDiv = document.getElementById("game-detector");
const sudokuSection = document.getElementById("sudoku-section");
const queensSection = document.getElementById("queens-section");

// Identify active tab context on load
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (tab.url.includes("mini-sudoku")) {
    detectorDiv.innerText = "Game: Mini Sudoku";
    sudokuSection.classList.remove("hidden");
  } else if (tab.url.includes("queens")) {
    detectorDiv.innerText = "Game: Queens";
    queensSection.classList.remove("hidden");
  } else {
    detectorDiv.innerText = "Not a recognized game page.";
  }
});

// Sudoku handler
document
  .getElementById("run-sudoku-solver")
  .addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(
      tab.id,
      { action: "GET_SUDOKU_DATA" },
      (response) => {
        if (!response || !response.data)
          return (outputDiv.innerText = "Error reading board.");
        const result = getSolvedSudoku(response.data);
        if (result.success) {
          outputDiv.innerHTML = `<strong>Sudoku Solution:</strong><br>[${result.solution.join(", ")}]`;
        } else {
          outputDiv.innerText = "Error: " + result.error;
        }
      },
    );
  });

// Queens handler
document
  .getElementById("run-queens-solver")
  .addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(
      tab.id,
      { action: "GET_QUEENS_DATA" },
      (response) => {
        if (!response || !response.data)
          return (outputDiv.innerText = "Error reading queens grid.");
        const result = getSolvedQueens(response.data);
        if (result.success) {
          outputDiv.innerHTML = `<strong>Queens Matrix (1 = Queen):</strong><br>${JSON.stringify(result.solution)}<br><br>Row indices for Queens: [${result.rawRows.join(", ")}]`;
        } else {
          outputDiv.innerText = "Error: " + result.error;
        }
      },
    );
  });
