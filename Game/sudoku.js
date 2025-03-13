// Get DOM elements
const grid = document.getElementById("sudoku-grid");
const solveBtn = document.querySelector(".solve-btn");
const checkBtn = document.querySelector(".check-btn");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");

// Global state
let board = Array(9).fill().map(() => Array(9).fill(0));
let solution = Array(9).fill().map(() => Array(9).fill(0));
let hasChecked = false; // Track if "Check" has been clicked

// Generate the 9x9 grid
function generateGrid() {
    grid.innerHTML = "";
    for (let i = 0; i < 81; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.addEventListener("input", (e) => {
            if (!/^[1-9]?$/.test(e.target.value)) e.target.value = "";
            updateBoard();
            hasChecked = false; // Reset check state on new input
            updateUI(); // Update UI to reset colors
        });
        grid.appendChild(input);
    }
}

// Generate a random solved Sudoku board
function generateRandomBoard() {
    board = Array(9).fill().map(() => Array(9).fill(0)); // Reset board
    for (let i = 0; i < 9; i += 3) {
        fillSubgrid(i, i);
    }
    solveSudoku();
    solution = board.map(row => [...row]); // Deep copy to solution
    return board;
}

// Fill a 3x3 subgrid with random numbers
function fillSubgrid(row, col) {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(numbers);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[row + i][col + j] = numbers[i * 3 + j];
        }
    }
}

// Shuffle array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Remove numbers based on difficulty
function removeNumbers(difficulty) {
    const cellsToRemove = {
        easy: 40,   // 41 clues
        medium: 50, // 31 clues
        hard: 56    // 25 clues
    };
    const count = cellsToRemove[difficulty];
    let removed = 0;
    let cellsToClear = new Set(); // Track unique cells to avoid overlap

    while (removed < count) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        const cellKey = `${row},${col}`;
        if (board[row][col] !== 0 && !cellsToClear.has(cellKey)) {
            board[row][col] = 0;
            cellsToClear.add(cellKey);
            removed++;
        }
    }

    // Log the number of clues to verify
    const clues = board.flat().filter(num => num !== 0).length;
    console.log(`Difficulty: ${difficulty}, Clues left: ${clues}`);
}

// Populate the board dynamically
function populateBoard(difficulty) {
    generateRandomBoard();
    removeNumbers(difficulty);
    hasChecked = false; // Reset check state on new puzzle
    updateUI(true);
}

// Sync UI with board
function updateBoard() {
    const inputs = grid.querySelectorAll("input");
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            board[i][j] = inputs[i * 9 + j].value ? parseInt(inputs[i * 9 + j].value) : 0;
        }
    }
}

// Check if a move is valid (for solver)
function isValidMove(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) return false;
    }
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

// Find an empty cell
function findEmptyCell(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return [i, j];
        }
    }
    return null;
}

// Solve the Sudoku
function solveSudoku() {
    const empty = findEmptyCell(board);
    if (!empty) return true;

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
        if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku()) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

// Check user-entered numbers against the solution
function checkSolution() {
    updateBoard();
    const inputs = grid.querySelectorAll("input");
    let hasErrors = false;
    let checkedAny = false;

    hasChecked = true; // Mark that we've checked

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const input = inputs[i * 9 + j];
            const userValue = board[i][j];
            const correctValue = solution[i][j];

            // Reset previous check styles
            input.classList.remove("correct", "incorrect");

            // Check any user-entered number in editable cells
            if (!input.readOnly && userValue !== 0) {
                checkedAny = true;
                if (userValue === correctValue) {
                    input.classList.add("correct");
                    input.style.color = "#27ae60"; // Green for correct
                } else {
                    input.classList.add("incorrect");
                    input.style.color = "#dc3545"; // Red for incorrect
                    hasErrors = true;
                }
            } else {
                input.style.color = "#000"; // Reset to black if not checked or readonly
            }
        }
    }

    if (!checkedAny) {
        alert("Enter some numbers to check!");
    } else {
        alert(hasErrors ? "Some numbers are incorrect!" : "All checked numbers are correct!");
    }
}

// Update UI
function updateUI(isInitial = false) {
    const inputs = grid.querySelectorAll("input");
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const input = inputs[i * 9 + j];
            const value = board[i][j];
            input.value = value ? value : "";

            if (isInitial) {
                input.readOnly = value !== 0;
                input.style.backgroundColor = value !== 0 ? "#e0e0e0" : "#fff";
                input.style.color = "#000"; // Always black initially
                input.classList.remove("correct", "incorrect");
            } else {
                // Only apply colors if "Check" has been clicked
                if (hasChecked && !input.readOnly && value !== 0) {
                    if (input.classList.contains("correct")) {
                        input.style.color = "#27ae60";
                    } else if (input.classList.contains("incorrect")) {
                        input.style.color = "#dc3545";
                    } else {
                        input.style.color = "#000";
                    }
                } else {
                    input.style.color = "#000"; // Default to black
                }
            }
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    difficultyBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const difficulty = btn.getAttribute("data-difficulty");
            populateBoard(difficulty);
        });
    });

    solveBtn.addEventListener("click", () => {
        updateBoard();
        if (solveSudoku()) {
            hasChecked = false; // Reset check state after solving
            updateUI();
            alert("Sudoku Solved!");
        } else {
            alert("No solution exists!");
        }
    });

    checkBtn.addEventListener("click", checkSolution);
}

// Initialize
generateGrid();
setupEventListeners();