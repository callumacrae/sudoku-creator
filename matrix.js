/**
 * Returns a new Matrix object.
 *
 * @constructor
 * @param array input Array of arrays, or array of strings, to turn in Matrix.
 * @param bool check If false, input will not be checked or parsed - only use
 *     this when you're certain that you're passing it a valid matrix.
 */
function Matrix(input, check) {
	'use strict';
	var i, j, l;

	if (!(this instanceof Matrix)) {
		return new Matrix(input, check);
	}

	if (!(input instanceof Array)) {
		throw new Error('Invalid matrix.');
	}

	if (typeof check !== 'boolean') {
		check = true;
	}

	if (check && input.length && typeof input[0] === 'string') {
		for (i = 0; i < input.length; i += 1) {
			input[i] = input[i].split(/\s+/g);
			if (i === 0) {
				l = input[i].length;
			} else if (input[i].length !== l) {
				throw new Error('Invalid matrix.');
			}

			for (j = 0; j < input[i].length; j += 1) {
				input[i][j] = (input[i][j] === '-' || input[i][j] === null) ? null : Number(input[i][j]);
				if (isNaN(input[i][j])) {
					throw new Error('Invalid matrix.');
				}
			}
		}
	} else if (check && input.length) {
		// Object; check whether everything same length and all ints or null
		for (i = 0; i < input.length; i += 1) {
			if (i === 0) {
				l = input[i].length;
			} else if (input[i].length !== l) {
				throw new Error('Invalid matrix.');
			}

			for (j = 0; j < input[i].length; j += 1) {
				if (typeof input[i][j] !== 'number') {
					input[i][j] = (input[i][j] === '-' || input[i][j] === null) ? null : Number(input[i][j]);
					if (isNaN(input[i][j])) {
						throw new Error('Invalid matrix.');
					}
				}
			}
		}
	}

	this.rows = input.length;
	this.cols = (input.length) ? input[0].length : 0;

	this.array = input;
}

/**
 * Adds two or more matrices together.
 *
 * @param Matrix a The first matrix.
 * @param Matrix b The second matrix.
 * @param ...
 * @returns Matrix The new matrix.
 */
Matrix.add = function () {
	'use strict';
	var end, i, row, col, mat;
	end = Array.prototype.slice.call(arguments, -1)[0].array.slice();
	i = arguments.length - 1;

	while (i--) {
		if (!(arguments[i] instanceof Matrix)) {
			mat = new Matrix(arguments[i]);
		}

		mat = arguments[i].array;

		if (mat.length !== end.length) {
			throw new Error('Matrix is wrong size.');
		}

		for (row = 0; row < mat.length; row += 1) {
			if (mat[row].length !== end[row].length) {
				throw new Error('Matrix is the wrong size.');
			}

			if (i === arguments.length - 2) {
				end[row] = end[row].slice();
			}

			for (col = 0; col < mat[row].length; col += 1) {
				end[row][col] += mat[row][col];
			}
		}
	}

	return new Matrix(end, false);
};

/**
 * Subtracts Matrix b from Matrix a.
 *
 * @param Matrix a Matrix a.
 * @param Matrix b Matrix b.
 * @returns Matrix The new matrix.
 */
Matrix.subtract = function (a, b) {
	'use strict';
	var end, row, col;
	end = a.array.slice();

	if (b.array.length !== end.length) {
		throw new Error('Matrix is wrong size.');
	}

	for (row = 0; row < b.array.length; row += 1) {
		if (b.array[row].length !== end[row].length) {
			throw new Error('Matrix is wrong size.');
		}

		end[row] = end[row].slice();

		for (col = 0; col < b.array[row].length; col += 1) {
			end[row][col] -= b.array[row][col];
		}
	}

	return new Matrix(end, false);
};

/**
 * Multiplies matrix a by b (can be matrix or constant).
 *
 * Remember, ab != ba.
 *
 * @param Matrix a Matrix a.
 * @param mixed b Matrix or constant to multiply a by.
 * @returns Matrix The new matrix.
 */
Matrix.multiply = function (a, b) {
	'use strict';
	var c, end, row, col, i;

	if (typeof a === 'number' && typeof b === 'number') {
		return a * b;
	} else if (typeof a === 'number' && b instanceof Matrix) {
		// Swap them the other way round
		c = b;
		b = a;
		a = c;
	}

	//Allow for multiplication by a constant
	if (typeof b === 'number' && Matrix.isMatrix(a)) {
		end = a.array.slice();
		for (row = 0; row < end.length; row += 1) {
			end[row] = end[row].slice();
			for (col = 0; col < end[row].length; col += 1) {
				end[row][col] *= b;
			}
		}
	} else if (Matrix.isMatrix(a) && Matrix.isMatrix(b)) {
		if (b.array.length !== a.array[0].length) {
			throw new Error('Matrix dimensions do not match.');
		}

		end = [];

		for (row = 0; row < a.array.length; row += 1) {
			end.push([]);
			for (col = 0; col < b.array[row].length; col += 1) {
				end[row][col] = 0;
				for (i = 0; i < a.array[row].length; i += 1) {
					end[row][col] += a.array[row][i] * b.array[i][col];
				}
			}
		}
	} else {
		throw new Error('Invalid arguments.');
	}

	return new Matrix(end, false);
};

