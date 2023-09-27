<template>
  <div style="height:calc(100vh - 50px);">
    <RelationGraph
        ref="seeksRelationGraph"
        :options="graphOptions"
        :on-node-click="onNodeClick"
        :on-line-click="onLineClick"
    />
  </div>
<!--  <button @click="emitquery('Match (n)-[r]-(m) return n,r,m limit 20')">changequery</button>-->
</template>

<script>
// 如果您没有在main.js文件中使用Vue.use(RelationGraph); 就需要使用下面这一行代码来引入relation-graph
import RelationGraph from 'relation-graph/vue3';

export default {
  name: 'RelationG',
  components: {RelationGraph},
  data() {
    return {
      graphdata: null,
      currentNode:null,
      currentEdge:null,
      isShowCodePanel: false,
      graphOptions: {
        'debug':false,
        // "backgrounImage": "https://camo.githubusercontent.com/ede1654f055903cdc39044129d15d5b158f4f3b33ba5b7c21c7407792a506dea/687474703a2f2f72656c6174696f6e2d67726170682e636f6d2f776562736974652f6c6f676f",
        "defaultFocusRootNode": false,
        "allowShowDownloadButton": false,
        "defaultNodeBorderWidth": 2,
        "defaultLineMarker": {
          "markerWidth": 15,
          "markerHeight": 15,
          "refX": 30,
          "refY": 7,
          "data": "M 14 7 L 1 .3 L 4 7 L .4 13 L 14 7, Z"
        },
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
    };
  },
  methods: {
    //接收节点数据并加载
    showSeeksGraph(RGdata) {
      //加入虚拟节点，根据河流/湖泊/流域分别加入虚拟节点，再加入根节点，设置节点透明
      let virtualnode={isHide:false,id:RGdata.rootID.toString(),text:'virtualnode',opacity:0,
        disableDefaultClickEffect:true}
      //将虚拟节点和所有节点建立关系
      RGdata.nodes.push(virtualnode)
      RGdata.nodes.forEach((node)=>{
        let relation={
          from: virtualnode.id.toString(),
          to: node.id,
          text: null,
          isHide: true
        }
        RGdata.lines.push(relation)
      })
      this.$refs.seeksRelationGraph.setJsonData(RGdata, (graphInstance) => {
        // graphInstance.focus(graphInstance.rootId)
        // 这些写上当图谱初始化完成后需要执行的代码
        console.log(graphInstance)
      });
    },
    onNodeClick(nodeObject, $event) {
      console.log($event)
      // this.sendgeojson(nodeObject.data)
      this.currentNode=nodeObject
      this.parsingNodeData(nodeObject.data)
      console.log('onNodeClick:', nodeObject);
    },
    onLineClick(lineObject, linkObject, $event) {
      console.log($event)
      console.log(linkObject)
      console.log('onLineClick:', lineObject);
    },
    emitquery(query){
      this.$emit('newQuery',query)
      // console.log(query)
    },
    sendgeojson(geojson){
      this.$emit('sendgeojson',geojson)
    },
    //解析节点的data数据
    parsingNodeData(nodedata){
      let nodejson={}
      let years=['2006','2011','2015','2018','2020']
      let keys=Object.keys(nodedata)
      years.forEach((year)=>{
        keys.forEach((key)=>{
          if(key.includes(year)){
            if(nodejson[year]==undefined){
              nodejson[year]={}
            }
            nodejson[year][key.substring(5)]=nodedata[key]
          }
        })
      })
      console.log(nodejson)
    },
    //解析边的data数据
    parsingEdgedata(edge){
      console.log(edge)
    }
  }
};
</script>
