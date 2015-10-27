
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
}

// get next state
xy.TileState.next = function(state) {
	if (state === this.EMPTY)
		return this.X;
	if (state === this.X)
		return this.Y;

	// default to empty
	return this.EMPTY;
}

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
}

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

}

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
}

xy.Grid.prototype.checkWin = function() {
	return this.checkWinRow() && this.checkWinCol();
}

xy.Grid.prototype.checkWinRow = function() {
	var boardFull = true;

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
					console.log("invalid: 3 in a row");
					return false;
				}
			}
			counts[state.name]++;
		}

		// too many of a letter
		var high = Math.max(counts.x, counts.y);
		if (high > this.size / 2) {
			console.log("invalid: too many of a kind in row");
			return false;
		}

		// if row is full, check for uniqueness
		if (counts.empty == 0) {
			for (var r2 = r+1; r2 < this.size; r2++) {
				// double row
				if (row == this.gridState[r2]) {
					console.log("invalid: double row");
					return false;
				}
			}
		} else {
			boardFull = false;
		}
	}

	return boardFull;
}

xy.Grid.prototype.checkWinCol = function() {
	var boardFull = true;

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
					console.log("invalid: 3 in a col");
					return false;
				}
			}
			counts[state.name]++;
		}

		// too many of a letter
		var high = Math.max(counts.x, counts.y);
		if (high > this.size / 2) {
			console.log("invalid: too many of a kind in col");
			return false;
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
					console.log("invalid: double col");
					return false;
				}
			}
		} else {
			boardFull = false;
		}
	}

	return boardFull;
}

xy.Game = function(parent) {
	this.parent = parent;
	this.grid = new xy.Grid(parent, 6);
}