import { EMPTY } from "../utils/constants.js";

export default class GridNode {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dist = 0;
    this.adj = [];
    this.parent = null;
    this.state = EMPTY;
    this.queueState = false;
    this.nodeCost = 0;
    this.distanceFromStart = 0;
    this.distanceToDest = 0;

  }
}
