<template>
    <div class="demo-collapse">
      <div v-if="nodedata!=undefined" style="text-align: left">
        <div style="padding-bottom: 10px;">{{nodename}}</div>
        <el-button @click="findRelationNode(nodedata.id)">查找相关节点</el-button>
        <el-button v-if="nodedata.type=='Lake'" @click="showInEcharts(nodedata.landuse)">土地利用数据</el-button>
<!--        <el-button v-if="nodedata.type=='Lake'" @click="showAreaChange(nodedata.property)">湖泊面积变化</el-button>-->
        <template v-if="nodedata.type=='RiverSys'||nodedata.type=='Region'">
          <el-descriptions
                  direction="vertical"
                  size='small'
                  border
                  v-for="(value,property) in nodedata.property" :key="property">
                <el-descriptions-item :label=property v-if="property !=='geometry'">
                  <template v-if="typeof value == 'object'">
                    <el-descriptions
                        direction="vertical"
                        size='small'
                        border
                        v-for="(v,k) in value" :key="k">
                      <el-descriptions-item :label=k >{{v}}</el-descriptions-item>
                    </el-descriptions>
                  </template>
                  <template v-else>
                    <div @click="clickprop(property,value)">{{value}}
                      <el-link style="margin-left: 10px" @click="showinMap(nodedata.geometry)" v-if="property=='名称' ">查看</el-link></div>
                    
                  </template>
                </el-descriptions-item>
              </el-descriptions>
        </template>
        <template v-else><el-collapse v-for="(data, year) in nodedata.property" :key="year">
          <el-collapse-item >
            <template #title>
              {{year}}年
              <el-link style="margin-left: 10px" @click="showinMap(data.geometry)">查看空间位置</el-link>
            </template>
            <div style="overflow: auto;height: 500px">
              <el-descriptions
                  direction="vertical"
                  size='small'
                  border
                  v-for="(value,property) in data" :key="property">
                <el-descriptions-item :label=property v-if="property !=='geometry'">
                  <template v-if="typeof value == 'object'">
                    <el-descriptions
                        direction="vertical"
                        size='small'
                        border
                        v-for="(v,k) in value" :key="k">
                      <el-descriptions-item :label=k >{{v}}</el-descriptions-item>
                    </el-descriptions>
                  </template>
                  <template v-else>
                    <div @click="clickprop(property,value)">{{value}}</div>
                  </template>
                </el-descriptions-item>
              </el-descriptions>
            </div>

          </el-collapse-item>
        </el-collapse></template>
      </div>
    </div>
    <el-dialog
      v-model="areaDialogVisible"
      title="湖泊面积变化"
      :draggable='true'
      @close="clearEchartA"
      style="width: 500px"
  >
    <EchartArea ref="echartArea"></EchartArea>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="areaDialogVisible = false">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>


<script>
// import {ref} from "vue";
import {defineComponent, nextTick, ref} from "vue";
import EchartArea from "@/components/echartsArea";
export default defineComponent({
  name: "nodeTable",
  components: {EchartArea},
  props:{
    nodedata:Object,
    nodename:String,
    nodeType:String
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
      console.log(geojson)
      context.emit('showinmap',(geojson))
    }
    //将土地利用数据传送至echarts组件
    const showInEcharts=(landuseData)=>{
      context.emit('showinEcharts',landuseData.buffer500)
    }
    const findRelationNode=(nodeID)=>{
      context.emit('findRelationNode',nodeID)
    }
    const areaDialogVisible=ref(false)
    const echartArea=ref()
    const showAreaChange=(property)=>{
      console.log(property)
      areaDialogVisible.value=true
      let areadata={'years':[],'values':[]}
      Object.keys(property).forEach((year)=>{
        areadata.years.push(year)
        areadata.values.push(property[year]['水面面积'])}
      )
      nextTick(() => {
        echartArea.value.resolvedata(areadata);
      });
    }
    const clearEchartA=()=>{
      echartArea.value.clearechart()
    }
    return {
      isObject,
      clickprop,
      showinMap,
      showInEcharts,
      findRelationNode,
      linejson,
      showAreaChange,
      areaDialogVisible,echartArea,clearEchartA
      // acceptNodedata
    }
  }
})
</script>

<style scoped>

</style>