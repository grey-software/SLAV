<template>
  <v-slider
    v-model="vizSpeedIndex"
    :tick-labels="vizSpeedOptions"
    :max="5"
    step="1"
    ticks="always"
    tick-size="4"
  ></v-slider>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return {
      vizSpeedIndex: 2,
      vizSpeedOptions: [0.25, 0.5, 1, 1.5, 2, 3]
    };
  },
  computed: {
    ...mapState(["vizSpeed"])
  },
  methods: {
    ...mapMutations(["setVizSpeed"])
  },
  watch: {
    vizSpeedIndex(newIndex) {
      this.setVizSpeed(this.vizSpeedOptions[newIndex]);
    }
  }
};
</script>



