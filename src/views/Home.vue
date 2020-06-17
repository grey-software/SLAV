<template>
  <div class="home">
    <div class="title">Searching & Learning Algorithm Visualizer</div>
    <input ref="rowInput" class="inputStyle">
    <input ref="colInput" class="inputStyle">

    <div class="my-2">
      <v-btn @click="runBfs" :disabled="selectionState != 'ready'" color="primary">Visualize</v-btn>
    </div>

    <div class="subtitle">
      <p>Visualiztion Speed: {{vizSpeed}}</p>
      <p>Current Position: (x: {{currX}}, y: {{currY}})</p>
      <p>State: {{selectionStateLabels[selectionState]}}</p>
    </div>

    <v-slider
      v-model="vizSpeedIndex"
      :tick-labels="vizSpeedOptions"
      :max="5"
      step="1"
      ticks="always"
      tick-size="4"
    ></v-slider>

    <div v-if="Object.keys(graph).length > 0" id="visualizer" class="ml-5 mt-5">
      <!-- Look for good svg graphics library to render graph -->
      <!-- for(var i = 0; i<30; i++) -->
      <div v-for="i in gridMaxY" :key="i" class="flex">
        <div v-for="j in gridMaxX" :key="j">
          <grid-cell
            :x="j - 1"
            :y="i - 1"
            :gridData="gridData"
            :gridNode="getGridNodeForCell(j-1, i-1)"
            @onGridCellClicked="onGridCellClicked"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//import graph from '../search-algorithms/bfs/test-bfs'
import GridNode from "../search-algorithms/bfs/GridNode";
import Queue from "../search-algorithms/bfs/Queue";
import Vue from "vue";
import VueToast from "vue-toast-notification";
// Import one of available themes
import "vue-toast-notification/dist/theme-default.css";
// @ is an alias to /src

//const GRID_MAX_Y = 50;
//const GRID_MAX_X = 50;
var rowBox = this.$refs.rowInput;
var colBox = this.$refs.colInput;

this.setDimensions(rowBox, colBox);



 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import GridCell from "@/components/GridCell.vue";

export default {
  name: "Home",
  components: {
    GridCell
  },
  data() {
    return {
      vizSpeedIndex: 2,
      vizSpeedOptions: [0.25, 0.5, 1, 1.5, 2, 3],
      startX: null,
      startY: null,
      destX: null,
      destY: null,
      //Node Model
      node: GridNode,
      currX: 0,
      currY: 0,
      neighborCurrX: 0,
      neighbourCurrY: 0,
      gridMaxX: parseInt(this.$refs.rowInput.innerText,10),
      gridMaxY: parseInt(this.$refs.colInput.innerText,10),
      selectionState: "pick-start",
      selectionStateLabels: {
        "pick-start": "Pick the starting node!",
        "pick-dest": "Pick the destination node!",
        ready: "You're ready to visualize!"
      },
      graph: {}
    };
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
        currX: this.currX,
        currY: this.currY,
        nodeList: []
      };
    }
  },
  mounted () {
      if(this.gridMaxX > 0 && this.gridMaxY > 0){
        this.graph = this.createGraph(this.gridMaxY, this.gridMaxX);
      }
  },
  methods: {
    /*setDimensions(rowBox, colBox){
        rowBox.addEventListener("keydown", function(event) {
          alert("Reached");
          //Enter key is pressed
          if(event.keyCode == 13){
            rowBox.disabled = true;
          }
        })
        colBox.addEventListener("keydown", function(event) {
          //Enter key is pressed
          if(event.keyCode == 13){
            colBox.disabled = true;
          

          }
        })

    },*/

    getGridNodeForCell(x, y) {
      console.log(this.graph[`(${x},${y})`])
      return this.graph[`(${x},${y})`]
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
        "(0,0)": currNode
      };
      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          cell = "(" + i + "," + j + ")";
          if (cell in nodeDict) {
            currNode = nodeDict[cell];
          } else {
            currNode = new GridNode(i, j);
            nodeDict[cell] = currNode;
          }
          this.addNeighbours(i, j, currNode, nodeDict, rows, cols);
        }
      }
      return nodeDict;
    },

    changeColor(cell, x, y, newColor) {
      if (x == this.neighborCurrX && y == this.neighbourCurrY) {
        cell.color = newColor;
        Vue.use(VueToast);
        Vue.$toast.open("Reached");
      }
    },

  

    runBfs() {
      const startNode = this.graph[`(${this.startX},${this.startY})`]
      console.log(startNode)
      const visited = this.bfs(this.graph, startNode);
      console.log(visited)
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
          break;
        }
      }
    },
    async bfs(graph, start) {
      const visited = [];

      const queue = new Queue();
      start.dist = 0;
      queue.enqueue(start);
      while (!queue.isEmpty()) {
        const currentNode = queue.dequeue();
        this.currX = currentNode.x;
        this.currY = currentNode.y;
        await sleep(600);
        visited.push(currentNode);
        currentNode.color = "green";
        this.$emit("visitedColorChange");
        //View node's color should observe model node's color
        for (const neighbour of currentNode.adj) {
          //Visit
          this.neighborCurrX = neighbour.x;
          this.neighbourCurrY = neighbour.y;
          console.log(neighbour);
          console.log(
            `Visiting neighbor: (x: ${neighbour.x}, y: ${neighbour.y})`
          );
          if (neighbour.color == "white") {
            console.log(
              `White neighbor: (x: ${neighbour.x}, y: ${neighbour.y})`
            );
            neighbour.color = "green";
            this.$emit("visitedColorChange", neighbour.x, neighbour.y);
            neighbour.dist = currentNode.dist + 1;
            queue.enqueue(neighbour);
          }
        }
        // console.log(queue.items)
        currentNode.color = "blue";
        this.$emit("finishedColorChange");
      }
      return visited;
    }
  }
};
</script>


<style>
  .inputStyle{
    margin: 2px;
    border: solid 2px;
    border-color: black;


  }




</style>
