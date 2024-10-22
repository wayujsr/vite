<template>
  <div class="navigation-button">
    <div @click="upClick" :class="{'disabled':index === 0}"><i class="fa fa-angle-double-up"></i></div>
    <div @click="downClick" :class="{'disabled':index === length - 1}"><i class="fa fa-angle-double-down"></i></div>
    <div @click="rightClick" :class="{'disabled':index === 0}"><i class="fa fa-angle-double-right"></i></div>
    <div @click="leftClick" :class="{'disabled':depth === 1}"><i class="fa fa-angle-double-left"></i></div>
  </div>
</template>

<script>
import $ from "jquery";

export default {
  name: "ArrowNavRB",
  props:{
    index:Number,
    depth:Number,
    length:Number
  },
  data() {
    return {};
  },
  methods:{
    leftClick(){
      console.log(this.index);
      if(this.depth === 1){
        console.log("depth is 0");
        return false;
      }
      this.$emit("leftClick",this.index);
    },
    rightClick(){
      console.log(this.index);
      if(this.index === 0){
        console.log("no tasks is 0");
        return false;
      }
      this.$emit("rightClick",this.index);
    },
    upClick(){
      console.log(this.index);
      if(this.index === 0){
        console.log("index is 0");
        return false;
      }
      this.$emit("upClick",this.index);
    },
    downClick(){
      console.log(this.index);
      if(this.index === this.length - 1){
        console.log("last element");
        return false;
      }
      this.$emit("downClick",this.index);
    },
  }
};
</script>