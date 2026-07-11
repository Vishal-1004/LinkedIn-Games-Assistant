// popup.js

const outputDiv = document.getElementById("output");
const detectorDiv = document.getElementById("game-detector");
const sudokuSection = document.getElementById("sudoku-section");
const queensSection = document.getElementById("queens-section");

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
  } else {
    detectorDiv.innerText = "Open a supported LinkedIn Sudoku or Queens page.";
    detectorDiv.style.background = "#fef3c7";
    detectorDiv.style.color = "#92400e";
  }
});

document.getElementById("run-sudoku-solver").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "SOLVE_SUDOKU" }, (response) => {
    outputDiv.classList.add("show");
    if (!response || !response.success) {
      outputDiv.innerText = "Unable to solve this Sudoku board. " + (response?.error || "Please refresh the page and try again.");
      return;
    }

    outputDiv.innerHTML = "<strong>Sudoku ready.</strong><br>The solution has been computed for the current board.";
  });
});

document.getElementById("run-queens-solver").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "SOLVE_QUEENS" }, (response) => {
    outputDiv.classList.add("show");
    if (!response || !response.success) {
      outputDiv.innerText = "Unable to solve the Queens board right now. Please refresh the website and try again.";
      return;
    }

    outputDiv.innerHTML = "<strong>Correct queen cells are highlighted.</strong><br>Hurry up and fill them before the time runs out!";
  });
});
