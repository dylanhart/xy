
var xy = {};

// state "enum"
xy.TileState = {
	EMPTY: {
		name: "empty"
	},
	X: {
		name: "x",
		cssclass: "x"
	},
	Y: {
		name: "y",
		cssclass: "y"
	}
};

// get next state
xy.TileState.next = function(state) {
	if (state === this.EMPTY)
		return this.X;
	if (state === this.X)
		return this.Y;

	// default to empty
	return this.EMPTY;
};

xy.TileState.opposite = function(state) {
	if (state === this.X)
		return this.Y;
	if (state === this.Y)
		return this.X;

	return this.EMPTY;
}

xy.LineScore = function() {
	this.tooManyAdjacent = false;
	this.tooManyOfType = false;
	this.isDuplicate = false;
	this.isFull = true;
};

xy.LineScore.prototype.hasError = function() {
	return this.tooManyAdjacent || this.tooManyOfType || this.isDuplicate;
}

xy.LineScore.prototype.isValid = function() {
	return !this.hasError() && this.isFull;
};

xy.Scoring = function(size) {
	this.rows = [];
	this.cols = [];

	for (var i = 0; i < size; i++) {
		this.rows.push(new xy.LineScore());
		this.cols.push(new xy.LineScore());
	}

	this.full = true;
};

xy.Scoring.prototype.hasError = function() {
	for (var r = 0; r < this.rows.length; r++) {
		if (this.rows[r].hasError())
			return true;
	}

	for (var c = 0; c < this.cols.length; c++) {
		if (this.cols[c].hasError())
			return true;
	}

	return false;
};

xy.Scoring.prototype.isWin = function() {
	if (!this.full) return false;

	for (var r = 0; r < this.rows.length; r++) {
		if (!this.rows[r].isValid())
			return false;
	}

	for (var c = 0; c < this.cols.length; c++) {
		if (!this.cols[c].isValid())
			return false;
	}

	return true;
};

xy.Grid = function(parent, size) {
	if (size % 2 != 0)
		throw new Error("grid size must be even");

	this.size = size;
	this.hasWon = false;

	this.gridState = new xy.Generator(30).generate(size);

	this.grid = document.createElement("div");
	this.grid.className = "grid grid" + size;

	for (var r = 0; r < size; r++) {
		var row = document.createElement("div");
		row.className = "grid-row";

		for (var c = 0; c < size; c++) {
			var tile = document.createElement("div");

			if (this.gridState[r][c].cssclass) {
				tile.className = "tile " + this.gridState[r][c].cssclass;
			} else {
				tile.className = "tile";
			}

			tile.addEventListener("click", (function(grid, r, c) {
				return function(e) {
					grid.tileClicked(e, r, c);
				};
			})(this, r, c));

			row.appendChild(tile);
		}

		this.grid.appendChild(row);
	}

	parent.appendChild(this.grid);
};

xy.Grid.prototype.remove = function() {
	this.grid.parentNode.removeChild(this.grid);
};

xy.Grid.prototype.tileClicked = function(event, r, c) {
	// console.log("click @ {r: " + r + ", c: " + c + "}");

	var tile = event.target;

	var newState = xy.TileState.next(this.gridState[r][c]);

	// try to set tile
	if (this.trySet(r, c, newState)) {
		if (newState.cssclass) {
			tile.className = "tile " + newState.cssclass;
		} else {
			tile.className = "tile";
		}

		if (this.hasWon)
			alert("You won!");
	}

};

xy.Grid.prototype.trySet = function(r, c, state) {
	if (!this.hasWon) {
		this.gridState[r][c] = state;

		if (this.checkWin()) {
			this.hasWon = true;
		}
		return true;
	} else {
		return false;
	}
};

xy.Grid.prototype.checkWin = function() {
	return new xy.Validator(this.gridState).getScore().isWin();
};

xy.Validator = function(gridState) {
	this.gridState = gridState;
	this.size = this.gridState.length;
}

xy.Validator.prototype.getScore = function() {
	var score = new xy.Scoring(this.size);
	this.evalScoreRow(score);
	this.evalScoreCol(score);
	return score;
};

xy.Validator.prototype.evalScoreRow = function(score) {
	for (var r = 0; r < this.size; r++) {
		var row = this.gridState[r];

		var last = xy.TileState.EMPTY;
		var matches = 0;
		var counts = {
			empty: 0,
			x: 0,
			y: 0
		};

		for (var c = 0; c < this.size; c++) {
			var state = row[c];

			if (state != last) {
				last = state;
				matches = 0;
			} else {
				matches++;
				// 3 in a row
				if (matches >= 2 && state != xy.TileState.EMPTY) {
					score.rows[r].tooManyAdjacent = true;
				}
			}
			counts[state.name]++;
		}

		// too many of a letter
		var high = Math.max(counts.x, counts.y);
		if (high > this.size / 2) {
			score.rows[r].tooManyOfType = true;
		}

		// if row is full, check for uniqueness
		if (counts.empty == 0) {
			for (var r2 = r+1; r2 < this.size; r2++) {
				// double row
				if (row == this.gridState[r2]) {
					score.rows[r].isDuplicate = true;
					score.rows[r2].isDuplicate = true;
				}
			}
		} else {
			score.rows[r].full = false;
			score.full = false;
		}
	}
};

