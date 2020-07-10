import Vue from "vue";
import Vuex from "vuex";
import GridNode from "../search-algorithms/bfs/GridNode";


Vue.use(Vuex);

const generateGraph = (rows, cols) => {
  var cell;
  const graph = {};
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      cell = `(${i},${j})`;
      let currNode = new GridNode(i, j);
      graph[cell] = currNode;
    }
  }

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      cell = `(${i},${j})`;
      let currNode = graph[cell];
      addNeighbours(i, j, currNode, graph, rows, cols);
    }
  }
  return graph;
};

const addNeighbours = (row, col, currNode, graph, rows, cols) => {
  var adjNode;
  var neighbourCoors = `(${row + 1},${col})`;
  if (row < cols - 1) {
    adjNode = graph[neighbourCoors];
    if (adjNode != null) {
      currNode.adj.push(neighbourCoors);
    }
  }

  neighbourCoors = `(${row},${col + 1})`;
  if (col < rows - 1) {
    adjNode = graph[neighbourCoors];
    if (adjNode != null) {
      currNode.adj.push(neighbourCoors);
    }
  }

  neighbourCoors = `(${row - 1},${col})`;
  if (row > 0) {
    adjNode = graph[neighbourCoors];
    if (adjNode != null) {
      currNode.adj.push(neighbourCoors);
    }
  }

  neighbourCoors = `(${row},${col - 1})`;
  if (col > 0) {
    adjNode = graph[neighbourCoors];
    if (adjNode != null) {
      currNode.adj.push(neighbourCoors);
    }
  }
  //console.log(currNode.adj);
};

export default new Vuex.Store({
  state: {
    isAlgorithmRunning: false,
    isAlgorithmFinished: false,
    selectionState: "pick-start",
    graph: {},
    vizSpeed: 1,
    currentAlgorithm: "search/a-star",
  },
  mutations: {
    setIsAlgorithmFinished(state, isAlgorithmFinished) {
      state.isAlgorithmFinished = isAlgorithmFinished;
    },

    setIsAlgorithmRunning(state, boolValue) {
      state.isAlgorithmRunning = boolValue;
    },

    setSelectionState(state, selectionState) {
      state.selectionState = selectionState;
    },
    setGraph(state, graph) {
      state.graph = graph;
    },
    setVizSpeed(state, speed) {
      state.vizSpeed = speed;
    },
    setCurrentAlgorithm(state, newAlgorithm) {
      state.currentAlgorithm = newAlgorithm;
    },
  },
  actions: {
    createGraph(context, payload) {
      const graph = generateGraph(payload.rows, payload.cols)
      context.commit('setGraph', graph)
    }
  },
  modules: {},
});
