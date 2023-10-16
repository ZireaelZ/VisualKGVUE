<template>
  <el-row style="height:95vh">
    <el-col
        :span=leftspan>
      <div id="GraphContainer"
      style="height:100vh">
        <RelationGraph
            id="relationgraph"
            ref="seeksRelationGraph"
            :options="graphOptions"
            :on-node-click="onNodeClick"
            :on-line-click="onLineClick"
        />
      </div>
      </el-col>
    <el-col :span=rightspan v-show="rightVisible">
      <el-card  class="right">
        <template #header>
          <div style="display: flex;
  justify-content: space-between;
  align-items: center;"
          >属性信息
            <el-icon @click="closePropWindow"><close/></el-icon></div>

        </template>

        <div style="overflow-y:hidden ">
          <nodeTable class="right-table"
                     :nodename="currentNodename"
                     :nodedata="currentNodedata"
                     @showinmap="sendgeojson"
                     @showinEcharts="showEcharts"
                     @findRelationNode="findNodeRelation"
          >
          </nodeTable>
          <edgeTable class="right-table" :edgedata="currentEdgedata" @travel2node="foucusNode"></edgeTable>
          <el-dialog
              v-model="dialogVisible"
              title="土地利用数据"
              :draggable='true'
              @close="clearEchart"
          >
            <echartTable ref="echartTable"></echartTable>
            <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">
          确认
        </el-button>
      </span>
            </template>
          </el-dialog>
        </div>
      </el-card>
    </el-col>


  </el-row>
  <!--  <button @click="emitquery('Match (n)-[r]-(m) return n,r,m limit 20')">changequery</button>-->
</template>

<script>
// 如果您没有在main.js文件中使用Vue.use(RelationGraph); 就需要使用下面这一行代码来引入relation-graph
import RelationGraph from 'relation-graph/vue3';
import {ref, defineComponent, nextTick} from "vue";
import nodeTable from "@/components/nodeTable";
import edgeTable from "@/components/edgeTable";
import echartTable from "@/components/echartTable";
import {Close} from '@element-plus/icons-vue'

