// popup.js

const outputDiv = document.getElementById("output");
const detectorDiv = document.getElementById("game-detector");
const sudokuSection = document.getElementById("sudoku-section");
const queensSection = document.getElementById("queens-section");
const tangoSection = document.getElementById("tango-section");

// Identify active tab context on load
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (tab.url.includes("mini-sudoku")) {
    detectorDiv.innerText = "Active game: Mini Sudoku";
    detectorDiv.style.background = "#ecfdf3";
    detectorDiv.style.color = "#166534";
    sudokuSection.classList.remove("hidden");
  } else if (tab.url.includes("queens")) {
    detectorDiv.innerText = "Active game: Queens";
    detectorDiv.style.background = "#ecfdf3";
    detectorDiv.style.color = "#166534";
    queensSection.classList.remove("hidden");
  } else if (tab.url.includes("tango")) {
    detectorDiv.innerText = "Active game: Tango";
    detectorDiv.style.background = "#ecfdf3";
    detectorDiv.style.color = "#166534";
    tangoSection.classList.remove("hidden");
  } else {
    detectorDiv.innerText = "Open a supported LinkedIn game page.";
    detectorDiv.style.background = "#fef3c7";
    detectorDiv.style.color = "#92400e";
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
        if (!response || !response.data) {
          outputDiv.classList.add("show");
          return (outputDiv.innerText = "Unable to read the Sudoku board from this page.");
        }
        const result = getSolvedSudoku(response.data);
        if (result.success) {
          outputDiv.classList.add("show");
          outputDiv.innerHTML = `<strong>Sudoku ready.</strong><br>The solution has been computed for the current board.`;
        } else {
          outputDiv.classList.add("show");
          outputDiv.innerText = "Unable to solve this Sudoku board. " + result.error;
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
      { action: "SOLVE_QUEENS" },
      (response) => {
        if (!response || !response.success) {
          outputDiv.classList.add("show");
          return (outputDiv.innerText = "Unable to solve the Queens board right now. Please refresh the website and try again.");
        }

        outputDiv.classList.add("show");
        outputDiv.innerHTML = `<strong>Correct queen cells are highlighted.</strong><br>Hurry up and fill them before the time runs out!`;
      },
    );
  });

// Tango handler
document
  .getElementById("run-tango-solver")
  .addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(
      tab.id,
      { action: "SOLVE_TANGO" },
      (response) => {
        if (!response || !response.success) {
          outputDiv.classList.add("show");
          return (outputDiv.innerText = "Unable to solve the Tango board right now. Please refresh the website and try again.");
        }

        outputDiv.classList.add("show");
        outputDiv.innerHTML = `<strong>Tango solution applied.</strong><br>Complete the board with the highlighted choices.`;
      },
    );
  });
