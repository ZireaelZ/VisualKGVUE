<template>
  <div class="hello">
    <button @click="runQuery('MATCH (n)-[r]->(m) RETURN n,r,m')">hello</button>
    <button @click="logNodes()" >hello</button>
  </div>
  <router-link to="/RelationG">helloworld</router-link>
  <router-view></router-view>
</template>

<script>
import neo4j from 'neo4j-driver'
import Vis from 'vis'
// import VKnowledgeGraph from "@/components/vKnowledgeGraph";
export default {
  name: 'HelloWorld',
  components: {
  },

  props: {
    msg: String
  },
  data(){
    return{
      driver:null,
      session:null,
      nodes:null,
      network:null
    }
  },
  created() {
    this.driver=neo4j.driver(
        'bolt://localhost:7687',
        neo4j.auth.basic('neo4j','neo4jneo4j')
    )
    this.session=this.driver.session()
    // this.nodes={a:'1',b:2}
  },
  beforeUnmount() {
    this.session.close()
    this.driver.close()
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
    logNodes(){
      // console.log(JSON.parse(JSON.stringify(this.nodes)))
      const nodes=[]
      const edges=[]
      this.nodes.forEach(record =>{
        const node1 = record.get('n');
        const node2 = record.get('m');
        const rel = record.get('r');
        // console.log(node1)
        nodes.push({ id: node1.identity.toString(), label: node1.properties['name'], properties: node1.properties });
        nodes.push({ id: node2.identity.toString(), label: node2.labels[0], properties: node2.properties });
        edges.push({ from: node1.identity.toString(), to: node2.identity.toString(), label: rel.type, properties: rel.properties });
      })
      const container =this.$refs["vis-container"]
      // const data = {
      //   nodes: nodes,
      //   edges: edges
      // };
      const options = {};
      // this.network = new Vis.Network(container, data, options);
      this.network = new Vis.Network(container, { nodes: this.nodes, edges: this.edges }, options);
    }
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
