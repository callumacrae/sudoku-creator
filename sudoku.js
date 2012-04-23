/**
 * Dumb function to say whether sudoku is solvable.
 *
 * It will return false for some possible sudokus, but never true
 * for impossible sudokus.
 *
 * @param Matrix sudoku Sudoku in the form of a Matrix
 */
function sudokuIsSolvable(sudoku) {
	var i, j, k, l, m, nums, solved, unsolved, col, row;

	while (true) {	
		solved = unsolved = 0;
		
		for (i = 0; i < 9; i++) {
			for (j = 0; j < 9; j++) {
			
				// If not already solved, attempt to solve it
				if (sudoku.array[i][j] === null) {
					nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
					
					// Remove numbers found in row and columns
					for (k = 0; k < 9; k++) {
						if (nums.indexOf(sudoku.array[i][k]) !== -1) {
							nums.splice(nums.indexOf(sudoku.array[i][k]), 1);
						}
						if (nums.indexOf(sudoku.array[k][j]) !== -1) {
							nums.splice(nums.indexOf(sudoku.array[k][j]), 1);
						}
					}
	
					// Remove numbers found in nearest grid of nine
					col = (j < 3) ? 0 : (j < 6) ?  3 : 6;
					row = (i < 3) ? 0 : (i < 6) ?  3 : 6;
	
					for (l = row; l < row + 3; l++) {
						for (m = col; m < row + 3; m++) {
							if (nums.indexOf(sudoku.array[m][l]) !== -1) {
								nums.splice(nums.indexOf(sudoku.array[m][l]), 1);
							}
						}
					}
	
					if (nums.length === 0) {
						return false;
					} else if (nums.length === 1) {
						sudoku.array[i][j] = nums[0];
						solved++;
					} else if (nums.length === 2 && randomise) {
						sudoku.array[i][j] = nums[Math.round(Math.random())];
						solved++
					} else {
						unsolved++;
					}
				}
			}
		}
		
		if (unsolved === 0) {
			return true;
		} else if (solved === 0) {
			return false;
		}
	}
}

/**
 * Generate and return a solvable sudoku.
 *
 * @param int blank Number of blank squares to have.
 */
function getSudoku(blank) {
	var sudoku,
		real_blank = 0,
		i = 0,
		tmp_num, row, col;
	
	// Loop here, as it only returns a valid sudoku occasionally
	while (!(sudoku = (function () {
		var arr, line, sudoku;
		var i, j, k, l, m, nums

		// Initialise empty sudoku
		line = Array(10).join('- ').slice(0, -1);
		for (arr = [], i = 0; i < 9; i++) {
			arr.push(line);
		}
		sudoku = new Matrix(arr);
	
		// Populate the empty sudoku
		for (i = 0; i < 9; i++) {
			for (j = 0; j < 9; j++) {
				nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	
				// Remove numbers found in row and columns
				for (k = 0; k < 9; k++) {
					if (nums.indexOf(sudoku.array[i][k]) !== -1) {
						nums.splice(nums.indexOf(sudoku.array[i][k]), 1);
					}
					if (nums.indexOf(sudoku.array[k][j]) !== -1) {
						nums.splice(nums.indexOf(sudoku.array[k][j]), 1);
					}
				}
	
				// Remove numbers found in nearest grid of nine
				col = (i < 3) ? 0 : (i < 6) ?  3 : 6;
				row = (j < 3) ? 0 : (j < 6) ?  3 : 6;

				for (l = row; l < row + 3; l++) {
					for (m = col; m < row + 3; m++) {
						if (nums.indexOf(sudoku.array[m][l]) !== -1) {
							nums.splice(nums.indexOf(sudoku.array[m][l]), 1);
						}
					}
				}
			
				// If nums.length === 0, then the Sudoku will be impossible
				if (nums.length === 0) {
					return false;
				}
	
				// Use random number out of remaining
				sudoku.array[i][j] = nums[Math.floor(Math.random() * nums.length)];
			}
		}
		return sudoku; // This is a full, solved sudoku
	})()));
	
	if (typeof blank !== 'number') {
		blank = 70;
	}
	
	// Remove numbers until the specified amount is removed (default 70)
	while (real_blank < blank && i++ < 5000) {
		row = Math.floor(Math.random() * 9);
		col = Math.floor(Math.random() * 9);
		
		tmp_num = sudoku.array[row][col];
		sudoku.array[row][col] = null;
		
		// If it doesn't work, put it back
		if (sudokuIsSolvable(sudoku.clone())) {
			real_blank++;
		} else {
			sudoku.array[row][col] = tmp_num;
		}
	}
	
	return sudoku;
}

/**
 * Return correctly formatted sudoku.
 *
 * This destroys the sudoku.
 */
function formatSudoku(sudoku) {
	var e = '', i, j;
	
	for (i = 0; i < 9; i++) {
		for (j = 0; j < 9; j++) {
			if (sudoku.array[i][j] === null) {
				sudoku.array[i][j] = '-';
			}
		}
		e += sudoku.array[i].join(' ') + '\n';
	}
	
	return e.slice(0, -1); // Remove trailing new line
}