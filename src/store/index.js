import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isAlgorithmRunning: false,
    isAlgorithmFinished: false,
    selectionState: "pick-start",
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
  },
  actions: {},
  modules: {},
});
