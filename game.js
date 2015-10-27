
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

xy.LineScore = function() {
	this.tooManyAdjacent = false;
	this.tooManyOfType = false;
	this.isDuplicate = false;
	this.isFull = true;
};

xy.LineScore.prototype.isValid = function() {
	return !this.tooManyAdjacent
			&& !this.tooManyOfType
			&& !this.isDuplicate
			&& this.isFull;
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

	this.gridState = [];

	this.grid = document.createElement("div");
	this.grid.className = "grid grid" + size;

	for (var r = 0; r < size; r++) {
		var states = [];

		var row = document.createElement("div");
		row.className = "grid-row";

		for (var c = 0; c < size; c++) {
			states.push(xy.TileState.EMPTY);

			var tile = document.createElement("div");
			tile.className = "tile";

			tile.addEventListener("click", (function(grid, r, c) {
				return function(e) {
					grid.tileClicked(e, r, c);
				};
			})(this, r, c));

			row.appendChild(tile);
		}

		this.grid.appendChild(row);

		this.gridState.push(states);
	}

	parent.appendChild(this.grid);
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
	return this.getScore().isWin();
};

xy.Grid.prototype.getScore = function() {
	var score = new xy.Scoring(this.size);
	this.evalScoreRow(score);
	this.evalScoreCol(score);
	return score;
};

xy.Grid.prototype.evalScoreRow = function(score) {
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
					score.rows[r2].isDuplicate = true
				}
			}
		} else {
			score.rows[r].full = false;
			score.full = false;
		}
	}
};

xy.Grid.prototype.evalScoreCol = function(score) {
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

xy.Grid.prototype.remove = function() {
	this.grid.parentNode.removeChild(this.grid);
};

xy.Game = function(parent, size) {
	this.parent = parent;
	this.grid = new xy.Grid(parent, size);
};

xy.Game.prototype.remove = function() {
	this.grid.remove();
	this.grid = null;
};
