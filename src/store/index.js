import Vue from "vue";
import Vuex from "vuex";
import GridNode from "../search-algorithms/models/GridNode";
import {
  EMPTY,
  VISITED,
  EXPLORED,
  WALL,
  PATH
} from "../search-algorithms/utils/constants.js";

import Queue from "../search-algorithms/utils/Queue";
import PriorityQueue from "../search-algorithms/utils/PriorityQueue";

Vue.use(Vuex);

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getPath = (iterNode, startNode) => {
  //Iterate back up the parents until you find the null parent
  var path = [];
  while (!(iterNode.x == startNode.x && iterNode.y == startNode.y)) {
    path.push(iterNode);
    iterNode = iterNode.parent;
  }
  return path;
};

const generateGraph = (rows, cols) => {
  var cell;
  const graph = {};
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      cell = `(${i},${j})`;
      let currNode = new GridNode(i, j);
      graph[cell] = currNode;
    }
  }

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      cell = `(${i},${j})`;
      let currNode = graph[cell];
      addNeighbours(i, j, currNode, graph, rows, cols);
    }
  }
  return graph;
};

const addNeighbours = (row, col, currNode, graph, rows, cols) => {
  var adjNode;
  var neighbourCoors = `(${row + 1},${col})`;
  if (row < cols - 1) {
    adjNode = graph[neighbourCoors];
    if (adjNode != null) {
      currNode.adj.push(neighbourCoors);
    }
  }

  neighbourCoors = `(${row},${col + 1})`;
  if (col < rows - 1) {
    adjNode = graph[neighbourCoors];
    if (adjNode != null) {
      currNode.adj.push(neighbourCoors);
    }
  }

  neighbourCoors = `(${row - 1},${col})`;
  if (row > 0) {
    adjNode = graph[neighbourCoors];
    if (adjNode != null) {
      currNode.adj.push(neighbourCoors);
    }
  }

  neighbourCoors = `(${row},${col - 1})`;
  if (col > 0) {
    adjNode = graph[neighbourCoors];
    if (adjNode != null) {
      currNode.adj.push(neighbourCoors);
    }
  }
  //console.log(currNode.adj);
};

