<template>
  <v-container class="home p-4">
    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>SLAV</v-toolbar-title>
    </v-app-bar>

    <!-- <div class="title">Grid Dimensions</div>-->
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

      <select-current-algorithm />
    </v-row>
    <div class="my-2">
      <v-btn
        class="glowButton"
        @click="runAlgorithm(currentAlgorithm)"
        :disabled="selectionState != 'ready' || isAlgorithmRunning"
        color="primary"
      >
        <v-icon>mdi-play</v-icon>Visualize
      </v-btn>
      <v-btn v-if="!isAlgorithmRunning" class="glowButton" @click="setIsAlgorithmRunning(true)" color="primary"> <v-icon>mdi-play</v-icon>Play</v-btn>
      <v-btn v-else class="glowButton" @click="setIsAlgorithmRunning(false)" color="primary">
        <v-icon>mdi-pause</v-icon>Pause
      </v-btn>
      <v-btn
        @click="resetGrid"
        :disabled="!isAlgorithmRunning && !isAlgorithmFinished"
        color="red"
      >Reset Grid</v-btn>
    </div>

    <div class="subtitle">
      <p>Current Position: (x: {{ currX }}, y: {{ currY }})</p>
      <p>{{ selectionStateLabels[selectionState] }}</p>
    </div>

    <viz-speed-slider></viz-speed-slider>

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
            @onGridCellClicked="onGridCellClicked"
            @onGridCellHover="onGridCellHover"
          />
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
//import graph from '../search-algorithms/bfs/test-bfs'
import Queue from "../search-algorithms/utils/Queue";
import PriorityQueue from "../search-algorithms/utils/PriorityQueue";
import Stack from "../search-algorithms/utils/Stack";
import VizSpeedSlider from "../components/VizSpeedSlider";
import SelectCurrentAlgorithm from "../components/SelectCurrentAlgorithm";
import {
  EMPTY,
  VISITED,
  EXPLORED,
  WALL,
  PATH,
  GRID_MAX_X,
  GRID_MAX_Y
} from "../search-algorithms/utils/constants.js";

