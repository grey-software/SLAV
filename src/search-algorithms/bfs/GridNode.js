module.exports = class GridNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dist = 1000;
        this.adj = [];
        this.color = "white";
    }
}