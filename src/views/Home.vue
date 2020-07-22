<template>
  <div>
    <v-toolbar app color="black" dark width="100%">
      <v-toolbar-title class="ml-12">SLAV</v-toolbar-title>
      <v-row class="ml-12 align-center">
        <v-btn
          class="mr-2"
          @click="onVizClicked"
          :disabled="selectionState != 'ready' || isAlgorithmRunning"
          color="primary"
        >
          <v-icon>mdi-play</v-icon>Visualize
        </v-btn>

        <v-btn
          @click="reset"
          :disabled="!isAlgorithmRunning && !isAlgorithmFinished"
          color="red"
        >Reset Grid</v-btn>

        <v-col cols="1">
          <v-text-field
            label="Grid Rows"
            :disabled="isAlgorithmRunning"
            v-model.number="rowCount"
            class="inputStyle pt-5"
          />
        </v-col>

        <v-col cols="1">
          <v-text-field
            label="Grid Columns"
            :disabled="isAlgorithmRunning"
            v-model.number="columnCount"
            class="inputStyle pt-5"
          />
        </v-col>
        <v-col cols="4">
          <select-current-algorithm />
        </v-col>
      </v-row>
    </v-toolbar>
    <v-container class="home p-4">
      <div class="subtitle">
        <p>{{ selectionStateLabels[selectionState] }}</p>
      </div>

      <viz-speed-slider></viz-speed-slider>

      <div class="ml-5 mt-5">
        <div v-for="j in 1" :key="j" class="flex">
          <div v-for="i in 37" :key="i">
            <queue-cell :queueIndex="i" :gridData="gridData" />
          </div>
        </div>
      </div>

      <div class="ml-5 mt-5">
        <div class="flex">
          <v-row justify="center" align="center">
            <p>Unvisited</p>
            <grid-cell :gridData="gridData" class="unvisited-cell" />

            <p>Visited</p>
            <grid-cell :gridData="gridData" class="visited-cell" />
            <p>Explored</p>
            <grid-cell :gridData="gridData" class="explored-cell" />

            <p>Wall</p>
            <grid-cell :gridData="gridData" class="wall-cell" />
          </v-row>
        </div>
      </div>

      <!-- This is our default graph rendering function. It takes in a graph,and draws it
while reactively responding to changes in state

Other algorithms may want a custom renderer, so they'll write their own GraphRenderer component

In our case, a custom renderer means a component that takes in a graph and draws it a certain way
      -->
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
  </div>
</template>

<script>
import Queue from "../search-algorithms/utils/Queue";
import Stack from "../search-algorithms/utils/Stack";
import VizSpeedSlider from "../components/VizSpeedSlider";
import SelectCurrentAlgorithm from "../components/SelectCurrentAlgorithm";
import {
  EMPTY,
  VISITED,
  EXPLORED,
  WALL,
  //PATH,
  GRID_MAX_X,
  GRID_MAX_Y
} from "../search-algorithms/utils/constants.js";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import { mapGetters } from "vuex";

import GridCell from "@/components/GridCell.vue";
import QueueCell from "@/components/QueueCell.vue";
//import QueueLog from "@/components/QueueLog.vue";
import { mapState, mapMutations, mapActions } from "vuex";
export default {
  name: "Home",
  components: {
    GridCell,
    VizSpeedSlider,
    SelectCurrentAlgorithm,
    QueueCell
    //QueueLog
  },
  data() {
    return {
      currentAlgorithmStruct: new Queue(),
      drawer: true,
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
      delayFactor: 200,
      wallCoordinates: new Set(),
      wallCreationState: false,
      queueNodes: {}
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
      currentAlgorithm: "currentAlgorithm",
      startX: "startX",
      startY: "startY",
      destX: "destX",
      destY: "destY",
      path: "path"
    }),
    gridData() {
      return {
        startX: this.startX,
        startY: this.startY,
        destX: this.destX,
        destY: this.destY,
        wallCoordinates: this.wallCoordinates,
        currentAlgorithmStruct: this.currentAlgorithmStruct
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
      "setGraph",
      "setStartCoors",
      "setDestCoors",
      "setCurrCoors",
      "resetGrid"
    ]),
    ...mapActions([
      "createGraph",
      "runAlgorithm",
      "onGridCellClicked",
      "onGridCellHover",
      "dfs",
      "dfsVisit",
      "bfs",
      "aStar",
      "findMinNodeIndex",
      "best_first",
      "drawPath",
      "reset"
    ]),
    addWall(wallCoordinate) {
      this.graph[wallCoordinate].state = WALL;
    },
    onGridCellClicked(x, y) {
      console.log(this.selectionState);
      switch (this.selectionState) {
        case "pick-start": {
          this.setStartCoors({ x, y });
          console.log(`${this.startX},${this.startY}`);
          this.setSelectionState("pick-dest");
          break;
        }
        case "pick-dest": {
          this.setDestCoors({ x, y });
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
    async dfs(graph, startNode, endNode) {
      // Perform DFS at start Node
      var path = await this.dfsVisit(startNode, startNode, endNode);
      return path;
    },
    async dfsVisit(currentNode, startNode, endNode) {
      //Not a wall
      const stack = new Stack();
      this.currentAlgorithmStruct = stack;
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
    onVizClicked() {
      this.runAlgorithm({ algorithm: this.currentAlgorithm });
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
    }
  }
};
</script>

<style>
.info-cell {
  margin-right: 170px;
}

.unvisited-cell {
  margin-left: 20px;
  margin-right: 170px;
  background-color: black;
}

.visited-cell {
  margin-left: 20px;
  margin-right: 170px;
  background-color: green;
}

.explored-cell {
  margin-left: 20px;
  margin-right: 170px;
  background-color: blue;
}

.wall-cell {
  margin-left: 20px;
  margin-right: 170px;
  background-color: orange;
}

.start-cell {
  margin-right: 170px;
  background-color: red;
}

.dest-cell {
  margin-right: 170px;
  background-color: yellow;
}

.start-cursor {
  cursor: "start-cell";
}

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