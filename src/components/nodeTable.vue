<template>
    <div class="demo-collapse">
      <div v-if="nodedata!=undefined" >
        <div>{{nodename}}</div>
        <el-button @click="findRelationNode(nodedata.id)">查找相关节点</el-button>
        <el-button @click="showInEcharts(nodedata.landuse)">土地利用数据</el-button>
        <el-collapse v-for="(data, year) in nodedata.property" :key="year">
          <el-collapse-item :title="`${year}属性`">
            <div style="overflow: auto;height: 500px">
              <el-descriptions
                  direction="vertical"
                  size='small'
                  border
                  v-for="(value,property) in data" :key="property">
                <el-descriptions-item :label=property >
                  <template v-if="typeof value == 'object'">
                    <!-- 对象类型渲染成嵌套列表 -->
                    <el-descriptions
                        direction="vertical"
                        size='small'
                        border
                        v-for="(v,k) in value" :key="k">
                      <el-descriptions-item :label=k >{{v}}</el-descriptions-item>
                    </el-descriptions>
                  </template>
                  <template v-else-if="property=='geometry_type'">
                    <el-link @click="showinMap(linejson)">在地图中查看</el-link>
                  </template>
                  <template v-else>
                    <div @click="clickprop(property,value)">{{value}}</div>
                  </template>
                </el-descriptions-item>
              </el-descriptions>
            </div>

          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
</template>


<script>
// import {ref} from "vue";
import {defineComponent} from "vue";

export default defineComponent({
  name: "nodeTable",
  props:{
    nodedata:Object,
    nodename:String
  },
  setup(props,context){
    const linejson = {
      "type": "LineString",
      "coordinates": [
        [39.05865459950023, 41.23690586540761],
        [36.26704421381755, 50.68171886355607],
        [26.71693876424287, 39.59846666017073],
        [30.89708131753751, 36.532217100586314]
      ]
    }
    const isObject=(value)=>{
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
    const clickprop=(property,value)=>{
      console.log(property,value)
      //在这里根据属性判断，然后分别执行不同的点击操作
    }
    const showinMap=(geojson)=>{
      context.emit('showinmap',(geojson))
    }
    //将土地利用数据传送至echarts组件
    const showInEcharts=(landuseData)=>{
      context.emit('showinEcharts',landuseData.buffer500)
    }
    const findRelationNode=(nodeID)=>{
      context.emit('findRelationNode',nodeID)
    }
    return {
      isObject,
      clickprop,
      showinMap,
      showInEcharts,
      findRelationNode,
      linejson
      // acceptNodedata
    }
  }
})
</script>

<style scoped>

</style>