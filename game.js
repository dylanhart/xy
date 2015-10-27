
var xy = {};

xy.Grid = function(parent, size) {
	this.grid = document.createElement("div");
	this.grid.className = "grid grid" + size;

	for (var r = 0; r < size; r++) {
		var row = document.createElement("div");
		row.className = "grid-row";

		for (var c = 0; c < size; c++) {
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
	}

	parent.appendChild(this.grid);
}

xy.Grid.prototype.tileClicked = function(event, r, c) {
	// console.log("click @ {r: " + r + ", c: " + c + "}");

	var tile = event.target;

	if (tile.classList.contains("x")) {
		tile.className = "tile y";
	} else if (tile.classList.contains("y")) {
		tile.className = "tile";
	} else {
		tile.className = "tile x";
	}
}

xy.Game = function(parent) {
	this.parent = parent;
	this.grid = new xy.Grid(parent, 4);
}