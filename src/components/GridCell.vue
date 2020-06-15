<template>
  <div
    @click="$emit('onGridCellClicked', x, y)"
    class="grid-cell"
    :class="{start: isStart, dest: isDest, visited: isVisited, finished: isFinished}"
  >
  </div>
</template>

<script>
//import GridNode from "@/search-algorithms/bfs/GridNode.js";
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
    },
    gridNode: {
      type: Object
    }
  },
  mounted () {
    console.log(this.gridNode);
  },
  computed: {
    isStart() {
      return this.gridData.startX === this.x && this.gridData.startY === this.y;
    },

    isDest() {
      return this.gridData.destX === this.x && this.gridData.destY === this.y;
    },

    isVisited() {
      return this.gridNode.color === "green";
    },

    isFinished() {
      return this.gridNode.color === "blue";
    }
  }
};
</script>


<style>
.grid-cell {
  height: 32px;
  width: 32px;
  border: solid 0.3px;
  border-color: #343434;
}

.start {
  background-color: red;
}

.dest {
  background-color: yellow;
}

.visited {
  background-color: green;
}

.finished {
  background-color: blue;
}
</style>