<template>
  <div>
    <button @click="runquery"></button>
  </div>
  <div>
  </div>
</template>

<script>
import neo4j from 'neo4j-driver'
export default {
  name: "vKnowledgeGraph",
  data(){
    return {
      neo4j: null, // Neo4j驱动程序实例
      session: null // Neo4j会话实例
    }
  },
  created() {
    this.neo4j=neo4j.driver('bolt://localhost:7687',neo4j.auth.basic('neo4j','neo4jneo4j'))
  },
  mounted() {
    this.session=this.neo4j.session();
  },
  beforeUnmount() {
    this.session.close();
    this.neo4j.close();
  },
  methods:{
    async runQuery(query) {
      try {
        const result = await this.session.run(query)
        // 处理查询结果
        this.nodes=result.records
        // console.log(result.records)
        // console.log(this.nodes)
      } catch (error) {
        // 处理错误
        console.error(error)
      }
    },
  }

}
</script>

<style scoped>

</style>