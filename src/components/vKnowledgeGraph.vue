<template>

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
    var url=''
    this.neo4j=neo4j.driver(url,neo4j.auth.basic('user','password'))
  },
  mounted() {
    this.session=this.neo4j.session();
  },
  beforeUnmount() {
    this.session.close();
    this.neo4j.close();
  }

}
</script>

<style scoped>

</style>