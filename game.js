
var xy = {};

xy.Grid = function(parent, size) {
	this.grid = document.createElement("div");
	this.grid.className = "grid grid" + size;

	for (var r = 0; r < size; r++) {
		var row = document.createElement("div");
		row.className = "grid-row";

		for (var t = 0; t < size; t++) {
			var tile = document.createElement("div");
			tile.className = "tile";

			row.appendChild(tile);
		}

		this.grid.appendChild(row);
	}

	parent.appendChild(this.grid);
}

xy.Game = function(parent) {
	this.parent = parent;
	this.grid = new xy.Grid(parent, 4);
}