export default defineComponent({
  name: 'RelationG',
  components: {RelationGraph, nodeTable, edgeTable,echartTable,Close},
  setup(props, context) {
    let currentNodedata = ref(null)
    let currentEdgedata = ref(null)
    let currentNodename=ref(null)
    const RGJson = ref()
    const gInstance = ref()
    const seeksRelationGraph = ref()
    const echartTable=ref()
    const graphOptions = {
      'debug': false,
      // "backgrounImage": "https://camo.githubusercontent.com/ede1654f055903cdc39044129d15d5b158f4f3b33ba5b7c21c7407792a506dea/687474703a2f2f72656c6174696f6e2d67726170682e636f6d2f776562736974652f6c6f676f",
      "defaultFocusRootNode": false,
      "allowShowDownloadButton": false,
      "defaultNodeBorderWidth": 2,
      'allowShowMiniToolBar':false,
      'allowAutoLayoutIfSupport':false,
      // "defaultLineMarker": {
      //   "markerWidth": 15,
      //   "markerHeight": 15,
      //   "refX": 30,
      //   "refY": 7,
      //   "data": "M 14 7 L 1 .3 L 4 7 L .4 13 L 14 7, Z"
      // },
      "moveToCenterWhenRefresh": false,
      "zoomToFitWhenRefresh": false,
      "layouts": [
        {
          "label": "中心",
          "layoutName": "force",
          "layoutClassName": "seeks-layout-center",
          "defaultExpandHolderPosition": "hide",
          "defaultJunctionPoint": "border"
        }
      ]
    }
    const dialogVisible = ref(false)
    //接收数据并展示为图谱
    const showSeeksGraph = (RGdata) => {

      //加入虚拟节点，根据河流/湖泊/流域分别加入虚拟节点，再加入根节点，设置节点透明
      let virtualnode = {
        isHide: false, id: RGdata.rootID.toString(), text: 'virtualnode', opacity: 0,
        disableDefaultClickEffect: true
      }
      //将虚拟节点和所有节点建立关系
      RGdata.nodes.push(virtualnode)
      RGdata.nodes.forEach((node) => {
        let relation = {
          from: virtualnode.id.toString(),
          to: node.id,
          text: null,
          isHide: true
        }
        RGdata.lines.push(relation)
      })
      seeksRelationGraph.value.setJsonData(RGdata, (graphInstance) => {
        // graphInstance.focus(graphInstance.rootId)
        gInstance.value = graphInstance
        // 这些写上当图谱初始化完成后需要执行的代码
        RGJson.value = RGdata
      });
    }
    const onNodeClick = (nodeObject) => {
      //nodeObject, $event
      console.log(nodeObject)
      rightVisible.value=true
      setspan()
      currentNodename.value=nodeObject.text
      parsingNodedata(nodeObject.data,nodeObject.id)
    }
    const onLineClick = (lineObject, linkObject) => {
      // lineObject,linkObject,$event)
      parsingEdgedata(linkObject)
    }
    const emitquery = (query) => {
      context.emit('newQuery', query)
    }
    const sendgeojson = (geojson) => {
          context.emit('sendgeojson', geojson)
    }
    //根据节点ID将图谱聚焦到对应节点
    const foucusNode = (nodeID) => {
      let node = gInstance.value.getNodeById(nodeID)
      currentNodename.value=node.text
      parsingNodedata(node.data,nodeID)
      gInstance.value.focusNodeById(nodeID)

    }
    //解析节点的data数据
    const parsingNodedata = (nodedata,id) => {
      let nodejson = {}
      let years = ['2006', '2011', '2015', '2018', '2020']
      let keys = Object.keys(nodedata)
      let landuse={'buffer500':{},'buffer1000':{}}
      years.forEach((year) => {
        keys.forEach((key) => {
          if (key.includes(year)) {
            //先生成json
            if (nodejson[year] === undefined) {
              nodejson[year] = {}
            }
            //对属性进行过滤
            if (key.includes('buffer500')){
              //500m缓冲区
              landuse['buffer500'][year]=JSON.parse(nodedata[key])
            }
            else if (key.includes('buffer1k')){
              //1000m缓冲区
              landuse['buffer1000'][year]=JSON.parse(nodedata[key])
            }
            else {
              nodejson[year][key.substring(5)] = nodedata[key]
            }
          }
        })
      })
      currentNodedata.value = {'property':nodejson,'landuse':landuse,'id':id}
    }
    //解析边的data数据
    const parsingEdgedata = (edges) => {
      //linkObject可能会有多个，需要记录的信息有：
      let relationdata = []
      edges.relations.forEach((edge) => {
        let oneRelation = {}
        oneRelation['from'] = edge.from
        oneRelation['to'] = edge.to
        oneRelation['data'] = edge.data
        oneRelation['type'] = edge.text
        relationdata.push(oneRelation)
      })
      //出发节点：出发节点ID
      //终点节点：终点节点ID
      //关系：以及关系的属性
      // console.log('edge',edges)
      currentEdgedata.value = relationdata
    }
    //将土地利用数据传送至echarts组件
    const showEcharts=(landusedata)=>{
      dialogVisible.value=true
      nextTick(() => {
        echartTable.value.resolvedata(landusedata);
      });
      // echartTable.value.resolvedata(landusedata)
    }
    //清空echart组件数据
    const clearEchart=()=>{
      echartTable.value.clearechart()
    }
    //根据节点id从neo4j数据库查找数据
    const findNodeRelation=(nodeID)=>{
      const query=`MATCH (n)-[r1]->(m) where n.id=${nodeID} or m.id=${nodeID}  WITH n, COLLECT(r1) AS r, m Return n,r,m limit 25`
      emitquery(query)
    }
    const rightVisible=ref(false)
    const leftspan=ref(24)
    const rightspan=ref(0)
    const setspan=()=>{
      if(rightVisible.value){
        leftspan.value=18
        rightspan.value=6
      }
      else {
        leftspan.value=24
      }
    }
    //关闭属性窗口
    const closePropWindow=()=>{
      rightVisible.value=false
      console.log('closed')
      setspan()
    }
    return {
      currentNodedata,
      currentEdgedata,
      currentNodename,
      graphOptions,
      showSeeksGraph,
      seeksRelationGraph,
      onNodeClick,
      onLineClick,
      emitquery,
      sendgeojson,
      foucusNode,
      showEcharts,
      echartTable,
      findNodeRelation,
      dialogVisible,
      clearEchart,
      leftspan,
      rightspan,
      rightVisible,
      closePropWindow
    }
  },
})
</script>
<style>
#relationgraph {
}

.lakeStyle{
  background-color:#409eff !important ;
  border-color:#409eff !important ;
}
.right-table {

}
</style>
