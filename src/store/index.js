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

/*

What would a custom algorithm's config look like?

graphComponent: {
  type: Component
  default: DefaultGraph
},
gridNodeModel: {
  type: GridNode,
  default: GridNode
},
- Add a constant to the GridCellState enum

*/

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
    startX: -1,
    startY: -1,
    destX: -1,
    destY: -1,
    rowCount: 23,
    columnCount: 70
  },
  mutations: {
    setIsAlgorithmFinished(state, isAlgorithmFinished) {
      state.isAlgorithmFinished = isAlgorithmFinished;
      if(isAlgorithmFinished){
        state.selectionState = "Finished";

      }
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
    setStartCoors(state, coors) {
      state.startX = coors.x,
        state.startY = coors.y
    },
    setDestCoors(state, coors) {
      state.destX = coors.x;
      state.destY = coors.y;
    },
    setCurrCoors(state, coors) {
      state.currX = coors.x;
      state.currY = coors.y;
    },
    resetWallCoordinates(state) {
      state.wallCoordinates = new Set();
    },
    resetGrid(state) {
      state.graph = {}
      state.startX = -1
      state.startY = -1;
      state.destX = -1;
      state.destY = -1;
      state.currX = -1;
      state.currY = -1;
      state.isAlgorithmFinished = false;
      state.isAlgorithmRunning = false;
      state.wallCoordinates = new Set();
      state.path = [];
      state.selectionState = "pick-start"
      state.currentAlgorithmStruct = null;
    },

    limitedResetGrid(state){
      state.graph = {}
      state.currX = -1;
      state.currY = -1;
      state.isAlgorithmRunning = false;
      state.path = [];
      state.currentAlgorithmStruct = null;



    },
    setGridNodeState(state, payload) {
      //console.log(`(${payload.x},${payload.y})`)
      //console.log(state.graph[`(${payload.x},${payload.y})`])
      state.graph[`(${payload.x},${payload.y})`].state = payload.nodeState;
    },
    addWall(state, wallCoordinate) {
      state.graph[wallCoordinate].state = WALL;
    },

    onVizClicked() {
      this.runAlgorithm({ algorithm: this.currentAlgorithm });
    },

  },
  actions: {
    reset(context) {

      context.commit('resetGrid')
      context.dispatch('createGraph', { rows: context.state.rowCount, cols: context.state.columnCount })
    },

    limitedReset(context){
      context.commit('limitedResetGrid');
      context.dispatch('createGraph', { rows: context.state.rowCount, cols: context.state.columnCount })


    },
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
        context.dispatch("bfs")
      } else if (algorithm == "search/depth-first") {
        const dfsPath = [];
        context.commit("setPath", dfsPath);
      } else if (algorithm == "search/a-star") {
        context.dispatch("aStar");
        //context.commit("setPath", aStarPath);
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
      //context.commit("setSelectionState", "pick-start");
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
      console.log(`This is our start Node x value ${startNode.x}`);
      startNode.queueState = true;
      while (!queue.isEmpty() && context.state.isAlgorithmRunning) {
        const currentNode = queue.dequeue();
        console.log(`This is our current node x value ${currentNode.x}`);
        currentNode.queueState = false;
        await sleep(context.state.delayFactor / context.state.vizSpeed);
        if (currentNode.state != WALL) {
          //visited.push(currentNode);
          if (context.state.isAlgorithmRunning) {
            currentNode.state = VISITED;
          }
        }
        var iterNode = currentNode;
        if (iterNode.x == endNode.x && iterNode.y == endNode.y) {
          const path = getPath(iterNode, startNode);
          context.commit("setPath", path);
          for (let i = path.length - 1; i >= 0; i--) {
            context.commit('setGridNodeState', {
              x: path[i].x, y: path[i].y, nodeState: PATH
            })
            await sleep(50);
          }
          return
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
              neighbour.queueState = true;

            }
          }
        }
        currentNode.state = EXPLORED;
      }
    },

    async aStar(context) {
      const nodesToExplore = [];
      var exploredNodes = [];
      //var currentNodeIndex;
      const graph = context.state.graph;
      const startNode =
        graph[`(${context.state.startX},${context.state.startY})`];
      const endNode = graph[`(${context.state.destX},${context.state.destY})`];
      nodesToExplore.push(startNode);
      var currentNode;
      var higherPriorityChildExists;
      var childExplored;
      while (nodesToExplore.length != 0 && context.state.isAlgorithmRunning) {
        // Remove element with least f-value
        var minValue = Infinity;
        var count = 0;
        var currentNodeIndex = 0;
        for (var node of nodesToExplore) {
          if (node.nodeCost < minValue) {
            minValue = node.nodeCost;
            currentNodeIndex = count;
          }
          count += 1;
        }
        //currentNodeIndex = findMinNodeIndex(nodesToExplore);
        currentNode = nodesToExplore[currentNodeIndex];
        exploredNodes.push(currentNode);
        nodesToExplore.splice(currentNodeIndex);
        if (context.state.isAlgorithmRunning) {
          currentNode.state = VISITED;
        }
        await sleep(context.state.delayFactor / context.state.vizSpeed);
        //Check if we're done
        if (currentNode.x == endNode.x && currentNode.y == endNode.y) {
          return getPath(currentNode, startNode);
        }
        for (let neighbourCoors of currentNode.adj) {
          const neighbour = graph[neighbourCoors];
          if (neighbour.state == WALL) {
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
            if (context.state.isAlgorithmRunning) {
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

    drawPath(iterNode, startNode) {
      //Iterate back up the parents until you find the null parent
      var path = [];
      while (!(iterNode.x == startNode.x && iterNode.y == startNode.y)) {
        path.push(iterNode);
        iterNode = iterNode.parent;
      }
      return path;
    }

  },

  getters: {
    isAlgorithmRunning: (state) => state.isAlgorithmRunning,
  },
  modules: {},
});
