document.addEventListener('DOMContentLoaded', () => {
    // Get references to the Sudoku grid and buttons
    const gridInputs = document.querySelectorAll('.sudoku-grid input');
    const numberButtons = document.querySelectorAll('.buttons-grid button');
    const undoButton = document.querySelector('#undoButton');
    const eraseButton = document.querySelector('#eraseButton');
    const newGameButton = document.querySelector('.new-game');
    const solutionButton = document.querySelector('.solution');
    const scoreDisplay = document.querySelector('.status-bar span:first-child');
    const timerDisplay = document.querySelector('.status-bar span:last-child');

    let previousValues = []; // To store previous values for Undo functionality
    let score = 0;
    let selectedCell = null; // Variable to keep track of the selected cell

    // Function to handle number button clicks
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedNumber = button.innerText;

            if (selectedCell && selectedCell.classList.contains('empty')) {
                previousValues.push({ cell: selectedCell, value: selectedCell.value }); // Store previous value for undo
                selectedCell.value = selectedNumber; // Set the selected number
                score += 1; // Increase score on successful input
                scoreDisplay.innerText = `Score: ${score}`;
            }
        });
    });

    // Undo functionality
    undoButton.addEventListener('click', () => {
        if (previousValues.length > 0) {
            const lastAction = previousValues.pop(); // Get the last action
            lastAction.cell.value = lastAction.value; // Restore the previous value
            score -= 1; // Decrease score
            scoreDisplay.innerText = `Score: ${score}`;
        }
    });

    // Erase functionality
    eraseButton.addEventListener('click', () => {
        if (selectedCell && selectedCell.classList.contains('empty')) {
            previousValues.push({ cell: selectedCell, value: selectedCell.value }); // Store previous value for undo
            selectedCell.value = ''; // Clear the value
        }
    });

    // New Game functionality (Reset the grid)
    newGameButton.addEventListener('click', () => {
        gridInputs.forEach(input => {
            if (!input.disabled) {
                input.value = ''; // Clear the value of enabled inputs
            }
        });
        previousValues = []; // Reset previous values for undo
        score = 0; // Reset score
        scoreDisplay.innerText = `Score: ${score}`; // Update score display
    });

    solutionButton.addEventListener('click', function() {

        let v = 0;
        let cells = document.querySelectorAll('.sudoku-cell'); // Fetch all the Sudoku cells
        console.log(`Number of cells: ${cells.length}`);

        
       // for (let i = 0; i < 9; i++) {
       //     board[i] = []; // Initialize the row if it doesn't exist
       //     for (let j = 0; j < 9; j++, v++) {
       //         let cellValue = cells[v].value; // Fetch the value from the corresponding cell
       //         board[i][j] = cellValue === '' ? '.' : cellValue; // If empty, use '.' for the solver, otherwise the value
       //     }
       // }
        // Solve the Sudoku puzzle
        SudokuSolver.solveSudoku(board);
        SudokuSolver.printBoard(board);

        // Update the input cells with the solved 
        v = 0;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++, v++) {
                cells[v].value = board[i][j] === '.' ? '' : board[i][j]; // If the cell is empty, keep it blank
            }
        }
    });
    

    // Add click event listeners to the Sudoku cells
    gridInputs.forEach(cell => {
        cell.addEventListener('click', function() {
            // Remove the selected class from any previously selected cell
            if (selectedCell) {
                selectedCell.classList.remove('selected');
            }

            // Set the new selected cell
            selectedCell = this;
            selectedCell.classList.add('selected'); // Add highlight to selected cell
        });

        // Handle keyboard input for each cell
        cell.addEventListener('keydown', function(event) {
            if (selectedCell && selectedCell.classList.contains('empty')) {
                const key = event.key;
                if (!isNaN(key) && key >= 1 && key <= 9) { // Check if the input is a valid number
                    previousValues.push({ cell: selectedCell, value: selectedCell.value }); // Store previous value for undo
                    setTimeout(() => { // Wait for the value to be updated
                        selectedCell.value = key;
                        score += 1;
                        scoreDisplay.innerText = `Score: ${score}`;
                    }, 0);
                }
            }
        });
    });

    // Function to fill the selected cell with the number from the clicked button
    document.querySelectorAll('.buttons-grid .key').forEach(button => {
        button.addEventListener('click', function() {
            if (selectedCell) { // Check if a cell is selected
                previousValues.push({ cell: selectedCell, value: selectedCell.value }); // Store previous value for undo
                selectedCell.value = this.textContent; // Set the cell value to the button's number
                selectedCell.classList.remove('selected'); // Optionally remove highlight after entering the number
                selectedCell = null; // Clear the selected cell after input
            }
        });
    });

    // Add a CSS class to highlight the selected cell
    const style = document.createElement('style');
    style.innerHTML = `
        .selected {
            background-color: lightblue; /* Change this color as desired */
        }
    `;
    document.head.appendChild(style);
});

class SudokuSolver {
    static isSafe(board, row, col, num) {
        // Check the row and column
        for (let i = 0; i < 9; i++) {
            // Check row
            if (board[i][col] == num.toString()) {
                return false;
            }
            // Check column
            if (board[row][i] == num.toString()) {
                return false;
            }
        }
        // Check the 3x3 grid
        let startRow = Math.floor(row / 3) * 3;
        let startCol = Math.floor(col / 3) * 3;

        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if (board[i][j] == num.toString()) {
                    return false;
                }
            }
        }
        return true;
    }

    static helper(board, row, col) {
        // Base case: If the row reaches the end
        if (row == board.length) {
            return true;
        }

        let nrow = 0;
        let ncol = 0;

        // Move to the next column or row
        if (col != board.length - 1) {
            ncol = col + 1;
            nrow = row;
        } else {
            nrow = row + 1;
            ncol = 0;
        }

        // If the current cell is not empty, move to the next cell
        if (board[row][col] != '.') {
            return this.helper(board, nrow, ncol);
        } else {
            // Try placing digits from 1 to 9 in the empty cell
            for (let i = 1; i <= 9; i++) {
                if (this.isSafe(board, row, col, i)) {
                    board[row][col] = i.toString();
                    if (this.helper(board, nrow, ncol)) {
                        return true;
                    }
  
                    board[row][col] = '.'; // Backtrack if the solution is not correct
                }
            }
        }

        return false;
    }

    static solveSudoku(board) {
        this.helper(board, 0, 0);
        console.log("board ; " + board);
        return board;
    }

    static printBoard(board) {
        console.log("result = ");
        for (let i = 0; i < board.length; i++) {
            let row = '';
            for (let j = 0; j < board.length; j++) {
                row += board[i][j] + "  ";
            }
            console.log(row);
        }
    }
}
let board = [
    ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
    ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
    ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
    ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
    ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
    ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
    ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
    ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
    ['.', '.', '.', '.', '8', '.', '.', '7', '9']
];


