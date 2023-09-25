<template>
  <div>
    <button @click='runquery(query)'>t se1</button>
    <RelationG></RelationG>
  </div>
  <div>
  </div>
</template>

<script>

import RelationG from './RelationG'
import neo4j from 'neo4j-driver'
import {ref, onMounted, onBeforeUnmount,reactive} from "vue";

export default {
  name: 'vKnowledgeGraph',
  components:{RelationG},
  setup() {
    let RGdata=ref()
    const query="MATCH (n) Return n limit 25"
    let neo4jlink = reactive()
    let session = reactive()
    neo4jlink = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'neo4jneo4j'))
    onMounted(() => {
      session = neo4jlink.session()
    })
    onBeforeUnmount(() => {
      session.close()
      neo4jlink.close()
    })
    const runquery = async (query) => {
      {
        try {
          const result = await session.run(query)
          // 处理查询结果
          RGdata=result.records
          // let Graphdata={
          //   rootId: 'a',
          //   nodes: [
          //     { id: 'a', text: 'A', borderColor: 'yellow' },
          //     { id: 'b', text: 'B', color: '#43a2f1', fontColor: 'yellow' },
          //     { id: 'c', text: 'C', nodeShape: 1, width: 80, height: 60 },
          //     { id: 'e', text: 'E', nodeShape: 0, width: 150, height: 150 }
          //   ],
          //   lines: [
          //     { from: 'a', to: 'b', text: '关系1', color: '#43a2f1' },
          //     { from: 'a', to: 'c', text: '关系2' },
          //     { from: 'a', to: 'e', text: '关系3' },
          //     { from: 'b', to: 'e', text: '', color: '#67C23A' }
          //   ]
          // }
          // console.log(Graphdata)
          console.log(RGdata)

        } catch (error) {
          // 处理错误
          console.error(error)
        }
      }
    }

    return{
      runquery,
      query,
    }
  }
  ,
}


</script>

<style scoped>

</style>