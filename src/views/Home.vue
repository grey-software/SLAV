<template>
  <v-container class="home p-4">
    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>SLAV</v-toolbar-title>
    </v-app-bar>

    <div class="title">Grid Dimensions</div>
    <v-row>
      <v-col cols="3">
        <v-text-field
          label="Grid Rows"
          :disabled="isAlgorithmRunning"
          v-model.number="rowCount"
          class="inputStyle"
        />
      </v-col>
      <v-col cols="3">
        <v-text-field
          label="Grid Columns"
          :disabled="isAlgorithmRunning"
          v-model.number="columnCount"
          class="inputStyle"
        />
      </v-col>

      <v-col class="d-flex" cols="6" sm="6">
        <v-select
          :items="Algorithms"
          filled
          label="Searching Algorithm"
          background-color="blue"
          v-model="currentAlgorithm"
        ></v-select>
      </v-col>
    </v-row>
    <div class="my-2">
      <v-btn
        class="mr-2"
        @click="runAlgorithm(currentAlgorithm)"
        :disabled="selectionState != 'ready' || isAlgorithmRunning"
        color="primary"
        >Visualize</v-btn
      >
      <v-btn
        @click="resetGrid"
        :disabled="!isAlgorithmRunning && !isAlgorithmFinished"
        color="red"
        >Reset Grid</v-btn
      >
    </div>

    <div class="subtitle">
      <p>Visualiztion Speed: {{ vizSpeed }}</p>
      <p>Current Position: (x: {{ currX }}, y: {{ currY }})</p>
      <p>State: {{ selectionStateLabels[selectionState] }}</p>
      <p>
        Walls:
        {{
          Object.keys(graph).filter((coors) => graph[coors].color == "orange")
            .length
        }}
      </p>
    </div>

    <v-slider
      v-model="vizSpeedIndex"
      :tick-labels="vizSpeedOptions"
      :max="5"
      step="1"
      ticks="always"
      tick-size="4"
    ></v-slider>

    <div
      :key="`${rowCount}x${columnCount}`"
      v-if="Object.keys(graph).length > 0"
      id="visualizer"
      class="ml-5 mt-5"
    >
      <!-- Look for good svg graphics library to render graph -->
      <!-- for(var i = 0; i<30; i++) -->
      <div v-for="i in rowCount" :key="i" class="flex">
        <div v-for="j in columnCount" :key="j">
          <grid-cell
            :x="j - 1"
            :y="i - 1"
            :gridData="gridData"
            :gridNode="getGridNodeForCell(j - 1, i - 1)"
            @onGridCellClicked="onGridCellClicked"
          />
        </div>
      </div>
      <!-- <v-icon v-drag dark>mdi-flag</v-icon> -->
    </div>
  </v-container>
</template>

<script>
//import graph from '../search-algorithms/bfs/test-bfs'
import GridNode from "../search-algorithms/bfs/GridNode";
import Queue from "../search-algorithms/utils/Queue";
import Stack from "../search-algorithms/utils/Stack";
import {
  EMPTY,
  VISITED,
  EXPLORED,
  WALL,
  PATH,
} from "../search-algorithms/utils/constants.js";

// Import one of available themes
// @ is an alias to /src

const GRID_MAX_Y = 10;
const GRID_MAX_X = 10;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import GridCell from "@/components/GridCell.vue";

