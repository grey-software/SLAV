import { EMPTY } from "../utils/constants.js";

export default class GridNode {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dist = 1000;
    this.adj = [];
    this.parent = null;
    this.state = EMPTY;
  }
}
