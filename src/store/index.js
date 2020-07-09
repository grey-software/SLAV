import Vue from "vue";
import Vuex from "vuex";
import GridNode from "../search-algorithms/bfs/GridNode";


Vue.use(Vuex);

const generateGraph = (rows, cols) => {
  var cell = "";
  var graph = {};
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

const addNeighbours = (j, i, currNode, graph, rows, cols) => {
  var adjNode;
  var adjCell = `(${j + 1},${i})`;
  if (j < cols - 1) {
    adjNode = graph[adjCell];
    if (adjNode != null) {
      currNode.adj.push(adjCell);
    }
  }

  adjCell = `(${j},${i + 1})`;
  if (i < rows - 1) {
    adjNode = graph[adjCell];
    if (adjNode != null) {
      currNode.adj.push(adjCell);
    }
  }

  adjCell = `(${j - 1},${i})`;
  if (j > 0) {
    adjNode = graph[adjCell];
    if (adjNode != null) {
      currNode.adj.push(adjCell);
    }
  }

  adjCell = `(${j},${i - 1})`;
  if (i > 0) {
    adjNode = graph[adjCell];
    if (adjNode != null) {
      currNode.adj.push(adjCell);
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
