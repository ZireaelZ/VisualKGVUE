<template>
  <div>
    <el-button @click='runquery(query)'>runquery</el-button>
    <el-button @click="clearmap">清空地图数据</el-button>
    <RelationG ref="rGraph" @newQuery="acceptQuery" @sendgeojson="acceptgeojson"></RelationG>
  </div>
  <div>
    <MapContainer ref="mapContainer"></MapContainer>
  </div>
</template>

<script>

import RelationG from './RelationG'
import MapContainer from "@/components/MapContainer";
import neo4j from 'neo4j-driver'
import {ref,onMounted, onBeforeUnmount, reactive} from "vue";

export default {
  name: 'vKnowledgeGraph',
  components: {RelationG,MapContainer},
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
    const RGdata = reactive({})
    const query = "MATCH (n)-[r]->(m) Return n,r,m limit 25"
    let neo4jlink = reactive()
    let session = reactive()
    neo4jlink = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'neo4jneo4j'))
    onMounted(() => {
      session = neo4jlink.session()
      runquery(query)
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
      mapContainer.value.loadGeojson(geojson)
    }
    const mapContainer=ref(null)
    //将从图谱组件收到的geojson送至地图页面
    //清空地图页面的数据
    const clearmap=()=>{
      mapContainer.value.clearmap()
    }
    const runquery = async (query) => {
      {
        try {
          const result = await session.run(query)
          let nodes = [], edges = []
          result.records.forEach(record => {
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
            nodes.push({id: node1.identity.toString(), text: name1, data: node1.properties});
            nodes.push({id: node2.identity.toString(), text: name2, data: node2.properties});
            edges.push({
              from: node1.identity.toString(),
              to: node2.identity.toString(),
              text: rel.type,
              data: rel.properties
            });
          })
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
    return {
      runquery,
      query,
      rGraph,
      showgraph,
      acceptQuery,
      acceptgeojson,
      mapContainer,
      clearmap,
      linejson
    }
  }
  ,
}


</script>

<style scoped>

</style>