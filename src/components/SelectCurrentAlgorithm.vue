<template>
  <v-col class="d-flex pt-8" cols="6" sm="6">
    <v-select
      :items="Algorithms"
      filled
      label="Searching Algorithm"
      dense
      solo
      v-model="currentAlgorithm"
    ></v-select>
  </v-col>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  data() {
    return {
      currentAlgorithm: { text: "Breadth First Search", value: "search/breadth-first" },
      Algorithms: [
        { text: "Breadth First Search", value: "search/breadth-first" },
        { text: "Depth First Search", value: "search/depth-first" },
        { text: "A* Search", value: "search/a-star" },
        { text: "Best First Search", value: "search/best-first" }
      ]
    };
  },
  methods: {
    ...mapMutations(["setCurrentAlgorithm"])
  },
  watch: {
    currentAlgorithm(newAlgorithm) {
      console.log(`New Algorithm ${newAlgorithm}`);
      this.setCurrentAlgorithm(newAlgorithm);
    }
  }
};
</script>










