<template>
  <div class="home">

    <div class="title">Searching & Learning Algorithm Visualizer</div>

    <div class="my-2">
      <v-btn @click="runBfs" :disabled="selectionState != 'ready'" color="primary">Visualize</v-btn>
    </div>

    <div class="subtitle">
      <p>Visualiztion Speed: {{vizSpeed}}</p>
      <p>Current Position: (x: {{currX}}, y: {{currY}})</p>
      <p>State: {{selectionStateLabels[selectionState]}} </p>
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
      id="visualizer"
      class="ml-5 mt-5"
    >
      <!-- Look for good svg graphics library to render graph -->
      <!-- for(var i = 0; i<30; i++) -->
      <div
        v-for="i in gridMaxY"
        :key="i"
        class="flex"
      >
        <div
          v-for="j in gridMaxX"
          :key="j"
        >
          <grid-cell
            :x="j - 1"
            :y="i - 1"
            :gridData="gridData"
            @onGridCellClicked="onGridCellClicked"
          />
        </div>

      </div>

    </div>

  </div>
</template>

<script>

import graph from '../search-algorithms/bfs/test-bfs'
import GridNode from '../search-algorithms/bfs/GridNode'
import Queue from '../search-algorithms/bfs/Queue'
// @ is an alias to /src

const GRID_MAX_Y = 5
const GRID_MAX_X = 5
// const bfs = require('bfs')
// import bfs from 'bfs'
/*
bfs(startX, startY, destX, destY).subscribe(context => {

})
*/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import GridCell from '@/components/GridCell.vue';

export default {
  name: 'Home',
  components: {
    GridCell
  },
  data () {
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
      gridMaxY: GRID_MAX_Y,
      gridMaxX: GRID_MAX_X,
      selectionState: "pick-start",
      selectionStateLabels: {
        "pick-start": "Pick the starting node!",
        "pick-dest": "Pick the destination node!",
        "ready": "You're ready to visualize!"
      }
    }
  },
  computed: {
    vizSpeed () {
      return this.vizSpeedOptions[this.vizSpeedIndex]
    },
    gridData () {
      return {
        startX: this.startX,
        startY: this.startY,
        destX: this.destX,
        destY: this.destY,
        currX: this.currX,
        currY: this.currY,
        nodeList: []
      }
    },

  },
  methods: {
    runBfs() {
      var startNode = null;
      // Grab vertex associated with selected start x and y
      for (const vertex of graph) {
        if (vertex.x == this.startX && vertex.y == this.startY) {
          startNode = vertex
        }
      }
      if (!startNode) return;
      console.log(this.bfs(graph, startNode))
    },
    onGridCellClicked (x, y) {
      switch (this.selectionState) {
        case 'pick-start': {
          this.startX = x;
          this.startY = y;
          this.selectionState = 'pick-dest'
          break;
        }
        case 'pick-dest': {
          this.destX = x;
          this.destY = y;
          this.selectionState = 'ready'
          break;
        }
        case 'ready': {
          break;
        }
      }

    },
    async bfs (graph, start) {
      const visited = [];

      const queue = new Queue();
      start.dist = 0;
      queue.enqueue(start);
      while (!queue.isEmpty()) {
        const currentNode = queue.dequeue();
        this.currX = currentNode.x;
        this.currY = currentNode.y;
        await sleep(600)
        visited.push(currentNode);
        currentNode.color = "grey";
        for (const neighbour of currentNode.adj) {
          //Visit
          console.log(neighbour)
          console.log(`Visiting neighbor: (x: ${neighbour.x}, y: ${neighbour.y})`)
          if (neighbour.color == "white") {
            console.log(`White neighbor: (x: ${neighbour.x}, y: ${neighbour.y})`)
            neighbour.color = "grey"
            neighbour.dist = currentNode.dist + 1
            queue.enqueue(neighbour)
          }
        }
        // console.log(queue.items)
        currentNode.color = "black"
      }
      return visited;

    }
  },

}
</script>
