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
    const defaultquery = "MATCH (n)-[r]->(m)  Return n,r,m limit 50"
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
    const runquery = async (query) => {
      {
        try {
          const result = await session.run(query)
          let nodes = [], edges = []
          let nodeids=[]
          result.records.forEach(record => {
            nodeids.push(record.get('n').properties.id.toString())
          })
          nodeids=Array.from(new Set(nodeids.map(JSON.stringify)), JSON.parse);
          let tmpquery=''
          console.log(nodeids.length)
          if(nodeids.length===0){
            tmpquery=defaultquery
            ElMessage('关键词错误或者不存在！')
          }
          else {
            tmpquery = `MATCH (n)-[r]->(m) WHERE n.id IN [${nodeids}] or m.id IN [${nodeids}] RETURN n, r, m`
          }
          const result2=await session.run(tmpquery)
          result2.records.forEach(record => {
            const node1 = record.get('n');
            const node2 = record.get('m');
            const rel = record.get('r');
            let name1='',name2=''
            Object.keys(node1.properties).forEach((pname)=>{
              if (pname.includes('FIRST_NAME')){
                name1=node1.properties[pname]
              }
            })
            Object.keys(node2.properties).forEach((pname)=>{
              if (pname.includes('FIRST_NAME')){
                name2=node2.properties[pname]
              }
            })
            //根据河流/湖泊类型匹配不同的style
            const styledict={
              'Lake':'lakeStyle',
              'River':'riverStyle',
            }
            // console.log(node1)
            nodes.push({id: node1.properties.id.toString(), text: name1, data: node1.properties,styleClass:styledict[node1.labels[0]]});
            nodes.push({id: node2.properties.id.toString(), text: name2, data: node2.properties,styleClass:styledict[node1.labels[0]]});
            edges.push({
              from: node1.properties.id.toString(),
              to: node2.properties.id.toString(),
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
    }
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
    //打开neo4j查询对话框
    const opendialog=()=>{
      neo4jQueryDialog.value=true
    }
    //根据选择的内容更新语句
    const currentType=ref('查询类型')
    const changeType=(cmd)=>{
      currentType.value=cmd
    }
    const inputname=ref('')
    //确认查询语句
    const comfirmQuery=()=>{
      let typedict={
        '湖泊名称':'Lake',
        '河流名称':'River',
        '流域名称':'Basin',
        '水系名称':'Riversys'
      }
      let queryA=`match (n:${typedict[currentType.value]})-[r]->(m) where n.\`2015_properties_FIRST_NAME\` CONTAINS '${inputname.value}' return n,r,m limit 20`
      console.log(queryA)
      runquery(queryA)
      neo4jQueryDialog.value=false
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
      currentType,
      changeType,
      comfirmQuery,asideCollapse
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