<template>
  <div>
    <div ref='echartsT' style="height: 300px;width: 400px"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {ref, onMounted, onBeforeUnmount,} from "vue";
//
export default {
  name: "echartArea",
  setup() {
    const echartsT = ref()
    onMounted(() => {
      echartsT.value = echarts.init(echartsT.value)
    })
    onBeforeUnmount(()=>{
      echartsT.value.clear()
    })
    const clearechart=()=>{
      echartsT.value.clear()
    }
    const resolvedata=(data)=>{
      const options={
        legend:{},
        tooltip:{},
        grid: {
          left: "2%",
          bottom: "2%",
          containLabel: true
        },
        title:{text:"水域面积变化",left: 'center', },
        xAxis:{name:'年度',type:'category',data:data['years'],axisLabel:{width:80}},
        yAxis:{name:'平方公里',scale:true,axisLabel: {
            formatter: function (value) {
              return value.toFixed(4);
            }}},
        series:[{data:data['values'],type:'line'}]
      }
      echartsT.value.setOption(options)
    }
    return {
      echartsT,
      resolvedata,
      clearechart,
    }
  }
}
</script>

<style scoped>

</style>