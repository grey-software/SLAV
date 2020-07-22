import { EMPTY } from "../utils/constants.js";

export default class GridNode {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dist = 0;
    // For weighted edges, we may want to have adj = {(2,3): 3, (2,1): 4}
    this.adj = [];
    this.parent = null;
    this.state = EMPTY;


    this.queueState = false;

    // A Star
    this.nodeCost = 0;
    this.distanceFromStart = 0;
    this.distanceToDest = 0;

  }
}