/**
 * Returns an identity Matrix (a matrix which, when multiplied with another
 * matrix of the same size, doesn't change the other matrix).
 *
 * @param int width The width and height of the identity matrix.
 */
Matrix.ident = Matrix.identity = function (width) {
	'use strict';
	var i, end, row;

	row = [];
	for (i = 0; i < width; i++) {
		row.push(0);
	}

	end = [];
	for (i = 0; i < width; i++) {
		end.push(row.slice())
		end[i][i] = 1;
	}

	return new Matrix(end);
};

/**
 * Returns the determinant of the Matrix. Currently only works with 2x2 matrices.
 *
 * @param Matrix mat The matrix.
 * @returns int The determinant.
 */
Matrix.det = Matrix.determinant = function (mat) {
	'use strict';
	if (!Matrix.isMatrix(mat)) {
		throw new Error('Invalid Matrix');
	}

	if (mat.rows !== mat.cols) {
		throw new Error('Dimension error: n*n matrices only.');
	}

	// @todo This isn't very mathematical...
	if (mat.rows === 2) {
		return mat.array[0][0] * mat.array[1][1] - mat.array[0][1] * mat.array[1][0];
	} else if (mat.rows === 3) {
		var a = mat.array;
		return a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1])
			- a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0])
			+ a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
	}
};

/**
 * Returns the inverse of the Matrix. Currently only works with 2x2 matrices.
 *
 * @param Matrix mat The matrix.
 * @returns Matrix The new matrix.
 */
Matrix.inverse = function (mat) {
	'use strict';
	if (!Matrix.isMatrix(mat)) {
		throw new Error('Invalid Matrix');
	}

	if (mat.rows === 2 && mat.cols === 2) {
		var det = Matrix.determinant(mat);
		return new Matrix([
			[mat.array[1][1] / det, -mat.array[0][1] / det],
			[-mat.array[1][0] / det, mat.array[0][0] / det]
		]);
	}
};

/**
 * Tests whether a is a Matrix, and validates it. Slightly more complicated than
 * just using a instanceof Matrix, as it tests it to make sure it is valid.
 *
 * @param mixed a Object to test.
 * @returns bool True if a is a Matrix.
 */
Matrix.isMatrix = function (a) {
	'use strict';
	var row, col, l;

	// Validate object itself
	if (!(a instanceof Matrix)) {
		return false;
	}

	// Validate array
	if (!(a.array instanceof Array)) {
		return false;
	}

	for (row = 0; row < a.array.length; row += 1) {
		if (!(a.array[row] instanceof Array)) {
			return false;
		}

		// Check that every row is the same length
		if (row === 0) {
			l = a.array[row].length;
		} else if (a.array[row].length !== l) {
			return false;
		}

		// Check that every value is either an int or null
		for (col = 0; col < a.array[row].length; col += 1) {
			if ((typeof a.array[row][col] !== 'number' || isNaN(a.array[row][col])) && a.array[row][col] !== null) {
				return false;
			}
		}
	}

	return true;
};

/**
 * Adds b to the current matrix. a+b = b+a, so they're both the same function.
 *
 * @param Matrix b The matrix to add to the current matrix.
 * @returns Matrix The new matrix.
 */
Matrix.prototype.addTo = Matrix.prototype.add = function (b) {
	'use strict';
	return Matrix.add(this, b);
};

/**
 * Subtracts b from the current Matrix.
 *
 * @param Matrix b The matrix to subtract.
 * @returns Matrix The new matrix.
 */
Matrix.prototype.subtract = function (b) {
	'use strict';
	return Matrix.subtract(this, b);
};

/**
 * Subtracts the current Matrix from b.
 *
 * @param Matrix b The matrix to subtract from.
 * @returns Matrix The new matrix.
 */
Matrix.prototype.subFrom = function (b) {
	'use strict';
	return Matrix.subtract(b, this);
};

/**
 * Multiplies the current matrix by b. b can be another matrix, or a constant.
 *
 * @param mixed b What to multiply b by - can be Matrix or number.
 * @returns Matrix The new matrix.
 */
Matrix.prototype.multBy = function (b) {
	'use strict';
	return Matrix.multiply(this, b);
};

/**
 * Returns the determinant of the current Matrix.
 *
 * @returns int The determinant.
 */
Matrix.prototype.det = Matrix.prototype.determinant = function () {
	'use strict';
	return Matrix.determinant(this);
};

/**
 * Returns the inverse of the current matrix.
 *
 * @returns Matrix The new matrix.
 */
Matrix.prototype.inverse = function () {
	'use strict';
	return Matrix.inverse(this);
};


/**
 * Converts Matrix object to string. Shouldn't really be called manually.
 *
 * @param string join What to join the rows with (default: \t).
 * @param string joinline What to join new lines with (default: \n) (eg <br />).
 */
Matrix.prototype.toString = function (join, joinline) {
	'use strict';
	var e = '',
		i, l = this.array.length;

	if (typeof join !== 'string') {
		join = '\t';
	}
	if (typeof joinline !== 'string') {
		joinline = '\n';
	}

	for (i = 0; i < l; i += 1) {
		e += this.array[i].join(join) + ((i !== l - 1) ? joinline : '');
	}

	return e;
};

/**
 * Clone a Matrix.
 */
Matrix.prototype.clone = function () {
	'use strict';
	var a = [], i;
	for (i = 0; i < this.array.length; i++) {
		a.push(this.array[i].slice());
	}
	return new Matrix(a);
};
