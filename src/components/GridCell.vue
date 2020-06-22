<template>
  <div
    @click="$emit('onGridCellClicked', x, y)"
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
//import GridNode from "@/search-algorithms/bfs/GridNode.js";
export default {
  props: {
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    gridData: {
      type: Object,
    },
    color: {
      type: String,
      default: "white",
    },
    gridNode: {
      type: Object,
    },
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
    },
    isPartOfPath() {
      return this.gridNode.color === "purple";
    },
    isWall() {
      return this.gridNode.color === "orange";
    },
  },
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

.path {
  background-color: purple;
}

.wall {
  background-color: orange;
}
</style>
