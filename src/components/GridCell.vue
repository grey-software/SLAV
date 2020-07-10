<template>
  <div
    @click="$emit('onGridCellClicked', x, y)"
    @mouseover="$emit('onGridCellHover', x, y)"
    class="grid-cell"
    :class="{
      visited: isVisited && !isStart && !isDest,
      finished: isFinished && !isStart && !isDest,
      path: isPartOfPath,
      start: isStart,
      dest: isDest,
      wall: isWall,
    }"
  ></div>
</template>

<script>
import {
  VISITED,
  EXPLORED,
  WALL,
  PATH
} from "../search-algorithms/utils/constants.js";
import { mapState } from "vuex";

export default {
  props: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    gridData: {
      type: Object
    },
    color: {
      type: String,
      default: "white"
    }
  },
  //Here we are making sure our gridCell is in sync with the gridNode model
  computed: {
    ...mapState({ graph: "graph" }),
    gridNode() {
      return this.graph[`(${this.x},${this.y})`];
    },
    isStart() {
      return this.gridData.startX === this.x && this.gridData.startY === this.y;
    },

    isDest() {
      return this.gridData.destX === this.x && this.gridData.destY === this.y;
    },

    isVisited() {
      
      return this.gridNode.state === VISITED;
    },

    isFinished() {
      return this.gridNode.state === EXPLORED;
    },
    isPartOfPath() {
      return this.gridNode.state === PATH;
    },
    isWall() {
      return this.gridNode.state === WALL;
    }
  }
};
</script>

<style>
.grid-cell {
  height: 16px;
  width: 16px;
  border: solid 0.2px;
  border-color: white;
}

.start {
  background-color: red;
}

.dest {
  background-color: yellow;
}

.visited {
  background-color: green;
  border-color: black;
  animation-name: colorVisited;
  animation-duration: 0.5s;
}

.finished {
  height: 16px;
  width: 16px;
  margin: 0 auto;
  background-color: blue;
  animation-name: colorFinished;
  animation-duration: 0.5s;
  animation-delay: 0;
  animation-direction: alternate;
  animation-iteration-count: 1;
  animation-fill-mode: none;
  animation-play-state: running;
  border-color: black;
}

@keyframes colorVisited {
  0% {
    transform: scale(0.1);
    background-color: black;
    border-radius: 100%;
  }
  50% {
    background-color: darkgreen;
  }
  100% {
    transform: scale(1);
    background-color: green;
  }
}

@keyframes colorFinished {
  0% {
    transform: scale(0.1);
    background-color: green;
    border-radius: 100%;
  }
  50% {
    background-color: lightblue;
  }
  100% {
    transform: scale(1);
    background-color: blue;
  }
}

.path {
  background-color: purple;
}

.wall {
  background-color: orange;
  border-width: 0px;
}
</style>
