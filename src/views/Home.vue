<template>
  <v-container class="home p-4">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
    >
      <v-list dense>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Algorithms</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Application</v-toolbar-title>
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
    </v-row>
    <div class="my-2">
      <v-btn @click="runBfs" :disabled="selectionState != 'ready' || isAlgorithmRunning" color="primary">Visualize</v-btn>
      <v-btn @click="resetGrid" :disabled=!isAlgorithmRunning color="red">Reset Grid</v-btn>
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
            :gridNode="getGridNodeForCell(j-1, i-1)"
            @onGridCellClicked="onGridCellClicked"
          />
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
//import graph from '../search-algorithms/bfs/test-bfs'
import GridNode from "../search-algorithms/bfs/GridNode";
import Queue from "../search-algorithms/bfs/Queue";

// Import one of available themes
// @ is an alias to /src

const GRID_MAX_Y = 10;
const GRID_MAX_X = 35;

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
      gridMaxX: GRID_MAX_X,
      gridMaxY: GRID_MAX_Y,
      selectionState: "pick-start",
      selectionStateLabels: {
        "pick-start": "Pick the starting node!",
        "pick-dest": "Pick the destination node!",
        ready: "You're ready to visualize!"
      },
      graph: {},
      rowCount: GRID_MAX_Y,
      columnCount: GRID_MAX_X,
      isAlgorithmRunning: false,
      path: [],
      delayFactor: 200
    };
  },

  created () {
      this.$vuetify.theme.dark = true
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
        destY: this.destY
      };
    }
  },
  mounted() {
    this.graph = this.createGraph(this.rowCount, this.columnCount);
  },
  methods: {
    resetGrid(){
      window.location.reload();

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
    async runBfs() {
      const startNode = this.graph[`(${this.startX},${this.startY})`];
      const endNode = this.graph[`(${this.destX},${this.destY})`];
      console.log(startNode);
      this.isAlgorithmRunning = true;
      this.path = await this.bfs(this.graph, startNode, endNode);
      for (let i = this.path.length - 1; i >= 0; i--) {
        this.path[i].color = "purple"
      }
      this.isAlgorithmRunning = false;
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

    /*async dfs(graph, startNode, endNode){
      const visited = [];
      var count = 0;
      for (node in graph){
        if(node.color == "white"){
          dfs_visit(graph, node);


        }
      }
    },


    async dfs_visit(graph, node){
      node.color = "grey";



    }*/



    async bfs(graph, startNode, endNode) {
      const visited = [];
      const queue = new Queue();
      startNode.dist = 0;
      queue.enqueue(startNode);
      while (!queue.isEmpty()) {
        const currentNode = queue.dequeue();
        this.currX = currentNode.x;
        this.currY = currentNode.y;
        await sleep(this.delayFactor/this.vizSpeedOptions[this.vizSpeedIndex]);
        visited.push(currentNode);
        currentNode.color = "green";
        var iterNode = currentNode;
        if (iterNode.x == endNode.x && iterNode.y == endNode.y) {
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
        }

        //View node's color should observe model node's color
        for (const neighbour of currentNode.adj) {
          //Visit
          if (neighbour.parent == null) {
            neighbour.parent = currentNode;
          }
          if (neighbour.color == "white") {
            neighbour.color = "green";
            neighbour.dist = currentNode.dist + 1;
            queue.enqueue(neighbour);
          }
        }
        // console.log(queue.items)
        currentNode.color = "blue";
      }
    }
  }
};
</script>


<style>
  


</style>
