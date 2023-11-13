<template>
  <div class="knowledge-graph">
    <el-container>
      <el-header class="header">湖北省测绘档案成果——知识图谱
      </el-header>
      <el-container>
        <el-aside width="collapse">
          <el-menu :collapse="asideCollapse"
                   :collapse-transition=false
          >
            <el-menu-item index="1" @click="asideCollapse=!asideCollapse">
              <el-icon >
                <expand v-if="asideCollapse"/>
                <fold v-else/>
              </el-icon>
            </el-menu-item>
            <el-menu-item index="2" @click='opendialog'>
              <el-icon><search/></el-icon>
              <template #title>根据名称查询</template>
            </el-menu-item>
            <el-menu-item index="3" @click="imageDialog=true">
              <el-icon><search/></el-icon>
              <template #title>查看影像数据</template>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <el-row >
            <el-col :span=leftspan v-show="leftVisible">
              <el-card style="height: 87vh">
                <MapContainer  style="height: 80vh" ref="mapContainer"></MapContainer>
                <el-button @click="closemap">关闭地图</el-button>
                <el-button @click="clearmap">清空地图数据</el-button>
                <el-button @click="getextent">获取当前地图范围</el-button>
              </el-card>
            </el-col>
            <el-col :span=rightspan>
              <el-card style="height: 87vh">
                <RelationG ref="rGraph" @newQuery="acceptQuery" @sendgeojson="acceptgeojson"></RelationG>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
<el-dialog
    v-model="neo4jQueryDialog"
    title="知识图谱查询"
    width="450px"
>
  <div style="display: flex">
    <el-dropdown @command="changeType" style="
    cursor: pointer;
  /*color: var(--el-color-primary);*/
  display: flex;
  align-items: center;
">
    <span class="el-dropdown-link">
      {{currentType}}
      <el-icon><arrow-down/></el-icon>
    </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="河流名称">河流名称</el-dropdown-item>
          <el-dropdown-item command="湖泊名称">湖泊名称</el-dropdown-item>
          <el-dropdown-item command="流域名称">流域名称</el-dropdown-item>
          <el-dropdown-item command="水系名称">水系名称</el-dropdown-item>
          <el-dropdown-item command="行政区">行政区</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-input v-model="inputname" placeholder="名称" style="width: 300px"/>
  </div>
  <template #footer>
      <span class="dialog-footer">
        <el-button @click="neo4jQueryDialog = false">取消</el-button>
        <el-button type="primary" @click="comfirmQuery">
          确认
        </el-button>
      </span>
  </template>
</el-dialog>
<el-dialog
    v-model="imageDialog"
    title="影像数据查询"
    width="450px"
>
  <div style="display: flex">
    <el-dropdown @command="changeImageType" style="
    cursor: pointer;
  /*color: var(--el-color-primary);*/
  display: flex;
  align-items: center;
">
    <span class="el-dropdown-link">
      {{currentImageType}}
      <el-icon><arrow-down/></el-icon>
    </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="2000DEM">2000DEM</el-dropdown-item>
          <el-dropdown-item command="2015DEM">2015DEM</el-dropdown-item>
          <el-dropdown-item command="2015DEM5W">2015DEM5W</el-dropdown-item>
          <el-dropdown-item command="2017DEM">2017DEM</el-dropdown-item>
          <el-dropdown-item command="2005DOM">2005DOm</el-dropdown-item>
          <el-dropdown-item command="2015DOM">2015DOM</el-dropdown-item>
          <el-dropdown-item command="2018WP">2019WP</el-dropdown-item>
          <el-dropdown-item command="2019WP">2019WP</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <template #footer>
      <span class="dialog-footer">
        <el-button @click="imageDialog = false">取消</el-button>
        <el-button type="primary" @click="readImage">
          确认
        </el-button>
      </span>
  </template>
</el-dialog>
</template>

<script>