xy.Validator.prototype.evalScoreCol = function(score) {
	for (var c = 0; c < this.size; c++) {
		var last = xy.TileState.EMPTY;
		var matches = 0;
		var counts = {
			empty: 0,
			x: 0,
			y: 0
		};

		for (var r = 0; r < this.size; r++) {
			var state = this.gridState[r][c];

			if (state != last) {
				last = state;
				matches = 0;
			} else {
				matches++;
				// 3 in a row
				if (matches >= 2 && state != xy.TileState.EMPTY) {
					score.cols[c].tooManyAdjacent = true;
				}
			}
			counts[state.name]++;
		}

		// too many of a letter
		var high = Math.max(counts.x, counts.y);
		if (high > this.size / 2) {
			score.cols[c].tooManyOfType = true;
		}

		// if col is full, check for uniqueness
		if (counts.empty == 0) {
			for (var c2 = c+1; c2 < this.size; c2++) {
				var diff = false;
				for (var r2 = 0; r2 < this.size; r2++) {
					if (this.gridState[r2][c] != this.gridState[r2][c2]) {
						// we're different
						diff = true;
						break;
					}
				}
				if (!diff) {
					score.cols[c].isDuplicate = true;
					score.cols[c2].isDuplicate = true;
				}
			}
		} else {
			score.cols[c].full = false;
			score.full = false;
		}
	}
};

xy.Generator = function(difficulty) {
	this.difficulty = difficulty;
};

xy.Generator.prototype.createEmpty = function(size) {
	var puzzle = [];
	for (var r = 0; r < size; r++) {
		puzzle.push(this.getEmptyLine(size));
	}
	return puzzle;
};

xy.Generator.prototype.getPermutedLine = function(size) {
	var line = Array(size);
	var last = xy.TileState.EMPTY;
	var picks = [
		xy.TileState.X,
		xy.TileState.Y
	];
	var matches = 0;
	var counts = {
		x: 0,
		y: 0
	};
	for (var i = 0; i < size; i++) {
		if (matches == 1) {
			matches = 0;
			line[i] = xy.TileState.opposite(last);
			last = line[i];
			counts[last.name]++;
		} else if (Math.max(counts.x, counts.y) == size/2) {
			var state = counts.x < counts.y ? xy.TileState.X : xy.TileState.Y;
			while (i < size)
				line[i++] = state;
			break;
		} else {
			var state = picks[Math.round(Math.random())];
			if (state == last) {
				matches++;
			} else {
				last = state;
			}
			line[i] = state;
			counts[state.name]++;
		}
	}
	return line;
};

xy.Generator.prototype.getEmptyLine = function(size) {
	var line = [];
	for (var i = 0; i < size; i++)
		line.push(xy.TileState.EMPTY);
	return line;
};

xy.Generator.prototype.generate = function(size) {
	var puzzle = this.createEmpty(size);
	var picks = [
		xy.TileState.X,
		xy.TileState.Y
	];
	var places = [];
	for (var r = 0; r < size; r++)
		for (var c = 0; c < size; c++)
			places.push({r:r,c:c});

	xy.util.shuffle(places);

	var n = size*size * (this.difficulty / 100.0);
	for (var i = 0; i < n;) {
		var pos = places.pop();
		var s = picks[Math.round(Math.random())];

		puzzle[pos.r][pos.c] = s;

		if (new xy.Validator(puzzle).getScore().hasError()) {
			puzzle[pos.r][pos.c] = xy.TileState.EMPTY;
		} else {
			i++;
		}
	}

	return puzzle;
};

xy.Game = function(parent, size) {
	this.parent = parent;
	this.grid = new xy.Grid(parent, size);
};

xy.Game.prototype.remove = function() {
	this.grid.remove();
	this.grid = null;
};

xy.util = {};
xy.util.shuffle = function(arr) {
	for (var i = arr.length - 1; i > 0; i--) {
		var p = Math.floor(Math.random()*i);
		var t = arr[i];
		arr[i] = arr[p];
		arr[p] = t;
	}
};

xy.util.puzzleToString = function(puzzle) {
	return puzzle.map(function(r) {
		return r.map(function(t) {
			return t.name;
		}).join(" ");
	}).join("\n");
};
