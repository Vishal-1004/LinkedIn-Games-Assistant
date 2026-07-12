// tango_sovler.js

/**
 * Simple Tango solver helper.
 *
 * Input: array of values where each entry is "Sun", "Moon", or null.
 * Output: { success: boolean, solution: Array }
 *
 * This basic implementation fills any empty cells deterministically with "Sun".
 * Replace with more advanced logic if you have the Tango rules.
 */
function getSolvedTango(boardArray) {
  if (!Array.isArray(boardArray) || boardArray.length === 0) {
    return { success: false, error: "Invalid board data or empty board." };
  }

  const normalized = boardArray.map((v) => {
    if (v === "Sun" || v === "Moon") return v;
    return null;
  });

  const isCompletelyEmpty = normalized.every((c) => c === null);
  if (isCompletelyEmpty) {
    return { success: false, error: "Board is completely empty. Please open a Tango game." };
  }

  // Simple deterministic fill: replace nulls with "Sun".
  const solution = normalized.map((c, i) => (c === null ? "Sun" : c));

  return { success: true, solution };
}