import RelationG from './RelationG'
import MapContainer from "@/components/MapContainer";
import neo4j from 'neo4j-driver'
import {ref, onMounted, onBeforeUnmount, reactive, nextTick} from "vue";
import { Search,Expand,Fold,ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'vKnowledgeGraph',
  components: {RelationG,MapContainer,Search,Expand,Fold,ArrowDown},
  setup() {
    const linejson = {
      "type": "LineString",
      "coordinates": [
        [39.05865459950023, 41.23690586540761],
        [36.26704421381755, 50.68171886355607],
        [26.71693876424287, 39.59846666017073],
        [30.89708131753751, 36.532217100586314]
      ]
    }
    const leftVisible=ref(false)
    const RGdata = reactive({})
    const defaultquery = "MATCH (n)-[r]-(m)  Return n,r,m limit 40"
    // const defaultquery = "MATCH (n1:Lake)-[r1]->(m1) where n1.`2006_properties_FIRST_NAME`='螺蛳湾'  MATCH (n2)-[r2]->(m2:Lake) where m2.`2006_properties_FIRST_NAME`='螺蛳湾' with collect(n1) + collect(n2) as n, collect(r1) + collect(r2) as r, collect(m1) + collect(m2) as m RETURN n, r, m"
    //MATCH (n:river)-[r]->(m)  Return n,r,m limit 50
    let neo4jlink = reactive()
    let session = reactive()
    neo4jlink = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'neo4jneo4j'))
    onMounted(() => {
      session = neo4jlink.session()
      runquery(defaultquery)
    })
    onBeforeUnmount(() => {
      session.close()
      neo4jlink.close()
    })
    const rGraph=ref(null)
    const showgraph=(data)=>{
      rGraph.value.showSeeksGraph(data)
    }
    //从子组件接收参数
    const acceptQuery=(newQ)=>{
      console.log('accepted')
      runquery(newQ)
    }
    const acceptgeojson=(geojson)=>{
      console.log('acceptgeojson')
      leftVisible.value=true
      setspan()
      nextTick(()=>{
        mapContainer.value.resizemap()
        mapContainer.value.loadGeojson(geojson)
      })

    }
    const mapContainer=ref(null)
    //将从图谱组件收到的geojson送至地图页面
    //清空地图页面的数据
    const clearmap=()=>{
      mapContainer.value.clearmap()
    }
    //获取当前地图的范围
    const getextent=()=>{
      mapContainer.value.getextent()
    }
    async function runquery(query){
      try {
          const result = await session.run(query)
        console.log(result)
          let nodes = [], edges = []
          let nodeids=[]
          result.records.forEach(record => {
            nodeids.push(record.get('n').identity.toString())
          })
          nodeids=Array.from(new Set(nodeids.map(JSON.stringify)), JSON.parse);
          let tmpquery=''
          if(nodeids.length===0){
            tmpquery=defaultquery
            ElMessage('关键词错误或者不存在！')
          }
          else {
            // tmpquery = `MATCH (n)-[r]->(m) WHERE id(n) IN [${nodeids}] or id(m) IN [${nodeids}] RETURN n, r, m limit 30`
            tmpquery=query
          }
          const result2=await session.run(tmpquery)
          result2.records.forEach(record => {
            const node1 = record.get('n');
            const node2 = record.get('m');
            const rel = record.get('r');
            let name1='',name2='',startID,endID
            name1=node1.properties["NAME"]
            name2=node2.properties["NAME"]
            if (node1['elementId']===rel['startNodeElementId'])
            {
              startID=node1['elementId']
              endID=node2['elementId']
            }
            else {
              startID=node2['elementId']
              endID=node1['elementId']
            }
            //根据河流/湖泊类型匹配不同的style
            const styledict={
              'Lake':'lakeStyle',
              'River':'riverStyle',
              'Basin':'basinStyle',
              'RiverSys':'riversysStyle',
            }
            // console.log(node1)
            nodes.push({id: node1['elementId'], text: name1, type:node1.labels.toString(),data: node1.properties,styleClass:styledict[node1.labels[0]]});
            nodes.push({id: node2['elementId'], text: name2, type:node2.labels.toString(),data: node2.properties,styleClass:styledict[node2.labels[0]]});
            edges.push({
              from: startID,
              to: endID,
              text: rel.type,
              data: rel.properties,
            });
          })
          nodes = Array.from(new Set(nodes.map(JSON.stringify)), JSON.parse);
          edges= Array.from(new Set(edges.map(JSON.stringify)), JSON.parse);
          RGdata.rootID = 999999
          RGdata.nodes = nodes
          RGdata.lines = edges
          showgraph(RGdata)
        } catch (error) {
          // 处理错误
          console.error(error)
        }
    }
    // const runquery = async (query) => {
    //   {
    //     try {
    //       const result = await session.run(query)
    //       let nodes = [], edges = []
    //       let nodeids=[]
    //       result.records.forEach(record => {
    //         nodeids.push(record.get('n').identity.toString())
    //       })
    //       nodeids=Array.from(new Set(nodeids.map(JSON.stringify)), JSON.parse);
    //       let tmpquery=''
    //       if(nodeids.length===0){
    //         tmpquery=defaultquery
    //         ElMessage('关键词错误或者不存在！')
    //       }
    //       else {
    //         // tmpquery = `MATCH (n)-[r]->(m) WHERE id(n) IN [${nodeids}] or id(m) IN [${nodeids}] RETURN n, r, m limit 30`
    //         tmpquery=query
    //       }
    //       const result2=await session.run(tmpquery)
    //       result2.records.forEach(record => {
    //         const node1 = record.get('n');
    //         const node2 = record.get('m');
    //         const rel = record.get('r');
    //         let name1='',name2=''
    //         name1=node1.properties["NAME"]
    //         name2=node2.properties["NAME"]

    //         //根据河流/湖泊类型匹配不同的style
    //         const styledict={
    //           'Lake':'lakeStyle',
    //           'River':'riverStyle',
    //           'Basin':'basinStyle',
    //           'RiverSys':'riversysStyle',
    //         }
    //         // console.log(node1)
    //         nodes.push({id: node1.identity.toString(), text: name1, type:node1.labels.toString(),data: node1.properties,styleClass:styledict[node1.labels[0]]});
    //         nodes.push({id: node2.identity.toString(), text: name2, type:node2.labels.toString(),data: node2.properties,styleClass:styledict[node2.labels[0]]});
    //         edges.push({
    //           from: node1.identity.toString(),
    //           to: node2.identity.toString(),
    //           text: rel.type,
    //           data: rel.properties,
    //         });
    //       })
    //       nodes = Array.from(new Set(nodes.map(JSON.stringify)), JSON.parse);
    //       edges= Array.from(new Set(edges.map(JSON.stringify)), JSON.parse);
    //       RGdata.rootID = 999999
    //       RGdata.nodes = nodes
    //       RGdata.lines = edges
    //       showgraph(RGdata)
    //     } catch (error) {
    //       // 处理错误
    //       console.error(error)
    //     }
    //   }
    // }
    const leftspan=ref(0)
    const rightspan=ref(24)
    const setspan=()=>{
      if(leftVisible.value){
        leftspan.value=8
        rightspan.value=16
      }
      else {
        rightspan.value=24
      }
    }
    //关闭地图显示框
    const closemap=()=>{
      leftVisible.value=false
      setspan()
    }
    const neo4jQueryDialog=ref(false)
    const imageDialog = ref(false)
    //打开neo4j查询对话框
    const opendialog=()=>{
      neo4jQueryDialog.value=true
    }
    //根据选择的内容更新语句
    const currentType=ref('查询类型')
    const changeType=(cmd)=>{
      currentType.value=cmd
    }
    //根据选择的内容设置影像名
    const currentImageType = ref('选择查看的数据')
    const changeImageType=(cmd)=>{
      currentImageType.value = cmd
    }
    const inputname=ref('')
    //确认查询语句
    const comfirmQuery=()=>{
      let typedict={
        '湖泊名称':'Lake',
        '河流名称':'River',
        '流域名称':'Basin',
        '水系名称':'RiverSys',
        '行政区':'Region'
      }
      let queryA=`match (n:${typedict[currentType.value]})-[r]-(m) where n.\`NAME\` CONTAINS '${inputname.value}' return n,r,m limit 40`
      console.log(queryA)
      runquery(queryA)
      neo4jQueryDialog.value=false
    }
    //发送请求查看影像数据
    const readImage = ()=>{
      const extent =  mapContainer.value.getextent()
      // 获取当前地图显示的经纬度范围
      const dataname = currentImageType.value
      const url = "http://127.0.0.1:5000/readimage"
      const data = {
        dataname: dataname,
        coordinates: extent
      }
      const options = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
      fetch(url, options).then((res) => {
        if (res.status === 200) {
          console.log("fuck")
        }
      }).catch((e) => {
        console.log(e)
      })
      console.log(extent); // 输出结果为 [minX, minY, maxX, maxY]
    }
    //侧边面板折叠
    const asideCollapse=ref(true)
    return {
      inputname,
      rGraph,
      showgraph,
      acceptQuery,
      acceptgeojson,
      mapContainer,
      clearmap,
      getextent,
      linejson,
      leftVisible,
      leftspan,
      rightspan,
      closemap,
      opendialog,
      neo4jQueryDialog,
      imageDialog,
      currentType,
      changeType,
      currentImageType,
      changeImageType,
      comfirmQuery,
      readImage,
      asideCollapse
    }
  }
  ,
}
</script>

<style scoped>
.knowledge-graph {
  height: auto;
  display: flex;
  flex-direction: column;
}
.el-dropdown-link{
  cursor: pointer;
  /*color: var(--el-color-primary);*/
  display: flex;
  align-items: center;
}
.header {
  height: 80px;
  line-height: 50px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  background-color: #409eff;
  color: #fff;
}
</style>