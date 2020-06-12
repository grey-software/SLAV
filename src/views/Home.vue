<template>
  <div class="home">

    <div class="title">Searching & Learning Algorithm Visualizer</div>

    <div class="my-2">
      <v-btn color="primary">Visualize</v-btn>
    </div>

    <div class="subtitle">
      <p>Visualiztion Speed: {{vizSpeed}}</p>
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
          @addNode

        </div>

      </div>

    </div>

  </div>
</template>

<script>
// @ is an alias to /src

const GRID_MAX_Y = 5
const GRID_MAX_X = 5
// const bfs = require('bfs')
// import bfs from 'bfs'
/*
bfs(startX, startY, destX, destY).subscribe(context => {

})
*/

import GridCell from '@/components/GridCell.vue';
import GridNode from '@/Node.js';

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
    onGridCellClicked(x, y){
      switch(this.selectionState) {
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

    addNode(x, y){



    }

    //V is a list of (x,y) tuples
    //s is the starting (x.y) position
    BFS(V,s){

      




    }


  },

}
</script>
