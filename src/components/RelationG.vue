<template>
    <div style="height:calc(100vh - 50px);">
      <RelationGraph
        ref="seeksRelationGraph"
        :options="graphOptions"
        :on-node-click="onNodeClick"
        :on-line-click="onLineClick" />
    </div>
</template>

<script>
// 如果您没有在main.js文件中使用Vue.use(RelationGraph); 就需要使用下面这一行代码来引入relation-graph
import RelationGraph from 'relation-graph/vue3';
export default {
  name: 'RelationG',
  components: {RelationGraph},
  data() {
    return {
      graphdata:null,
      isShowCodePanel: false,
      graphOptions: {
        debug: true,
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        allowShowDownloadButton: true,
        defaultJunctionPoint: 'border'
        // 这里可以参考"Graph 图谱"中的参数进行设置
      }
    };
  },
  mounted() {
    this.showSeeksGraph();
  },
  methods: {
    showSeeksGraph() {
      this.graphdata = {
        rootId: 'a',
        nodes: [
          { id: 'a', text: 'A', borderColor: 'yellow' },
          { id: 'b', text: 'B', color: '#43a2f1', fontColor: 'yellow' },
          { id: 'c', text: 'C', nodeShape: 1, width: 80, height: 60 },
          { id: 'e', text: 'E', nodeShape: 0, width: 150, height: 150 }
        ],
        lines: [
          { from: 'a', to: 'b', text: '关系1', color: '#43a2f1' },
          { from: 'a', to: 'c', text: '关系2' },
          { from: 'a', to: 'e', text: '关系3' },
          { from: 'b', to: 'e', text: '', color: '#67C23A' }
        ]
      };
      this.$refs.seeksRelationGraph.setJsonData(this.graphdata, (graphInstance) => {
        // 这些写上当图谱初始化完成后需要执行的代码
        console.log(graphInstance)
      });
    },
    onNodeClick(nodeObject, $event) {
      console.log($event)
      console.log('onNodeClick:', nodeObject);
    },
    onLineClick(lineObject, linkObject, $event) {
      console.log($event)
      console.log(linkObject)
      console.log('onLineClick:', lineObject);
    }
  }
};
</script>
