<template>
    <v-col cols="3">
        <v-text-field
        label="Grid Rows"
        :disabled="isAlgorithmRunning"
        v-model.number="rowCount"
        class="inputStyle"
        />
    </v-col>
</template>

<script>
import {
  GRID_MAX_X,
  GRID_MAX_Y
} from "../search-algorithms/utils/constants.js"
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return {
        rowCount: 
     
    };
  },
  methods: {
    ...mapMutations([""])
  },
  watch: {
   
    
  }
};
</script>