export default new Vuex.Store({
  state: {
    isAlgorithmRunning: false,
    isAlgorithmFinished: false,
    selectionState: "pick-start",
    graph: {},
    vizSpeed: 1,
    currentAlgorithm: "search/a-star",
    path: [],
    delayFactor: 200,
  },
  mutations: {
    setIsAlgorithmFinished(state, isAlgorithmFinished) {
      state.isAlgorithmFinished = isAlgorithmFinished;
    },

    setIsAlgorithmRunning(state, boolValue) {
      state.isAlgorithmRunning = boolValue;
    },

    setSelectionState(state, selectionState) {
      state.selectionState = selectionState;
    },
    setGraph(state, graph) {
      state.graph = graph;
    },
    setVizSpeed(state, speed) {
      state.vizSpeed = speed;
    },
    setCurrentAlgorithm(state, newAlgorithm) {
      state.currentAlgorithm = newAlgorithm;
    },
    setPath(state, path) {
      state.path = path;
    },
  },
  actions: {
    createGraph(context, payload) {
      const graph = generateGraph(payload.rows, payload.cols);
      context.commit("setGraph", graph);
    },
    async runAlgorithm(context, payload) {
      const algorithm = payload.algorithm;
      // const startNode =
      //   context.state.graph[
      //     `(${context.state.startX},${context.state.startY})`
      //   ];
      // const endNode =
      //   context.state.graph[`(${context.state.destX},${context.state.destY})`];
      context.commit("setIsAlgorithmRunning", true);
      console.log(`Running algorithm: ${algorithm}`);
      if (algorithm == "search/breadth-first") {
        const bfsPath = [];
        context.commit("setPath", bfsPath);
        // this.path = await this.bfs(this.graph, startNode, endNode);
      } else if (algorithm == "search/depth-first") {
        const dfsPath = [];
        context.commit("setPath", dfsPath);
        // this.path = await this.dfs(this.graph, startNode, endNode);
      } else if (algorithm == "search/a-star") {
        const aStarPath = [];
        context.commit("setPath", aStarPath);
        // this.path = await this.aStar(this.graph, startNode, endNode);
      } else if (algorithm == "search/best-first") {
        const bestFirstPath = [];
        context.commit("setPath", bestFirstPath);
        // this.path = await this.best_first(this.graph, startNode, endNode);
      }
      for (let i = context.state.path.length - 1; i >= 0; i--) {
        context.state.path[i].state = PATH;
        await sleep(50);
      }
      context.commit("setIsAlgorithmRunning", true);
      context.commit("setIsAlgorithmFinished", true);
      // Convert to a mutation
      context.commit("setSelectionState", "pick-start");
    },
    async bfs(context) {
      const graph = context.state.graph;
      const startNode =
        graph[`(${context.state.startX},${context.state.startY})`];
      const endNode = graph[`(${context.state.destX},${context.state.destY})`];
      //const visited = [];
      const queue = new Queue();
      startNode.dist = 0;
      queue.enqueue(startNode);
      while (!queue.isEmpty() && context.state.isAlgorithmRunning) {
        console.log(context.state.isAlgorithmRunning);
        const currentNode = queue.dequeue();
        await sleep(context.state.delayFactor / context.state.vizSpeed);
        if (currentNode.state != WALL) {
          //visited.push(currentNode);
          if (context.state.isAlgorithmRunning) {
            currentNode.state = VISITED;
          }
        }
        var iterNode = currentNode;
        if (iterNode.x == endNode.x && iterNode.y == endNode.y) {
          return getPath(iterNode, startNode);
        }
        //View node's color should observe model node's color
        for (const neighbourCoors of currentNode.adj) {
          const neighbour = graph[neighbourCoors];
          //Only interact with non-wall nodes
          if (neighbour.state != WALL) {
            //Visit
            if (neighbour.parent == null) {
              neighbour.parent = currentNode;
            }
            if (neighbour.state == EMPTY) {
              if (context.state.isAlgorithmRunning) {
                neighbour.state = VISITED;
              }
              neighbour.dist = currentNode.dist + 1;
              queue.enqueue(neighbour);
            }
          }
        }
        currentNode.state = EXPLORED;
      }
    },

    async aStar(graph, startNode, endNode) {
      const nodesToExplore = [];
      var exploredNodes = [];
      var currentNodeIndex;
      nodesToExplore.push(startNode);
      var currentNode;
      var higherPriorityChildExists;
      var childExplored;
      while (nodesToExplore.length != 0 && this.isAlgorithmRunning) {
        // Remove element with least f-value
        currentNodeIndex = this.findMinNodeIndex(nodesToExplore);
        currentNode = nodesToExplore[currentNodeIndex];
        exploredNodes.push(currentNode);
        nodesToExplore.splice(currentNodeIndex);
        if (this.isAlgorithmRunning) {
          currentNode.state = VISITED;
        }
        await sleep(this.delayFactor / this.vizSpeed);
        //Check if we're done
        if (currentNode.x == endNode.x && currentNode.y == endNode.y) {
          return this.getPath(currentNode, startNode);
        }
        for (let neighbourCoors of currentNode.adj) {
          const neighbour = this.graph[neighbourCoors];
          if (neighbour.state == WALL) {
            console.log("wall");
            continue;
          }
          if (neighbour.parent == null) {
            neighbour.parent = currentNode;
          }
          higherPriorityChildExists = false;
          childExplored = false;
          neighbour.distanceFromStart = currentNode.distanceFromStart + 1;
          neighbour.distanceToDest =
            Math.abs(neighbour.x - endNode.x) +
            Math.abs(neighbour.y - endNode.y);
          neighbour.nodeCost =
            neighbour.distanceFromStart + neighbour.distanceToDest;
          for (let closedChild of exploredNodes) {
            if (closedChild.x == neighbour.x && closedChild.y == neighbour.y) {
              childExplored = true;
            }
          }
          for (let openChild of nodesToExplore) {
            if (openChild.x == neighbour.x && openChild.y == neighbour.y) {
              if (neighbour.distanceFromStart > openChild.distanceFromStart) {
                higherPriorityChildExists = true;
              }
            }
          }
          if (!higherPriorityChildExists && !childExplored) {
            if (this.isAlgorithmRunning) {
              neighbour.state = VISITED;
            }
            nodesToExplore.push(neighbour);
          }
        }
        currentNode.state = EXPLORED;
      }
    },
    async best_first(graph, startNode, endNode) {
      var pQueue = new PriorityQueue();
      pQueue.enqueue(startNode);
      while (!pQueue.isEmpty()) {
        var min = pQueue.dequeue().element;
        if (min.x == endNode.x && min.y == endNode.y) {
          return getPath(min, startNode);
        } else {
          for (var neighbourCoors of min.adj) {
            const neighbour = this.graph[neighbourCoors];
            if (neighbour.parent == null) {
              neighbour.parent = min;
            }
            if (neighbour.state == EMPTY) {
              neighbour.state = VISITED;
              await sleep(this.delayFactor / this.vizSpeed);
              pQueue.enqueue(neighbour);
            }
          }
          min.state = EXPLORED;
        }
      }
    },
    findMinNodeIndex(lst) {
      var minValue = Infinity;
      var count = 0;
      var index = 0;
      for (var node of lst) {
        if (node.nodeCost < minValue) {
          minValue = node.nodeCost;
          index = count;
        }
        count += 1;
      }
      return index;
    },
  },

  getters: {
    isAlgorithmRunning: (state) => state.isAlgorithmRunning,
  },
  modules: {},
});
