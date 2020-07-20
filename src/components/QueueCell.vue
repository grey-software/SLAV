<template>
  <div
    class="grid_cell"
    :class="{
      queue_cell: isInQueue,
      grid_cell: !isInQueue
    }">
    <p class="queue_text">Osama</p>
</div>
</template>

<script>

import { mapState } from "vuex";
export default {
  props: {
    queueIndex:{
        type: Number,
        default: 0  

    },
    gridData: {
      type: Object
    },
    
  },
  //Here we are making sure our gridCell is in sync with the gridNode model
  computed: {
    ...mapState({ graph: "graph" }),
    gridNode() {
      if(this.gridData.currentAlgorithmStruct != null){
        if(this.gridData.currentAlgorithmStruct.length() >= this.queueIndex - 1){
            return this.gridData.currentAlgorithmStruct.items[this.queueIndex];
        }
      }
      return null;  
    },
    
    isInQueue(){
      if(this.gridNode != null){
        return this.gridNode.queueState === true;

      }
      return null;

    }
  }
};
</script>

<style>
.grid_cell {
  height: 25px;
  width: 30px;
  border: solid 0.2px;  
  border-color: white;
}

.queue_cell{
  
  border-color: greenyellow;


}

.queue_text{
    font-size: 0.5em;


}



</style>