export default {
  name: "Home",
  components: {
    GridCell,
  },
  data() {
    return {
      drawer: true,
      Algorithms: ["DFS", "BFS"],
      vizSpeedIndex: 2,
      vizSpeedOptions: [0.25, 0.5, 1, 1.5, 2, 3],
      startX: null,
      startY: null,
      destX: null,
      destY: null,
      currX: 0,
      currY: 0,
      gridMaxX: GRID_MAX_X,
      gridMaxY: GRID_MAX_Y,
      selectionState: "pick-start",
      selectionStateLabels: {
        "pick-start": "Pick the starting node!",
        "pick-dest": "Pick the destination node!",
        ready: "You're ready to visualize!",
      },
      graph: {},
      rowCount: GRID_MAX_Y,
      columnCount: GRID_MAX_X,
      isAlgorithmRunning: false,
      isAlgorithmFinished: false,
      path: [],
      delayFactor: 200,
      wallCoordinates: new Set(),
      currentAlgorithm: "DFS",
    };
  },

  created() {
    this.$vuetify.theme.dark = true;
  },

  computed: {
    vizSpeed() {
      return this.vizSpeedOptions[this.vizSpeedIndex];
    },
    gridData() {
      return {
        startX: this.startX,
        startY: this.startY,
        destX: this.destX,
        destY: this.destY,
        wallCoordinates: this.wallCoordinates,
      };
    },
  },
  mounted() {
    this.graph = this.createGraph(this.rowCount, this.columnCount);
    console.log(VISITED);
    console.log(EMPTY);
  },
  methods: {
    resetGrid() {
      this.startX = null;
      this.startY = null;
      this.destX = null;
      this.destY = null;
      this.currX = null;
      this.currY = null;
      this.graph = this.createGraph(this.rowCount, this.columnCount);
      this.wallCoordinates = new Set();
      this.path = [];
      this.selectionState = "pick-start";
      this.isAlgorithmFinished = false;
      this.isAlgorithmRunning = false;
    },
    addWall(wallCoordinate) {
      //Find coordiante by (x,y)
      this.graph[wallCoordinate].color = "orange";
    },

    getGridNodeForCell(x, y) {
      if (!this.graph[`(${x},${y})`]) {
        console.log(`(${x},${y})`);
      }
      return this.graph[`(${x},${y})`];
    },
    onVisitedColorChange(x, y) {
      console.log(x);
      console.log(y);
    },
    addNeighbours(j, i, currNode, nodeDict, rows, cols) {
      var cell = "";
      var adjNode;

      cell = "(" + (j + 1) + "," + i + ")";
      if (cell in nodeDict) {
        currNode.adj.push(nodeDict[cell]);
      } else {
        adjNode = new GridNode(j + 1, i);
        if (j < rows - 1) {
          nodeDict[cell] = adjNode;
          currNode.adj.push(adjNode);
        }
      }

      cell = "(" + j + "," + (i + 1) + ")";
      if (cell in nodeDict) {
        currNode.adj.push(nodeDict[cell]);
      } else {
        adjNode = new GridNode(j, i + 1);
        if (i < cols - 1) {
          nodeDict[cell] = adjNode;
          currNode.adj.push(adjNode);
        }
      }

      cell = "(" + (j - 1) + "," + i + ")";
      if (cell in nodeDict) {
        currNode.adj.push(nodeDict[cell]);
      } else {
        adjNode = new GridNode(j - 1, i);
        if (j > 0) {
          nodeDict[cell] = adjNode;
          currNode.adj.push(adjNode);
        }
      }

      cell = "(" + j + "," + (i - 1) + ")";
      if (cell in nodeDict) {
        currNode.adj.push(nodeDict[cell]);
      } else {
        adjNode = new GridNode(j + 1, i);
        if (i > 0) {
          nodeDict[cell] = adjNode;
          currNode.adj.push(adjNode);
        }
      }
    },
    /**
     * Creates a model for the graph in the form of:
     *
     * {
     *  (0,0): GridNode,
     *  (0,1): GridNode,
     *  (1,0): GridNode
     * }
     */
    createGraph(rows, cols) {
      var currNode = new GridNode(0, 0);
      var cell = "";
      var nodeDict = {
        "(0,0)": currNode,
      };
      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          cell = `(${i},${j})`;
          //Check if the cell is not part of the wall
          //if(!(cell in this.wallCoordinates)){
          if (cell in nodeDict) {
            currNode = nodeDict[cell];
          } else {
            currNode = new GridNode(i, j);
            nodeDict[cell] = currNode;
          }
          this.addNeighbours(i, j, currNode, nodeDict, rows, cols);
          //}
        }
      }
      return nodeDict;
    },

    onGridCellClicked(x, y) {
      switch (this.selectionState) {
        case "pick-start": {
          this.startX = x;
          this.startY = y;
          this.selectionState = "pick-dest";
          break;
        }
        case "pick-dest": {
          this.destX = x;
          this.destY = y;
          this.selectionState = "ready";
          break;
        }
        case "ready": {
          // Add wall
          this.addWall(`(${x},${y})`);

          break;
        }
      }
    },

    async runAlgorithm(name) {
      const startNode = this.graph[`(${this.startX},${this.startY})`];
      const endNode = this.graph[`(${this.destX},${this.destY})`];
      this.isAlgorithmRunning = true;
      if (name == "BFS") {
        this.path = await this.bfs(this.graph, startNode, endNode);
      } else if (name == "DFS") {
        this.path = await this.dfs(this.graph, startNode, endNode);
      }
      for (let i = this.path.length - 1; i >= 0; i--) {
        this.path[i].state = PATH;
        await sleep(50);
      }

      this.isAlgorithmRunning = false;
      this.isAlgorithmFinished = true;
      this.selectionState = "pick-start";
    },

    async dfs(graph, startNode, endNode) {
      // Perform DFS at start Node
      var path = await this.dfsVisit(graph, startNode, startNode, endNode);
      return path;
    },

    async dfsVisit(graph, currentNode, startNode, endNode) {
      //Not a wall
      const stack = new Stack();
      stack.push(startNode);
      while (!stack.isEmpty()) {
        currentNode = stack.pop();
        var iterNode = currentNode;
        if (iterNode.x == endNode.x && iterNode.y == endNode.y) {
          return this.drawPath(iterNode, startNode);
        }
        currentNode.state = VISITED;
        await sleep(
          this.delayFactor / this.vizSpeedOptions[this.vizSpeedIndex]
        );
        console.log(currentNode.adj);
        for (const neighbour of currentNode.adj) {
          if (neighbour.state != WALL) {
            if (neighbour.state == EMPTY) {
              stack.push(neighbour);
            }

            if (neighbour.parent == null) {
              neighbour.parent = currentNode;
            }
          }
        }
        currentNode.state = EXPLORED;
      }
    },

    async bfs(graph, startNode, endNode) {
      //const visited = [];
      const queue = new Queue();
      startNode.dist = 0;
      queue.enqueue(startNode);
      while (!queue.isEmpty()) {
        const currentNode = queue.dequeue();
        await sleep(
          this.delayFactor / this.vizSpeedOptions[this.vizSpeedIndex]
        );
        if (currentNode.state != WALL) {
          //visited.push(currentNode);
          currentNode.state = VISITED;
        }

        var iterNode = currentNode;
        if (iterNode.x == endNode.x && iterNode.y == endNode.y) {
          return this.drawPath(iterNode, startNode);
        }

        //View node's color should observe model node's color
        for (const neighbour of currentNode.adj) {
          //Only interact with non-wall nodes
          if (neighbour.state != WALL) {
            //Visit
            if (neighbour.parent == null) {
              neighbour.parent = currentNode;
            }
            if (neighbour.state == EMPTY) {
              neighbour.state = VISITED;
              neighbour.dist = currentNode.dist + 1;
              queue.enqueue(neighbour);
            }
          }
        }
        // console.log(queue.items)
        currentNode.state = EXPLORED;
      }
    },

    drawPath(iterNode, startNode) {
      //Iterate back up the parents until you find the null parent
      var path = [];
      while (!(iterNode.x == startNode.x && iterNode.y == startNode.y)) {
        path.push(iterNode);
        console.log(iterNode);
        console.log(iterNode.parent);
        iterNode = iterNode.parent;
      }
      console.log(path);
      return path;
    },

    setAlgorithm(name) {
      this.currentAlgorithm = name;
    },
  },
};
</script>

<style>
.dropdown {
  background-color: black;
  width: 3px;
}
</style>
