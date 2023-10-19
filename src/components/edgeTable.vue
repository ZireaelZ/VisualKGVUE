<template>
  <div class="demo-collapse" style="text-align: left">
    <div style="padding-top: 10px;padding-bottom: 10px">关系</div>
    <el-collapse  v-for="(data,index) in edgedata" :key=index>
      <el-collapse-item :title="`关系${index+1}`" >
        <el-descriptions
            direction="horizontal"
            size='small'
            border>
          <el-descriptions-item label='起点' label-align="left" align="center"
          ><el-link @click="travel2node(data.from)">{{data.from}}</el-link></el-descriptions-item>
          <el-descriptions-item label='终点' label-align="left" align="center"
          ><el-link @click="travel2node(data.to)">{{data.to}}</el-link></el-descriptions-item>
          <el-descriptions-item label='关系类型' label-align="left" align="center"
          >{{ data.type }}</el-descriptions-item>
          <el-descriptions-item label='属性' >
<!--            嵌套的列表来一个-->
            <el-descriptions
                direction="vertical"
                size='small'
                border
            v-for="(value,property) in data.data" :key="property">
              <el-descriptions-item :label=property >{{value}}</el-descriptions-item>
            </el-descriptions>
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>


<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: "edgeTable",
  props:{
    edgedata:Object
  },
  setup(props,context) {
    const travel2node=(nodeID)=>{
      context.emit('travel2node',nodeID)
    }
    return {
      travel2node
    }
  }
})
</script>

<style scoped>

</style>