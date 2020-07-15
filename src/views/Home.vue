<template>
  <v-container class="home p-4">
    <v-toolbar 
    app clipped-left
    color="black"
    dark
    width=100%
    >
      <v-toolbar-title>SLAV</v-toolbar-title>
          <v-col cols="2">
          <v-text-field
            label="Grid Rows"
            :disabled="isAlgorithmRunning"
            v-model.number="rowCount"
            class="inputStyle"
          />
          </v-col>

          <v-col cols="2">
          <v-text-field
            label="Grid Columns"
            :disabled="isAlgorithmRunning"
            v-model.number="columnCount"
            class="inputStyle"
          />
          </v-col>
          <v-col cols="6">
            <select-current-algorithm />
          </v-col>
          
          
      
    </v-toolbar>

    <!-- <div class="title">Grid Dimensions</div>-->
    
    <div class="my-2">
      <v-btn
        class="glowButton"
        @click="runAlgorithm(currentAlgorithm)"
        :disabled="selectionState != 'ready' || isAlgorithmRunning"
        color="primary"
      >
        <v-icon>mdi-play</v-icon>Visualize
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
    
    <div>
        <div v-for="i in 5" :key="i" class="flex" float: left>
            <grid-cell   
              :x="100"
              :y="100"
              :gridData="gridData"         
            />
        </div>
    </div>

    <div>
      <grid-cell   
              :x="1000"
              :y="1000"
              :gridData="gridData"         
      />
    
    
    
    </div>



    <div
      :key="`${rowCount}x${columnCount}`"
      v-if="Object.keys(graph).length > 0"
      id="visualizer"
      class="ml-5 mt-5"
    >
      <!-- Look for good svg graphics library to render graph -->
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

import { mapGetters } from "vuex";

import GridCell from "@/components/GridCell.vue";
//import QueueLog from "@/components/QueueLog.vue";
import { mapState, mapMutations, mapActions } from "vuex";
export default {
  name: "Home",
  components: {
    GridCell,
    VizSpeedSlider,
    SelectCurrentAlgorithm,
    //QueueLog
  },
  data() {
    return {
      currentAlgorithmStruct: null,
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
    ...mapGetters({ isAlgorithmRunning: "isAlgorithmRunning" }),
    ...mapState({
      isAlgorithmFinished: "isAlgorithmFinished",
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
      this.setIsAlgorithmFinished(false);
      this.setIsAlgorithmRunning(false);
      this.createGraph({ rows: this.rowCount, cols: this.columnCount });
      this.wallCoordinates = new Set();
      this.path = [];
      //this.selectionState = "pick-start";
      this.setSelectionState("pick-start");
    },
    addWall(wallCoordinate) {
      this.graph[wallCoordinate].state = WALL;
    },
    onGridCellClicked(x, y) {
      console.log(this.selectionState);
      switch (this.selectionState) {
        case "pick-start": {
          this.startX = x;
          this.startY = y;
          console.log(`${this.startX},${this.startY}`);
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
            if (x != this.startX && y != this.startY) {
              if (x != this.destX && y != this.destY) {
                this.addWall(`(${x},${y})`);
              }
            }
          }
          break;
        }
      }
    },

    onGridCellHover(x, y) {
      if (this.wallCreationState) {
        if (x != this.startX && y != this.startY) {
          if (x != this.destX && y != this.destY) {
            this.addWall(`(${x},${y})`);
          }
        }
      }
    },

    async runAlgorithm(algorithm) {
      const startNode = this.graph[`(${this.startX},${this.startY})`];
      const endNode = this.graph[`(${this.destX},${this.destY})`];
      this.setIsAlgorithmRunning(true);
      console.log(`Running algorithm: ${algorithm}`);
      if (algorithm == "search/breadth-first") {
        this.path = await this.bfs(this.graph, startNode, endNode);
      } else if (algorithm == "search/depth-first") {
        this.path = await this.dfs(this.graph, startNode, endNode);
      } else if (algorithm == "search/a-star") {
        console.log("calling a star");
        this.path = await this.aStar(this.graph, startNode, endNode);
      } else if (algorithm == "search/best-first") {
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
      while (!stack.isEmpty() && this.isAlgorithmRunning) {
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
      while (!queue.isEmpty() && this.isAlgorithmRunning) {
        console.log(`Length${queue.length()}`);
        const currentNode = queue.dequeue();
        await sleep(this.delayFactor / this.vizSpeed);
        if (currentNode.state != WALL) {
          //visited.push(currentNode);
          if (this.isAlgorithmRunning) {
            currentNode.state = VISITED;
          }
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
              if (this.isAlgorithmRunning) {
                neighbour.state = VISITED;
              }
              neighbour.dist = currentNode.dist + 1;
              queue.enqueue(neighbour);
            }
          }
        }
        // console.log(queue.items)
        currentNode.state = EXPLORED;
      }
    },
    
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