// Import one of available themes
// @ is an alias to /src

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import GridCell from "@/components/GridCell.vue";
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  name: "Home",
  components: {
    GridCell,
    VizSpeedSlider,
    SelectCurrentAlgorithm
  },
  data() {
    return {
      drawer: true,
      Algorithms: ["BFS", "DFS", "A* Search", "Best-First-Search"],
      startX: null,
      startY: null,
      destX: null,
      destY: null,
      currX: 0,
      currY: 0,
      gridMaxX: GRID_MAX_X,
      gridMaxY: GRID_MAX_Y,
      // selectionState: "pick-start",
      selectionStateLabels: {
        "pick-start": "Pick the starting node!",
        "pick-dest": "Pick the destination node!",
        ready: "You're ready to visualize!"
      },
      rowCount: GRID_MAX_Y,
      columnCount: GRID_MAX_X,
      path: [],
      delayFactor: 200,
      wallCoordinates: new Set(),
      wallCreationState: false
    };
  },

  created() {
    this.$vuetify.theme.dark = true;
  },

  computed: {
    ...mapState({
      isAlgorithmFinished: "isAlgorithmFinished",
      isAlgorithmRunning: "isAlgorithmRunning",
      selectionState: "selectionState",
      vizSpeed: "vizSpeed",
      graph: "graph",
      currentAlgorithm: "currentAlgorithm"
    }),
    gridData() {
      return {
        startX: this.startX,
        startY: this.startY,
        destX: this.destX,
        destY: this.destY,
        wallCoordinates: this.wallCoordinates
      };
    }
  },
  mounted() {
    // this.graph = this.createGraph(this.rowCount, this.columnCount);
    this.createGraph({ rows: this.rowCount, cols: this.columnCount });
  },
  methods: {
    ...mapMutations([
      "setIsAlgorithmFinished",
      "setIsAlgorithmRunning",
      "setSelectionState",
      "setGraph"
    ]),
    ...mapActions(["createGraph"]),
    resetGrid() {
      this.startX = null;
      this.startY = null;
      this.destX = null;
      this.destY = null;
      this.currX = null;
      this.currY = null;
      this.createGraph({ rows: this.rowCount, cols: this.columnCount });
      this.wallCoordinates = new Set();
      this.path = [];
      this.setSelectionState("pick-start");
      this.setIsAlgorithmFinished(false);
      this.setIsAlgorithmRunning(false);
      //Need to make sure process stops running on reset %%%
    },
    addWall(wallCoordinate) {
      //Find coordiante by (x,y)
      this.graph[wallCoordinate].state = WALL;
    },

    onGridCellClicked(x, y) {
      console.log(this.selectionState);
      switch (this.selectionState) {
        case "pick-start": {
          this.startX = x;
          this.startY = y;
          console.log(`${this.startX},${this.startY}`);
          //this.selectionState = "pick-dest";
          this.setSelectionState("pick-dest");
          break;
        }
        case "pick-dest": {
          this.destX = x;
          this.destY = y;
          this.setSelectionState("ready");
          break;
        }
        case "ready": {
          // Add wall
          if (this.wallCreationState) {
            this.wallCreationState = false;
          } else {
            this.wallCreationState = true;
            this.addWall(`(${x},${y})`);
          }
          break;
        }
      }
    },

    onGridCellHover(x, y) {
      if (this.wallCreationState) {
        this.addWall(`(${x},${y})`);
      }
    },

    async runAlgorithm(name) {
      const startNode = this.graph[`(${this.startX},${this.startY})`];
      const endNode = this.graph[`(${this.destX},${this.destY})`];
      this.setIsAlgorithmRunning(true);
      console.log("Running algorithm: " + name);

      if (name == "search/breadth-first") {
        this.path = await this.bfs(this.graph, startNode, endNode);
      } else if (name == "search/depth-first") {
        this.path = await this.dfs(this.graph, startNode, endNode);
      } else if (name == "search/a-star") {
        console.log("calling a star");
        this.path = await this.aStar(this.graph, startNode, endNode);
      } else if (name == "search/best-first") {
        this.path = await this.best_first(this.graph, startNode, endNode);
      }

      for (let i = this.path.length - 1; i >= 0; i--) {
        this.path[i].state = PATH;
        await sleep(50);
      }

      this.setIsAlgorithmRunning(true);
      this.setIsAlgorithmFinished(true);

      // Convert to a mutation
      this.setSelectionState("pick-start");
    },

    async dfs(graph, startNode, endNode) {
      // Perform DFS at start Node
      var path = await this.dfsVisit(startNode, startNode, endNode);
      return path;
    },

    async dfsVisit(currentNode, startNode, endNode) {
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
        await sleep(this.delayFactor / this.vizSpeed);

        for (const neighbourCoors of currentNode.adj) {
          const neighbour = this.graph[neighbourCoors];
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
        console.log(this.isAlgorithmRunning)
        // while (!this.isAlgorithmRunning) {
        //   await sleep(100)
        // }
        const currentNode = queue.dequeue();
        await sleep(this.delayFactor / this.vizSpeed);
        if (currentNode.state != WALL) {
          //visited.push(currentNode);
          currentNode.state = VISITED;
        }

        var iterNode = currentNode;
        if (iterNode.x == endNode.x && iterNode.y == endNode.y) {
          return this.drawPath(iterNode, startNode);
        }

        //View node's color should observe model node's color
        for (const neighbourCoors of currentNode.adj) {
          const neighbour = this.graph[neighbourCoors];
          //Only interact with non-wall nodes
          if (neighbour.state != WALL) {
            //Visit
            if (neighbour.parent == null) {
              neighbour.parent = currentNode;
            }
            if (neighbour.state == EMPTY) {
              currentNode.state = VISITED;
              await sleep(this.delayFactor / this.vizSpeed);
              neighbour.dist = currentNode.dist + 1;
              queue.enqueue(neighbour);
            }
          }
        }
        // console.log(queue.items)
        currentNode.state = EXPLORED;
      }
    },

    async aStar(graph, startNode, endNode) {
      console.log(graph);
      const nodesToExplore = [];
      var exploredNodes = [];
      var currentNodeIndex;
      var currentNode;
      var higherPriorityChildExists;
      var childExplored;

      while (nodesToExplore.length != 0) {
        // Remove element with least f-value
        currentNodeIndex = this.findMinNodeIndex(nodesToExplore);
        currentNode = nodesToExplore[currentNodeIndex];
        exploredNodes.push(currentNode);
        nodesToExplore.splice(currentNodeIndex);
        currentNode.state = VISITED;
        await sleep(this.delayFactor / this.vizSpeed);
        //Check if we're done
        if (currentNode.x == endNode.x && currentNode.y == endNode.y) {
          return this.drawPath(currentNode, startNode);
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
              if (neighbour.distanceFromStart > openChild.g) {
                higherPriorityChildExists = true;
              }
            }
          }
          if (!higherPriorityChildExists && !childExplored) {
            neighbour.state = VISITED;
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
          return this.drawPath(min, startNode);
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
          minValue = node.f;
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
  }
};
</script>

<style>
@import url(https://fonts.googleapis.com/css?family=Roboto:900);

.glowButton {
  position: relative;
  margin: auto;
  padding-right: 1.5rem;
  padding-left: 1.5rem;
  font-size: 1rem;
  line-height: 3rem;
  text-decoration: none;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: blue;
  border-radius: 30px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 0 0 0 #ec008c, 0.5rem 0.5rem 30px mix(black, #26115a, 50%);
  transition: box-shadow 0.6s;
}

glowButton:hover {
  box-shadow: 0 0 60px 2px #ec008c, 0.5rem 0.5rem 30px mix(black, #26115a, 50%);
}

glowButton:after {
  content: "";
  position: absolute;
  top: 2px;
  right: 2px;
  bottom: 2px;
  left: 2px;
  border-radius: 30px;
  background-image: linear-gradient(170deg, rgba(white, 0.3), rgba(white, 0));
  pointer-events: none;
}
</style>
