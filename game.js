
var xy = {};

// state "enum"
xy.TileState = {
	EMPTY: {},
	X: {
		cssclass: "x"
	},
	Y: {
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
	var old = this.gridState[r][c];
	this.gridState[r][c] = state;

	// revert state if move is invalid
	if (!this.isValid()) {
		this.gridState[r][c] = old;
		return false;
	}

	return true;
}

xy.Grid.prototype.isValid = function() {
	// add grid state validiation here
	return true;
}

xy.Game = function(parent) {
	this.parent = parent;
	this.grid = new xy.Grid(parent, 4);
}